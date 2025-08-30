import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Auth from './pages/auth';
import Profile from './pages/profile';
import Chat from './pages/chat';
import { useAppStore } from './store';
import apiClient from './lib/api-client';
import { GET_USER_INFO } from './utills/constants';

const PrivateRoute = ({ children }) => {
    const { userInfo } = useAppStore();
    const location = useLocation();

    useEffect(() => {
        if (!userInfo) {
            localStorage.setItem('intendedPath', location.pathname);
        }
    }, [userInfo, location.pathname]);

    return userInfo ? children : <Navigate to="/auth" replace />;
};

const AuthRoute = ({ children }) => {
    const { userInfo } = useAppStore();
    const intendedPath = localStorage.getItem('intendedPath') || '/chat';
    return userInfo ? <Navigate to={intendedPath} replace /> : children;
};

function App() {
    const { userInfo, setUserInfo } = useAppStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserData = async () => {
            try {
                const response = await apiClient.get(GET_USER_INFO, {
                    withCredentials: true,
                });

                if (response.data?.user?.id) {
                    setUserInfo(response.data.user);
                } else if (response.data?.id) {
                    setUserInfo(response.data);
                } else {
                    setUserInfo(undefined);
                }
            } catch (error) {
                console.log(error);
                setUserInfo(undefined);
            } finally {
                setLoading(false);
            }
        };

        if (!userInfo) {
            getUserData();
        } else {
            setLoading(false);
        }
    }, [userInfo, setUserInfo]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/auth"
                    element={
                        <AuthRoute>
                            <Auth />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/chat"
                    element={
                        <PrivateRoute>
                            <Chat />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
