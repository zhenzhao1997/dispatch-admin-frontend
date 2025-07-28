// src/components/NewOrderModal.jsx
import React, { useState } from 'react';
import api from '../utils/api.js';

function NewOrderModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        // 基础信息
        passengerName: '',
        passengerPhone: '',
        state: 'VIC', // 默认为维多利亚州
        orderType: 'AirportTransfer', // 主类型
        orderSubtype: 'Arrival', // 子类型：默认接机
        requiredServiceLevel: 'Comfort', // 后端验证要求是 Economy/Comfort/Luxury
        serviceTime: new Date().toISOString().slice(0, 16),
        pickupAddress: '',
        dropoffAddress: '',
        passengerCount: 1,
        luggageCount: 0,
        amount: 0,
        driverSettlementAmount: 0,
        flightNumber: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // 当主类型改变时，重置子类型为默认值
        if (name === 'orderType') {
            const defaultSubtypes = {
                'AirportTransfer': 'Arrival',
                'Charter': 'Hourly',
                'PointToPoint': 'Business'
            };
            setFormData(prev => ({ 
                ...prev, 
                [name]: value,
                orderSubtype: defaultSubtypes[value] || ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');

        // 构造符合后端期望的数据格式
        const payload = {
            passengerName: formData.passengerName,
            passengerPhone: formData.passengerPhone,
            state: formData.state,
            orderType: formData.orderType,
            orderSubtype: formData.orderSubtype, // 新增：子类型
            requiredServiceLevel: formData.requiredServiceLevel,
            serviceTime: new Date(formData.serviceTime).toISOString(),
            pickupAddress: formData.pickupAddress,
            dropoffAddress: formData.dropoffAddress,
            passengerCount: parseInt(formData.passengerCount, 10),
            luggageCount: parseInt(formData.luggageCount, 10),
            amount: parseFloat(formData.amount),
            driverSettlementAmount: parseFloat(formData.driverSettlementAmount),
            flightNumber: formData.flightNumber || undefined, // 空字符串转为 undefined
        };

        console.log('🚀 准备提交订单数据:', payload);

        try {
            await api.post('/orders', payload);
            console.log('✅ 订单创建成功');
            onSuccess();
        } catch (err) {
            console.error('❌ 订单创建失败:', err);
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 根据主类型获取子类型选项
    const getSubtypeOptions = () => {
        switch (formData.orderType) {
            case 'AirportTransfer':
                return [
                    { value: 'Arrival', label: '接机' },
                    { value: 'Departure', label: '送机' }
                ];
            case 'Charter':
                return [
                    { value: 'Hourly', label: '按小时包车' },
                    { value: 'Daily', label: '按天包车' }
                ];
            case 'PointToPoint':
                return [
                    { value: 'Business', label: '商务用车' },
                    { value: 'Tourism', label: '旅游用车' }
                ];
            default:
                return [];
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-2/3 max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">创建新订单</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="sr-only">关闭</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 第一行：基础信息 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">乘客姓名 *</label>
                            <input 
                                type="text" 
                                name="passengerName" 
                                value={formData.passengerName} 
                                onChange={handleChange} 
                                className="border border-gray-300 p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">乘客电话 *</label>
                            <input 
                                type="tel" 
                                name="passengerPhone" 
                                value={formData.passengerPhone} 
                                onChange={handleChange} 
                                className="border border-gray-300 p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500" 
                                required 
                            />
                        </div>
                    </div>

                    {/* 第二行：订单类型选择 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">州/省 *</label>
                            <select 
                                name="state" 
                                value={formData.state} 
                                onChange={handleChange} 
                                className="border border-gray-300 p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            >
                                <option value="VIC">维多利亚州 (VIC)</option>
                                <option value="NSW">新南威尔士州 (NSW)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">订单类型 *</label>
                            <select 
                                name="orderType" 
                                value={formData.orderType} 
                                onChange={handleChange} 
                                className="border border-gray-300 p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            >
                                <option value="AirportTransfer">机场接送</option>
                                <option value="Charter">包车服务</option>
                                <option value="PointToPoint">市内用车</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">具体类型 *</label>
                            <select 
                                name="orderSubtype" 
                                value={formData.orderSubtype} 
                                onChange={handleChange} 
                                className="border border-gray-300 p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            >
                                {getSubtypeOptions().map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 第三行：服务级别和时间 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">服务级别 *</label>
                            <select 
                                name="requiredServiceLevel" 
                                value={formData.requiredServiceLevel} 
                                onChange={handleChange} 
                                className="border border-gray-300 p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            >
                                <option value="Economy">经济型</option>
                                <option value="Comfort">舒适型</option>
                                <option value="Luxury">豪华型</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">服务时间 *</label>
                            <input 
                                type="datetime-local" 
                                name="serviceTime" 
                                value={formData.serviceTime} 
                                onChange={handleChange} 
                                className="border border-gray-300 p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">航班号</label>
                            <input 
                                type="text" 
                                name="flightNumber" 
                                value={formData.flightNumber} 
                                onChange={handleChange} 
                                className="border border-gray-300 p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500" 
                                placeholder="例如：QF123"
                            />
                        </div>
                    </div>

                    {/* 第四行：地址 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">上车地址 *</label>
                            <input 
                                type="text" 
                                name="pickupAddress" 
                                value={formData.pickupAddress} 
                                onChange={handleChange} 
                                className="border border-gray-300 p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">下车地址 *</label>
                            <input 
                                type="text" 
                                name="dropoffAddress" 
                                value={formData.dropoffAddress} 
                                onChange={handleChange} 
                                className="border border-gray-300 p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500" 
                                required 
                            />
                        </div>
                    </div>

                    {/* 第五行：数量和金额 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">乘客人数 *</label>
                            <input 
                                type="number" 
                                name="passengerCount" 
                                value={formData.passengerCount} 
                                onChange={handleChange} 
                                className="border border-gray-300 p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500" 
                                min="1" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">行李件数</label>
                            <input 
                                type="number" 
                                name="luggageCount" 
                                value={formData.luggageCount} 
                                onChange={handleChange} 
                                className="border border-gray-300 p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500" 
                                min="0" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">总金额 ($)</label>
                            <input 
                                type="number" 
                                name="amount" 
                                value={formData.amount} 
                                onChange={handleChange} 
                                className="border border-gray-300 p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500" 
                                step="0.01" 
                                min="0" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">司机结算 ($)</label>
                            <input 
                                type="number" 
                                name="driverSettlementAmount" 
                                value={formData.driverSettlementAmount} 
                                onChange={handleChange} 
                                className="border border-gray-300 p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500" 
                                step="0.01" 
                                min="0" 
                            />
                        </div>
                    </div>

                    {/* 错误信息 */}
                    {submitError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="text-red-600 text-sm">{submitError}</div>
                        </div>
                    )}

                    {/* 底部按钮 */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                isSubmitting 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                            }`}
                        >
                            {isSubmitting ? '创建中...' : '创建订单'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewOrderModal;