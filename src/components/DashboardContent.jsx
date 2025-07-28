import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';

function DashboardContent() {
    const [admin, setAdmin] = useState(null);
    const [error, setError] = useState('');
     
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const data = await api.get('/admin/me');
                setAdmin(data);
            } catch(err) {
                setError(err.message);
            }
        };
        fetchAdminData();
    }, []);

    return (
         <div>
            <h1 className="text-3xl font-bold text-gray-800">
                {admin ? `欢迎回来, ${admin.full_name}!` : '正在加载...'}
            </h1>
            {error && <div className="mt-4 text-red-600">{error}</div>}
            <p className="mt-2 text-gray-600">这里是您的系统主控台。</p>
        </div>
    );
}

export default DashboardContent;