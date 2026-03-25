import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import api from '../api';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaQuestion, setCaptchaQuestion] = useState('');
    const [captchaAnswer, setCaptchaAnswer] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCaptcha();
    }, []);

    const fetchCaptcha = async () => {
        try {
            const res = await api.get('/auth/captcha');
            setCaptchaToken(res.data.token);
            setCaptchaQuestion(res.data.image);
            setCaptchaAnswer('');
        } catch (err) {
            console.error("Failed to fetch captcha");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await login(username, password, captchaAnswer, captchaToken);
            if (user.role === 'ROLE_TEACHER') {
                navigate('/teacher');
            } else {
                navigate('/student');
            }
        } catch (err) {
            let errorMsg = err.response?.data?.message || 'Invalid credentials or captcha. Please try again.';
            if (errorMsg === 'Bad credentials') {
                errorMsg = 'Invalid credentials!';
            }
            setError(errorMsg);
            fetchCaptcha(); // Refresh captcha on failure
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="w-full max-w-[450px] animate-fade-in flex flex-col items-center">
                <div className="text-center mb-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-indigo-900 drop-shadow-sm mb-2">AssignFlow</h1>
                </div>

                <div className="auth-card">
                    <div className="text-center mb-6">
                        <p className="text-slate-500 font-medium">Welcome back! Please login to your account.</p>
                    </div>
                    {error && <div className="error-msg">{error}</div>}

                    <form className="w-full" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Username</label>
                            <input
                                type="text"
                                className="input-field"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Enter your username"
                            />
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="input-group">
                            <label className="flex justify-between items-center">
                                <span>Human Verification</span>
                                <button type="button" onClick={fetchCaptcha} className="text-indigo-400 hover:text-indigo-300 text-xs">
                                    Refresh
                                </button>
                            </label>
                            <div className="flex gap-3 items-center mt-1">
                                <div className="bg-white/80 border border-slate-200 flex items-center justify-center rounded-lg shadow-sm overflow-hidden h-12 w-40">
                                    {captchaQuestion ? (
                                        <img src={captchaQuestion} alt="Captcha" className="h-full w-full object-cover opacity-90 mix-blend-multiply" />
                                    ) : (
                                        <span className="text-indigo-600 text-xs">Loading...</span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    className="input-field mb-0 text-center flex-1"
                                    value={captchaAnswer}
                                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                                    required
                                    placeholder="Captcha"
                                    maxLength={6}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary mt-6" disabled={isLoading}>
                            <LogIn size={20} />
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div className="flex justify-between items-center text-sm pt-2">
                            <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300">
                                Forgot password?
                            </Link>
                        </div>

                        <div className="auth-link text-slate-600">
                            Don't have an account? <Link to="/signup" className="text-indigo-600 font-bold hover:text-indigo-500">Sign Up</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
