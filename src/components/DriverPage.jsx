import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import NewDriverModal from './NewDriverModal.jsx';
// 【新增】引入我们即将创建的 EditDriverModal 组件
import EditDriverModal from './EditDriverModal.jsx';

function DriverPage() {
    const [drivers, setDrivers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    // 【新增】用于存储正在编辑的司机信息
    const [editingDriver, setEditingDriver] = useState(null);

    const fetchDrivers = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/drivers');
            setDrivers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDrivers(); }, []);

    // 【新增】统一的弹窗关闭和刷新回调
    const handleModalClose = () => {
        setIsNewModalOpen(false);
        setEditingDriver(null);
        fetchDrivers();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">司机管理</h1>
                <button 
                    onClick={() => setIsNewModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                >
                    + 新增司机
                </button>
            </div>

            {isNewModalOpen && <NewDriverModal onClose={() => setIsNewModalOpen(false)} onSuccess={handleModalClose} />}
            {/* 【新增】编辑弹窗的渲染逻辑 */}
            {editingDriver && <EditDriverModal driver={editingDriver} onClose={() => setEditingDriver(null)} onSuccess={handleModalClose} />}

            {isLoading && <p>正在加载司机列表...</p>}
            {error && <div className="text-red-600">{`加载失败: ${error}`}</div>}
            {!isLoading && !error && (
                <div className="bg-white shadow rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电话</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                                {/* 【新增】操作列 */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {drivers.map(driver => (
                                <tr key={driver.ID}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.FullName || '未提供'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.Phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.DriverType === 'internal' ? '内部' : '外部'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${driver.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{driver.IsActive ? '激活' : '禁用'}</span>
                                    </td>
                                    {/* 【新增】编辑按钮 */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => setEditingDriver(driver)} className="text-indigo-600 hover:text-indigo-900">编辑</button>
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

export default DriverPage;