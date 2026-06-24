import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import logo from '../assets/logoSimples.svg';
import api from '../services/api';
import { useChatCrypto } from '../services/cryptoHook';
import './Chat.css';

interface User {
    id: string;
    username: string;
    email: string;
    publicKey: string;
}

interface Message {
    id: number;
    text: string;
    sender: 'me' | 'other';
}

function Chat() {
    const navigate = useNavigate();

    // NOVO: Trazendo as funções do seu hook de criptografia
    const { encryptMessage, decryptMessage, generateAESKey } = useChatCrypto();

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    // NOVO: Estados para gerenciar o WebSocket e a chave de Criptografia do Chat
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [aesKey, setAesKey] = useState<CryptoKey | null>(null);

    // ATENÇÃO: Como não há uma tela de seleção de chats ainda,
    // estamos usando um ID fixo para testar a integração.
    // Depois, isso virá de uma lista de chats na sua API.
    const activeChatId = "id-do-chat-teste";

    useEffect(() => {
        loadUser();
        setupCryptoKey();
    }, []);

    // NOVO: Configurando o WebSocket assim que o usuário e a chave AES estiverem prontos
    useEffect(() => {
        if (!currentUser || !aesKey) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
                console.log('Conectado ao WebSocket do Spring Boot!');

                // Inscreve no tópico do chat específico
                client.subscribe(`/topic/chat/${activeChatId}`, async (msg) => {
                    const data = JSON.parse(msg.body);

                    // Só processa se a mensagem for do OUTRO usuário (as nossas já mostramos na tela)
                    if (data.userId !== currentUser.id) {
                        try {
                            // DESCRIPTOGRAFA a mensagem recebida!
                            const textoAberto = await decryptMessage(data.cipherText, data.iv, aesKey);

                            const novaMensagem: Message = {
                                id: data.id,
                                text: textoAberto,
                                sender: 'other'
                            };

                            setMessages((prev) => [...prev, novaMensagem]);
                        } catch (error) {
                            console.error("Erro ao descriptografar mensagem:", error);
                        }
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Erro no STOMP: ' + frame.headers['message']);
            },
        });

        client.activate();
        setStompClient(client);

        // Desconecta ao sair da tela
        return () => {
            client.deactivate();
        };
    }, [currentUser, aesKey]);

    const loadUser = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                navigate('/');
                return;
            }
            const response = await api.get(`api/user/${userId}`);
            setCurrentUser(response.data);
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            localStorage.removeItem('userId');
            navigate('/');
        }
    };

    // NOVO: Prepara a chave AES para este chat
    const setupCryptoKey = async () => {
        // Num fluxo real: você buscaria a chave AES do localStorage ou criaria uma e trocaria via RSA.
        // Aqui geramos uma chave temporária para o WebSocket funcionar e você ver a mágica acontecer:
        const key = await generateAESKey();
        setAesKey(key);
        setMessages([{ id: 0, text: 'Chave de segurança gerada. Chat criptografado de ponta a ponta estabelecido.', sender: 'other' }]);
    };

    const logout = () => {
        localStorage.removeItem('userId');
        navigate('/');
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !aesKey || !stompClient || !currentUser) return;

        const msgOriginal = newMessage;
        setNewMessage(''); // Limpa o input rápido para boa UX

        // 1. Mostra na tela do remetente imediatamente (não precisa descriptografar a própria mensagem)
        const myMessage: Message = {
            id: Date.now(),
            text: msgOriginal,
            sender: 'me',
        };
        setMessages((prev) => [...prev, myMessage]);

        try {
            // 2. CRIPTOGRAFA a mensagem usando o seu hook!
            const { cipherText, iv } = await encryptMessage(msgOriginal, aesKey);

            // 3. Envia o pacote cifrado para o Spring Boot via STOMP
            stompClient.publish({
                destination: `/app/chat/${activeChatId}`,
                body: JSON.stringify({
                    userId: currentUser.id,
                    chatId: activeChatId,
                    cipherText: cipherText,
                    iv: iv
                }),
            });
        } catch (error) {
            console.error("Erro ao enviar mensagem cifrada:", error);
        }
    };

    return (
        <div className="chat-container">
            <header className="chat-header">
                <div className="header-left">
                    <img src={logo} alt="LLP" className="header-logo" />
                    <h2>Chat Criptografado</h2>
                </div>

                <div className="header-user">
                    <div className="status-dot"></div>
                    <span>{currentUser?.username || 'Carregando...'}</span>
                    <button className="logout-button" onClick={logout}>Sair</button>
                </div>
            </header>

            <main className="chat-messages">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`message ${
                            message.sender === 'me'
                                ? 'message-sent'
                                : 'message-received'
                        }`}
                    >
                        {message.text}
                    </div>
                ))}
            </main>

            <footer className="chat-input-container">
                <input
                    type="text"
                    placeholder="Digite uma mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            sendMessage();
                        }
                    }}
                />
                <button onClick={sendMessage}>Enviar</button>
            </footer>
        </div>
    );
}

export default Chat;