import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('');
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setStatus({ type: 'success', message: res.data.message });
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Something went wrong.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="w-full max-w-[450px] animate-fade-in flex flex-col items-center">
                <div className="text-center mb-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-indigo-900 drop-shadow-sm mb-2">Forgot Password</h1>
                </div>

                <div className="auth-card relative">
                    <Link to="/login" className="text-indigo-500 font-medium hover:text-indigo-400 flex items-center gap-1 mb-6 text-sm absolute -top-10 left-0">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>

                    <div className="text-center mb-6 mt-2">
                        <p className="text-slate-500 font-medium">Enter your account email address and we'll send you a link to reset your password.</p>
                    </div>

                    {status && (
                        <div className={`p-3 rounded-lg text-sm mb-4 border ${status.type === 'success' ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-300' : 'bg-red-900/30 border-red-500/50 text-red-300'}`}>
                            {status.message}
                        </div>
                    )}

                    <form className="w-full" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                            />
                        </div>

                        <button type="submit" className="btn-primary mt-6" disabled={isLoading}>
                            <Mail size={20} />
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
