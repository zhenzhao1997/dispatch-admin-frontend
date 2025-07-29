// src/components/pricing/PricingRulesTab.jsx
// V3.0升级版 - 支持起点+终点计费规则管理（完全修复版）

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, DollarSign, MapPin, ArrowRight, Calculator } from 'lucide-react';
import api from '../../utils/api.js';

function PricingRulesTab() {
    const [rules, setRules] = useState([]);
    const [zones, setZones] = useState([]); // 用于选择起点终点区域
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({
        rule_name: '',
        rule_type: 'normal', // 'normal', 'pickup_zone', 'dropoff_zone', 'zone_to_zone'
        state: 'VIC',
        order_type: 'City',
        service_level: 'Economy',
        zone_id: '',
        pickup_zone_id: '',
        dropoff_zone_id: '',
        base_fare: '',
        per_km_fare: '',
        per_minute_fare: '',
        fixed_price: '', // V3.0新增
        priority: 50,
        is_active: true
    });

    // 规则类型选项
    const ruleTypes = [
        { value: 'normal', label: '普通里程计费', icon: Calculator, color: 'blue' },
        { value: 'pickup_zone', label: '接机固定价格（任意终点）', icon: MapPin, color: 'green' },
        { value: 'dropoff_zone', label: '送机固定价格（任意起点）', icon: ArrowRight, color: 'orange' },
        { value: 'zone_to_zone', label: '精准路线固定价格', icon: ArrowRight, color: 'purple' }
    ];

    // 服务等级选项
    const serviceLevels = [
        { value: 'Economy', label: 'Economy' },
        { value: 'Comfort', label: 'Comfort' },
        { value: 'Luxury', label: 'Luxury' }
    ];

    // 订单类型选项
    const orderTypes = [
        { value: 'City', label: 'City' },
        { value: 'Airport', label: 'Airport' },
        { value: 'Intercity', label: 'Intercity' }
    ];

    useEffect(() => {
        fetchRules();
        fetchZones();
    }, []);

    const fetchRules = async () => {
        try {
            setLoading(true);
            const data = await api.get('/pricing/rules');
            setRules(data);
        } catch (error) {
            console.error('加载规则失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchZones = async () => {
        try {
            const data = await api.get('/pricing/zones');
            setZones(data);
            console.log('加载的区域数据:', data); // 调试用
        } catch (error) {
            console.error('加载区域失败:', error);
        }
    };

    // 获取机场区域
    const getAirports = () => zones.filter(zone => zone.zone_type === 'airport');
    
    // 获取非机场区域（城市、郊区等）
    const getNonAirports = () => zones.filter(zone => zone.zone_type !== 'airport');

    const handleCreate = () => {
        setEditingRule(null);
        resetForm();
        setShowModal(true);
    };

    const handleEdit = (rule) => {
        setEditingRule(rule);
        setFormData({
            rule_name: rule.rule_name || '',
            rule_type: rule.rule_type || 'normal',
            state: rule.state || 'VIC',
            order_type: rule.order_type || 'City',
            service_level: rule.service_level || 'Economy',
            zone_id: rule.zone_id || '',
            pickup_zone_id: rule.pickup_zone_id || '',
            dropoff_zone_id: rule.dropoff_zone_id || '',
            base_fare: rule.base_fare?.Valid ? rule.base_fare.Float64.toString() : '',
            per_km_fare: rule.per_km_fare?.Valid ? rule.per_km_fare.Float64.toString() : '',
            per_minute_fare: rule.per_minute_fare?.Valid ? rule.per_minute_fare.Float64.toString() : '',
            fixed_price: rule.fixed_price?.Valid ? rule.fixed_price.Float64.toString() : '',
            priority: rule.priority || 50,
            is_active: rule.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('确定要删除这条规则吗？')) {
            try {
                await api.delete(`/pricing/rules/${id}`);
                fetchRules();
            } catch (error) {
                console.error('删除规则失败:', error);
                alert('删除失败: ' + error.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                rule_name: formData.rule_name,
                rule_type: formData.rule_type,
                state: formData.state,
                order_type: formData.order_type,
                service_level: formData.service_level,
                priority: parseInt(formData.priority) || 50,
                is_active: formData.is_active
            };

            // 根据规则类型添加相应字段
            if (formData.rule_type === 'normal') {
                // 普通里程计费
                if (formData.zone_id) submitData.zone_id = parseInt(formData.zone_id);
                if (formData.base_fare) submitData.base_fare = parseFloat(formData.base_fare);
                if (formData.per_km_fare) submitData.per_km_fare = parseFloat(formData.per_km_fare);
                if (formData.per_minute_fare) submitData.per_minute_fare = parseFloat(formData.per_minute_fare);
            } else if (formData.rule_type === 'pickup_zone') {
                // 接机固定价格
                if (formData.pickup_zone_id) submitData.pickup_zone_id = parseInt(formData.pickup_zone_id);
                if (formData.fixed_price) submitData.fixed_price = parseFloat(formData.fixed_price);
            } else if (formData.rule_type === 'dropoff_zone') {
                // 送机固定价格
                if (formData.dropoff_zone_id) submitData.dropoff_zone_id = parseInt(formData.dropoff_zone_id);
                if (formData.fixed_price) submitData.fixed_price = parseFloat(formData.fixed_price);
            } else if (formData.rule_type === 'zone_to_zone') {
                // 区域间固定价格
                if (formData.pickup_zone_id) submitData.pickup_zone_id = parseInt(formData.pickup_zone_id);
                if (formData.dropoff_zone_id) submitData.dropoff_zone_id = parseInt(formData.dropoff_zone_id);
                if (formData.fixed_price) submitData.fixed_price = parseFloat(formData.fixed_price);
            }

            if (editingRule) {
                await api.put(`/pricing/rules/${editingRule.id}`, submitData);
            } else {
                await api.post('/pricing/rules', submitData);
            }

            setShowModal(false);
            fetchRules();
            resetForm();
        } catch (error) {
            console.error('保存规则失败:', error);
            alert('保存失败: ' + error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            rule_name: '',
            rule_type: 'normal',
            state: 'VIC',
            order_type: 'City',
            service_level: 'Economy',
            zone_id: '',
            pickup_zone_id: '',
            dropoff_zone_id: '',
            base_fare: '',
            per_km_fare: '',
            per_minute_fare: '',
            fixed_price: '',
            priority: 50,
            is_active: true
        });
    };

    // 渲染规则类型标签
    const renderRuleTypeTag = (ruleType) => {
        const type = ruleTypes.find(t => t.value === ruleType);
        if (!type) return ruleType;

        const Icon = type.icon;
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${type.color}-100 text-${type.color}-800`}>
                <Icon className="h-3 w-3 mr-1" />
                {type.label}
            </span>
        );
    };

    // 渲染价格信息
    const renderPriceInfo = (rule) => {
        if (rule.rule_type === 'normal') {
            // 普通里程计费
            return (
                <div className="text-sm text-gray-600">
                    基础: ${rule.base_fare?.Valid ? rule.base_fare.Float64.toFixed(2) : '0.00'} | 
                    里程: ${rule.per_km_fare?.Valid ? rule.per_km_fare.Float64.toFixed(2) : '0.00'}/km | 
                    时长: ${rule.per_minute_fare?.Valid ? rule.per_minute_fare.Float64.toFixed(2) : '0.00'}/min
                </div>
            );
        } else {
            // 固定价格
            return (
                <div className="text-lg font-semibold text-green-600">
                    ${rule.fixed_price?.Valid ? rule.fixed_price.Float64.toFixed(2) : '0.00'}
                </div>
            );
        }
    };

    // 渲染区域信息 - 增强版
    const renderZoneInfo = (rule) => {
        if (rule.rule_type === 'pickup_zone' && rule.pickup_zone_id) {
            const zone = zones.find(z => z.id === rule.pickup_zone_id);
            return (
                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    从: {zone?.zone_name || '未知区域'} → 任意地点
                </span>
            );
        } else if (rule.rule_type === 'dropoff_zone' && rule.dropoff_zone_id) {
            const zone = zones.find(z => z.id === rule.dropoff_zone_id);
            return (
                <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    任意地点 → {zone?.zone_name || '未知区域'}
                </span>
            );
        } else if (rule.rule_type === 'zone_to_zone') {
            const pickupZone = zones.find(z => z.id === rule.pickup_zone_id);
            const dropoffZone = zones.find(z => z.id === rule.dropoff_zone_id);
            const isAirportRoute = pickupZone?.zone_type === 'airport' || dropoffZone?.zone_type === 'airport';
            return (
                <span className={`text-sm px-2 py-1 rounded ${
                    isAirportRoute 
                        ? 'text-purple-600 bg-purple-50' 
                        : 'text-gray-600 bg-gray-50'
                }`}>
                    {pickupZone?.zone_name || '未知'} → {dropoffZone?.zone_name || '未知'}
                    {isAirportRoute && <span className="ml-1 text-xs">✈️</span>}
                </span>
            );
        } else if (rule.rule_type === 'normal' && rule.zone_id) {
            const zone = zones.find(z => z.id === rule.zone_id);
            return <span className="text-sm text-gray-600">区域: {zone?.zone_name || '未知区域'}</span>;
        }
        return <span className="text-sm text-gray-500">全州适用</span>;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="ml-4 text-gray-600">加载中...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* 顶部操作栏 */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">计费规则管理</h2>
                    <p className="text-gray-600 mt-1">管理接机、送机、区域内和里程计费规则</p>
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
                                规则名称 & 类型
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                适用范围
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                服务等级
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                价格信息
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                优先级
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
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{rule.rule_name}</div>
                                        <div className="mt-1">{renderRuleTypeTag(rule.rule_type)}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm text-gray-900">{rule.state} - {rule.order_type}</div>
                                        <div className="mt-1">{renderZoneInfo(rule)}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {rule.service_level}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {renderPriceInfo(rule)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {rule.priority || 50}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        rule.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {rule.is_active ? '启用' : '禁用'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(rule)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(rule.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 创建/编辑模态框 */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingRule ? '编辑计费规则' : '新建计费规则'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* 基础信息 */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            规则名称 *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.rule_name}
                                            onChange={(e) => setFormData({...formData, rule_name: e.target.value})}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="如：接机_Economy_固定价格"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            规则类型 *
                                        </label>
                                        <select
                                            required
                                            value={formData.rule_type}
                                            onChange={(e) => setFormData({...formData, rule_type: e.target.value})}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {ruleTypes.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            州/地区 *
                                        </label>
                                        <select
                                            required
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
                                            订单类型 *
                                        </label>
                                        <select
                                            required
                                            value={formData.order_type}
                                            onChange={(e) => setFormData({...formData, order_type: e.target.value})}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {orderTypes.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            服务等级 *
                                        </label>
                                        <select
                                            required
                                            value={formData.service_level}
                                            onChange={(e) => setFormData({...formData, service_level: e.target.value})}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {serviceLevels.map(level => (
                                                <option key={level.value} value={level.value}>{level.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* 根据规则类型显示不同的字段 */}
                                {formData.rule_type === 'normal' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                适用区域（可选）
                                            </label>
                                            <select
                                                value={formData.zone_id}
                                                onChange={(e) => setFormData({...formData, zone_id: e.target.value})}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">全州适用</option>
                                                {zones.map(zone => (
                                                    <option key={zone.id} value={zone.id}>{zone.zone_name}</option>
                                                ))}
                                            </select>
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
                                    </>
                                )}

                                {formData.rule_type === 'pickup_zone' && (
                                    <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                                        <h4 className="font-medium text-green-800">接机规则设置</h4>
                                        <p className="text-sm text-green-600">从指定机场接客人，不管送到哪里，都收固定价格</p>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    接机机场 *
                                                </label>
                                                <select
                                                    required
                                                    value={formData.pickup_zone_id}
                                                    onChange={(e) => setFormData({...formData, pickup_zone_id: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="">选择机场</option>
                                                    {getAirports().map(airport => (
                                                        <option key={airport.id} value={airport.id}>
                                                            {airport.zone_name} ({airport.state})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    固定价格 ($) *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={formData.fixed_price}
                                                    onChange={(e) => setFormData({...formData, fixed_price: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="45.00"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formData.rule_type === 'dropoff_zone' && (
                                    <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
                                        <h4 className="font-medium text-orange-800">送机规则设置</h4>
                                        <p className="text-sm text-orange-600">不管从哪里出发，送到指定机场，都收固定价格</p>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    送机机场 *
                                                </label>
                                                <select
                                                    required
                                                    value={formData.dropoff_zone_id}
                                                    onChange={(e) => setFormData({...formData, dropoff_zone_id: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="">选择机场</option>
                                                    {getAirports().map(airport => (
                                                        <option key={airport.id} value={airport.id}>
                                                            {airport.zone_name} ({airport.state})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    固定价格 ($) *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={formData.fixed_price}
                                                    onChange={(e) => setFormData({...formData, fixed_price: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="45.00"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formData.rule_type === 'zone_to_zone' && (
                                    <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                                        <h4 className="font-medium text-purple-800">精准路线固定价格</h4>
                                        <p className="text-sm text-purple-600">指定起点到指定终点的固定价格（如：墨尔本机场→东南区=$80）</p>
                                        
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    起点 *
                                                </label>
                                                <select
                                                    required
                                                    value={formData.pickup_zone_id}
                                                    onChange={(e) => setFormData({...formData, pickup_zone_id: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="">选择起点</option>
                                                    <optgroup label="🛩️ 机场">
                                                        {getAirports().map(airport => (
                                                            <option key={airport.id} value={airport.id}>
                                                                {airport.zone_name}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                    <optgroup label="🏢 其他区域">
                                                        {getNonAirports().map(zone => (
                                                            <option key={zone.id} value={zone.id}>
                                                                {zone.zone_name}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    终点 *
                                                </label>
                                                <select
                                                    required
                                                    value={formData.dropoff_zone_id}
                                                    onChange={(e) => setFormData({...formData, dropoff_zone_id: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="">选择终点</option>
                                                    <optgroup label="🛩️ 机场">
                                                        {getAirports().map(airport => (
                                                            <option key={airport.id} value={airport.id}>
                                                                {airport.zone_name}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                    <optgroup label="🏢 其他区域">
                                                        {getNonAirports().map(zone => (
                                                            <option key={zone.id} value={zone.id}>
                                                                {zone.zone_name}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    固定价格 ($) *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={formData.fixed_price}
                                                    onChange={(e) => setFormData({...formData, fixed_price: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="80.00"
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* 快速创建按钮 */}
                                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                                            <span className="text-xs text-gray-500">快速创建：</span>
                                            {getAirports().map(airport => (
                                                <button
                                                    key={airport.id}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, pickup_zone_id: airport.id.toString()})}
                                                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                >
                                                    从{airport.zone_name}接机
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 优先级和状态 */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            优先级
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="50"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">数值越大优先级越高</p>
                                    </div>

                                    <div className="flex items-center mt-6">
                                        <input
                                            type="checkbox"
                                            id="rule_is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="rule_is_active" className="ml-2 block text-sm text-gray-900">
                                            启用规则
                                        </label>
                                    </div>
                                </div>

                                {/* 表单按钮 */}
                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <button
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                                        className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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