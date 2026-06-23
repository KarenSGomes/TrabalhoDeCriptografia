import logo from '../assets/logo.svg';
import './Login.css';
import arvorebi from '../assets/arvorebi.svg';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
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
                    <img src={arvorebi} />
                </div>
            </div>

            <div className="right-panel">
                <div className="login-card">
                    <h1>Bem-vindo(a) de volta!</h1>
                    <p className="subtitle">
                        Acesse sua conta para continuar aprendendo.
                    </p>

                    <div className="input-group">
                        <label>E-mail</label>
                        <div className="input-wrapper">
                            {/* Ícone de Email */}
                            <svg className="input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>

                            <input
                                type="email"
                                placeholder="seu@email.com"
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Senha</label>
                        <div className="input-wrapper">
                            {/* Ícone de Cadeado */}
                            <svg className="input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>

                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input-field password-field"
                            />

                            {/* Ícone de Olho cortado */}
                            <svg className="input-icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        </div>
                    </div>

                    <a href="#" className="forgot-password">
                        Esqueci minha senha
                    </a>

                    <button
                        className="login-button"
                        onClick={() => navigate('/chat')}
                    >
                        Entrar
                    </button>

                    <p className="register-text">
                        Não tem uma conta? <a href="#">Cadastra-se</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;