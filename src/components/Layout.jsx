// src/components/Layout.jsx
import React from 'react';
import DashboardContent from './DashboardContent.jsx';
import DriverPage from './DriverPage.jsx';
import OrderPage from './OrderPage.jsx';
import VehiclePage from './VehiclePage.jsx';
import MonitorPage from './MonitorPage.jsx';
import PricingStrategyPage from './PricingStrategyPage.jsx'; // 新增

function Layout({ currentPage, onNavigate, onLogout }) {
    const navItems = [
        { id: 'dashboard', name: '仪表盘', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/> },
        { id: 'monitor', name: '实时监控', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/> },
        { id: 'orders', name: '订单管理', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
        { id: 'drivers', name: '司机管理', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
        { id: 'vehicles', name: '车辆管理', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4h5m-5 4h5" /> },
        // 新增：定价策略中心
        { id: 'pricing', name: '定价策略', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> }
    ];

    return (
        <div className="h-screen flex">
            <div className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-gray-700">派单系统后台</div>
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {navItems.map(item => (
                        <a 
                            key={item.id}
                            href="#" 
                            onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
                            className={`${currentPage === item.id ? 
                                'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                        >
                            <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">{item.icon}</svg>
                            {item.name}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="flex-1 flex flex-col">
                <header className="w-full bg-white shadow-md">
                    <div className="flex justify-end items-center h-16 px-8">
                        <button onClick={onLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">登出</button>
                    </div>
                </header>
                <main className="flex-1 p-8 bg-gray-100 overflow-y-auto">
                   {currentPage === 'dashboard' && <DashboardContent />}
                   {currentPage === 'monitor' && <MonitorPage />}
                   {currentPage === 'orders' && <OrderPage />}
                   {currentPage === 'drivers' && <DriverPage />}
                   {currentPage === 'vehicles' && <VehiclePage />}
                   {currentPage === 'pricing' && <PricingStrategyPage />} {/* 新增 */}
                </main>
            </div>
        </div>
    );
}

export default Layout;