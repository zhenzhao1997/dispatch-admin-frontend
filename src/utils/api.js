// src/utils/api.js
const API_BASE_URL = 'http://localhost:8080/v1';

console.log('🔗 API地址配置:', API_BASE_URL);

const request = async (endpoint, options = {}) => {
    const token = localStorage.getItem('admin_token');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('📡 发起请求:', fullUrl);

    try {
        const response = await fetch(fullUrl, config);
        console.log('📥 收到响应:', response.status, response.statusText);

        if (!response.ok) {
            if (response.status === 401) {
                console.log('🔑 认证失败，清除token');
                localStorage.removeItem('admin_token');
                window.location.reload();
                throw new Error('登录已过期，请重新登录');
            }
            
            try {
                const errorData = await response.json();
                console.error('❌ 错误响应:', errorData);
                throw new Error(errorData.error || `请求失败，状态码: ${response.status}`);
            } catch (e) {
                if (e.message.includes('请求失败，状态码:')) {
                    throw e;
                }
                console.error('❌ 解析错误响应失败:', e);
                throw new Error(`请求失败: ${response.status} ${response.statusText}`);
            }
        }
        
        if (response.status === 201 || response.status === 204) {
            console.log('✅ 请求成功，无内容返回');
            return {};
        }

        const data = await response.json();
        console.log('✅ 请求成功，数据:', data);
        return data;
        
    } catch (error) {
        console.error('🚨 请求异常:', error);
        
        // 网络连接错误的友好提示
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('无法连接到服务器，请确认后端服务是否正在运行');
        }
        
        throw error;
    }
};

const api = {
    // 健康检查
    healthCheck: async () => {
        try {
            console.log('🏥 执行健康检查...');
            const result = await fetch('http://localhost:8080/healthcheck');
            const data = await result.json();
            console.log('✅ 健康检查成功:', data);
            return data;
        } catch (error) {
            console.error('❌ 健康检查失败:', error);
            throw new Error('后端服务不可用');
        }
    },
    
    get: (endpoint) => request(endpoint),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export default api;