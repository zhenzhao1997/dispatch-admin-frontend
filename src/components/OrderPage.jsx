// src/components/OrderPage.jsx
// 【正确版本】保持Redux架构，只修复分页验证问题

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  selectOrderStatusText, 
  selectOrderTypeText, 
  selectServiceLevelText,
  selectSystemConstants 
} from '../store/index';
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
    pageSize: 10  // 修复：确保满足后端min验证要求
  });
  const [pagination, setPagination] = useState({});

  // 使用Redux字典服务
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
      
      // 构建查询参数，确保符合后端验证
      const params = new URLSearchParams();
      
      if (filters.status !== '' && filters.status !== null) {
        params.append('status', filters.status);
      }
      if (filters.orderType !== '' && filters.orderType !== null) {
        params.append('orderType', filters.orderType);
      }
      if (filters.serviceLevel !== '' && filters.serviceLevel !== null) {
        params.append('serviceLevel', filters.serviceLevel);
      }
      
      // 确保分页参数符合后端验证（最小值要求）
      params.append('page', Math.max(1, filters.page));
      params.append('pageSize', Math.max(1, Math.min(100, filters.pageSize)));
      
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

  // 渲染筛选器
  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">筛选订单</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 状态筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">订单状态</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部状态</option>
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
            {Object.entries(systemConstants.service_level || {}).map(([value, text]) => (
              <option key={value} value={value}>{text}</option>
            ))}
          </select>
        </div>

        {/* 重置按钮 */}
        <div className="flex items-end">
          <button
            onClick={() => setFilters({ status: '', orderType: '', serviceLevel: '', page: 1, pageSize: 10 })}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            重置筛选
          </button>
        </div>
      </div>
    </div>
  );

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
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无订单</h3>
          <p className="text-gray-500">当前筛选条件下没有找到订单</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  服务等级
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  接驾地址
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  服务时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {getOrderStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getOrderTypeText(order.order_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getServiceLevelText(order.service_level)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {order.pickup_address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.service_time ? new Date(order.service_time).toLocaleString('zh-CN') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleViewOrder(order.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      查看
                    </button>
                    <button 
                      onClick={() => handleEditOrder(order.id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      编辑
                    </button>
                    <button 
                      onClick={() => handleAssignOrder(order.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      派单
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 分页 */}
          {pagination.total_pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setFilters({...filters, page: Math.max(1, filters.page - 1)})}
                  disabled={filters.page <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  上一页
                </button>
                <button
                  onClick={() => setFilters({...filters, page: Math.min(pagination.total_pages, filters.page + 1)})}
                  disabled={filters.page >= pagination.total_pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    显示第 <span className="font-medium">{((filters.page - 1) * filters.pageSize) + 1}</span> 到{' '}
                    <span className="font-medium">{Math.min(filters.page * filters.pageSize, pagination.total)}</span> 条，
                    共 <span className="font-medium">{pagination.total}</span> 条记录
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => setFilters({...filters, page: filters.page - 1})}
                    disabled={filters.page <= 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 mr-2"
                  >
                    上一页
                  </button>
                  <span className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded">
                    {filters.page} / {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => setFilters({...filters, page: filters.page + 1})}
                    disabled={filters.page >= pagination.total_pages}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 ml-2"
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

  // 事件处理函数
  function getStatusColor(status) {
    const colors = {
      0: 'bg-yellow-100 text-yellow-800',
      1: 'bg-blue-100 text-blue-800',
      2: 'bg-purple-100 text-purple-800',
      3: 'bg-indigo-100 text-indigo-800',
      4: 'bg-green-100 text-green-800',
      5: 'bg-orange-100 text-orange-800',
      6: 'bg-gray-100 text-gray-800',
      7: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

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