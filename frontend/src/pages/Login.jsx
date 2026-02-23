import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, LogIn, AlertOctagon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            const data = err.response?.data;
            if (data?.locked) {
                navigate('/locked', { state: { lockUntil: data.lockUntil } });
            } else {
                setError(data?.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-card">
                <div className="text-center" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-block', padding: '0.75rem', backgroundColor: 'rgba(56, 189, 248, 0.2)', borderRadius: '1rem', marginBottom: '1rem' }}>
                        <Shield size={40} color="#38bdf8" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Secure Login</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>Identity verification required</p>
                </div>

                {error && (
                    <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <AlertOctagon size={20} style={{ flexShrink: 0 }} />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" />
                            <input
                                type="email"
                                required
                                className="input-field"
                                placeholder="you@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" />
                            <input
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ padding: '0.875rem' }}
                    >
                        {loading ? 'Authenticating...' : 'Secure Sign In'}
                        <LogIn size={16} />
                    </button>
                </form>

                <p className="text-center" style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                    New user? <Link to="/register" style={{ color: '#38bdf8', fontWeight: '500', textDecoration: 'none' }}>Create Account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
