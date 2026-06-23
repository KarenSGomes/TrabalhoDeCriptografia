import { useState } from 'react';
import logo from '../assets/logoSimples.svg';
import './Chat.css';

interface Message {
    id: number;
    text: string;
    sender: 'me' | 'other';
}

function Chat() {
    const currentUser = {
        name: 'Karen Gomes',
    };

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: 'Olá! Tudo bem?',
            sender: 'other',
        },
        {
            id: 2,
            text: 'Tudo sim! E você?',
            sender: 'me',
        },
    ]);

    const [newMessage, setNewMessage] = useState('');

    const sendMessage = () => {
        if (!newMessage.trim()) return;

        const message: Message = {
            id: Date.now(),
            text: newMessage,
            sender: 'me',
        };

        setMessages([...messages, message]);
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
                    <span>{currentUser.name}</span>
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

                <button onClick={sendMessage}>
                    Enviar
                </button>

            </footer>

        </div>
    );
}

export default Chat;