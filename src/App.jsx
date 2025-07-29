// src/App.jsx  
// 【最简版本】不使用 Redux 和 React Router

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';

function App() {
  const [token, setToken] = useState(null);
  const [currentPage, setCurrentPage] = useState('orders');
  const [isLoading, setIsLoading] = useState(true);

  // 应用启动时检查认证状态
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    setToken(savedToken);
    setIsLoading(false);
  }, []);

  // 登录成功处理
  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
  };

  // 登出处理
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  // 页面导航处理
  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // 初始化加载中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {token ? (
        <Layout 
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;