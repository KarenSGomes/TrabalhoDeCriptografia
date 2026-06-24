import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../services/api';
import { useChatCrypto } from '../services/cryptoHook';
import "../pages/Chat.css"

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
    const [aesKey, setAesKey] = useState<CryptoKey | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [stompClient, setStompClient] = useState<Client | null>(null);

    useEffect(() => {
        loadUser();
        loadUsers();
        loadChats();
    }, []);

    useEffect(() => {
        if (!currentUser || !chatId) return;

        connectWS();
    }, [currentUser, chatId, aesKey]);

    // 👤 USER
    const loadUser = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return navigate('/');

        const res = await api.get(`api/user/${userId}`);
        setCurrentUser(res.data);
    }

    const loadUsers = async () => {
        const res = await api.get("api/user/getAll");
        setUsers(res.data);
    }

    const loadChats = async () => {
        const res = await api.get(`/api/user/chats/${currentUser?.id}`);
        setChats(res.data);
    }

    const potentialChats = users.filter(u => {
        return (
            u.id !== currentUser?.id &&
            !chats.some(c =>
                c.user1Id === u.id || c.user2Id === u.id
            )
        );
    })

    // 💬 CRIAR OU PEGAR CHAT + DESCRIPTOGRAFAR AES
    const loadChat = async (friendId: string) => {

        const res = await api.post("api/chat", {
            user1Id: currentUser?.id,
            user2Id: friendId
        });

        const chatData: Chat = res.data;

        setChat(chatData);
        setChatId(chatData.id);

        // 🔐 pega private key do storage
        const privateKeyJwk = JSON.parse(localStorage.getItem("privateKey")!);
        const privateKey = await importPrivateRSAKey(privateKeyJwk);

        // 🔑 escolhe AES correta
        let encryptedAES = currentUser?.id === chatData.user1Id
            ? chatData.aesKeyForUser1
            : chatData.aesKeyForUser2;

        if (!encryptedAES) {
            const aesKey = await generateAESKey();

            const aesBase64 = await exportAESKey(aesKey);

            const friend = currentUser?.id === chatData.user1Id 
                ? chatData.user2Id 
                : chatData.user1Id;

            const friendUser = await api.get(`api/user/${friend}`);

            const publicKey = await importPublicRSAKey(friendUser.data.publicKey);

            const encryptedForMe = await encryptAESKeyWithRSA(
                aesBase64, await importPublicRSAKey(currentUser?.publicKey)
            );

            const encryptedForFriend = await encryptAESKeyWithRSA(aesBase64, publicKey);

            await api.put(`api/chat/${chatData.id}/keys`, {
                aesKeyForUser1: chatData.user1Id === currentUser?.id
                    ? encryptedForMe
                    : encryptedForFriend,

                aesKeyForUser2: chatData.user1Id === currentUser?.id
                    ? encryptedForFriend
                    : encryptedForMe
            })

            setAesKey(aesKey);
            return;
        }

        // 🔓 decrypt AES
        const aesBase64 = await decryptAESKeyWithRSA(
            encryptedAES,
            privateKey
        );

        // 🔄 importa AES pra CryptoKey
        const key = await importAESKey(aesBase64);
        setAesKey(key);
    };

    // 🔌 WEBSOCKET
    const connectWS = () => {
        if (stompClient) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

            reconnectDelay: 5000,

            onConnect: () => {
                console.log('WS conectado');

                client.subscribe(`/topic/chat/${chatId}`, async (msg) => {
                    const data = JSON.parse(msg.body);

                    if (data.userId === currentUser?.id) return;
                    if (!aesKey) return;

                    try {
                        const text = await decryptMessage(
                            data.cipherText,
                            data.iv,
                            aesKey
                        );

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
        if (!stompClient || !aesKey || !currentUser || !chatId) return;

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
        <div className="chat-container">

            <h2>Chat Criptografado 🔐</h2>

            <div>
                <h3>Pessoas para conversar</h3>

                {potentialChats.map(user => (
                    <div
                        key={user.id}
                        onClick={() => loadChat(user.id)}
                        className="user-item"
                    >
                        {user.username}
                    </div>
                ))}
            </div>

            {/* botão fake só pra testar chat */}
            <button onClick={() => loadChat("friend-id")}>
                Abrir Chat
            </button>

            <div className="messages">
                {messages.map(m => (
                    <div key={m.id}>
                        <b>{m.userId}</b>: {m.text}
                    </div>
                ))}
            </div>

            <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />

            <button onClick={sendMessage}>
                Enviar
            </button>

        </div>
    );
}

export default Chat;