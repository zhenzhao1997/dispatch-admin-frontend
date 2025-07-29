// src/components/OrderDetailModal.jsx - 简化稳定版本
// 【遵循避坑指南#1】在React项目中修改，不修改admin.html

import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import DispatchAssistantModal from './DispatchAssistantModal.jsx';

function OrderDetailModal({ orderId, onClose }) {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDispatchAssistant, setShowDispatchAssistant] = useState(false);

    // 【遵循避坑指南#3】处理sql.NullString类型数据的安全函数
    const safeString = (field, defaultValue = 'N/A') => {
        if (!field) return defaultValue;
        if (typeof field === 'string') return field;
        return (field && field.Valid) ? field.String : defaultValue;
    };

    const safeNumber = (field, defaultValue = 0) => {
        if (field === null || field === undefined) return defaultValue;
        if (typeof field === 'number') return field;
        return (field && field.Valid) ? (field.Int64 || field.Float64 || 0) : defaultValue;
    };

    // 获取订单详情
    const fetchOrderDetails = async () => {
        try {
            setIsLoading(true);
            setError('');
            console.log('📋 获取订单详情:', orderId);
            
            const data = await api.get(`/orders/${orderId}`);
            setOrder(data);
            console.log('✅ 订单详情加载成功:', data);
        } catch (err) {
            console.error('❌ 获取订单详情失败:', err);
            setError(err.message || '加载失败');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    // 派单成功回调
    const handleAssignSuccess = () => {
        setShowDispatchAssistant(false);
        fetchOrderDetails(); // 刷新订单详情
    };

    // 获取状态信息
    const getStatusInfo = (status) => {
        const statusMap = {
            0: { text: '待处理', color: 'bg-yellow-100 text-yellow-800', canDispatch: true },
            1: { text: '已派单', color: 'bg-blue-100 text-blue-800', canDispatch: false },
            2: { text: '司机已接单', color: 'bg-purple-100 text-purple-800', canDispatch: false },
            3: { text: '前往接驾', color: 'bg-teal-100 text-teal-800', canDispatch: false },
            4: { text: '已到达', color: 'bg-cyan-100 text-cyan-800', canDispatch: false },
            5: { text: '服务中', color: 'bg-indigo-100 text-indigo-800', canDispatch: false },
            6: { text: '已完成', color: 'bg-green-100 text-green-800', canDispatch: false },
            7: { text: '已取消', color: 'bg-red-100 text-red-800', canDispatch: false }
        };
        return statusMap[status] || { text: '未知状态', color: 'bg-gray-100 text-gray-800', canDispatch: false };
    };

    // 加载状态
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
                <div className="bg-white rounded-lg p-8 max-w-md">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">正在加载订单详情...</p>
                    </div>
                </div>
            </div>
        );
    }

    // 错误状态
    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
                <div className="bg-white rounded-lg p-8 max-w-md">
                    <div className="text-center">
                        <div className="text-red-500 text-4xl mb-4">❌</div>
                        <h3 className="text-lg font-medium text-red-800 mb-2">加载失败</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <div className="space-x-3">
                            <button 
                                onClick={fetchOrderDetails}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                重试
                            </button>
                            <button 
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 没有订单数据
    if (!order) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
                <div className="bg-white rounded-lg p-8 max-w-md">
                    <div className="text-center">
                        <div className="text-gray-400 text-4xl mb-4">📋</div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">订单不存在</h3>
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                    
                    {/* 头部 */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    📋 订单详情 #{order.id}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    外部订单号: {safeString(order.external_order_id, '内部订单')}
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                {/* 智能派单按钮 - 只在待处理状态显示 */}
                                {statusInfo.canDispatch && (
                                    <button
                                        onClick={() => setShowDispatchAssistant(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"
                                    >
                                        <span>🤖</span>
                                        <span>智能派单</span>
                                    </button>
                                )}
                                
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.color}`}>
                                    {statusInfo.text}
                                </span>
                                
                                <button 
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 内容区域 */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* 基本信息 */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 基本信息</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">订单类型:</span>
                                        <span className="font-medium">{order.order_type || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">服务等级:</span>
                                        <span className="font-medium">{order.required_service_level || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">服务时间:</span>
                                        <span className="font-medium">
                                            {order.service_time ? new Date(order.service_time).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">乘客数量:</span>
                                        <span className="font-medium">{order.passenger_count || 0}人</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">行李数量:</span>
                                        <span className="font-medium">{order.luggage_count || 0}件</span>
                                    </div>
                                </div>
                            </div>

                            {/* 地址信息 */}
                            <div className="bg-green-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 地址信息</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                            <span className="font-medium text-green-700">起点</span>
                                        </div>
                                        <p className="text-gray-700 ml-6">{order.pickup_address || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                            <span className="font-medium text-red-700">终点</span>
                                        </div>
                                        <p className="text-gray-700 ml-6">{order.dropoff_address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 费用信息 */}
                            <div className="bg-yellow-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 费用信息</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">订单金额:</span>
                                        <span className="font-bold text-lg text-green-600">
                                            ${(order.amount || 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">司机结算:</span>
                                        <span className="font-medium">
                                            ${(order.driver_settlement_amount || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 时间信息 */}
                            <div className="bg-purple-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">⏰ 时间信息</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">创建时间:</span>
                                        <span className="font-medium">
                                            {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">更新时间:</span>
                                        <span className="font-medium">
                                            {order.updated_at ? new Date(order.updated_at).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 特殊信息 - 只在有数据时显示 */}
                            {(order.flight_number || order.terminal) && (
                                <div className="bg-orange-50 rounded-lg p-4 lg:col-span-2">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">✈️ 航班信息</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {order.flight_number && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">航班号:</span>
                                                <span className="font-medium">{safeString(order.flight_number)}</span>
                                            </div>
                                        )}
                                        {order.terminal && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">航站楼:</span>
                                                <span className="font-medium">{safeString(order.terminal)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 备注信息 - 只在有数据时显示 */}
                            {order.customer_service_notes && (
                                <div className="bg-gray-50 rounded-lg p-4 lg:col-span-2">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 客服备注</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {safeString(order.customer_service_notes)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 底部操作栏 */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                订单ID: {order.id}
                            </div>
                            <div className="flex space-x-3">
                                {statusInfo.canDispatch && (
                                    <button
                                        onClick={() => setShowDispatchAssistant(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
                                    >
                                        ⚡ 快速派单
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    关闭
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 派单助手模态框 */}
            {showDispatchAssistant && (
                <DispatchAssistantModal
                    orderId={order.id}
                    onClose={() => setShowDispatchAssistant(false)}
                    onAssignSuccess={handleAssignSuccess}
                />
            )}
        </>
    );
}

export default OrderDetailModal;