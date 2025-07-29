import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Hash, Wand2 } from 'lucide-react';
import api from '../../utils/api.js';

function PricingZonesTab() {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingZone, setEditingZone] = useState(null);
    const [inputMode, setInputMode] = useState('postcodes'); // 'postcodes' 或 'map'
    const [formData, setFormData] = useState({
        zone_name: '',
        state: 'VIC',
        postcodes: '',
        zone_geo: '',
        is_active: true
    });

    // 魔术按钮相关状态
    const [locationName, setLocationName] = useState('');
    const [boundaryLoading, setBoundaryLoading] = useState(false);

    // 加载数据
    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            setLoading(true);
            const data = await api.get('/pricing/zones');
            setZones(data);
        } catch (error) {
            console.error('加载区域失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 处理表单提交
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                zone_name: formData.zone_name,
                state: formData.state,
                is_active: formData.is_active
            };

            // 根据输入模式添加不同的数据
            if (inputMode === 'postcodes' && formData.postcodes) {
                submitData.postcodes = formData.postcodes.split(',').map(pc => pc.trim()).filter(pc => pc);
            } else if (inputMode === 'map' && formData.zone_geo) {
                submitData.zone_geo = formData.zone_geo;
            }

            if (editingZone) {
                await api.put(`/pricing/zones/${editingZone.id}`, submitData);
            } else {
                await api.post('/pricing/zones', submitData);
            }

            setShowModal(false);
            setEditingZone(null);
            resetForm();
            fetchZones();
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败: ' + error.message);
        }
    };

    // 删除区域
    const handleDelete = async (id) => {
        if (confirm('确定要删除这个计费区域吗？删除后相关的计价规则也会受到影响。')) {
            try {
                await api.delete(`/pricing/zones/${id}`);
                fetchZones();
            } catch (error) {
                console.error('删除失败:', error);
                alert('删除失败: ' + error.message);
            }
        }
    };

    // 编辑区域
    const handleEdit = (zone) => {
        setEditingZone(zone);
        setFormData({
            zone_name: zone.zone_name || '',
            state: zone.state || 'VIC',
            postcodes: '', // 这里可以加载实际的邮编数据
            zone_geo: zone.zone_geo || '',
            is_active: zone.is_active !== false
        });
        setInputMode('postcodes');
        setShowModal(true);
    };

    // 重置表单
    const resetForm = () => {
        setFormData({
            zone_name: '',
            state: 'VIC',
            postcodes: '',
            zone_geo: '',
            is_active: true
        });
        setLocationName('');
        setInputMode('postcodes');
    };

    // 新建区域
    const handleCreate = () => {
        resetForm();
        setEditingZone(null);
        setShowModal(true);
    };

    // 魔术按钮 - 获取地理边界
    const handleMagicButton = async () => {
        if (!locationName.trim()) {
            alert('请输入地区名称');
            return;
        }

        try {
            setBoundaryLoading(true);
            const response = await fetch(`http://localhost:8080/v1/geo/boundary?name=${encodeURIComponent(locationName)}`);
            const data = await response.json();

            if (data.boundaries && data.boundaries.length > 0) {
                // 将边界坐标转换为WKT格式
                const coordinates = data.boundaries.map(point => `${point[0]} ${point[1]}`).join(', ');
                const wktPolygon = `POLYGON((${coordinates}))`;
                
                setFormData(prev => ({
                    ...prev,
                    zone_geo: wktPolygon
                }));
                
                alert(`成功获取 ${data.location_name} 的地理边界！\n来源: ${data.source}\n坐标点数: ${data.boundaries.length}`);
            } else {
                alert(`无法获取 ${locationName} 的地理边界，请手动输入坐标或使用邮编模式。`);
            }
        } catch (error) {
            console.error('获取地理边界失败:', error);
            alert('获取地理边界失败: ' + error.message);
        } finally {
            setBoundaryLoading(false);
        }
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
                    <h2 className="text-xl font-semibold text-gray-900">计费区域管理</h2>
                    <p className="text-gray-600 mt-1">管理地理围栏和邮编计费区域</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    新建区域
                </button>
            </div>

            {/* 区域列表 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {zones.map((zone) => (
                    <div key={zone.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                                <MapPin className="h-5 w-5 text-indigo-600 mr-2" />
                                <h3 className="text-lg font-medium text-gray-900">{zone.zone_name}</h3>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                zone.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {zone.is_active ? '启用' : '禁用'}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">州/地区:</span>
                                <span className="font-medium">{zone.state}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">区域类型:</span>
                                <span className="font-medium">
                                    {zone.zone_geo ? '地理围栏' : '邮编区域'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">创建时间:</span>
                                <span className="font-medium">
                                    {new Date(zone.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4 border-t border-gray-200">
                            <button
                                onClick={() => handleEdit(zone)}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center text-sm"
                            >
                                <Edit2 className="h-4 w-4 mr-1" />
                                编辑
                            </button>
                            <button
                                onClick={() => handleDelete(zone.id)}
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

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {editingZone ? '编辑计费区域' : '新建计费区域'}
                                    </h3>

                                    <div className="space-y-4">
                                        {/* 基本信息 */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    区域名称
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.zone_name}
                                                    onChange={(e) => setFormData({...formData, zone_name: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="如：墨尔本CBD"
                                                />
                                            </div>

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
                                        </div>

                                        {/* 输入模式切换 */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                区域定义方式
                                            </label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        value="postcodes"
                                                        checked={inputMode === 'postcodes'}
                                                        onChange={(e) => setInputMode(e.target.value)}
                                                        className="mr-2"
                                                    />
                                                    <Hash className="h-4 w-4 mr-1" />
                                                    邮编列表
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        value="map"
                                                        checked={inputMode === 'map'}
                                                        onChange={(e) => setInputMode(e.target.value)}
                                                        className="mr-2"
                                                    />
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    地理围栏
                                                </label>
                                            </div>
                                        </div>

                                        {/* 邮编输入模式 */}
                                        {inputMode === 'postcodes' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    邮编列表
                                                </label>
                                                <textarea
                                                    value={formData.postcodes}
                                                    onChange={(e) => setFormData({...formData, postcodes: e.target.value})}
                                                    rows={3}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="输入邮编，用逗号分隔。如：3000, 3001, 3002, 3003"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    输入多个邮编，用逗号分隔。系统会自动为这些邮编创建计费区域。
                                                </p>
                                            </div>
                                        )}

                                        {/* 地理围栏输入模式 */}
                                        {inputMode === 'map' && (
                                            <div className="space-y-3">
                                                {/* 魔术按钮 */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        快速生成边界 (魔术按钮)
                                                    </label>
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="text"
                                                            value={locationName}
                                                            onChange={(e) => setLocationName(e.target.value)}
                                                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            placeholder="输入地区名称，如：Melbourne, VIC"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleMagicButton}
                                                            disabled={boundaryLoading}
                                                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                                                        >
                                                            <Wand2 className="h-4 w-4 mr-1" />
                                                            {boundaryLoading ? '获取中...' : '魔术按钮'}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        输入地区名称，系统会自动获取该地区的地理边界坐标
                                                    </p>
                                                </div>

                                                {/* 手动输入坐标 */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        地理围栏坐标 (WKT格式)
                                                    </label>
                                                    <textarea
                                                        value={formData.zone_geo}
                                                        onChange={(e) => setFormData({...formData, zone_geo: e.target.value})}
                                                        rows={4}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                                        placeholder="POLYGON((lng1 lat1, lng2 lat2, lng3 lat3, lng1 lat1))"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        WKT格式的多边形坐标，或使用上面的魔术按钮自动生成
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="zone_is_active"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="zone_is_active" className="ml-2 block text-sm text-gray-900">
                                                启用此区域
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        {editingZone ? '更新' : '创建'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingZone(null);
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

export default PricingZonesTab;