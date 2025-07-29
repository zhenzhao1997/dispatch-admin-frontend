import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import api from '../../utils/api.js';

function PricingRulesTab() {
    const [rules, setRules] = useState([]);
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({
        rule_name: '',
        zone_id: '',
        service_level: 'Economy',
        state: 'VIC',
        order_type: 'City',
        base_fare: '',
        per_km_fare: '',
        per_minute_fare: '',
        priority: 0,
        is_active: true
    });

    // 加载数据
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rulesData, zonesData] = await Promise.all([
                api.get('/pricing/rules'),
                api.get('/pricing/zones')
            ]);
            setRules(rulesData);
            setZones(zonesData);
        } catch (error) {
            console.error('加载数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 处理表单提交
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                zone_id: formData.zone_id ? parseInt(formData.zone_id) : null,
                base_fare: parseFloat(formData.base_fare) || null,
                per_km_fare: parseFloat(formData.per_km_fare) || null,
                per_minute_fare: parseFloat(formData.per_minute_fare) || null,
                priority: parseInt(formData.priority) || 0
            };

            if (editingRule) {
                await api.put(`/pricing/rules/${editingRule.id}`, submitData);
            } else {
                await api.post('/pricing/rules', submitData);
            }

            setShowModal(false);
            setEditingRule(null);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败: ' + error.message);
        }
    };

    // 删除规则
    const handleDelete = async (id) => {
        if (confirm('确定要删除这个计价规则吗？')) {
            try {
                await api.delete(`/pricing/rules/${id}`);
                fetchData();
            } catch (error) {
                console.error('删除失败:', error);
                alert('删除失败: ' + error.message);
            }
        }
    };

    // 编辑规则
    const handleEdit = (rule) => {
        setEditingRule(rule);
        setFormData({
            rule_name: rule.rule_name || '',
            zone_id: rule.zone_id?.Int64 || '',
            service_level: rule.service_level || 'Economy',
            state: rule.state || 'VIC',
            order_type: rule.order_type || 'City',
            base_fare: rule.base_fare?.Valid ? rule.base_fare.Float64.toString() : '',
            per_km_fare: rule.per_km_fare?.Valid ? rule.per_km_fare.Float64.toString() : '',
            per_minute_fare: rule.per_minute_fare?.Valid ? rule.per_minute_fare.Float64.toString() : '',
            priority: rule.priority || 0,
            is_active: rule.is_active !== false
        });
        setShowModal(true);
    };

    // 重置表单
    const resetForm = () => {
        setFormData({
            rule_name: '',
            zone_id: '',
            service_level: 'Economy',
            state: 'VIC',
            order_type: 'City',
            base_fare: '',
            per_km_fare: '',
            per_minute_fare: '',
            priority: 0,
            is_active: true
        });
    };

    // 新建规则
    const handleCreate = () => {
        resetForm();
        setEditingRule(null);
        setShowModal(true);
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
                    <h2 className="text-xl font-semibold text-gray-900">计价规则管理</h2>
                    <p className="text-gray-600 mt-1">管理不同区域和服务等级的基础计费规则</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    新建规则
                </button>
            </div>

            {/* 规则列表 */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                规则名称
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                区域
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                服务等级
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                基础费
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                里程费
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                时长费
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                状态
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                操作
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rules.map((rule) => (
                            <tr key={rule.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {rule.rule_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {rule.state} - {rule.order_type}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-900">
                                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                        {rule.zone_name || '默认区域'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        rule.service_level === 'Economy' ? 'bg-green-100 text-green-800' :
                                        rule.service_level === 'Comfort' ? 'bg-blue-100 text-blue-800' :
                                        'bg-purple-100 text-purple-800'
                                    }`}>
                                        {rule.service_level}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${rule.base_fare?.Valid ? rule.base_fare.Float64.toFixed(2) : '0.00'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${rule.per_km_fare?.Valid ? rule.per_km_fare.Float64.toFixed(2) : '0.00'}/km
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${rule.per_minute_fare?.Valid ? rule.per_minute_fare.Float64.toFixed(2) : '0.00'}/min
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        rule.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {rule.is_active ? '启用' : '禁用'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(rule)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rule.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                                        {editingRule ? '编辑计价规则' : '新建计价规则'}
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                规则名称
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.rule_name}
                                                onChange={(e) => setFormData({...formData, rule_name: e.target.value})}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="如：VIC_City_Economy_规则"
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
                                                    订单类型
                                                </label>
                                                <select
                                                    value={formData.order_type}
                                                    onChange={(e) => setFormData({...formData, order_type: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="City">City</option>
                                                    <option value="Airport">Airport</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    服务等级
                                                </label>
                                                <select
                                                    value={formData.service_level}
                                                    onChange={(e) => setFormData({...formData, service_level: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="Economy">Economy</option>
                                                    <option value="Comfort">Comfort</option>
                                                    <option value="Luxury">Luxury</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    计费区域
                                                </label>
                                                <select
                                                    value={formData.zone_id}
                                                    onChange={(e) => setFormData({...formData, zone_id: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="">默认区域</option>
                                                    {zones.map((zone) => (
                                                        <option key={zone.id} value={zone.id}>
                                                            {zone.zone_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    基础费 ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.base_fare}
                                                    onChange={(e) => setFormData({...formData, base_fare: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    里程费 ($/km)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.per_km_fare}
                                                    onChange={(e) => setFormData({...formData, per_km_fare: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    时长费 ($/min)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.per_minute_fare}
                                                    onChange={(e) => setFormData({...formData, per_minute_fare: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                                启用此规则
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        {editingRule ? '更新' : '创建'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingRule(null);
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

export default PricingRulesTab;