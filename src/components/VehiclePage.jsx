import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import NewVehicleModal from './NewVehicleModal.jsx';
import EditVehicleModal from './EditVehicleModal.jsx';

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
            setVehicles(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        fetchVehicles(); 
    }, []);

    // 统一的回调，用于在弹窗关闭后刷新列表
    const handleModalClose = () => {
        setIsNewModalOpen(false);
        setEditingVehicle(null);
        fetchVehicles(); // 自动刷新数据
    };

    // 编辑车辆
    const handleEditVehicle = (vehicle) => {
        setEditingVehicle(vehicle);
    };

    // 删除车辆
    const handleDeleteVehicle = async (vehicle) => {
        const confirmMessage = `确定要删除车辆 "${vehicle.CarPlate}" 吗？此操作不可恢复。`;
        
        if (window.confirm(confirmMessage)) {
            try {
                await api.delete(`/vehicles/${vehicle.ID}`);
                await fetchVehicles(); // 删除成功后刷新列表
                alert('车辆删除成功！');
            } catch (err) {
                alert(`删除失败: ${err.message}`);
            }
        }
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
            {isNewModalOpen && (
                <NewVehicleModal 
                    onClose={() => setIsNewModalOpen(false)} 
                    onSuccess={handleModalClose} 
                />
            )}
            
            {/* 编辑车辆模态框 */}
            {editingVehicle && (
                <EditVehicleModal 
                    vehicle={editingVehicle} 
                    onClose={() => setEditingVehicle(null)} 
                    onSuccess={handleModalClose} 
                />
            )}
            
            {/* 加载状态 */}
            {isLoading && (
                <div className="flex justify-center items-center py-8">
                    <div className="text-gray-600">正在加载车辆列表...</div>
                </div>
            )}
            
            {/* 错误状态 */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    加载失败: {error}
                </div>
            )}
            
            {/* 车辆列表表格 */}
            {!isLoading && !error && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    车牌号
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    品牌
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    型号
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    服务等级
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    座位数
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    注册州
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {vehicles.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        暂无车辆数据
                                    </td>
                                </tr>
                            ) : (
                                vehicles.map((vehicle) => (
                                    <tr key={vehicle.ID} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {vehicle.CarPlate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {(vehicle.Brand && vehicle.Brand.Valid) ? vehicle.Brand.String : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {(vehicle.Model && vehicle.Model.Valid) ? vehicle.Model.String : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                vehicle.ServiceLevel === 'Luxury' ? 'bg-purple-100 text-purple-800' :
                                                vehicle.ServiceLevel === 'Comfort' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {vehicle.ServiceLevel === 'Luxury' ? '豪华型' :
                                                 vehicle.ServiceLevel === 'Comfort' ? '舒适型' : '经济型'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {vehicle.SeatCount} 座
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                vehicle.RegistrationState === 'VIC' ? 'bg-indigo-100 text-indigo-800' : 'bg-orange-100 text-orange-800'
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default VehiclePage;