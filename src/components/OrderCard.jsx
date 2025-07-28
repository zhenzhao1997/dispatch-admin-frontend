// src/components/OrderCard.jsx

import React from 'react';

const getStatusTag = (status) => {
    const statusMap = { 0: { text: '待处理', color: 'bg-yellow-100 text-yellow-800' }, 1: { text: '已派单', color: 'bg-blue-100 text-blue-800' }, 2: { text: '司机已接单', color: 'bg-blue-100 text-blue-800' }, 3: { text: '前往接驾', color: 'bg-teal-100 text-teal-800' }, 4: { text: '已到达', color: 'bg-teal-100 text-teal-800' }, 5: { text: '服务中', color: 'bg-cyan-100 text-cyan-800' }, 6: { text: '已完成', color: 'bg-green-100 text-green-800' }, 7: { text: '已取消', color: 'bg-red-100 text-red-800' }, };
    return statusMap[status] || { text: '未知状态', color: 'bg-gray-100 text-gray-800' };
};

// 【核心修改】组件现在接收 onAssignClick 作为 prop
function OrderCard({ order, onAssignClick }) {
    const { text: statusText, color: statusColor } = getStatusTag(order.Status);
    const externalId = order.ExternalOrderID?.Valid ? order.ExternalOrderID.String : null;
    const serviceTime = new Date(order.ServiceTime);
    const pickupAddress = order.PickupAddress;
    const dropoffAddress = order.DropoffAddress;
    const passengerCount = order.PassengerCount;
    const luggageCount = order.LuggageCount;
    const assignedDriver = order.AssignedDriverName?.Valid ? order.AssignedDriverName.String : '未分配';

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
            {/* 卡片头部 */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div> <span className="text-sm font-semibold text-gray-800">预约单</span> <span className="ml-4 text-sm text-gray-500"> 服务时间: {serviceTime.toLocaleDateString()} {serviceTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} </span> </div>
                <div className="flex items-center gap-x-3"> <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}> {statusText} </span> <span className="text-sm text-gray-400">携程号: {externalId || 'N/A'}</span> </div>
            </div>
            {/* 卡片主体 */}
            <div className="p-4">
                <div className="flex">
                    <div className="flex-grow">
                        <div className="flex items-center mb-3"> <span className="bg-blue-500 rounded-full h-4 w-4 flex items-center justify-center text-white text-xs">起</span> <p className="ml-3 text-gray-800 font-medium">{pickupAddress}</p> </div>
                        <div className="flex items-center"> <span className="bg-green-500 rounded-full h-4 w-4 flex items-center justify-center text-white text-xs">终</span> <p className="ml-3 text-gray-800 font-medium">{dropoffAddress}</p> </div>
                    </div>
                    <div className="flex-shrink-0 w-32 flex flex-col items-center justify-center">
                        <div className="flex items-center"> <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> <span className="ml-2 text-lg font-bold text-gray-800">{passengerCount}</span> </div>
                        <div className="flex items-center mt-2"> <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> <span className="ml-2 text-lg font-bold text-gray-800">{luggageCount}</span> </div>
                    </div>
                </div>
            </div>
            {/* 卡片底部 - 操作栏 */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end items-center space-x-4">
                <span className="text-sm text-gray-600">司机: <span className="font-medium">{assignedDriver}</span></span>
                <button className="text-sm text-indigo-600 hover:text-indigo-900">订单详情</button>
                <button className="text-sm text-indigo-600 hover:text-indigo-900">改派司机</button>
                {order.Status === 0 && (
                    // 【核心修改】为按钮绑定 onClick 事件
                    <button 
                        onClick={onAssignClick}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md shadow-sm hover:bg-indigo-700"
                    >
                        派单
                    </button>
                )}
            </div>
        </div>
    );
}

export default OrderCard;