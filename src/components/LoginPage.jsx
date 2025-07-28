import React, { useState } from 'react';
import api from '../utils/api.js';

function LoginPage({ onLoginSuccess }) {
    const [username, setUsername] = useState('superadmin');
    const [password, setPassword] = useState('SuperAdminPwd123!');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            console.log('🚀 正在尝试登录...', { username });
            const data = await api.post('/admin/login', { username, password });
            console.log('✅ 登录成功:', data);
            
            if (data && data.token) {
                localStorage.setItem('admin_token', data.token);
                onLoginSuccess(data.token);
            } else {
                throw new Error('服务器响应格式错误：缺少token');
            }
        } catch (err) {
            console.error('❌ 登录失败:', err);
            setError(err.message || '登录失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-full flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
                        <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        派单系统后台
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        请使用管理员账户登录
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">用户名</label>
                            <input 
                                id="username" 
                                name="username" 
                                type="text" 
                                required 
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                                placeholder="用户名" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                disabled={isLoading} 
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">密码</label>
                            <input 
                                id="password" 
                                name="password" 
                                type="password" 
                                required 
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                                placeholder="密码" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                disabled={isLoading} 
                            />
                        </div>
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">登录失败：</strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    <div>
                        <button 
                            type="submit" 
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                                isLoading 
                                    ? 'bg-indigo-400 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                            }`} 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    正在登录...
                                </div>
                            ) : (
                                '登 录'
                            )}
                        </button>
                    </div>
                </form>
                
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        默认账户：superadmin / SuperAdminPwd123!
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;