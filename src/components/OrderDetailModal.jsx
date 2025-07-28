// src/components/OrderDetailModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';

// 状态信息辅助函数
const getStatusInfo = (status) => {
    const statusMap = {
        0: { text: '待处理', color: 'bg-gray-100 text-gray-800' },
        1: { text: '已派单', color: 'bg-blue-100 text-blue-800' },
        2: { text: '已接单', color: 'bg-blue-100 text-blue-800' },
        3: { text: '前往接驾', color: 'bg-cyan-100 text-cyan-800' },
        4: { text: '已到达', color: 'bg-teal-100 text-teal-800' },
        5: { text: '服务中', color: 'bg-indigo-100 text-indigo-800' },
        6: { text: '已完成', color: 'bg-green-100 text-green-800' },
        7: { text: '已取消', color: 'bg-red-100 text-red-800' },
    };
    return statusMap[status] || { text: '未知状态', color: 'bg-yellow-100 text-yellow-800' };
};

function OrderDetailModal({ orderId, onClose }) {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // 获取订单详情
    const fetchOrderDetail = async () => {
        setIsLoading(true);
        try {
            const data = await api.get(`/orders/${orderId}`);
            setOrder(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrderDetail();
        }
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg">正在加载订单详情...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">加载错误</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <span className="sr-only">关闭</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="text-red-600">{error}</div>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const { text: statusText, color: statusColor } = getStatusInfo(order.status);

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                {/* 头部 */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                            订单详情 #{order.id}
                        </h3>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColor}`}>
                            {statusText}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="sr-only">关闭</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 内容区域 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 左侧：订单基本信息 */}
                    <div className="space-y-6">
                        {/* 订单信息卡片 */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-3">订单信息</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">订单类型：</span>
                                    <span className="font-medium">{order.order_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">服务级别：</span>
                                    <span className="font-medium">{order.required_service_level}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">服务时间：</span>
                                    <span className="font-medium">{new Date(order.service_time).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">乘客人数：</span>
                                    <span className="font-medium">{order.passenger_count}人</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">行李件数：</span>
                                    <span className="font-medium">{order.luggage_count}件</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">总金额：</span>
                                    <span className="font-medium text-green-600">¥{order.amount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">司机结算：</span>
                                    <span className="font-medium">¥{order.driver_settlement_amount}</span>
                                </div>
                                {order.flight_number && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">航班号：</span>
                                        <span className="font-medium">{order.flight_number}</span>
                                    </div>
                                )}
                                {order.external_order_id && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">外部订单号：</span>
                                        <span className="font-medium">{order.external_order_id}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 乘客信息卡片 */}
                        {order.passenger && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-3">乘客信息</h4>
                                <div className="space-y-2 text-sm">
                                    {order.passenger.name && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">姓名：</span>
                                            <span className="font-medium">{order.passenger.name}</span>
                                        </div>
                                    )}
                                    {order.passenger.phone && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">电话：</span>
                                            <span className="font-medium">{order.passenger.phone}</span>
                                        </div>
                                    )}
                                    {order.passenger.email && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">邮箱：</span>
                                            <span className="font-medium">{order.passenger.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 右侧：地址和司机信息 */}
                    <div className="space-y-6">
                        {/* 行程信息卡片 */}
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-3">行程信息</h4>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-blue-500 rounded-full h-4 w-4 flex items-center justify-center flex-shrink-0 mt-1">
                                        <span className="text-white text-xs font-bold">起</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">起点</p>
                                        <p className="font-medium">{order.pickup_address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="bg-green-500 rounded-full h-4 w-4 flex items-center justify-center flex-shrink-0 mt-1">
                                        <span className="text-white text-xs font-bold">终</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">终点</p>
                                        <p className="font-medium">{order.dropoff_address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 司机信息卡片 */}
                        {order.driver ? (
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-3">司机信息</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">姓名：</span>
                                        <span className="font-medium">{order.driver.name || '未提供'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">电话：</span>
                                        <span className="font-medium">{order.driver.phone || '未提供'}</span>
                                    </div>
                                </div>
                                
                                {/* 车辆信息 */}
                                {order.vehicle && (
                                    <div className="mt-4 pt-3 border-t border-purple-200">
                                        <h5 className="font-medium text-gray-900 mb-2">车辆信息</h5>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">车牌号：</span>
                                                <span className="font-medium">{order.vehicle.car_plate}</span>
                                            </div>
                                            {order.vehicle.brand && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">品牌：</span>
                                                    <span className="font-medium">{order.vehicle.brand}</span>
                                                </div>
                                            )}
                                            {order.vehicle.model && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">车型：</span>
                                                    <span className="font-medium">{order.vehicle.model}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-3">司机信息</h4>
                                <p className="text-gray-600">暂未分配司机</p>
                            </div>
                        )}

                        {/* 备注信息 */}
                        {order.customer_service_notes && (
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-3">备注信息</h4>
                                <p className="text-sm text-gray-700">{order.customer_service_notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 底部时间信息 */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-500">
                    <span>创建时间：{new Date(order.created_at).toLocaleString()}</span>
                    <span>更新时间：{new Date(order.updated_at).toLocaleString()}</span>
                </div>

                {/* 底部操作按钮 */}
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        关闭
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrderDetailModal;