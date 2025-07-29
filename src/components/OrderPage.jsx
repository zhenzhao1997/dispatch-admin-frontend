// src/components/OrderPage.jsx
// 【技术总监V3.0】订单管理页面 - 使用统一字典服务

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  selectOrderStatusText, 
  selectOrderTypeText, 
  selectServiceLevelText,
  selectSystemConstants 
} from '../store/slices/systemConstantsSlice';
import api from '../utils/api';

function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    orderType: '',
    serviceLevel: '',
    page: 1,
    pageSize: 20
  });
  const [pagination, setPagination] = useState({});

  // =================================================================
  // 【核心改进】使用Redux字典服务而不是硬编码映射
  // =================================================================
  
  const systemConstants = useSelector(selectSystemConstants);
  const getOrderStatusText = useSelector(selectOrderStatusText);
  const getOrderTypeText = useSelector(selectOrderTypeText);  
  const getServiceLevelText = useSelector(selectServiceLevelText);

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 构建查询参数
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/orders?${params.toString()}`);
      setOrders(response.orders || []);
      setPagination(response.pagination || {});
      
    } catch (err) {
      setError('加载订单失败: ' + err.message);
      console.error('❌ 订单加载失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // =================================================================
  // 【新增】获取状态颜色的工具函数
  // =================================================================
  
  const getStatusColor = (status) => {
    const colorMap = {
      0: 'bg-yellow-100 text-yellow-800',   // 待处理
      1: 'bg-blue-100 text-blue-800',       // 已派单
      2: 'bg-indigo-100 text-indigo-800',   // 司机已接单
      3: 'bg-orange-100 text-orange-800',   // 前往接驾
      4: 'bg-purple-100 text-purple-800',   // 已到达
      5: 'bg-cyan-100 text-cyan-800',       // 服务中
      6: 'bg-green-100 text-green-800',     // 已完成
      7: 'bg-red-100 text-red-800',         // 已取消
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getServiceLevelColor = (level) => {
    const colorMap = {
      'Economy': 'bg-green-100 text-green-800',
      'Comfort': 'bg-blue-100 text-blue-800',
      'Luxury': 'bg-purple-100 text-purple-800',
      'Premium': 'bg-gold-100 text-gold-800',
    };
    return colorMap[level] || 'bg-gray-100 text-gray-800';
  };

  // =================================================================
  // 渲染筛选器组件
  // =================================================================
  
  const renderFilters = () => (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 订单状态筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">订单状态</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部状态</option>
            {/* 【关键改进】动态渲染选项，使用字典服务 */}
            {Object.entries(systemConstants.order_status || {}).map(([value, text]) => (
              <option key={value} value={value}>{text}</option>
            ))}
          </select>
        </div>

        {/* 订单类型筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">订单类型</label>
          <select
            value={filters.orderType}
            onChange={(e) => setFilters({...filters, orderType: e.target.value, page: 1})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部类型</option>
            {/* 【关键改进】动态渲染选项，使用字典服务 */}
            {Object.entries(systemConstants.order_type || {}).map(([value, text]) => (
              <option key={value} value={value}>{text}</option>
            ))}
          </select>
        </div>

        {/* 服务等级筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">服务等级</label>
          <select
            value={filters.serviceLevel}
            onChange={(e) => setFilters({...filters, serviceLevel: e.target.value, page: 1})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部等级</option>
            {/* 【关键改进】动态渲染选项，使用字典服务 */}
            {Object.entries(systemConstants.service_level || {}).map(([value, text]) => (
              <option key={value} value={value}>{text}</option>
            ))}
          </select>
        </div>

        {/* 重置按钮 */}
        <div className="flex items-end">
          <button
            onClick={() => setFilters({ status: '', orderType: '', serviceLevel: '', page: 1, pageSize: 20 })}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            重置筛选
          </button>
        </div>
      </div>
    </div>
  );

  // =================================================================
  // 主渲染逻辑
  // =================================================================

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="ml-4 text-gray-600">加载订单中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadOrders}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">订单管理</h1>
          <p className="text-gray-600 mt-1">
            共找到 {pagination.total || 0} 个订单
            {filters.status && ` · 状态: ${getOrderStatusText(filters.status)}`}
            {filters.orderType && ` · 类型: ${getOrderTypeText(filters.orderType)}`}
            {filters.serviceLevel && ` · 等级: ${getServiceLevelText(filters.serviceLevel)}`}
          </p>
        </div>
        <button 
          onClick={() => {/* 添加新订单逻辑 */}}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          新建订单
        </button>
      </div>

      {/* 筛选器 */}
      {renderFilters()}

      {/* 订单列表 */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg">没有找到符合条件的订单</p>
          <p className="text-gray-400 text-sm mt-2">尝试调整筛选条件或创建新订单</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    订单信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型 & 等级
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    服务时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    路线信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    司机 & 车辆
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    {/* 订单信息 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                        {order.external_order_id && (
                          <div className="text-sm text-gray-500">外部订单: {order.external_order_id}</div>
                        )}
                        <div className="text-xs text-gray-400">
                          创建时间: {new Date(order.created_at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    </td>

                    {/* 类型 & 等级 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {/* 【关键改进】使用字典服务翻译订单类型 */}
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getOrderTypeText(order.order_type)}
                        </span>
                        {/* 【关键改进】使用字典服务翻译服务等级 */}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getServiceLevelColor(order.service_level)}`}>
                          {getServiceLevelText(order.service_level)}
                        </span>
                      </div>
                    </td>

                    {/* 状态 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* 【关键改进】使用字典服务翻译订单状态 */}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getOrderStatusText(order.status)}
                      </span>
                    </td>

                    {/* 服务时间 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.service_time).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    {/* 路线信息 */}
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="space-y-1">
                        <div className="truncate">
                          <span className="text-green-600">🔵</span> {order.pickup_address}
                        </div>
                        <div className="truncate">
                          <span className="text-red-600">🔴</span> {order.dropoff_address}
                        </div>
                      </div>
                    </td>

                    {/* 司机 & 车辆信息 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        {/* 【关键改进】使用JOIN查询获取的动态信息 */}
                        <div>
                          👨‍💼 {order.driver_name?.Valid ? order.driver_name.String : '未指派'}
                        </div>
                        <div>
                          🚗 {order.car_plate?.Valid ? order.car_plate.String : '未指派'}
                        </div>
                      </div>
                    </td>

                    {/* 金额 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.amount.toFixed(2)}
                    </td>

                    {/* 操作 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          查看
                        </button>
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          onClick={() => handleEditOrder(order.id)}
                        >
                          编辑
                        </button>
                        {order.status === 0 && (
                          <button 
                            className="text-green-600 hover:text-green-900 transition-colors"
                            onClick={() => handleAssignOrder(order.id)}
                          >
                            派单
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {pagination.total_pages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  显示第 {((pagination.page - 1) * pagination.page_size) + 1} 到 {Math.min(pagination.page * pagination.page_size, pagination.total)} 条，
                  共 {pagination.total} 条记录
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilters({...filters, page: pagination.page - 1})}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    上一页
                  </button>
                  <span className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded">
                    {pagination.page} / {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => setFilters({...filters, page: pagination.page + 1})}
                    disabled={pagination.page >= pagination.total_pages}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // =================================================================
  // 事件处理函数
  // =================================================================

  function handleViewOrder(orderId) {
    console.log('查看订单:', orderId);
    // 实现查看订单详情逻辑
  }

  function handleEditOrder(orderId) {
    console.log('编辑订单:', orderId);
    // 实现编辑订单逻辑
  }

  function handleAssignOrder(orderId) {
    console.log('派单:', orderId);
    // 实现派单逻辑
  }
}

export default OrderPage;