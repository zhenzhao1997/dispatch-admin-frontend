// src/components/charts/DashboardStats.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';

// 统计卡片组件
const StatCard = ({ title, value, icon, trend, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-500 text-blue-600 bg-blue-50',
        green: 'bg-green-500 text-green-600 bg-green-50',
        yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
        red: 'bg-red-500 text-red-600 bg-red-50',
        purple: 'bg-purple-500 text-purple-600 bg-purple-50'
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${colorClasses[color].split(' ')[2]}`}>
                    <div className={`w-6 h-6 ${colorClasses[color].split(' ')[1]}`}>
                        {icon}
                    </div>
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <div className="flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">{value}</p>
                        {trend && (
                            <p className={`ml-2 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {trend > 0 ? '+' : ''}{trend}%
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 简单的柱状图组件
const SimpleBarChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <div className="w-20 text-sm text-gray-600">{item.label}</div>
                        <div className="flex-1 mx-3">
                            <div className="bg-gray-200 rounded-full h-4">
                                <div 
                                    className="bg-indigo-500 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="w-12 text-sm font-medium text-gray-900">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 主仪表盘组件
function DashboardStats() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        todayOrders: 0,
        activeDrivers: 0,
        completedOrders: 0,
        revenue: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // 获取订单数据
            const orders = await api.get('/orders');
            const drivers = await api.get('/drivers');
            
            // 计算统计数据
            const today = new Date().toDateString();
            const todayOrders = orders.filter(order => 
                new Date(order.ServiceTime).toDateString() === today
            ).length;
            
            const completedOrders = orders.filter(order => order.Status === 6).length;
            const activeDrivers = drivers.filter(driver => driver.IsActive).length;
            
            // 计算收入（示例数据）
            const revenue = orders.reduce((sum, order) => sum + (order.Amount || 0), 0);
            
            setStats({
                totalOrders: orders.length,
                todayOrders,
                activeDrivers,
                completedOrders,
                revenue: revenue.toFixed(2)
            });

            // 生成图表数据
            const statusData = [
                { label: '待处理', value: orders.filter(o => o.Status === 0).length },
                { label: '已派单', value: orders.filter(o => o.Status === 1).length },
                { label: '进行中', value: orders.filter(o => [2,3,4,5].includes(o.Status)).length },
                { label: '已完成', value: completedOrders },
                { label: '已取消', value: orders.filter(o => o.Status === 7).length }
            ];
            
            setChartData(statusData);
            
        } catch (error) {
            console.error('获取仪表盘数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 统计卡片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    title="总订单数"
                    value={stats.totalOrders}
                    trend={5.2}
                    color="blue"
                    icon={
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                        </svg>
                    }
                />
                <StatCard
                    title="今日订单"
                    value={stats.todayOrders}
                    trend={12.3}
                    color="green"
                    icon={
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                        </svg>
                    }
                />
                <StatCard
                    title="活跃司机"
                    value={stats.activeDrivers}
                    trend={-2.1}
                    color="purple"
                    icon={
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                        </svg>
                    }
                />
                <StatCard
                    title="已完成"
                    value={stats.completedOrders}
                    trend={8.7}
                    color="green"
                    icon={
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                    }
                />
                <StatCard
                    title="总收入"
                    value={`¥${stats.revenue}`}
                    trend={15.4}
                    color="yellow"
                    icon={
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                        </svg>
                    }
                />
            </div>

            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimpleBarChart
                    data={chartData}
                    title="订单状态分布"
                />
                
                {/* 最近活动 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">最近活动</h3>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">新订单创建 - 5分钟前</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">司机已接单 - 12分钟前</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">新司机注册 - 1小时前</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">订单已完成 - 2小时前</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardStats;