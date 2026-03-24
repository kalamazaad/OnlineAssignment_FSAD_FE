import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Key } from 'lucide-react';
import api from '../api';

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match.' });
            return;
        }

        setIsLoading(true);
        setStatus('');

        try {
            const res = await api.post('/auth/reset-password', { token, newPassword });
            setStatus({ type: 'success', message: res.data.message });
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Invalid or expired token.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-card text-center p-8">
                    <h2 className="text-xl text-red-400 font-bold mb-4">Invalid Link</h2>
                    <p className="text-gray-400">This password reset link is invalid or missing the security token. Please request a new link.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card animate-fade-in">
                <h1 className="auth-title">Reset Password</h1>
                <p className="auth-subtitle text-sm">Create a new secure password for your account.</p>

                {status && (
                    <div className={`p-3 rounded-lg text-sm mb-4 border ${status.type === 'success' ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-300' : 'bg-red-900/30 border-red-500/50 text-red-300'}`}>
                        {status.message}
                        {status.type === 'success' && <p className="mt-2 text-xs opacity-75">Redirecting to login...</p>}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="input-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn-primary mt-6" disabled={isLoading || status.type === 'success'}>
                        <Key size={20} />
                        {isLoading ? 'Resetting...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
