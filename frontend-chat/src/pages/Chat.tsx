import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../services/api';
import { useChatCrypto } from '../services/cryptoHook';
import logo from '../assets/logo.svg';
import "./Chat.css";

interface User {
    id: string;
    username: string;
    publicKey: any;
}

interface Chat {
    id: string;
    user1Id: string;
    user2Id: string;
    aesKeyForUser1: string;
    aesKeyForUser2: string;
}

interface Message {
    id: number;
    userId: string;
    chatId: string;
    text: string;
}

function Chat() {
    const navigate = useNavigate();

    const {
        encryptMessage,
        decryptMessage,
        importAESKey,
        importPrivateRSAKey,
        importPublicRSAKey,
        decryptAESKeyWithRSA,
        encryptAESKeyWithRSA,
        generateAESKey,
        exportAESKey
    } = useChatCrypto();

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [chats, setChats] = useState<Chat[]>([]);
    const [chat, setChat] = useState<Chat | null>(null);
    const [chatId, setChatId] = useState<string>('');
    const [activeFriendName, setActiveFriendName] = useState<string>(''); // Armazena o nome de com quem você fala
    const [aesKey, setAesKey] = useState<CryptoKey | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [stompClient, setStompClient] = useState<Client | null>(null);

    useEffect(() => {
        loadUser();
        loadUsers();
    }, []);

    useEffect(() => {
        if (currentUser) {
            loadChats();
        }
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser || !chatId || !aesKey) return;
        connectWS();
    }, [currentUser, chatId, aesKey]);

    const logout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('privateKey');
        navigate('/');
    };

    // 👤 USER
    const loadUser = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return navigate('/');

        const res = await api.get(`/api/user/${userId}`);
        setCurrentUser(res.data);
    }

    const loadUsers = async () => {
        const res = await api.get("/api/user/getAll");
        setUsers(res.data);
    }

    const loadChats = async () => {
        const res = await api.get(`/api/user/chats/${currentUser?.id}`);
        setChats(res.data);
    }

    // ✅ CORREÇÃO DO FILTRO: Agora filtra APENAS você mesma. Exibe todo mundo, tendo chat ou não!
    const allContacts = users.filter(u => u.id !== currentUser?.id);

    // 💬 CRIAR OU PEGAR CHAT + DESCRIPTOGRAFAR AES
    const loadChat = async (friendId: string, friendName: string) => {
        setActiveFriendName(friendName);
        setMessages([]); // Limpa a tela de mensagens ao trocar de chat

        const res = await api.post("api/chat", {
            user1Id: currentUser?.id,
            user2Id: friendId
        });

        const chatData: Chat = res.data;

        setChat(chatData);
        setChatId(chatData.id);

        // Função auxiliar para evitar double stringify nas chaves do banco
        const parseJWK = (keyData: any) => {
            let parsed = keyData;
            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            return parsed;
        };

        // 🔐 pega private key do storage
        const privateKeyJwk = parseJWK(localStorage.getItem("privateKey"));
        const privateKey = await importPrivateRSAKey(privateKeyJwk);

        // 🔑 escolhe AES correta
        let encryptedAES = currentUser?.id === chatData.user1Id
            ? chatData.aesKeyForUser1
            : chatData.aesKeyForUser2;

        if (!encryptedAES) {
            const newAesKey = await generateAESKey();
            const aesBase64 = await exportAESKey(newAesKey);

            const friendUser = await api.get(`api/user/${friendId}`);
            const publicKey = await importPublicRSAKey(parseJWK(friendUser.data.publicKey));

            const encryptedForMe = await encryptAESKeyWithRSA(
                aesBase64, await importPublicRSAKey(parseJWK(currentUser?.publicKey))
            );

            const encryptedForFriend = await encryptAESKeyWithRSA(aesBase64, publicKey);

            await api.put(`api/chat/chat/${chatData.id}/keys`, {
                aesKeyForUser1: chatData.user1Id === currentUser?.id ? encryptedForMe : encryptedForFriend,
                aesKeyForUser2: chatData.user1Id === currentUser?.id ? encryptedForFriend : encryptedForMe
            });

            setAesKey(newAesKey);
            // Atualiza a lista de chats locais para controle interno
            loadChats();
            return;
        }

        // 🔓 decrypt AES
        const aesBase64 = await decryptAESKeyWithRSA(encryptedAES, privateKey);
        const key = await importAESKey(aesBase64);
        setAesKey(key);
    };

    // 🔌 WEBSOCKET
    const connectWS = () => {
        if (stompClient) {
            stompClient.deactivate(); // Desconecta o canal do chat anterior se houver
        }

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('WS conectado ao chat:', chatId);

                client.subscribe(`/topic/chat/${chatId}`, async (msg) => {
                    const data = JSON.parse(msg.body);

                    if (data.userId === currentUser?.id) return;
                    if (!aesKey) return;

                    try {
                        const text = await decryptMessage(data.encryptedMessage, data.iv, aesKey);

                        setMessages(prev => [
                            ...prev,
                            {
                                id: data.id ?? Date.now(),
                                userId: data.userId,
                                chatId,
                                text
                            }
                        ]);

                    } catch (err) {
                        console.error("decrypt error", err);
                    }
                });
            }
        });

        client.activate();
        setStompClient(client);
    };

    // 📤 ENVIAR MENSAGEM
    const sendMessage = async () => {
        if (!stompClient || !aesKey || !currentUser || !chatId || !newMessage.trim()) return;

        const text = newMessage;
        setNewMessage('');

        setMessages(prev => [
            ...prev,
            {
                id: Date.now(),
                userId: currentUser.id,
                chatId,
                text
            }
        ]);

        const { cipherText, iv } = await encryptMessage(text, aesKey);

        stompClient.publish({
            destination: `/app/chat/${chatId}`,
            body: JSON.stringify({
                userId: currentUser.id,
                chatId,
                cipherText,
                iv
            })
        });
    };

    return (
        <div className="chat-layout">
            {/* BARRA LATERAL (SIDEBAR) */}
            <aside className="chat-sidebar">
                <div className="sidebar-header">
                    <img src={logo} alt="Logo" className="sidebar-logo" />
                    <div className="user-info">
                        <span className="status-dot"></span>
                        <span className="username">{currentUser?.username || 'Carregando...'}</span>
                    </div>
                    <button className="logout-btn" onClick={logout}>Sair</button>
                </div>

                <div className="sidebar-content">
                    <h3>Contatos Disponíveis</h3>
                    <div className="contact-list">
                        {allContacts.length === 0 && <p className="empty-text">Nenhum outro usuário cadastrado.</p>}
                        {allContacts.map(user => (
                            <div key={user.id} onClick={() => loadChat(user.id, user.username)} className="contact-item">
                                <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
                                <span>{user.username}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* ÁREA PRINCIPAL DO CHAT */}
            <main className="chat-main-area">
                {!chatId ? (
                    <div className="no-chat-selected">
                        <img src={logo} alt="Logo" className="bg-logo" />
                        <h2>Selecione um contacto para iniciar uma conversa criptografada</h2>
                    </div>
                ) : (
                    <div className="chat-container">
                        <header className="chat-header">
                            <div className="header-left">
                                <div className="avatar">{activeFriendName.charAt(0).toUpperCase()}</div>
                                <h2>{activeFriendName}</h2>
                            </div>
                            {aesKey && <span className="secure-badge"> Protegido E2EE</span>}
                        </header>

                        <div className="chat-messages">
                            {messages.map(m => (
                                <div
                                    key={m.id}
                                    className={`message ${m.userId === currentUser?.id ? 'message-sent' : 'message-received'}`}
                                >
                                    {m.text}
                                </div>
                            ))}
                        </div>

                        <footer className="chat-input-container">
                            <input
                                type="text"
                                placeholder="Digite uma mensagem..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <button onClick={sendMessage}>Enviar</button>
                        </footer>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Chat;