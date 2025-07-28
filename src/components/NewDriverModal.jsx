import React, { useState } from 'react';
import api from '../utils/api.js';

function NewDriverModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        driverType: 'internal', // 默认为内部司机
        fullName: '',
        phone: '',
        email: '',
        password: '', // 密码只在内部司机时需要
        operatingState: 'VIC',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // 校验：如果是内部司机，密码不能为空
        if (formData.driverType === 'internal' && !formData.password) {
            setSubmitError('内部司机必须提供初始密码');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            // 注意字段名要和后端 DTO (CreateDriverRequest) 匹配
            const payload = {
                driver_type: formData.driverType,
                full_name: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                password: formData.password,
                operating_state: formData.operatingState,
            };
            
            await api.post('/drivers', payload);
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
                <h3 className="text-lg leading-6 font-medium text-gray-900 text-center mb-4">新增司机</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">司机类型</label>
                        <select name="driverType" value={formData.driverType} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md">
                            <option value="internal">内部司机</option>
                            <option value="external">外部司机</option>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="fullName" placeholder="司机姓名" value={formData.fullName} onChange={handleChange} className="border p-2 rounded-md" required />
                        <input type="text" name="phone" placeholder="电话" value={formData.phone} onChange={handleChange} className="border p-2 rounded-md" required />
                    </div>

                    <input type="email" name="email" placeholder="邮箱" value={formData.email} onChange={handleChange} className="border p-2 rounded-md w-full" required />
                    
                    {/* 条件渲染：只有当司机类型是 internal 时，才显示密码框 */}
                    {formData.driverType === 'internal' && (
                        <input type="password" name="password" placeholder="初始密码" value={formData.password} onChange={handleChange} className="border p-2 rounded-md w-full" required />
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">运营州</label>
                        <select name="operatingState" value={formData.operatingState} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md">
                            <option value="VIC">VIC</option>
                            <option value="NSW">NSW</option>
                        </select>
                    </div>

                    {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
                    
                    <div className="pt-4 flex gap-4">
                        <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md w-full hover:bg-gray-300" onClick={onClose}>取消</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-md w-full hover:bg-indigo-700" disabled={isSubmitting}>
                            {isSubmitting ? '提交中...' : '确认新增'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewDriverModal;