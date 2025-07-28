// src/hooks/useSSE.js
import { useEffect, useRef, useState } from 'react';

const useSSE = (endpoint, dependencies = []) => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState(null);
    const [error, setError] = useState(null);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            setError('未找到认证令牌');
            return;
        }

        // 创建SSE连接
        const connectSSE = () => {
            try {
                console.log('🔌 正在连接SSE:', endpoint);
                
                // 通过URL参数传递token（EventSource的正确认证方式）
                const url = `http://localhost:8080/v1/events/${endpoint}?token=${encodeURIComponent(token)}`;
                console.log('🔗 SSE连接URL:', url);
                eventSourceRef.current = new EventSource(url);

                eventSourceRef.current.onopen = () => {
                    console.log('✅ SSE连接已建立');
                    setIsConnected(true);
                    setError(null);
                };

                eventSourceRef.current.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('📨 收到SSE事件:', data);
                        setLastEvent(data);
                    } catch (err) {
                        console.error('❌ 解析SSE事件失败:', err);
                    }
                };

                eventSourceRef.current.onerror = (event) => {
                    console.error('❌ SSE连接错误:', event);
                    console.error('❌ EventSource readyState:', eventSourceRef.current?.readyState);
                    console.error('❌ EventSource URL:', eventSourceRef.current?.url);
                    
                    setIsConnected(false);
                    setError('SSE连接断开');
                    
                    // 检查token是否过期
                    const currentToken = localStorage.getItem('admin_token');
                    if (!currentToken) {
                        setError('认证令牌丢失，请重新登录');
                        return;
                    }
                    
                    // 自动重连（5秒后）
                    setTimeout(() => {
                        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
                            console.log('🔄 尝试重连SSE...');
                            connectSSE();
                        }
                    }, 5000);
                };

            } catch (err) {
                console.error('❌ 创建SSE连接失败:', err);
                setError(err.message);
            }
        };

        connectSSE();

        // 清理函数
        return () => {
            if (eventSourceRef.current) {
                console.log('🔌 关闭SSE连接');
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            setIsConnected(false);
        };
    }, dependencies);

    return {
        isConnected,
        lastEvent,
        error,
        disconnect: () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
                setIsConnected(false);
            }
        }
    };
};

export default useSSE;