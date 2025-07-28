import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';

function EditVehicleModal({ vehicle, onClose, onSuccess }) {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // 使用 useEffect 来从传入的 vehicle prop 初始化表单状态
    useEffect(() => {
        if (vehicle) {
            setFormData({
                carPlate: vehicle.CarPlate || '',
                brand: vehicle.Brand?.String || '',
                model: vehicle.Model?.String || '',
                serviceLevel: vehicle.ServiceLevel || 'Comfort',
                seatCount: vehicle.SeatCount || 5,
                registrationState: vehicle.RegistrationState || 'VIC',
            });
        }
    }, [vehicle]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');

        try {
            // 调用后端的更新接口
            await api.put(`/vehicles/${vehicle.ID}`, {
                ...formData,
                seatCount: parseInt(formData.seatCount, 10),
            });
            onSuccess(); // 调用成功回调
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-1/3 shadow-lg rounded-md bg-white">
                <h3 className="text-lg leading-6 font-medium text-gray-900 text-center mb-4">编辑车辆信息</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">车牌号</label>
                        <input type="text" name="carPlate" value={formData.carPlate} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">品牌</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">型号</label>
                            <input type="text" name="model" value={formData.model} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">服务等级</label>
                        <select name="serviceLevel" value={formData.serviceLevel} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md">
                            <option value="Economy">经济型</option>
                            <option value="Comfort">舒适型</option>
                            <option value="Luxury">豪华型</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">座位数</label>
                        <input type="number" name="seatCount" value={formData.seatCount} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" min="1" />
                    </div>
                    
                    {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
                    
                    <div className="pt-4 flex gap-4">
                        <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md w-full hover:bg-gray-300" onClick={onClose}>取消</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-md w-full hover:bg-indigo-700" disabled={isSubmitting}>
                            {isSubmitting ? '保存中...' : '保存更改'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditVehicleModal;