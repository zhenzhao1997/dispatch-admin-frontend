// utils/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// 再次确认这里的IP地址是您电脑的局域网IP
const API_BASE_URL = 'http://192.168.50.38:8080/v1';

const request = async (endpoint, options = {}) => {
    const token = await AsyncStorage.getItem('driver_token');

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

    // 对应 204 No Content 这种没有返回体的成功响应
    if (response.status === 204) {
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