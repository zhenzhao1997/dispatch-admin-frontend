// src/components/VehiclePage.jsx
// 【修复版本】完整的车辆管理页面

import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';

function VehiclePage() {
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);

    const fetchVehicles = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/vehicles');
            setVehicles(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        fetchVehicles(); 
    }, []);

    const handleModalClose = () => {
        setIsNewModalOpen(false);
        setEditingVehicle(null);
        fetchVehicles();
    };

    const handleEditVehicle = (vehicle) => {
        setEditingVehicle(vehicle);
    };

    const handleDeleteVehicle = async (vehicle) => {
        if (window.confirm(`确定要删除车辆 ${vehicle.CarPlate} 吗？`)) {
            try {
                await api.delete(`/vehicles/${vehicle.ID}`);
                fetchVehicles();
            } catch (err) {
                alert('删除失败: ' + err.message);
            }
        }
    };

    const renderNullableString = (field) => {
        return (field && field.Valid) ? field.String : '-';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">车辆管理</h1>
                <button 
                    onClick={() => setIsNewModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    + 新增车辆
                </button>
            </div>

            {/* 新增车辆模态框 */}
            {isNewModalOpen && <NewVehicleModal onClose={() => setIsNewModalOpen(false)} onSuccess={handleModalClose} />}
            
            {/* 编辑车辆模态框 */}
            {editingVehicle && <EditVehicleModal vehicle={editingVehicle} onClose={() => setEditingVehicle(null)} onSuccess={handleModalClose} />}

            {isLoading && (
                <div className="flex justify-center items-center py-8">
                    <div className="text-gray-600">正在加载车辆列表...</div>
                </div>
            )}
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    加载失败: {error}
                </div>
            )}
            
            {!isLoading && !error && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车牌号</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">品牌</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">型号</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">服务等级</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">座位数</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册州</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {vehicles.map(vehicle => (
                                <tr key={vehicle.ID} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {vehicle.CarPlate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {renderNullableString(vehicle.Brand)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {renderNullableString(vehicle.Model)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            vehicle.ServiceLevel === 'Luxury' 
                                                ? 'bg-purple-100 text-purple-800' 
                                                : vehicle.ServiceLevel === 'Comfort'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {vehicle.ServiceLevel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {vehicle.SeatCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            vehicle.RegistrationState === 'VIC' 
                                                ? 'bg-indigo-100 text-indigo-800' 
                                                : 'bg-orange-100 text-orange-800'
                                        }`}>
                                            {vehicle.RegistrationState}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditVehicle(vehicle)}
                                                className="bg-blue-500 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors"
                                            >
                                                编辑
                                            </button>
                                            <button
                                                onClick={() => handleDeleteVehicle(vehicle)}
                                                className="bg-red-500 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors"
                                            >
                                                删除
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// 简化版新增车辆模态框
function NewVehicleModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        car_plate: '',
        brand: '',
        model: '',
        service_level: 'Comfort',
        seat_count: 5,
        registration_state: 'VIC'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await api.post('/vehicles', formData);
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'seat_count' ? parseInt(value) : value 
        }));
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-4">新增车辆</h3>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">车牌号</label>
                        <input type="text" name="car_plate" value={formData.car_plate} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" placeholder="如：ABC123" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">品牌</label>
                        <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" placeholder="如：Toyota" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">型号</label>
                        <input type="text" name="model" value={formData.model} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" placeholder="如：Camry" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">服务等级</label>
                        <select name="service_level" value={formData.service_level} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="Economy">经济型</option>
                            <option value="Comfort">舒适型</option>
                            <option value="Luxury">豪华型</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">座位数</label>
                        <select name="seat_count" value={formData.seat_count} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value={4}>4座</option>
                            <option value={5}>5座</option>
                            <option value={7}>7座</option>
                            <option value={8}>8座</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">注册州</label>
                        <select name="registration_state" value={formData.registration_state} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="VIC">VIC</option>
                            <option value="NSW">NSW</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300">
                            取消
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50">
                            {isSubmitting ? '保存中...' : '保存'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// 简化版编辑车辆模态框
function EditVehicleModal({ vehicle, onClose, onSuccess }) {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (vehicle) {
            setFormData({
                car_plate: vehicle.CarPlate || '',
                brand: (vehicle.Brand && vehicle.Brand.Valid) ? vehicle.Brand.String : '',
                model: (vehicle.Model && vehicle.Model.Valid) ? vehicle.Model.String : '',
                service_level: vehicle.ServiceLevel || 'Comfort',
                seat_count: vehicle.SeatCount || 5,
                registration_state: vehicle.RegistrationState || 'VIC',
            });
        }
    }, [vehicle]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await api.put(`/vehicles/${vehicle.ID}`, formData);
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'seat_count' ? parseInt(value) : value 
        }));
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-4">编辑车辆</h3>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">车牌号</label>
                        <input type="text" name="car_plate" value={formData.car_plate || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">品牌</label>
                        <input type="text" name="brand" value={formData.brand || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">型号</label>
                        <input type="text" name="model" value={formData.model || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">服务等级</label>
                        <select name="service_level" value={formData.service_level || 'Comfort'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="Economy">经济型</option>
                            <option value="Comfort">舒适型</option>
                            <option value="Luxury">豪华型</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">座位数</label>
                        <select name="seat_count" value={formData.seat_count || 5} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value={4}>4座</option>
                            <option value={5}>5座</option>
                            <option value={7}>7座</option>
                            <option value={8}>8座</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">注册州</label>
                        <select name="registration_state" value={formData.registration_state || 'VIC'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="VIC">VIC</option>
                            <option value="NSW">NSW</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300">
                            取消
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50">
                            {isSubmitting ? '保存中...' : '保存更改'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default VehiclePage;