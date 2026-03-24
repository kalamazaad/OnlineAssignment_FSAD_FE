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
        role: 'ROLE_STUDENT'
    });
    const [error, setError] = useState('');
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
        setIsLoading(true);
        try {
            await signup(formData.username, formData.email, formData.name, formData.password, formData.role);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card animate-fade-in">
                <h1 className="auth-title">Join AssignFlow</h1>
                <p className="auth-subtitle">Create your account to get started.</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
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

                    <button type="submit" className="btn-primary" disabled={isLoading}>
                        <UserPlus size={20} />
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="auth-link">
                        Already have an account? <Link to="/login">Sign In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
