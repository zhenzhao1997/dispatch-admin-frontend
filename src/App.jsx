// src/App.jsx
// 【稳定版本】保持Redux架构完整性的App组件

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { restoreAuth, selectIsAuthenticated } from './store/slices/authSlice';
import { selectIsInitialized, selectConstantsLoading, selectConstantsError } from './store/index';

// 组件导入
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isConstantsInitialized = useSelector(selectIsInitialized);
  const constantsLoading = useSelector(selectConstantsLoading);
  const constantsError = useSelector(selectConstantsError);
  
  const [appInitialized, setAppInitialized] = useState(false);

  // 应用启动时初始化认证状态
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      dispatch(restoreAuth({ token }));
    }
    setAppInitialized(true);
  }, [dispatch]);

  // 应用初始化中
  if (!appInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">正在初始化应用...</p>
        </div>
      </div>
    );
  }

  // 未认证显示登录页
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // 字典加载中 (可选功能，不阻塞主界面)
  if (constantsLoading && !isConstantsInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">正在加载系统配置...</p>
        </div>
      </div>
    );
  }

  // 已认证，显示主界面
  return <LayoutWrapper />;
}

// Layout包装器组件
function LayoutWrapper() {
  const [currentPage, setCurrentPage] = useState('orders');
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch({ type: 'auth/logout' });
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <Layout 
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}

export default App;