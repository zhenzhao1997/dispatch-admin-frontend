// src/components/OrderPage.jsx - 集成派单助手的增强版本
// 【遵循避坑指南#1】在React项目中修改，不修改admin.html

import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import NewOrderModal from './NewOrderModal.jsx';
import EditOrderModal from './EditOrderModal.jsx';
import EnhancedOrderDetailModal from './OrderDetailModal.jsx'; // 🆕 使用增强版详情页
import DispatchAssistantModal from './DispatchAssistantModal.jsx'; // 🆕 直接派单助手

function OrderPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    
    // 🆕【派单助手】状态：直接从列表快速派单
    const [quickDispatchOrderId, setQuickDispatchOrderId] = useState(null);

    // 【遵循避坑指南#2】使用完整的API工具类获取订单列表
    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/orders');
            setOrders(data || []);
            console.log('✅ 订单列表加载成功，共', data?.length || 0, '条订单');
        } catch (err) {
            setError(err.message);
            console.error('❌ 获取订单列表失败:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // 状态文本映射
    const getStatusText = (status) => {
        const statusMap = {
            0: '待处理',
            1: '已派单', 
            2: '司机已接单',
            3: '前往接驾',
            4: '已到达',
            5: '服务中',
            6: '已完成',
            7: '已取消'
        };
        return statusMap[status] || '未知状态';
    };

    // 获取状态样式
    const getStatusStyle = (status) => {
        const styleMap = {
            0: 'bg-yellow-100 text-yellow-800',
            1: 'bg-blue-100 text-blue-800',
            2: 'bg-purple-100 text-purple-800',
            3: 'bg-teal-100 text-teal-800',
            4: 'bg-cyan-100 text-cyan-800',
            5: 'bg-indigo-100 text-indigo-800',
            6: 'bg-green-100 text-green-800',
            7: 'bg-red-100 text-red-800'
        };
        return styleMap[status] || 'bg-gray-100 text-gray-800';
    };

    // 订单创建成功回调
    const handleOrderCreated = () => {
        setIsModalOpen(false);
        fetchOrders();
    };

    // 订单编辑成功回调
    const handleOrderUpdated = () => {
        setEditingOrder(null);
        fetchOrders();
    };

    // 🆕【派单助手】成功指派回调
    const handleQuickDispatchSuccess = () => {
        setQuickDispatchOrderId(null);
        fetchOrders(); // 刷新列表
    };

    // 传统派单处理（保留原功能）
    const handleAssignDriver = async (orderId) => {
        const driverId = prompt('请输入司机ID:');
        if (!driverId) return;

        try {
            await api.post(`/orders/${orderId}/assign`, { driver_id: parseInt(driverId) });
            alert('派单成功!');
            fetchOrders();
        } catch (err) {
            alert('派单失败: ' + err.message);
        }
    };

    // 取消订单
    const handleCancelOrder = async (orderId) => {
        if (!confirm('确定要取消这个订单吗？')) return;

        try {
            await api.post(`/orders/${orderId}/cancel`);
            alert('订单已取消');
            fetchOrders();
        } catch (err) {
            alert('取消失败: ' + err.message);
        }
    };

    // 【遵循避坑指南#3】处理sql.NullString类型数据的工具函数
    const renderNullableString = (field, defaultValue = 'N/A') => {
        if (!field) return defaultValue;
        if (typeof field === 'string') return field;
        return (field && field.Valid) ? field.String : defaultValue;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">📋 订单管理</h1>
                    <p className="text-gray-600 mt-1">管理所有订单，支持智能派单</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>+ 新建订单</span>
                </button>
            </div>
            
            {/* 新建订单弹窗 */}
            {isModalOpen && (
                <NewOrderModal 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={handleOrderCreated} 
                />
            )}

            {/* 编辑订单弹窗 */}
            {editingOrder && (
                <EditOrderModal 
                    order={editingOrder}
                    onClose={() => setEditingOrder(null)} 
                    onSuccess={handleOrderUpdated} 
                />
            )}

            {/* 🆕【派单助手】订单详情弹窗（集成智能派单） */}
            {selectedOrderId && (
                <EnhancedOrderDetailModal
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                />
            )}

            {/* 🆕【派单助手】快速派单弹窗 */}
            {quickDispatchOrderId && (
                <DispatchAssistantModal
                    orderId={quickDispatchOrderId}
                    onClose={() => setQuickDispatchOrderId(null)}
                    onAssignSuccess={handleQuickDispatchSuccess}
                />
            )}

            {/* 加载状态 */}
            {isLoading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600 text-lg">正在加载订单列表...</p>
                </div>
            )}

            {/* 错误状态 */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center space-x-3">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-lg font-medium text-red-800">加载失败</h3>
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                    <button 
                        onClick={fetchOrders}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                        重试
                    </button>
                </div>
            )}

            {/* 订单列表 */}
            {!isLoading && !error && (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        订单信息
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        类型/状态
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        服务时间
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        起点地址
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        终点地址
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        金额
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order.ID || order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {/* 【遵循避坑指南#3】正确处理可能的sql.NullString */}
                                                    #{order.ID || order.id}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {renderNullableString(order.ExternalOrderID || order.external_order_id, '内部订单')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="text-sm text-gray-900">
                                                    {order.OrderType || order.order_type || 'N/A'}
                                                </div>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(order.Status || order.status)}`}>
                                                    {getStatusText(order.Status || order.status)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.ServiceTime || order.service_time).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {order.PickupAddress || order.pickup_address || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {order.DropoffAddress || order.dropoff_address || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ${(order.Amount || order.amount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                {/* 查看详情按钮 */}
                                                <button 
                                                    onClick={() => setSelectedOrderId(order.ID || order.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                    title="查看详情"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>

                                                {/* 🆕【派单助手】智能派单按钮 - 只在待处理状态显示 */}
                                                {(order.Status === 0 || order.status === 0) && (
                                                    <button 
                                                        onClick={() => setQuickDispatchOrderId(order.ID || order.id)}
                                                        className="text-purple-600 hover:text-purple-900 transition-colors"
                                                        title="智能派单"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                        </svg>
                                                    </button>
                                                )}

                                                {/* 编辑按钮 */}
                                                <button 
                                                    onClick={() => setEditingOrder(order)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    title="编辑订单"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>

                                                {/* 传统派单按钮 */}
                                                {(order.Status === 0 || order.status === 0) && (
                                                    <button 
                                                        onClick={() => handleAssignDriver(order.ID || order.id)}
                                                        className="text-green-600 hover:text-green-900 transition-colors"
                                                        title="手动派单"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                    </button>
                                                )}

                                                {/* 取消订单按钮 */}
                                                {(order.Status === 0 || order.status === 0) && (
                                                    <button 
                                                        onClick={() => handleCancelOrder(order.ID || order.id)}
                                                        className="text-red-600 hover:text-red-900 transition-colors"
                                                        title="取消订单"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 空状态 */}
                    {orders.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-500 mb-2">暂无订单</h3>
                            <p className="text-gray-400 mb-4">还没有任何订单，点击上方按钮创建第一个订单</p>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
                            >
                                创建订单
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* 页面底部统计信息 */}
            {!isLoading && !error && orders.length > 0 && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{orders.length}</div>
                            <div className="text-sm text-gray-600">总订单数</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {orders.filter(o => (o.Status || o.status) === 0).length}
                            </div>
                            <div className="text-sm text-gray-600">待处理</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600">
                                {orders.filter(o => (o.Status || o.status) === 1).length}
                            </div>
                            <div className="text-sm text-gray-600">已派单</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">
                                {orders.filter(o => (o.Status || o.status) === 6).length}
                            </div>
                            <div className="text-sm text-gray-600">已完成</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderPage;