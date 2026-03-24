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
            setError(err.response?.data?.message || 'Invalid credentials or captcha. Please try again.');
            fetchCaptcha(); // Refresh captcha on failure
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card animate-fade-in">
                <h1 className="auth-title">AssignFlow</h1>
                <p className="auth-subtitle">Welcome back! Please login to your account.</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
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
                            <div className="bg-slate-800 flex items-center justify-center rounded-lg border border-slate-700 shadow-inner overflow-hidden h-12 w-40">
                                {captchaQuestion ? (
                                    <img src={captchaQuestion} alt="Captcha" className="h-full w-full object-cover mix-blend-screen opacity-90" />
                                ) : (
                                    <span className="text-indigo-300 text-xs">Loading...</span>
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

                    <div className="auth-link">
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
