import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';

function EditDriverModal({ driver, onClose, onSuccess }) {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (driver) {
            setFormData({
                full_name: driver.FullName || '',
                email: driver.Email.Valid ? driver.Email.String : '',
                phone: driver.Phone || '',
                operating_state: driver.OperatingState || 'VIC',
                is_active: driver.IsActive,
            });
        }
    }, [driver]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');
        try {
            await api.put(`/drivers/${driver.ID}`, formData);
            onSuccess();
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-1/3 shadow-lg rounded-md bg-white">
                <h3 className="text-lg leading-6 font-medium text-gray-900 text-center mb-4">编辑司机信息</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="full_name" placeholder="司机姓名" value={formData.full_name} onChange={handleChange} className="border p-2 rounded-md" required />
                        <input type="text" name="phone" placeholder="电话" value={formData.phone} onChange={handleChange} className="border p-2 rounded-md" required />
                    </div>
                    <input type="email" name="email" placeholder="邮箱" value={formData.email} onChange={handleChange} className="border p-2 rounded-md w-full" required />
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="is_active" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="is_active" className="font-medium text-gray-700">激活状态</label>
                            <p className="text-gray-500">取消勾选可禁用此司机账号。</p>
                        </div>
                    </div>
                    {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
                    <div className="pt-4 flex gap-4">
                        <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md w-full hover:bg-gray-300" onClick={onClose}>取消</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-md w-full hover:bg-indigo-700" disabled={isSubmitting}>{isSubmitting ? '保存中...' : '保存更改'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditDriverModal;