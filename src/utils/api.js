// 【核心修正】移除了第一行错误的 import AsyncStorage 语句

const API_BASE_URL = 'http://192.168.50.38:8080/v1'; // 请再次确认IP地址

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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        try {
            const errorData = await response.json();
            throw new Error(errorData.error || `请求失败，状态码: ${response.status}`);
        } catch (e) {
            throw new Error(`请求失败: ${response.status} ${response.statusText}`);
        }
    }
    
    if (response.status === 201 || response.status === 204) {
        return {};
    }

    return response.json();
};

const api = {
    get: (endpoint) => request(endpoint),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export default api;