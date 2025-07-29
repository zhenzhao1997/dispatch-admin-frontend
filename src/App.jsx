// src/App.jsx
// 【技术总监V3.0】应用主组件 - 集成字典服务

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { fetchSystemConstants, selectIsInitialized, selectConstantsLoading, selectConstantsError } from './store/slices/systemConstantsSlice';

// 组件导入
import LoginPage from './components/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import OrderPage from './components/OrderPage';
import VehiclePage from './components/VehiclePage';
import DriverPage from './components/DriverPage';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const dispatch = useDispatch();
  const isConstantsInitialized = useSelector(selectIsInitialized);
  const constantsLoading = useSelector(selectConstantsLoading);
  const constantsError = useSelector(selectConstantsError);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  // =================================================================
  // 【关键修改】应用启动时立即加载系统字典
  // =================================================================
  
  useEffect(() => {
    // 只有在用户已认证且字典未初始化时才加载
    if (isAuthenticated && !isConstantsInitialized && !constantsLoading) {
      console.log('🚀 应用启动：开始加载系统字典...');
      dispatch(fetchSystemConstants());
    }
  }, [dispatch, isAuthenticated, isConstantsInitialized, constantsLoading]);

  // =================================================================
  // 渲染逻辑
  // =================================================================

  // 未认证用户显示登录页
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    );
  }

  // 字典加载中显示全屏加载器
  if (constantsLoading || !isConstantsInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-lg text-gray-600">正在初始化系统字典...</p>
          <p className="mt-2 text-sm text-gray-500">请稍候，这只需要几秒钟</p>
        </div>
      </div>
    );
  }

  // 字典加载失败显示错误页面
  if (constantsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">系统初始化失败</h1>
          <p className="text-red-600 mb-4">{constantsError}</p>
          <button 
            onClick={() => {
              console.log('🔄 重新加载系统字典...');
              dispatch(fetchSystemConstants());
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  // 正常渲染应用
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/orders" replace />} />
              <Route path="orders" element={<OrderPage />} />
              <Route path="vehicles" element={<VehiclePage />} />
              <Route path="drivers" element={<DriverPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;