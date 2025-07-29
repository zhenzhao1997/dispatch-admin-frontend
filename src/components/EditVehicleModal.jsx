import React, { useState } from 'react';
import api from '../utils/api.js';

function EditVehicleModal({ vehicle, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        carPlate: vehicle.CarPlate || '',
        brand: (vehicle.Brand && vehicle.Brand.Valid) ? vehicle.Brand.String : '',
        model: (vehicle.Model && vehicle.Model.Valid) ? vehicle.Model.String : '',
        serviceLevel: vehicle.ServiceLevel || 'Comfort',
        seatCount: vehicle.SeatCount || 5,
        registrationState: vehicle.RegistrationState || 'VIC',
    });
    
    // 用于跟踪哪些字段被修改过
    const [modifiedFields, setModifiedFields] = useState(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // 标记字段为已修改
        setModifiedFields(prev => new Set([...prev, name]));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');

        try {
            // 只发送被修改过的字段
            const updateData = {};
            modifiedFields.forEach(field => {
                if (field === 'seatCount') {
                    updateData[field] = parseInt(formData[field], 10);
                } else {
                    updateData[field] = formData[field];
                }
            });

            // 如果没有任何修改，直接关闭
            if (Object.keys(updateData).length === 0) {
                onClose();
                return;
            }

            await api.put(`/vehicles/${vehicle.ID}`, updateData);
            onSuccess();
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    
    return (
        <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
            onClick={handleBackdropClick}
        >
            <div className="relative bg-white rounded-lg shadow-lg p-6 mx-4 w-full max-w-md">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="关闭"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-lg leading-6 font-medium text-gray-900 text-center mb-4">
                    编辑车辆 - {vehicle.CarPlate}
                </h3>
                
                {submitError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        {submitError}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">车牌号</label>
                        <input 
                            type="text" 
                            name="carPlate" 
                            value={formData.carPlate} 
                            onChange={handleChange} 
                            className={`mt-1 block w-full border p-2 rounded-md ${modifiedFields.has('carPlate') ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                            required 
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">品牌</label>
                            <input 
                                type="text" 
                                name="brand" 
                                value={formData.brand} 
                                onChange={handleChange} 
                                className={`mt-1 block w-full border p-2 rounded-md ${modifiedFields.has('brand') ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">型号</label>
                            <input 
                                type="text" 
                                name="model" 
                                value={formData.model} 
                                onChange={handleChange} 
                                className={`mt-1 block w-full border p-2 rounded-md ${modifiedFields.has('model') ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">服务等级</label>
                        <select 
                            name="serviceLevel" 
                            value={formData.serviceLevel} 
                            onChange={handleChange} 
                            className={`mt-1 block w-full border p-2 rounded-md ${modifiedFields.has('serviceLevel') ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                        >
                            <option value="Economy">经济型</option>
                            <option value="Comfort">舒适型</option>
                            <option value="Luxury">豪华型</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">座位数</label>
                        <input 
                            type="number" 
                            name="seatCount" 
                            value={formData.seatCount} 
                            onChange={handleChange} 
                            className={`mt-1 block w-full border p-2 rounded-md ${modifiedFields.has('seatCount') ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                            min="1" 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">注册州</label>
                        <select 
                            name="registrationState" 
                            value={formData.registrationState} 
                            onChange={handleChange} 
                            className={`mt-1 block w-full border p-2 rounded-md ${modifiedFields.has('registrationState') ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                        >
                            <option value="VIC">维多利亚州 (VIC)</option>
                            <option value="NSW">新南威尔士州 (NSW)</option>
                        </select>
                    </div>
                    
                    <div className="pt-4 flex gap-4">
                        <button 
                            type="button" 
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md w-full hover:bg-gray-300" 
                            onClick={onClose}
                        >
                            取消
                        </button>
                        <button 
                            type="submit" 
                            className={`px-4 py-2 bg-indigo-500 text-white rounded-md w-full hover:bg-indigo-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '更新中...' : '确认修改'}
                        </button>
                    </div>
                    
                    {modifiedFields.size > 0 && (
                        <div className="text-sm text-gray-600 text-center">
                            修改的字段: {Array.from(modifiedFields).join(', ')}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default EditVehicleModal;