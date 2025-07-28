import React, { useState } from 'react';
import api from '../utils/api.js';

function NewOrderModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        orderType: 'AirportTransfer_Arrival',
        passengerName: '',
        passengerPhone: '',
        // 【新增】为新字段设置默认值
        requiredServiceLevel: 'Comfort', // 默认为舒适型
        serviceTime: new Date().toISOString().slice(0, 16),
        pickupAddress: '',
        dropoffAddress: '',
        passengerCount: 1,
        luggageCount: 0,
        amount: 0.0,
        driverSettlementAmount: 0.0,
        customerServiceNotes: '',
        flightNumber: '',
        charterDuration: 2,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');

        // 准备发送给后端的数据
        const payload = {
            passengerName: formData.passengerName,
            passengerPhone: formData.passengerPhone,
            state: 'VIC', // 暂时硬编码
            orderType: formData.orderType.startsWith('AirportTransfer') ? 'AirportTransfer' : 'Charter',
            // 【新增】将新字段加入提交的数据中
            requiredServiceLevel: formData.requiredServiceLevel,
            serviceTime: new Date(formData.serviceTime).toISOString(),
            pickupAddress: formData.pickupAddress,
            dropoffAddress: formData.dropoffAddress,
            passengerCount: parseInt(formData.passengerCount, 10),
            luggageCount: parseInt(formData.luggageCount, 10),
            amount: parseFloat(formData.amount),
            driverSettlementAmount: parseFloat(formData.driverSettlementAmount),
            customerServiceNotes: formData.customerServiceNotes,
            flightNumber: formData.orderType.startsWith('AirportTransfer') ? formData.flightNumber : undefined,
            charterDuration: formData.orderType === 'Charter' ? parseInt(formData.charterDuration, 10) : undefined,
        };

        try {
            await api.post('/orders', payload);
            onSuccess();
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-2/3 shadow-lg rounded-md bg-white">
                <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">创建新订单</h3>
                <form onSubmit={handleSubmit} className="mt-4 px-7 py-3 space-y-4 text-left">
                    <div className="p-3 bg-gray-50 rounded-lg grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">订单类型</label>
                            <select name="orderType" value={formData.orderType} onChange={handleChange} className="border p-2 rounded w-full text-lg">
                                <option value="AirportTransfer_Arrival">接机</option>
                                <option value="AirportTransfer_Departure">送机</option>
                                <option value="Charter">包车</option>
                                <option value="PointToPoint">点对点</option>
                            </select>
                        </div>
                        {/* 【新增】服务等级选择框 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">要求服务等级</label>
                            <select name="requiredServiceLevel" value={formData.requiredServiceLevel} onChange={handleChange} className="border p-2 rounded w-full text-lg">
                                <option value="Economy">经济型</option>
                                <option value="Comfort">舒适型</option>
                                <option value="Luxury">豪华型</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="passengerName" placeholder="乘客姓名" value={formData.passengerName} onChange={handleChange} className="border p-2 rounded w-full text-lg" required />
                        <input type="text" name="passengerPhone" placeholder="乘客电话" value={formData.passengerPhone} onChange={handleChange} className="border p-2 rounded w-full text-lg" required />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <input type="datetime-local" name="serviceTime" value={formData.serviceTime} onChange={handleChange} className="border p-2 rounded w-full text-lg col-span-2" required />
                        <input type="number" name="passengerCount" placeholder="乘客数" value={formData.passengerCount} onChange={handleChange} className="border p-2 rounded w-full text-lg" min="1" />
                    </div>
                    
                    {/* ... 其他表单字段保持不变 ... */}
                    { formData.orderType.startsWith('AirportTransfer') && ( <input type="text" name="flightNumber" placeholder="航班号 (例如: CZ321)" value={formData.flightNumber} onChange={handleChange} className="border p-2 rounded w-full text-lg bg-blue-50" /> )}
                    { formData.orderType === 'Charter' && ( <div className="flex items-center"> <input type="number" name="charterDuration" placeholder="包车时长" value={formData.charterDuration} onChange={handleChange} className="border p-2 rounded w-full text-lg bg-green-50" min="1" /> <span className="ml-2 text-gray-700">小时</span> </div> )}
                    <input type="text" name="pickupAddress" placeholder="上车地址" value={formData.pickupAddress} onChange={handleChange} className="border p-2 rounded w-full text-lg" required />
                    <input type="text" name="dropoffAddress" placeholder="下车地址" value={formData.dropoffAddress} onChange={handleChange} className="border p-2 rounded w-full text-lg" required />
                    <textarea name="customerServiceNotes" placeholder="客服备注..." value={formData.customerServiceNotes} onChange={handleChange} className="border p-2 rounded w-full text-lg" rows="2"></textarea>
                    
                    {submitError && <div className="text-red-500 text-sm text-center">{submitError}</div>}
                    
                    <div className="items-center px-4 py-3 flex gap-4">
                        <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300" onClick={onClose}>取消</button>
                        <button type="submit" className={`px-4 py-2 bg-indigo-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-700 focus:outline-none ${isSubmitting ? 'cursor-not-allowed' : ''}`} disabled={isSubmitting}>{isSubmitting ? '提交中...' : '确认创建'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewOrderModal;