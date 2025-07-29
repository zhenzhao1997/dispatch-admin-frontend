// src/components/DriverPage.jsx
// 【修复版本】完整的司机管理页面

import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';

function DriverPage() {
    const [drivers, setDrivers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
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

    useEffect(() => { 
        fetchDrivers(); 
    }, []);

    const handleModalClose = () => {
        setIsNewModalOpen(false);
        setEditingDriver(null);
        fetchDrivers();
    };

    const handleEditDriver = (driver) => {
        setEditingDriver(driver);
    };

    const handleDeleteDriver = async (driver) => {
        if (window.confirm(`确定要删除司机 ${driver.FullName} 吗？`)) {
            try {
                await api.delete(`/drivers/${driver.ID}`);
                fetchDrivers();
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
                <h1 className="text-3xl font-bold text-gray-800">司机管理</h1>
                <button 
                    onClick={() => setIsNewModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    + 新增司机
                </button>
            </div>

            {/* 新增司机模态框 */}
            {isNewModalOpen && <NewDriverModal onClose={() => setIsNewModalOpen(false)} onSuccess={handleModalClose} />}
            
            {/* 编辑司机模态框 */}
            {editingDriver && <EditDriverModal driver={editingDriver} onClose={() => setEditingDriver(null)} onSuccess={handleModalClose} />}

            {isLoading && (
                <div className="flex justify-center items-center py-8">
                    <div className="text-gray-600">正在加载司机列表...</div>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电话</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">州</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {drivers.map(driver => (
                                <tr key={driver.ID} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {driver.FullName || '未提供'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {driver.Phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {renderNullableString(driver.Email)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            driver.DriverType === 'internal' 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {driver.DriverType === 'internal' ? '内部' : '外部'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            driver.OperatingState === 'VIC' 
                                                ? 'bg-indigo-100 text-indigo-800' 
                                                : 'bg-orange-100 text-orange-800'
                                        }`}>
                                            {driver.OperatingState}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            driver.IsActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {driver.IsActive ? '活跃' : '停用'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditDriver(driver)}
                                                className="bg-blue-500 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors"
                                            >
                                                编辑
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDriver(driver)}
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

// 简化版新增司机模态框
function NewDriverModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        driver_type: 'internal',
        full_name: '',
        phone: '',
        email: '',
        password: '123456',
        operating_state: 'VIC'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await api.post('/drivers', formData);
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-4">新增司机</h3>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">司机类型</label>
                        <select name="driver_type" value={formData.driver_type} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="internal">内部</option>
                            <option value="external">外部</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">姓名</label>
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">电话</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">邮箱</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">运营州</label>
                        <select name="operating_state" value={formData.operating_state} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
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

// 简化版编辑司机模态框
function EditDriverModal({ driver, onClose, onSuccess }) {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (driver) {
            setFormData({
                full_name: driver.FullName || '',
                email: driver.Email && driver.Email.Valid ? driver.Email.String : '',
                phone: driver.Phone || '',
                operating_state: driver.OperatingState || 'VIC',
                is_active: driver.IsActive,
            });
        }
    }, [driver]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await api.put(`/drivers/${driver.ID}`, formData);
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-4">编辑司机</h3>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">姓名</label>
                        <input type="text" name="full_name" value={formData.full_name || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">电话</label>
                        <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">邮箱</label>
                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">运营州</label>
                        <select name="operating_state" value={formData.operating_state || 'VIC'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="VIC">VIC</option>
                            <option value="NSW">NSW</option>
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center">
                            <input type="checkbox" name="is_active" checked={formData.is_active || false} onChange={handleChange} className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                            <span className="ml-2 text-sm text-gray-700">激活状态</span>
                        </label>
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

export default DriverPage;