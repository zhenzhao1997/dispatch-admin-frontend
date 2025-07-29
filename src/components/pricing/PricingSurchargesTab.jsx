import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, DollarSign, Percent } from 'lucide-react';
import api from '../../utils/api.js';

function PricingSurchargesTab() {
    const [surcharges, setSurcharges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSurcharge, setEditingSurcharge] = useState(null);
    const [formData, setFormData] = useState({
        surcharge_name: '',
        state: 'VIC',
        surcharge_type: 'percentage',
        value: '',
        start_time: '',
        end_time: '',
        start_date: '',
        end_date: '',
        is_active: true
    });

    // 加载数据
    useEffect(() => {
        fetchSurcharges();
    }, []);

    const fetchSurcharges = async () => {
        try {
            setLoading(true);
            const data = await api.get('/pricing/surcharges');
            setSurcharges(data);
        } catch (error) {
            console.error('加载附加费失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 处理表单提交
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                surcharge_name: formData.surcharge_name,
                state: formData.state,
                surcharge_type: formData.surcharge_type,
                value: parseFloat(formData.value),
                is_active: formData.is_active
            };

            // 添加时间数据（如果有的话）
            if (formData.start_time) {
                submitData.start_time = `2025-07-29T${formData.start_time}:00Z`;
            }
            if (formData.end_time) {
                submitData.end_time = `2025-07-29T${formData.end_time}:00Z`;
            }
            if (formData.start_date) {
                submitData.start_date = `${formData.start_date}T00:00:00Z`;
            }
            if (formData.end_date) {
                submitData.end_date = `${formData.end_date}T23:59:59Z`;
            }

            if (editingSurcharge) {
                await api.put(`/pricing/surcharges/${editingSurcharge.id}`, submitData);
            } else {
                await api.post('/pricing/surcharges', submitData);
            }

            setShowModal(false);
            setEditingSurcharge(null);
            resetForm();
            fetchSurcharges();
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败: ' + error.message);
        }
    };

    // 删除附加费
    const handleDelete = async (id) => {
        if (confirm('确定要删除这个附加费吗？')) {
            try {
                await api.delete(`/pricing/surcharges/${id}`);
                fetchSurcharges();
            } catch (error) {
                console.error('删除失败:', error);
                alert('删除失败: ' + error.message);
            }
        }
    };

    // 编辑附加费
    const handleEdit = (surcharge) => {
        setEditingSurcharge(surcharge);
        setFormData({
            surcharge_name: surcharge.surcharge_name || '',
            state: surcharge.state || 'VIC',
            surcharge_type: surcharge.surcharge_type || 'percentage',
            value: surcharge.value?.toString() || '',
            start_time: surcharge.start_time || '',
            end_time: surcharge.end_time || '',
            start_date: surcharge.start_date || '',
            end_date: surcharge.end_date || '',
            is_active: surcharge.is_active !== false
        });
        setShowModal(true);
    };

    // 重置表单
    const resetForm = () => {
        setFormData({
            surcharge_name: '',
            state: 'VIC',
            surcharge_type: 'percentage',
            value: '',
            start_time: '',
            end_time: '',
            start_date: '',
            end_date: '',
            is_active: true
        });
    };

    // 新建附加费
    const handleCreate = () => {
        resetForm();
        setEditingSurcharge(null);
        setShowModal(true);
    };

    // 格式化时间显示
    const formatTimeRange = (startTime, endTime) => {
        if (!startTime || !endTime) return '全天';
        return `${startTime} - ${endTime}`;
    };

    // 格式化日期显示
    const formatDateRange = (startDate, endDate) => {
        if (!startDate && !endDate) return '长期有效';
        if (startDate && endDate) return `${startDate} 至 ${endDate}`;
        if (startDate) return `自 ${startDate}`;
        if (endDate) return `至 ${endDate}`;
        return '长期有效';
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">加载中...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* 顶部操作栏 */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">附加费管理</h2>
                    <p className="text-gray-600 mt-1">管理时间段、节假日等附加费规则</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    新建附加费
                </button>
            </div>

            {/* 附加费列表 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {surcharges.map((surcharge) => (
                    <div key={surcharge.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                                <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                                <h3 className="text-lg font-medium text-gray-900">{surcharge.surcharge_name}</h3>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                surcharge.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {surcharge.is_active ? '启用' : '禁用'}
                            </span>
                        </div>

                        <div className="space-y-3 mb-4">
                            {/* 附加费类型和值 */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">附加费类型:</span>
                                <div className="flex items-center">
                                    {surcharge.surcharge_type === 'fixed' ? (
                                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                                    ) : (
                                        <Percent className="h-4 w-4 text-blue-600 mr-1" />
                                    )}
                                    <span className={`font-medium ${
                                        surcharge.surcharge_type === 'fixed' ? 'text-green-600' : 'text-blue-600'
                                    }`}>
                                        {surcharge.surcharge_type === 'fixed' ? `固定 $${surcharge.value}` : `百分比 ${surcharge.value}%`}
                                    </span>
                                </div>
                            </div>

                            {/* 时间范围 */}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">生效时间:</span>
                                <span className="font-medium">
                                    {formatTimeRange(surcharge.start_time, surcharge.end_time)}
                                </span>
                            </div>

                            {/* 日期范围 */}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">生效日期:</span>
                                <span className="font-medium">
                                    {formatDateRange(surcharge.start_date, surcharge.end_date)}
                                </span>
                            </div>

                            {/* 州/地区 */}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">适用地区:</span>
                                <span className="font-medium">{surcharge.state}</span>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4 border-t border-gray-200">
                            <button
                                onClick={() => handleEdit(surcharge)}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center text-sm"
                            >
                                <Edit2 className="h-4 w-4 mr-1" />
                                编辑
                            </button>
                            <button
                                onClick={() => handleDelete(surcharge.id)}
                                className="text-red-600 hover:text-red-900 flex items-center text-sm"
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                删除
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 创建/编辑模态框 */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {editingSurcharge ? '编辑附加费' : '新建附加费'}
                                    </h3>

                                    <div className="space-y-4">
                                        {/* 基本信息 */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                附加费名称
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.surcharge_name}
                                                onChange={(e) => setFormData({...formData, surcharge_name: e.target.value})}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="如：夜间附加费"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    州/地区
                                                </label>
                                                <select
                                                    value={formData.state}
                                                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="VIC">VIC</option>
                                                    <option value="NSW">NSW</option>
                                                    <option value="QLD">QLD</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    附加费类型
                                                </label>
                                                <select
                                                    value={formData.surcharge_type}
                                                    onChange={(e) => setFormData({...formData, surcharge_type: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="percentage">百分比</option>
                                                    <option value="fixed">固定金额</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                附加费值
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={formData.value}
                                                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder={formData.surcharge_type === 'fixed' ? '5.00' : '20'}
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 text-sm">
                                                        {formData.surcharge_type === 'fixed' ? '$' : '%'}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formData.surcharge_type === 'fixed' 
                                                    ? '固定金额，如：5.00 表示增加$5.00' 
                                                    : '百分比，如：20 表示在基础价格上增加20%'}
                                            </p>
                                        </div>

                                        {/* 时间设置 */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                生效时间段 (可选)
                                            </label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">开始时间</label>
                                                    <input
                                                        type="time"
                                                        value={formData.start_time}
                                                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">结束时间</label>
                                                    <input
                                                        type="time"
                                                        value={formData.end_time}
                                                        onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                留空表示全天有效。支持跨夜时间，如22:00-06:00
                                            </p>
                                        </div>

                                        {/* 日期设置 */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                生效日期范围 (可选)
                                            </label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">开始日期</label>
                                                    <input
                                                        type="date"
                                                        value={formData.start_date}
                                                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">结束日期</label>
                                                    <input
                                                        type="date"
                                                        value={formData.end_date}
                                                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                留空表示长期有效。可用于节假日等特殊日期设置
                                            </p>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="surcharge_is_active"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="surcharge_is_active" className="ml-2 block text-sm text-gray-900">
                                                启用此附加费
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        {editingSurcharge ? '更新' : '创建'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingSurcharge(null);
                                            resetForm();
                                        }}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        取消
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PricingSurchargesTab;