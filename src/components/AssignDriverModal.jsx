// src/components/AssignDriverModal.jsx

import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';

function AssignDriverModal({ order, onClose, onSuccess }) {
    const [drivers, setDrivers] = useState([]);
    const [selectedDriverId, setSelectedDriverId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const driverData = await api.get('/drivers');
                const activeDrivers = driverData.filter(d => d.IsActive);
                setDrivers(activeDrivers || []);
                if (activeDrivers.length > 0) {
                    setSelectedDriverId(activeDrivers[0].ID);
                }
            } catch (err) {
                setError('无法加载司机列表: ' + err.message);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchDrivers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDriverId) {
            setError('请选择一个司机');
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            await api.post(`/orders/${order.ID}/assign`, {
                driver_id: parseInt(selectedDriverId, 10),
            });
            onSuccess();
        } catch (err) {
            setError('派单失败: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-1/3 shadow-lg rounded-md bg-white">
                <h3 className="text-lg leading-6 font-medium text-gray-900 text-center mb-4">
                    为订单 #{order.ID} 派单
                </h3>
                {isLoading && <p>正在加载可用司机...</p>}
                
                {!isLoading && !error && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="driver-select" className="block text-sm font-medium text-gray-700">选择司机</label>
                            <select
                                id="driver-select"
                                value={selectedDriverId}
                                onChange={(e) => setSelectedDriverId(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                {drivers.map(driver => {
                                    // 【核心优化】根据姓名是否存在，决定显示内容
                                    const displayName = driver.FullName.Valid && driver.FullName.String
                                        ? `${driver.FullName.String} (${driver.Phone})`
                                        : driver.Phone;

                                    return (
                                        <option key={driver.ID} value={driver.ID}>
                                            {displayName}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        
                        {drivers.length === 0 && <p className="text-sm text-yellow-600">系统中没有可用的激活状态的司机。</p>}
                        
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        
                        <div className="pt-4 flex gap-4">
                            <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md w-full hover:bg-gray-300" onClick={onClose}>取消</button>
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-indigo-500 text-white rounded-md w-full hover:bg-indigo-700" 
                                disabled={isSubmitting || drivers.length === 0}
                            >
                                {isSubmitting ? '正在指派...' : '确认指派'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default AssignDriverModal;