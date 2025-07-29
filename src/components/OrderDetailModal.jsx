import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, User, Car, Phone, Mail, DollarSign, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/api.js';

const EnhancedOrderDetailModal = ({ orderId, onClose }) => {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // 真实API调用获取订单详情
    useEffect(() => {
        const fetchOrderDetail = async () => {
            setIsLoading(true);
            try {
                // 🔧 使用您现有的API
                const data = await api.get(`/orders/${orderId}`);
                console.log('📋 获取到的订单数据:', data);
                
                // 🔧 适配您的数据结构
                const adaptedOrder = {
                    id: data.id,
                    status: data.status,
                    orderType: data.order_type,
                    orderSubtype: data.order_subtype || '',
                    serviceTime: data.service_time,
                    pickupAddress: data.pickup_address,
                    dropoffAddress: data.dropoff_address,
                    amount: data.amount,
                    driverSettlementAmount: data.driver_settlement_amount,
                    flightNumber: data.flight_number,
                    passengerCount: data.passenger_count,
                    luggageCount: data.luggage_count,
                    requiredServiceLevel: data.required_service_level,
                    customerServiceNotes: data.customer_service_notes,
                    createdAt: data.created_at,
                    updatedAt: data.updated_at,
                    
                    // 乘客信息
                    passenger: data.passenger ? {
                        name: data.passenger.name,
                        phone: data.passenger.phone,
                        email: data.passenger.email
                    } : {
                        name: '未提供',
                        phone: '未提供',
                        email: '未提供'
                    },
                    
                    // 司机信息
                    driver: data.driver ? {
                        id: data.driver.id,
                        name: data.driver.name,
                        phone: data.driver.phone,
                        rating: 4.8, // 暂时使用默认值
                        totalOrders: 1000 // 暂时使用默认值
                    } : null,
                    
                    // 车辆信息
                    vehicle: data.vehicle ? {
                        plate: data.vehicle.car_plate,
                        brand: data.vehicle.brand || '未提供',
                        model: data.vehicle.model || '未提供',
                        year: 2022, // 暂时使用默认值
                        color: '黑色', // 暂时使用默认值
                        serviceLevel: data.required_service_level
                    } : null,
                    
                    // 时间轴（基于订单状态生成）
                    timeline: generateTimeline(data)
                };
                
                setOrder(adaptedOrder);
            } catch (err) {
                console.error('❌ 获取订单详情失败:', err);
                setError('获取订单详情失败: ' + err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetail();
        }
    }, [orderId]);

    // 🔧 根据订单状态生成时间轴
    const generateTimeline = (orderData) => {
        const baseTime = new Date(orderData.created_at);
        const timeline = [];
        
        // 订单创建
        timeline.push({
            time: orderData.created_at,
            event: '订单创建',
            status: 'completed'
        });
        
        // 根据当前状态添加相应的时间节点
        if (orderData.status >= 1) {
            timeline.push({
                time: orderData.updated_at,
                event: '派单给司机',
                status: 'completed'
            });
        }
        
        if (orderData.status >= 2) {
            timeline.push({
                time: orderData.updated_at,
                event: '司机已接单',
                status: 'completed'
            });
        }
        
        if (orderData.status >= 3) {
            timeline.push({
                time: orderData.updated_at,
                event: '司机出发前往接驾',
                status: orderData.status === 3 ? 'active' : 'completed'
            });
        }
        
        if (orderData.status >= 4) {
            timeline.push({
                time: orderData.updated_at,
                event: '到达接驾地点',
                status: orderData.status === 4 ? 'active' : 'completed'
            });
        }
        
        if (orderData.status >= 5) {
            timeline.push({
                time: orderData.updated_at,
                event: '服务进行中',
                status: orderData.status === 5 ? 'active' : 'completed'
            });
        }
        
        if (orderData.status >= 6) {
            timeline.push({
                time: orderData.updated_at,
                event: '服务完成',
                status: 'completed'
            });
        }
        
        if (orderData.status === 7) {
            timeline.push({
                time: orderData.updated_at,
                event: '订单已取消',
                status: 'completed'
            });
        }
        
        return timeline;
    };

    // 状态配置
    const getStatusConfig = (status) => {
        const statusMap = {
            0: { text: '待接单', color: 'bg-gray-100 text-gray-700', icon: Clock },
            1: { text: '已派单', color: 'bg-orange-100 text-orange-600', icon: AlertCircle },
            2: { text: '司机已接单', color: 'bg-blue-100 text-blue-600', icon: CheckCircle },
            3: { text: '前往接驾', color: 'bg-cyan-100 text-cyan-600', icon: Car },
            4: { text: '已到达', color: 'bg-teal-100 text-teal-600', icon: MapPin },
            5: { text: '服务中', color: 'bg-indigo-100 text-indigo-600', icon: Car },
            6: { text: '已完成', color: 'bg-green-100 text-green-600', icon: CheckCircle },
            7: { text: '已取消', color: 'bg-red-100 text-red-600', icon: XCircle },
        };
        return statusMap[status] || { text: '未知状态', color: 'bg-gray-100 text-gray-600', icon: AlertCircle };
    };

    // 格式化时间
    const formatTime = (timeStr) => {
        return new Date(timeStr).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="text-center mt-4 text-gray-600">正在加载订单详情...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
                        <p className="text-sm text-gray-600 mb-4">{error}</p>
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* 头部 */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between text-white">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-semibold">订单详情 #{order.id}</h2>
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color} bg-white`}>
                            <StatusIcon size={16} />
                            <span>{statusConfig.text}</span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-blue-800 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* 标签页导航 */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { key: 'overview', label: '订单概览', icon: Calendar },
                            { key: 'people', label: '相关人员', icon: User },
                            { key: 'timeline', label: '状态时间轴', icon: Clock },
                            { key: 'financial', label: '费用信息', icon: DollarSign }
                        ].map(tab => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.key
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <TabIcon size={16} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* 内容区域 */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 基本信息 */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Calendar className="mr-2" size={20} />
                                    基本信息
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">订单类型：</span>
                                        <span className="font-medium">
                                            {order.orderType === 'AirportTransfer' ? '接送机' : order.orderType}
                                            {order.orderSubtype && ` - ${order.orderSubtype === 'Arrival' ? '接机' : '送机'}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">服务时间：</span>
                                        <span className="font-medium">{formatTime(order.serviceTime)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">乘客数量：</span>
                                        <span className="font-medium">{order.passengerCount} 人</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">行李数量：</span>
                                        <span className="font-medium">{order.luggageCount} 件</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">服务级别：</span>
                                        <span className="font-medium">{order.requiredServiceLevel}</span>
                                    </div>
                                    {order.flightNumber && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">航班号：</span>
                                            <span className="font-medium">{order.flightNumber}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 地址信息 */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <MapPin className="mr-2" size={20} />
                                    地址信息
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                                        <div>
                                            <div className="text-sm text-gray-600">起点</div>
                                            <div className="font-medium">{order.pickupAddress}</div>
                                        </div>
                                    </div>
                                    <div className="border-l-2 border-gray-300 ml-1.5 h-6"></div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                                        <div>
                                            <div className="text-sm text-gray-600">终点</div>
                                            <div className="font-medium">{order.dropoffAddress}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 备注信息 */}
                            {order.customerServiceNotes && (
                                <div className="lg:col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                                        <AlertCircle className="mr-2 text-yellow-600" size={20} />
                                        客服备注
                                    </h3>
                                    <p className="text-gray-700">{order.customerServiceNotes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'people' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* 乘客信息 */}
                            <div className="bg-blue-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <User className="mr-2 text-blue-600" size={20} />
                                    乘客信息
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm text-gray-600">姓名</div>
                                        <div className="font-medium">{order.passenger.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">电话</div>
                                        <div className="font-medium flex items-center">
                                            <Phone size={16} className="mr-2 text-blue-600" />
                                            <a href={`tel:${order.passenger.phone}`} className="hover:text-blue-600">
                                                {order.passenger.phone}
                                            </a>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">邮箱</div>
                                        <div className="font-medium flex items-center">
                                            <Mail size={16} className="mr-2 text-blue-600" />
                                            <a href={`mailto:${order.passenger.email}`} className="hover:text-blue-600">
                                                {order.passenger.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 司机信息 */}
                            {order.driver && (
                                <div className="bg-green-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <User className="mr-2 text-green-600" size={20} />
                                        司机信息
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-sm text-gray-600">姓名</div>
                                            <div className="font-medium flex items-center">
                                                {order.driver.name}
                                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                    ⭐ {order.driver.rating}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">电话</div>
                                            <div className="font-medium flex items-center">
                                                <Phone size={16} className="mr-2 text-green-600" />
                                                <a href={`tel:${order.driver.phone}`} className="hover:text-green-600">
                                                    {order.driver.phone}
                                                </a>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">服务次数</div>
                                            <div className="font-medium">{order.driver.totalOrders} 次</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 车辆信息 */}
                            {order.vehicle && (
                                <div className="bg-purple-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Car className="mr-2 text-purple-600" size={20} />
                                        车辆信息
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-sm text-gray-600">车牌号</div>
                                            <div className="font-medium text-lg">{order.vehicle.plate}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">车型</div>
                                            <div className="font-medium">
                                                {order.vehicle.brand} {order.vehicle.model} ({order.vehicle.year})
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">颜色</div>
                                            <div className="font-medium">{order.vehicle.color}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">服务级别</div>
                                            <div className="font-medium">{order.vehicle.serviceLevel}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="max-w-2xl mx-auto">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <Clock className="mr-2" size={20} />
                                订单状态时间轴
                            </h3>
                            <div className="space-y-4">
                                {order.timeline.map((item, index) => (
                                    <div key={index} className="flex items-start space-x-4">
                                        <div className={`w-4 h-4 rounded-full mt-1 ${
                                            item.status === 'completed' ? 'bg-green-500' : 
                                            item.status === 'active' ? 'bg-blue-500' : 'bg-gray-300'
                                        }`}></div>
                                        <div className="flex-1 pb-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-gray-900">{item.event}</div>
                                                    <div className="text-sm text-gray-600">{formatTime(item.time)}</div>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    item.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    item.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {item.status === 'completed' ? '已完成' : 
                                                     item.status === 'active' ? '进行中' : '待处理'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'financial' && (
                        <div className="max-w-2xl mx-auto">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <DollarSign className="mr-2" size={20} />
                                费用信息
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-600">订单总价</span>
                                        <span className="text-xl font-bold text-green-600">${order.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-600">司机结算</span>
                                        <span className="text-lg font-medium">${order.driverSettlementAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-600">平台收入</span>
                                        <span className="text-lg font-medium">
                                            ${(order.amount - order.driverSettlementAmount).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">平台抽成比例</span>
                                        <span className="text-lg font-medium">
                                            {(((order.amount - order.driverSettlementAmount) / order.amount) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 底部操作栏 */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            创建时间: {formatTime(order.createdAt)} | 
                            最后更新: {formatTime(order.updatedAt)}
                        </div>
                        <div className="flex space-x-3">
                            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                编辑订单
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                                联系司机
                            </button>
                            <button 
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedOrderDetailModal;