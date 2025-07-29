import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import NewOrderModal from './NewOrderModal.jsx';
import EditOrderModal from './EditOrderModal.jsx';
// 🔧 修正导入路径 - 应该导入 OrderDetailModal.jsx 中的默认导出
import EnhancedOrderDetailModal from './OrderDetailModal.jsx';

function OrderPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // 获取订单列表
    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/orders');
            setOrders(data || []);
        } catch (err) {
            setError(err.message);
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
            0: 'bg-gray-100 text-gray-800',
            1: 'bg-blue-100 text-blue-800',
            2: 'bg-purple-100 text-purple-800',
            3: 'bg-yellow-100 text-yellow-800',
            4: 'bg-orange-100 text-orange-800',
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

    // 派单处理
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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">订单管理</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                >
                    + 新建订单
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

            {/* 订单详情弹窗 */}
            {selectedOrderId && (
                <EnhancedOrderDetailModal
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                />
            )}

            {/* 加载状态 */}
            {isLoading && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-600">正在加载订单列表...</p>
                </div>
            )}

            {/* 错误状态 */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <div className="text-red-800">加载失败: {error}</div>
                </div>
            )}

            {/* 订单列表 */}
            {!isLoading && !error && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    订单号
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    订单类型
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    状态
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    用车时间
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    起点
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    终点
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    金额
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        暂无订单数据
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.ID || order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order.ExternalOrderID && order.ExternalOrderID.Valid 
                                                ? order.ExternalOrderID.String 
                                                : `内部 #${order.ID || order.id}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.OrderType || order.order_type || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(order.Status || order.status)}`}>
                                                {getStatusText(order.Status || order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.ServiceTime || order.service_time).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-32 truncate">
                                            {order.PickupAddress || order.pickup_address || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-32 truncate">
                                            {order.DropoffAddress || order.dropoff_address || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${(order.Amount || order.amount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button 
                                                onClick={() => setSelectedOrderId(order.ID || order.id)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                查看
                                            </button>
                                            <button 
                                                onClick={() => setEditingOrder(order)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                编辑
                                            </button>
                                            {(order.Status === 0 || order.status === 0) && (
                                                <button 
                                                    onClick={() => handleAssignDriver(order.ID || order.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    派单
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default OrderPage;