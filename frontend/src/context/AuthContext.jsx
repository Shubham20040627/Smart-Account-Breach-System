import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';

const AuthContext = createContext();
const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Socket Connection
    useEffect(() => {
        if (user) {
            const newSocket = io(socketURL, {
                withCredentials: true
            });

            newSocket.on('connect', () => {
                newSocket.emit('join', user.id);
            });

            newSocket.on('LOGOUT_ALL', () => {
                // Instantly logout if alerted
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                window.location.href = '/login';
            });

            newSocket.on('SECURITY_UPDATE', () => {
                // Trigger a re-fetch of security status in components
                setRefreshTrigger(prev => prev + 1);
            });

            newSocket.on('SECURITY_ALERT', (msg) => {
                alert(msg);
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, [user]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser(JSON.parse(localStorage.getItem('user')));
                }
            } catch (err) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await authService.login({ email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        try { await authService.logout(); } catch (e) { }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, setUser, refreshTrigger }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
