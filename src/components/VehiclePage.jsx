import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import NewVehicleModal from './NewVehicleModal.jsx';
// 【新增】我们将在下一步创建 EditVehicleModal 组件
import EditVehicleModal from './EditVehicleModal.jsx';

function VehiclePage() {
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    
    // 【新增】用于存储正在编辑的车辆信息
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

    useEffect(() => { fetchVehicles(); }, []);

    // 【新增】一个统一的回调，用于在弹窗关闭后刷新列表
    const handleModalClose = () => {
        setIsNewModalOpen(false);
        setEditingVehicle(null);
        fetchVehicles();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">车辆管理</h1>
                <button 
                    onClick={() => setIsNewModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                >
                    + 新增车辆
                </button>
            </div>

            {isNewModalOpen && <NewVehicleModal onClose={() => setIsNewModalOpen(false)} onSuccess={handleModalClose} />}
            {/* 【新增】编辑弹窗的渲染逻辑 */}
            {editingVehicle && <EditVehicleModal vehicle={editingVehicle} onClose={() => setEditingVehicle(null)} onSuccess={handleModalClose} />}
            
            {isLoading && <p>正在加载车辆列表...</p>}
            {error && <div className="text-red-600">{`加载失败: ${error}`}</div>}
            {!isLoading && !error && (
                <div className="bg-white shadow rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车牌号</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">品牌</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">型号</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">服务等级</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">座位数</th>
                                {/* 【新增】操作列 */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {vehicles.map(vehicle => (
                                <tr key={vehicle.ID}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.CarPlate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.Brand.String}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.Model.String}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.ServiceLevel}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.SeatCount}</td>
                                    {/* 【新增】编辑按钮 */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button 
                                            onClick={() => setEditingVehicle(vehicle)} 
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            编辑
                                        </button>
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

export default VehiclePage;