// src/utils/api.js
const API_BASE_URL = 'http://localhost:8080/v1';

console.log('🔗 API地址配置:', API_BASE_URL);

const request = async (method, endpoint, data = null) => {
    const token = localStorage.getItem('admin_token');
    
    const headers = {
        'Content-Type': 'application/json',
    };

    // 只在非登录请求时添加 Authorization header
    if (token && endpoint !== '/admin/login') {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('📡 发起请求:', method, fullUrl);
    console.log('📤 请求数据:', data);

    try {
        const response = await fetch(fullUrl, config);
        console.log('📥 收到响应:', response.status, response.statusText);

        if (!response.ok) {
            let errorMessage = '请求失败';
            
            try {
                const errorData = await response.json();
                console.error('❌ 错误响应:', errorData);
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                console.error('❌ 解析错误响应失败:', e);
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            
            if (response.status === 401) {
                console.log('🔑 认证失败，清除token');
                localStorage.removeItem('admin_token');
                // 不要自动刷新页面，让组件处理状态变化
            }
            
            throw new Error(errorMessage);
        }
        
        // 处理无内容响应
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            console.log('✅ 请求成功，无内容返回');
            return null;
        }

        const responseData = await response.json();
        console.log('✅ 请求成功，返回数据:', responseData);
        return responseData;
        
    } catch (error) {
        console.error('🚨 请求异常:', error);
        
        // 网络连接错误的友好提示
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('无法连接到服务器，请确认后端服务是否在运行 (http://localhost:8080)');
        }
        
        throw error;
    }
};

const api = {
    get: (endpoint) => request('GET', endpoint),
    post: (endpoint, data) => request('POST', endpoint, data),
    put: (endpoint, data) => request('PUT', endpoint, data),
    delete: (endpoint) => request('DELETE', endpoint),
};

export default api;