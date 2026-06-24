import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.svg';
import arvorebi from '../assets/arvorebi.svg';
import { useChatCrypto } from "../services/cryptoHook"
import './Login.css'; 

const REGISTER_URL: string = "api/user";

interface registerForm {
    username: string,
    email: string,
    password: string,
}

function Register() {
    const navigate = useNavigate();
    const { generateKeyPair } = useChatCrypto()
 
    const [formData, setFormData] = useState<registerForm>({
        username: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = async (e: any) => {
        e.preventDefault();
        const { name, value } = e.target;
        setFormData((state) => ({ ...state, [name]: value }));
    }

    const handleRegister = async (e: any) => {
        e.preventDefault();
        try {
            setLoading(true);

            const keys = await generateKeyPair();

            await api.post(REGISTER_URL, {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                publicKey: JSON.stringify(keys.publicKey),
            });

            localStorage.setItem('privateKey', JSON.stringify(keys.privateKey));

            navigate('/');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="left-panel">
                <div className="code-decoration">
                    <pre>
                        {`// Árvore Binária
class No {
    int valor;
    No esq;
    No dir;
}`}
                    </pre>
                </div>

                <div className="logo-container">
                    <img src={logo} alt="LLP" className="logo" />
                </div>

                <div className="tree-decoration">
                    <img src={arvorebi} alt="Árvore Binária" />
                </div>
            </div>

            <div className="right-panel">
                <div className="login-card">
                    <h1>Criar conta</h1>
                    <p className="subtitle">
                        Aprenda de forma elegante e acompanhe seu progresso.
                    </p>
                    {/* USERNAME */}
                    <div className="input-group">
                        <label>Nome de Usuário</label>

                        <div className="input-wrapper">
                            <svg
                                className="input-icon-left"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>

                            <input
                                type="text"
                                placeholder="Digite seu usuário"
                                className="input-field"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* EMAIL */}
                    <div className="input-group">
                        <label>E-mail</label>

                        <div className="input-wrapper">
                            <svg
                                className="input-icon-left"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>

                            <input
                                type="email"
                                placeholder="seu@email.com"
                                className="input-field"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div className="input-group">
                        <label>Senha</label>

                        <div className="input-wrapper">
                            <svg
                                className="input-icon-left"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect
                                    x="3"
                                    y="11"
                                    width="18"
                                    height="11"
                                    rx="2"
                                    ry="2"
                                ></rect>

                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>

                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input-field password-field"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />

                            <svg
                                className="input-icon-right"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line
                                    x1="1"
                                    y1="1"
                                    x2="23"
                                    y2="23"
                                ></line>
                            </svg>
                        </div>
                    </div>

                    <button
                        className="login-button"
                        onClick={handleRegister}
                        disabled={loading}
                    >
                        {loading ? 'Criando conta...' : 'Cadastrar'}
                    </button>

                    <p className="register-text">
                        Já tem conta?{' '}
                        <Link to={"/"}>Entrar</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;