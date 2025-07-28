import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';

function EditOrderModal({ order, onClose, onSuccess }) {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (order) {
            const serviceTimeForInput = new Date(new Date(order.ServiceTime).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            setFormData({
                serviceTime: serviceTimeForInput,
                pickupAddress: order.PickupAddress || '',
                dropoffAddress: order.DropoffAddress || '',
                customerServiceNotes: order.CustomerServiceNotes || '',
            });
        }
    }, [order]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');
        try {
            await api.put(`/orders/${order.ID}`, {
                ...formData,
                serviceTime: new Date(formData.serviceTime).toISOString(),
            });
            onSuccess();
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
                <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">编辑订单 #{order.ID}</h3>
                <form onSubmit={handleSubmit} className="mt-4 px-7 py-3 space-y-4 text-left">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">用车时间</label>
                        <input type="datetime-local" name="serviceTime" value={formData.serviceTime || ''} onChange={handleChange} className="border p-2 rounded w-full" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">上车地址</label>
                        <input type="text" name="pickupAddress" placeholder="上车地址" value={formData.pickupAddress || ''} onChange={handleChange} className="border p-2 rounded w-full" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">下车地址</label>
                        <input type="text" name="dropoffAddress" placeholder="下车地址" value={formData.dropoffAddress || ''} onChange={handleChange} className="border p-2 rounded w-full" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">客服备注</label>
                        <textarea name="customerServiceNotes" placeholder="客服备注..." value={formData.customerServiceNotes || ''} onChange={handleChange} className="border p-2 rounded w-full" rows="3"></textarea>
                    </div>
                    {submitError && <div className="text-red-500 text-sm">{submitError}</div>}
                    <div className="items-center px-4 py-3 flex gap-4">
                        <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300" onClick={onClose}>取消</button>
                        <button type="submit" className={`px-4 py-2 bg-indigo-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-700 focus:outline-none ${isSubmitting ? 'cursor-not-allowed' : ''}`} disabled={isSubmitting}>
                            {isSubmitting ? '保存中...' : '保存更改'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditOrderModal;