// src/components/OrderPage.jsx - 完全仿照携程风格的订单管理界面
import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import NewOrderModal from './NewOrderModal.jsx';
import AssignDriverModal from './AssignDriverModal.jsx';
import EditOrderModal from './EditOrderModal.jsx';
import OrderDetailModal from './OrderDetailModal.jsx';

// 状态配置 - 完全按照携程的颜色
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
        'AirportTransfer': '接送机', // 兼容原有数据
        'Charter': '包车',
        'PointToPoint': '市内用车',
    };
    return typeMap[orderType] || orderType;
};

// 单个订单行组件 - 完全模仿携程的布局
const OrderRow = ({ order, onAssignClick, onEditClick, onDetailClick }) => {
    const statusConfig = getStatusConfig(order.Status);
    const serviceTime = new Date(order.ServiceTime);
    const orderTypeDisplay = getOrderTypeDisplay(order.OrderType);
    
    // 格式化时间 - 携程风格
    const timeDisplay = serviceTime.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    const dateDisplay = serviceTime.toLocaleDateString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit' 
    });
    
    return (
        <div className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="px-6 py-4">
                {/* 第一行：时间、类型、状态 */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                        {/* 时间显示 - 大字体突出 */}
                        <div className="flex items-baseline space-x-2">
                            <span className="text-lg font-semibold text-gray-900">
                                {orderTypeDisplay} {timeDisplay}
                            </span>
                            <span className="text-sm text-gray-500">{dateDisplay}</span>
                        </div>
                        
                        {/* 状态标签 */}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                            {statusConfig.text}
                        </span>
                    </div>
                    
                    {/* 右侧时间和订单号 */}
                    <div className="text-right text-sm text-gray-500">
                        <div>{timeDisplay}完成派单</div>
                        <div className="text-xs">订单号码: {order.ID.toString().padStart(12, '0')}</div>
                    </div>
                </div>
                
                {/* 第二行：地址信息 */}
                <div className="mb-3">
                    <div className="flex items-start space-x-3">
                        {/* 地址图标 */}
                        <div className="flex flex-col items-center mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="w-0.5 h-4 bg-gray-300 my-1"></div>
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                        
                        {/* 地址文本 */}
                        <div className="flex-1 space-y-2">
                            <div className="text-sm text-gray-900">
                                {order.PickupAddress}
                            </div>
                            <div className="text-sm text-gray-900">
                                {order.DropoffAddress}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* 第三行：司机信息和其他详情 */}
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
                    
                    {/* 操作按钮 - 携程风格 */}
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

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/orders');
            setOrders(Array.isArray(data) ? data : []);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

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
        const matchesStatus = filterStatus === 'all' || order.Status === parseInt(filterStatus);
        const matchesType = filterType === 'all' || order.OrderType === filterType;
        return matchesStatus && matchesType;
    });

    return (
        <div className="max-w-full">
            {/* 页面头部 - 携程风格 */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-6 py-4">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-semibold text-gray-900">订单管理</h1>
                        <button 
                            onClick={() => setIsNewOrderModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                        >
                            新建订单
                        </button>
                    </div>
                    
                    {/* 筛选栏 - 携程风格的标签页 */}
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
            
            {/* 弹窗们 */}
            {isNewOrderModalOpen && <NewOrderModal onClose={() => setIsNewOrderModalOpen(false)} onSuccess={handleModalClose} />}
            {assigningOrder && <AssignDriverModal order={assigningOrder} onClose={() => setAssigningOrder(null)} onSuccess={handleModalClose} />}
            {editingOrder && <EditOrderModal order={editingOrder} onClose={() => setEditingOrder(null)} onSuccess={handleModalClose} />}
            {viewingOrderId && <OrderDetailModal orderId={viewingOrderId} onClose={() => setViewingOrderId(null)} />}

            {/* 订单列表 - 携程风格的列表 */}
            <div className="bg-white">
                {isLoading && (
                    <div className="text-center py-8">
                        <div className="text-gray-500">正在加载订单列表...</div>
                    </div>
                )}
                
                {error && (
                    <div className="px-6 py-4 text-red-600 bg-red-50 border-b border-red-200">
                        加载失败: {error}
                    </div>
                )}
                
                {!isLoading && !error && filteredOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        {orders.length === 0 ? '暂无订单数据' : '没有符合条件的订单'}
                    </div>
                )}
                
                {!isLoading && !error && filteredOrders.map(order => (
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