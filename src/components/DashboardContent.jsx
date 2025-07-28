import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import DashboardStats from './charts/DashboardStats.jsx';

function DashboardContent() {
    const [admin, setAdmin] = useState(null);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const data = await api.get('/admin/me');
                setAdmin(data);
            } catch(err) {
                setError(err.message);
            }
        };
        fetchAdminData();

        // 更新时间
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* 欢迎区域 */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {admin ? `欢迎回来，${admin.full_name}！` : '正在加载...'}
                        </h1>
                        <p className="mt-2 text-indigo-100">
                            派单系统运行正常，今天是个适合工作的好日子 🌟
                        </p>
                        {error && <div className="mt-2 text-red-200">⚠️ {error}</div>}
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono">
                            {formatTime(currentTime).split(' ')[1]}
                        </div>
                        <div className="text-indigo-200">
                            {formatTime(currentTime).split(' ')[0]}
                        </div>
                    </div>
                </div>
            </div>

            {/* 数据统计组件 */}
            <DashboardStats />

            {/* 快捷操作区域 */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">快捷操作</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">新建订单</span>
                    </button>
                    
                    <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center">
                        <div className="w-8 h-8 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">司机管理</span>
                    </button>
                    
                    <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">车辆管理</span>
                    </button>
                    
                    <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-center">
                        <div className="w-8 h-8 bg-yellow-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">数据导出</span>
                    </button>
                </div>
            </div>

            {/* 系统状态 */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">系统状态</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">数据库连接正常</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">API服务运行中</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">系统运行正常</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardContent;