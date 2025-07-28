// src/components/GrabRequestsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';

export default function GrabRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/grab-requests');
            setRequests(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleConfirm = async (requestId) => {
        try {
            await api.post(`/grab-requests/${requestId}/confirm`, {});
            alert('确认成功，订单已指派！');
            fetchRequests(); // 刷新列表
        } catch (err) {
            alert('确认失败: ' + err.message);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">抢单请求管理</h1>
            {isLoading && <p>正在加载请求列表...</p>}
            {error && <div className="text-red-600">{`加载失败: ${error}`}</div>}
            {!isLoading && !error && (
                <div className="bg-white shadow rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">请求司机</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用车时间</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">上车地址</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.map(req => (
                                <tr key={req.RequestID}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.OrderID}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.DriverName} (ID: {req.DriverID})</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.ServiceTime).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.PickupAddress}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button 
                                            onClick={() => handleConfirm(req.RequestID)}
                                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-md shadow-sm hover:bg-green-700"
                                        >
                                            确认派单
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}