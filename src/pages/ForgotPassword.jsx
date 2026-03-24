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
            <div className="auth-card animate-fade-in">
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 mb-6 text-sm">
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                <h1 className="auth-title">Forgot Password</h1>
                <p className="auth-subtitle text-sm">Enter your account email address and we'll send you a link to reset your password.</p>

                {status && (
                    <div className={`p-3 rounded-lg text-sm mb-4 border ${status.type === 'success' ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-300' : 'bg-red-900/30 border-red-500/50 text-red-300'}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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
    );
}
