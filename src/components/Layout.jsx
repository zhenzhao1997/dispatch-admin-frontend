import React from 'react';
import DashboardContent from './DashboardContent.jsx';
import DriverPage from './DriverPage.jsx';
import OrderPage from './OrderPage.jsx';
import VehiclePage from './VehiclePage.jsx';
// 【核心修正】引入我们新创建的 GrabRequestsPage 组件
import GrabRequestsPage from './GrabRequestsPage.jsx';

function Layout({ currentPage, onNavigate, onLogout }) {
    const navItems = [
        { id: 'dashboard', name: '仪表盘', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/> },
        { id: 'orders', name: '订单管理', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
        { id: 'grab-requests', name: '抢单请求', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /> },
        { id: 'drivers', name: '司机管理', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
        { id: 'vehicles', name: '车辆管理', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4h5m-5 4h5" /> }
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
                            className={`${currentPage === item.id ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
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
                   {currentPage === 'orders' && <OrderPage />}
                   {currentPage === 'grab-requests' && <GrabRequestsPage />}
                   {currentPage === 'drivers' && <DriverPage />}
                   {currentPage === 'vehicles' && <VehiclePage />}
                </main>
            </div>
        </div>
    );
}

export default Layout;