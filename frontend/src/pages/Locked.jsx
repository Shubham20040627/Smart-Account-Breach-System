import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Timer, AlertTriangle, ArrowRight } from 'lucide-react';

const Locked = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const lockUntil = location.state?.lockUntil ? new Date(location.state.lockUntil) : new Date(Date.now() + 600000);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const calculateTime = () => {
            const diff = Math.max(0, Math.floor((lockUntil - Date.now()) / 1000));
            setTimeLeft(diff);
            if (diff === 0) navigate('/login');
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [lockUntil, navigate]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="auth-container">
            <div className="glass-card text-center" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: '50%', width: '5rem', height: '5rem', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 1.5rem auto' }}>
                    <Lock size={40} color="#ef4444" className="animate-pulse" />
                </div>

                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '0.5rem' }}>Account Locked</h1>
                <p style={{ color: '#94a3b8', marginBottom: '2rem', fontWeight: '500' }}>
                    Suspicious activity detected. Multiple failed login attempts have triggered a security lockout.
                </p>

                <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(51, 65, 85, 1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#38bdf8', marginBottom: '0.5rem' }}>
                        <Timer size={20} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unlocking in</span>
                    </div>
                    <div className="font-mono" style={{ fontSize: '3rem', fontWeight: 'bold', letterSpacing: '-0.05em' }}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="alert alert-warning" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                    <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                        Please check your email for a security alert. To protect your identity, this account is temporarily disabled.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/login')}
                    className="btn"
                    style={{ background: 'transparent', color: '#38bdf8', fontWeight: '600', textDecoration: 'none' }}
                >
                    Return to Login <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Locked;
