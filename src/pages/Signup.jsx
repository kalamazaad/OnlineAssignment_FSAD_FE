import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

export default function Signup() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
        role: 'ROLE_STUDENT'
    });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            await signup(formData.username, formData.email, formData.name, formData.password, formData.role);
            setSuccessMsg('New account created successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="w-full max-w-[450px] animate-fade-in flex flex-col items-center">
                <div className="text-center mb-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-indigo-900 drop-shadow-sm mb-2">Join AssignFlow</h1>
                </div>

                <div className="auth-card">
                    <div className="text-center mb-6">
                        <p className="text-slate-500 font-medium">Create your account to get started.</p>
                    </div>

                    {error && <div className="error-msg">{error}</div>}
                    {successMsg && (
                        <div className="p-3 rounded-lg text-sm mb-4 border bg-emerald-900/30 border-emerald-500/50 text-emerald-300">
                            {successMsg}
                        </div>
                    )}

                    <form className="w-full" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className="input-field"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="input-field"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="input-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                className="input-field"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="Choose a username"
                            />
                        </div>

                        <div className="input-group">
                            <label>Role</label>
                            <select
                                name="role"
                                className="input-field select-field"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="ROLE_STUDENT">Student</option>
                                <option value="ROLE_TEACHER">Teacher</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                className="input-field"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Create a strong password"
                            />
                        </div>

                        <div className="input-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="input-field"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="Repeat your password"
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading || successMsg}>
                            <UserPlus size={20} />
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>

                        <div className="auth-link text-slate-600">
                            Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-500">Sign In</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
