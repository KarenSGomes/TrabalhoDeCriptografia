import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../assets/logoSimples.svg';
import api from '../services/api';

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

    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: 'Bem-vindo ao Chat Criptografado!',
            sender: 'other',
        },
    ]);

    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userId = localStorage.getItem('userId');

            if (!userId) {
                navigate('/');
                return;
            }

            const response = await api.get(`/user/${userId}`);

            setCurrentUser(response.data);
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);

            localStorage.removeItem('userId');
            navigate('/');
        }
    };

    const logout = () => {
        localStorage.removeItem('userId');
        navigate('/');
    };

    const sendMessage = () => {
        if (!newMessage.trim()) return;

        const message: Message = {
            id: Date.now(),
            text: newMessage,
            sender: 'me',
        };

        setMessages((prev) => [...prev, message]);
        setNewMessage('');
    };

    return (
        <div className="chat-container">

            <header className="chat-header">

                <div className="header-left">
                    <img
                        src={logo}
                        alt="LLP"
                        className="header-logo"
                    />

                    <h2>Chat Criptografado</h2>
                </div>

                <div className="header-user">
                    <div className="status-dot"></div>

                    <span>
                        {currentUser?.username || 'Carregando...'}
                    </span>

                    <button
                        className="logout-button"
                        onClick={logout}
                    >
                        Sair
                    </button>
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
                    onChange={(e) =>
                        setNewMessage(e.target.value)
                    }
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            sendMessage();
                        }
                    }}
                />

                <button onClick={sendMessage}>
                    Enviar
                </button>

            </footer>

        </div>
    );
}

export default Chat;