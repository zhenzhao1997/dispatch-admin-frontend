import React, { useState } from 'react';
import LoginPage from './components/LoginPage.jsx';
import Layout from './components/Layout.jsx';

function App() {
    const [token, setToken] = useState(localStorage.getItem('admin_token'));
    const [currentPage, setCurrentPage] = useState('dashboard');

    const handleLoginSuccess = (newToken) => setToken(newToken);
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
    };
    const handleNavigate = (page) => setCurrentPage(page);

    return (
        <div className="h-full">
            {token ? (
                <Layout currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} />
            ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
            )}
        </div>
    );
}

export default App;