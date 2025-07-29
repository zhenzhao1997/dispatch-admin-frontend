// src/components/OrderPage.jsx - 修复版本 + SSE实时更新
import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import useSSE from '../hooks/useSSE.js';
import NewOrderModal from './NewOrderModal.jsx';
import AssignDriverModal from './AssignDriverModal.jsx';
import EditOrderModal from './EditOrderModal.jsx';
import OrderDetailModal from './OrderDetailModal.jsx';
import EnhancedOrderDetailModal from './EnhancedOrderDetailModal.jsx';


// 状态配置
const getStatusConfig = (status) => {
    const statusMap = {
        0: { text: '待接单', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
        1: { text: '确认已发单', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
        2: { text: '司机已接单', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
        3: { text: '前往接驾', bgColor: 'bg-cyan-100', textColor: 'text-cyan-600' },
        4: { text: '已到达', bgColor: 'bg-teal-100', textColor: 'text-teal-600' },
        5: { text: '服务中', bgColor: 'bg-indigo-100', textColor: 'text-indigo-600' },
        6: { text: '已完成', bgColor: 'bg-green-100', textColor: 'text-green-600' },
        7: { text: '已取消', bgColor: 'bg-red-100', textColor: 'text-red-600' },
    };
    return statusMap[status] || { text: '未知状态', bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
};

// 订单类型配置
const getOrderTypeDisplay = (orderType) => {
    const typeMap = {
        'AirportTransfer_Arrival': '接机',
        'AirportTransfer_Departure': '送机',
        'AirportTransfer': '接送机',
        'Charter': '包车',
        'PointToPoint': '市内用车',
    };
    return typeMap[orderType] || orderType;
};

// 安全获取属性值的辅助函数
const safeGet = (obj, path, defaultValue = '') => {
    try {
        return path.split('.').reduce((current, key) => {
            if (current && typeof current === 'object' && key in current) {
                return current[key];
            }
            return defaultValue;
        }, obj);
    } catch (error) {
        console.warn('safeGet error:', error, 'path:', path, 'obj:', obj);
        return defaultValue;
    }
};

// 单个订单行组件
const OrderRow = ({ order, onAssignClick, onEditClick, onDetailClick }) => {
    const statusConfig = getStatusConfig(order.Status);
    
    // 安全处理时间显示
    const formatServiceTime = (timeStr) => {
        try {
            const date = new Date(timeStr);
            return date.toLocaleString('zh-CN', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return timeStr || '未设置';
        }
    };

    return (
        <div className="border-b border-gray-200 py-4 px-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
                {/* 左侧：基本信息 */}
                <div className="flex-1">
                    {/* 第一行：订单类型、状态、时间 */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                            <span className="text-lg font-medium text-gray-900">
                                {getOrderTypeDisplay(order.OrderType)}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                                {statusConfig.text}
                            </span>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                            <div>{formatServiceTime(order.ServiceTime)}</div>
                            <div className="text-xs">订单号: #{order.ID}</div>
                        </div>
                    </div>
                    
                    {/* 第二行：地址信息 */}
                    <div className="mb-3">
                        <div className="flex items-start space-x-3">
                            <div className="flex flex-col items-center mt-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="w-0.5 h-4 bg-gray-300 my-1"></div>
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="text-sm text-gray-900">
                                    起：{order.PickupAddress || '未设置'}
                                </div>
                                <div className="text-sm text-gray-900">
                                    终：{order.DropoffAddress || '未设置'}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* 第三行：详细信息 */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                            {/* 司机信息 */}
                            {order.AssignedDriverName ? (
                                <span>司机: {order.AssignedDriverName}</span>
                            ) : (
                                <span className="text-orange-600">未分配司机</span>
                            )}
                            
                            {/* 乘客信息 */}
                            <span>乘客: {order.PassengerCount || 1}人</span>
                            
                            {/* 行李信息 */}
                            {order.LuggageCount > 0 && (
                                <span>行李: {order.LuggageCount}件</span>
                            )}
                            
                            {/* 航班信息 */}
                            {order.FlightNumber && (
                                <span>航班: {order.FlightNumber}</span>
                            )}
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => onDetailClick(order)}
                                className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                            >
                                详情
                            </button>
                            
                            <button
                                onClick={() => onEditClick(order)}
                                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                            >
                                编辑
                            </button>
                            
                            {order.Status === 0 && (
                                <button
                                    onClick={() => onAssignClick(order)}
                                    className="px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                                >
                                    派单
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 主订单页面组件
function OrderPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
    const [assigningOrder, setAssigningOrder] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [viewingOrderId, setViewingOrderId] = useState(null);
    
    // 筛选状态
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');

    // 🆕 SSE实时通信
    const { isConnected, lastEvent, error: sseError } = useSSE('admin');

    const fetchOrders = async () => {
        setIsLoading(true);
        setError('');
        try {
            console.log('🔍 开始获取订单列表...');
            const data = await api.get('/orders');
            console.log('✅ 原始订单数据:', data);
            
            // 确保数据是数组格式
            const ordersArray = Array.isArray(data) ? data : [];
            console.log('📋 处理后的订单数组:', ordersArray);
            
            setOrders(ordersArray);
        } catch (err) {
            console.error('❌ 获取订单失败:', err);
            setError(err.message || '获取订单失败');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        fetchOrders(); 
    }, []);

    // 🆕 处理SSE事件
    useEffect(() => {
        if (lastEvent) {
            console.log('📨 处理SSE事件:', lastEvent);
            
            switch (lastEvent.type) {
                case 'connected':
                    console.log('✅ SSE连接成功:', lastEvent.data.message);
                    break;
                    
                case 'order_created':
                    console.log('🆕 新订单创建:', lastEvent.data);
                    // 自动刷新订单列表
                    fetchOrders();
                    // 可以添加通知提示
                    showNotification('新订单已创建', 'success');
                    break;
                    
                case 'order_assigned':
                    console.log('📋 订单已派单:', lastEvent.data);
                    // 自动刷新订单列表
                    fetchOrders();
                    showNotification(`订单已分配给司机 ${lastEvent.data.driver_name}`, 'success');
                    break;
                    
                case 'order_updated':
                    console.log('🔄 订单已更新:', lastEvent.data);
                    fetchOrders();
                    break;
                    
                default:
                    console.log('📨 未知事件类型:', lastEvent.type);
            }
        }
    }, [lastEvent]);

    // 🆕 显示通知的函数
    const showNotification = (message, type = 'info') => {
        // 这里可以集成更好的通知组件，现在先用简单的alert
        if (type === 'success') {
            console.log('✅ 通知:', message);
        } else {
            console.log('ℹ️ 通知:', message);
        }
        // TODO: 后续可以替换为更好的通知组件
    };

    const handleModalClose = () => {
        setIsNewOrderModalOpen(false);
        setAssigningOrder(null);
        setEditingOrder(null);
        setViewingOrderId(null);
        fetchOrders();
    };

    const handleViewDetail = (order) => {
        setViewingOrderId(order.ID);
    };
    
    // 筛选订单
    const filteredOrders = orders.filter(order => {
        try {
            const matchesStatus = filterStatus === 'all' || order.Status === parseInt(filterStatus);
            const matchesType = filterType === 'all' || order.OrderType === filterType;
            return matchesStatus && matchesType;
        } catch (error) {
            console.warn('筛选订单时出错:', error, order);
            return false;
        }
    });

    return (
        <div className="max-w-full">
            {/* 页面头部 */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-6 py-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-semibold text-gray-900">订单管理</h1>
                            {/* 🆕 SSE连接状态指示器 */}
                            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                                isConnected 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                    isConnected ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                                <span>{isConnected ? '实时连接正常' : '连接断开'}</span>
                            </div>
                            {sseError && (
                                <div className="text-xs text-red-600">
                                    SSE错误: {sseError}
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={() => setIsNewOrderModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                        >
                            新建订单
                        </button>
                    </div>
                    
                    {/* 筛选栏 */}
                    <div className="flex items-center space-x-1 border-b border-gray-200">
                        {/* 状态筛选 */}
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                filterStatus === 'all' 
                                ? 'border-blue-500 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            全部 <span className="text-xs">({orders.length})</span>
                        </button>
                        
                        <button
                            onClick={() => setFilterStatus('0')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                filterStatus === '0' 
                                ? 'border-blue-500 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            待接单 <span className="text-xs">({orders.filter(o => o.Status === 0).length})</span>
                        </button>
                        
                        <button
                            onClick={() => setFilterStatus('1')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                filterStatus === '1' 
                                ? 'border-blue-500 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            已派单 <span className="text-xs">({orders.filter(o => o.Status === 1).length})</span>
                        </button>
                        
                        <button
                            onClick={() => setFilterStatus('6')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                filterStatus === '6' 
                                ? 'border-blue-500 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            已完成 <span className="text-xs">({orders.filter(o => o.Status === 6).length})</span>
                        </button>
                        
                        {/* 订单类型筛选 */}
                        <div className="ml-8 flex items-center space-x-4">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:border-blue-500"
                            >
                                <option value="all">所有类型</option>
                                <option value="AirportTransfer_Arrival">接机</option>
                                <option value="AirportTransfer_Departure">送机</option>
                                <option value="Charter">包车</option>
                                <option value="PointToPoint">市内用车</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 弹窗组件 */}
            {isNewOrderModalOpen && <NewOrderModal onClose={() => setIsNewOrderModalOpen(false)} onSuccess={handleModalClose} />}
            {assigningOrder && <AssignDriverModal order={assigningOrder} onClose={() => setAssigningOrder(null)} onSuccess={handleModalClose} />}
            {editingOrder && <EditOrderModal order={editingOrder} onClose={() => setEditingOrder(null)} onSuccess={handleModalClose} />}
            {viewingOrderId && (<EnhancedOrderDetailModal orderId={viewingOrderId} onClose={() => setViewingOrderId(null)} />)}

            {/* 订单列表 */}
            <div className="bg-white">
                {isLoading && (
                    <div className="text-center py-8">
                        <div className="text-gray-500">正在加载订单列表...</div>
                    </div>
                )}
                
                {error && (
                    <div className="px-6 py-4 text-red-600 bg-red-50 border-b border-red-200">
                        加载失败: {error}
                        <button 
                            onClick={fetchOrders}
                            className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                            重试
                        </button>
                    </div>
                )}
                
                {!isLoading && !error && filteredOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        {orders.length === 0 ? '暂无订单数据' : '没有符合条件的订单'}
                    </div>
                )}
                
                {!isLoading && !error && filteredOrders.length > 0 && filteredOrders.map(order => (
                    <OrderRow 
                        key={order.ID} 
                        order={order}
                        onAssignClick={setAssigningOrder}
                        onEditClick={setEditingOrder}
                        onDetailClick={handleViewDetail}
                    />
                ))}
            </div>
        </div>
    );
}

export default OrderPage;