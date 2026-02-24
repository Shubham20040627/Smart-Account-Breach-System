import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import {
    ShieldCheck, ShieldAlert, Monitor, Clock,
    LogOut, Shield, Globe
} from 'lucide-react';

const Dashboard = () => {
    const { user, logout, refreshTrigger } = useAuth();
    const [securityData, setSecurityData] = useState({
        accountStatus: 'ACTIVE',
        trustedDevices: [],
        loginHistory: []
    });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [auditResult, setAuditResult] = useState('');
    const [auditLoading, setAuditLoading] = useState(false);

    const fetchStatus = async () => {
        try {
            const { data } = await authService.getSecurityStatus();
            setSecurityData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [refreshTrigger]);

    const handleLogoutAll = async () => {
        if (!window.confirm('This will invalidate all sessions. Continue?')) return;
        setActionLoading(true);
        try {
            await authService.logoutAll();
            logout();
        } catch (err) {
            alert('Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevokeDevice = async (deviceId) => {
        if (!window.confirm('Revoke access for this device?')) return;
        setActionLoading(true);
        try {
            await authService.revokeDeviceSession(deviceId);
            await fetchStatus();
        } catch (err) {
            alert('Revocation failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCPPAudit = async () => {
        setAuditLoading(true);
        setAuditResult('Compiling and running C++ Core Logic Engine...\n');
        try {
            const { data } = await authService.getCPPAudit();
            setAuditResult(prev => prev + data.result);
        } catch (err) {
            setAuditResult(prev => prev + 'Error executing C++ Logic: ' + err.message);
        } finally {
            setAuditLoading(false);
        }
    };

    if (loading) return (
        <div className="flex-center" style={{ minHeight: '100vh' }}>
            <div style={{ width: '3rem', height: '3rem', border: '4px solid #38bdf8', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin"></div>
        </div>
    );

    return (
        <div className="dashboard-container">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Shield color="#38bdf8" /> Security Dashboard
                        </h1>
                        <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Protecting account: <span style={{ color: 'white', fontWeight: '500' }}>{user?.email}</span></p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={handleLogoutAll}
                            disabled={actionLoading}
                            className="btn btn-danger-outline"
                        >
                            <ShieldAlert size={16} /> Logout All Devices
                        </button>
                        <button
                            onClick={logout}
                            className="btn"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', backgroundColor: '#1e293b', color: '#cbd5e1', width: 'auto' }}
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>

                {/* Status Grid */}
                <div className="status-grid">
                    <div className="glass-card status-card success">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.75rem' }}>
                                <ShieldCheck color="#10b981" size={24} />
                            </div>
                            <div>
                                <p className="status-label">Account Status</p>
                                <p className="status-value" style={{ color: '#10b981' }}>{securityData.accountStatus}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card status-card accent">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '0.75rem' }}>
                                <Monitor color="#38bdf8" size={24} />
                            </div>
                            <div>
                                <p className="status-label">Trusted Devices</p>
                                <p className="status-value">{securityData.trustedDevices.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card status-card warning">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.75rem' }}>
                                <Clock color="#f59e0b" size={24} />
                            </div>
                            <div>
                                <p className="status-label">Recent Activity</p>
                                <p className="status-value">{securityData.loginHistory.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* C++ Audit Section */}
                <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '0.5rem' }}>
                                <Shield color="#38bdf8" size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>C++ DSA Logic Verifier</h3>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Runs standalone C++ binary to audit system logic</p>
                            </div>
                        </div>
                        <button
                            onClick={handleCPPAudit}
                            disabled={auditLoading}
                            className="btn"
                            style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                        >
                            {auditLoading ? 'Auditing...' : 'Run C++ Security Audit'}
                        </button>
                    </div>

                    {auditResult && (
                        <div style={{
                            backgroundColor: '#0f172a',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontFamily: 'monospace',
                            color: '#38bdf8',
                            border: '1px solid #1e293b',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {auditResult}
                        </div>
                    )}
                </div>

                <div className="section-grid">
                    {/* Devices */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Monitor size={20} color="#38bdf8" /> Trusted Devices
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {securityData.trustedDevices.map((device, i) => (
                                <div key={i} className="glass-card device-item">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#1e293b', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Monitor size={20} color="#64748b" />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 'bold' }}>{device.browser} on {device.OS || device.os}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Globe size={12} /> {device.IP}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', flexShrink: 0 }}>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Last accessed</p>
                                            <p style={{ fontSize: '0.75rem', fontWeight: '500' }}>{new Date(device.lastLogin).toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRevokeDevice(device.deviceId)}
                                            disabled={actionLoading}
                                            className="revoke-btn"
                                            style={{
                                                padding: '0.35rem 0.75rem',
                                                fontSize: '0.75rem',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '0.375rem',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                                            }}
                                        >
                                            Revoke Access
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Activity */}
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={20} color="#f59e0b" /> Login History
                        </h2>
                        <div className="glass-card table-container" style={{ padding: '0' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Device</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {securityData.loginHistory.map((attempt, i) => (
                                        <tr key={i}>
                                            <td>
                                                {attempt.success ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#10b981', fontSize: '0.875rem', fontWeight: '500' }}>
                                                        <ShieldCheck size={16} /> Success
                                                    </span>
                                                ) : (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#ef4444', fontSize: '0.875rem', fontWeight: '500' }}>
                                                        <ShieldAlert size={16} /> Failed
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>{attempt.browser} on {attempt.OS}</p>
                                                <p style={{ fontSize: '0.625rem', color: '#64748b' }}>{attempt.IP}</p>
                                            </td>
                                            <td style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                {new Date(attempt.timestamp).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
