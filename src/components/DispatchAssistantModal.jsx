// src/components/DispatchAssistantModal.jsx
// 🎯【派单助手】智能推荐与一键派单界面

import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';

function DispatchAssistantModal({ orderId, onClose, onAssignSuccess }) {
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState('');
    const [orderInfo, setOrderInfo] = useState(null);
    const [assigningDriverId, setAssigningDriverId] = useState(null);

    // 🔧【遵循避坑指南#2】使用已确认完整的API工具类
    const fetchSuggestions = async () => {
        setIsLoading(true);
        setError('');
        
        try {
            console.log('🤖 派单助手：获取订单', orderId, '的司机推荐');
            const data = await api.get(`/orders/${orderId}/suggestions`);
            
            setSuggestions(data.suggestions || []);
            setOrderInfo({
                orderId: data.order_id,
                pickupLat: data.pickup_lat,
                pickupLng: data.pickup_lng,
                totalFound: data.total_found
            });
            
            console.log('✅ 获取到', data.suggestions?.length || 0, '个推荐司机');
        } catch (err) {
            console.error('❌ 获取推荐失败:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 自动获取推荐
    useEffect(() => {
        if (orderId) {
            fetchSuggestions();
        }
    }, [orderId]);

    // 一键指派司机
    const handleAssignDriver = async (suggestion) => {
        setAssigningDriverId(suggestion.driver_id);
        
        try {
            console.log('🎯 正在指派司机:', suggestion.driver_name, '到订单', orderId);
            
            // 【遵循避坑指南#2】使用现有的派单接口
            await api.post(`/orders/${orderId}/assign`, { 
                driver_id: suggestion.driver_id 
            });
            
            console.log('✅ 派单成功!');
            alert(`✅ 成功将订单派给 ${suggestion.driver_name}！`);
            
            // 关闭弹窗并触发刷新
            onAssignSuccess?.();
            onClose();
            
        } catch (err) {
            console.error('❌ 派单失败:', err);
            alert(`❌ 派单失败: ${err.message}`);
        } finally {
            setAssigningDriverId(null);
        }
    };

    // 获取距离的显示文本
    const getDistanceText = (distanceKM) => {
        if (distanceKM >= 999) return '距离未知';
        if (distanceKM < 1) return `${Math.round(distanceKM * 1000)}米`;
        return `${distanceKM.toFixed(1)}公里`;
    };

    // 获取评分的颜色样式
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* 头部 */}
                <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">🤖 派单助手</h2>
                                <p className="text-sm text-gray-600">智能推荐最适合的司机</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 内容区域 */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* 订单信息卡片 */}
                    {orderInfo && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 订单 #{orderInfo.orderId}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-600 font-medium">起点坐标:</span>
                                    <span className="ml-2 text-gray-700">
                                        {orderInfo.pickupLat?.toFixed(4)}, {orderInfo.pickupLng?.toFixed(4)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-blue-600 font-medium">找到司机:</span>
                                    <span className="ml-2 text-gray-700">{orderInfo.totalFound} 位</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 获取推荐按钮 */}
                    <div className="flex justify-center mb-6">
                        <button
                            onClick={fetchSuggestions}
                            disabled={isLoading}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${
                                isLoading 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>分析中...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span>🔍 重新获取推荐</span>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-red-800 font-medium">获取推荐失败</span>
                            </div>
                            <p className="text-red-600 mt-1">{error}</p>
                        </div>
                    )}

                    {/* 推荐列表 */}
                    {suggestions.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                📊 推荐司机 (按匹配度排序)
                            </h3>
                            
                            {suggestions.map((suggestion, index) => (
                                <div key={suggestion.driver_id} 
                                     className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    
                                    <div className="flex items-start justify-between">
                                        {/* 左侧：司机信息 */}
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 mb-4">
                                                {/* 排名徽章 */}
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                                    index === 0 ? 'bg-yellow-500' : 
                                                    index === 1 ? 'bg-gray-400' : 
                                                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                
                                                {/* 司机基本信息 */}
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-800">
                                                        {/* 【遵循避坑指南#3】如果后端返回的是sql.NullString，在此处正确处理 */}
                                                        {suggestion.driver_name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        📞 {suggestion.phone} | ⭐ 等级 {suggestion.driver_level} | 评分 {suggestion.rating_score.toFixed(1)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* 车辆信息 */}
                                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                                <h5 className="font-medium text-gray-700 mb-2">🚗 车辆信息</h5>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div><span className="text-gray-600">车牌:</span> <span className="font-medium">{suggestion.car_plate}</span></div>
                                                    <div><span className="text-gray-600">品牌:</span> <span className="font-medium">{suggestion.vehicle_brand}</span></div>
                                                    <div><span className="text-gray-600">型号:</span> <span className="font-medium">{suggestion.vehicle_model}</span></div>
                                                    <div><span className="text-gray-600">座位:</span> <span className="font-medium">{suggestion.seat_count}座</span></div>
                                                    <div><span className="text-gray-600">等级:</span> <span className="font-medium">{suggestion.service_level}</span></div>
                                                    <div><span className="text-gray-600">状态:</span> 
                                                        <span className="ml-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                            {suggestion.current_status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 距离和评分 */}
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-600">距离: </span>
                                                    <span className="font-medium text-gray-800">{getDistanceText(suggestion.distance_km)}</span>
                                                </div>
                                                
                                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(suggestion.match_score)}`}>
                                                    🎯 匹配度: {Math.round(suggestion.match_score)}分
                                                </div>
                                            </div>
                                        </div>

                                        {/* 右侧：派单按钮 */}
                                        <div className="ml-6">
                                            <button
                                                onClick={() => handleAssignDriver(suggestion)}
                                                disabled={assigningDriverId === suggestion.driver_id}
                                                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                                                    assigningDriverId === suggestion.driver_id
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : index === 0 
                                                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                                                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                                                }`}
                                            >
                                                {assigningDriverId === suggestion.driver_id ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                                        <span>派单中...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                        <span>{index === 0 ? '🥇 推荐指派' : '选择指派'}</span>
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 无推荐结果 */}
                    {!isLoading && suggestions.length === 0 && !error && (
                        <div className="text-center py-8">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.816-6.203-2.18M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-500 mb-2">暂无可用司机</h3>
                            <p className="text-gray-400">当前没有符合条件的司机，请稍后重试或手动派单</p>
                        </div>
                    )}
                </div>

                {/* 底部操作栏 */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DispatchAssistantModal;