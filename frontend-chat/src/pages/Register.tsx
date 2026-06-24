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
                        Preencha os dados para começar.
                    </p>
                    {/* USERNAME */}
                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="seu usuário"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    {/* EMAIL */}
                    <div className="input-group">
                        <label>E-mail</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="seu@email.com"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* PASSWORD */}
                    <div className="input-group">
                        <label>Senha</label>
                        <input
                            type="password"
                            className="input-field password-field"
                            placeholder="••••••••"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
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