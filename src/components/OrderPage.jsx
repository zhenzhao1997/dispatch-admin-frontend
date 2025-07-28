import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import NewOrderModal from './NewOrderModal.jsx';
import AssignDriverModal from './AssignDriverModal.jsx';
import EditOrderModal from './EditOrderModal.jsx';

// 將 getStatusInfo 移到組件外部，作為一個純粹的輔助函數
const getStatusInfo = (status) => {
    const statusMap = {
        0: { text: '待處理', color: 'bg-gray-100 text-gray-800' },
        1: { text: '已派單', color: 'bg-blue-100 text-blue-800' },
        2: { text: '已接單', color: 'bg-blue-100 text-blue-800' },
        3: { text: '前往接駕', color: 'bg-cyan-100 text-cyan-800' },
        4: { text: '已到達', color: 'bg-teal-100 text-teal-800' },
        5: { text: '服務中', color: 'bg-indigo-100 text-indigo-800' },
        6: { text: '已完成', color: 'bg-green-100 text-green-800' },
        7: { text: '已取消', color: 'bg-red-100 text-red-800' },
    };
    return statusMap[status] || { text: '未知狀態', color: 'bg-yellow-100 text-yellow-800' };
};


// 為了讓程式碼更清晰，我們將表格的一行抽離成一個獨立的小組件
const OrderTableRow = ({ order, onAssignClick, onEditClick }) => {
    const { text: statusText, color: statusColor } = getStatusInfo(order.Status);

    return (
        <tr key={order.ID}>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="font-medium text-gray-900">內部ID: #{order.ID}</div>
                {order.ExternalOrderID && (<div className="text-gray-500">外部: {order.ExternalOrderID}</div>)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.ServiceTime).toLocaleString()}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.AssignedDriverName || '未分配'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                    {statusText}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                {order.Status === 0 && (<button onClick={() => onAssignClick(order)} className="text-indigo-600 hover:text-indigo-900">派單</button>)}
                <button onClick={() => onEditClick(order)} className="text-gray-600 hover:text-gray-900">編輯</button>
            </td>
        </tr>
    );
};


function OrderPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
    const [assigningOrder, setAssigningOrder] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/orders');
            setOrders(Array.isArray(data) ? data : []);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleModalClose = () => {
        setIsNewOrderModalOpen(false);
        setAssigningOrder(null);
        setEditingOrder(null);
        fetchOrders();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">訂單管理</h1>
                <button onClick={() => setIsNewOrderModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"> + 新建訂單 </button>
            </div>
            {isNewOrderModalOpen && <NewOrderModal onClose={() => setIsNewOrderModalOpen(false)} onSuccess={handleModalClose} />}
            {assigningOrder && <AssignDriverModal order={assigningOrder} onClose={() => setAssigningOrder(null)} onSuccess={handleModalClose} />}
            {editingOrder && <EditOrderModal order={editingOrder} onClose={() => setEditingOrder(null)} onSuccess={handleModalClose} />}

            {isLoading && <p>正在載入訂單列表...</p>}
            {error && <div className="text-red-600">{`載入失敗: ${error}`}</div>}
            
            {!isLoading && !error && (
                <div className="bg-white shadow rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">訂單號</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用車時間</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指派司機</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(orders).map(order => (
                                <OrderTableRow 
                                    key={order.ID} 
                                    order={order}
                                    onAssignClick={setAssigningOrder}
                                    onEditClick={setEditingOrder}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default OrderPage;