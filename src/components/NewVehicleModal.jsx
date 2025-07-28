import React, { useState } from 'react';
import api from '../utils/api.js';
import Modal from './common/Modal.jsx';

function NewVehicleModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        carPlate: '',
        brand: '',
        model: '',
        serviceLevel: 'Comfort',
        seatCount: 5,
        registrationState: 'VIC',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');

        try {
            await api.post('/vehicles', {
                ...formData,
                seatCount: parseInt(formData.seatCount, 10),
            });
            onSuccess();
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Modal onClose={onClose} width="w-1/3">
            <h3 className="text-lg leading-6 font-medium text-gray-900 text-center mb-4">新增车辆</h3>
            {submitError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{submitError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">车牌号</label>
                        <input type="text" name="carPlate" value={formData.carPlate} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">品牌 (e.g. Toyota)</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">型号 (e.g. Camry)</label>
                            <input type="text" name="model" value={formData.model} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">服务等级</label>
                        <select name="serviceLevel" value={formData.serviceLevel} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md">
                            <option value="Economy">经济型</option>
                            <option value="Comfort">舒适型</option>
                            <option value="Luxury">豪华型</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">座位数</label>
                        <input type="number" name="seatCount" value={formData.seatCount} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" min="1" />
                    </div>
                    <div className="pt-4 flex gap-4">
                        <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md w-full hover:bg-gray-300" onClick={onClose}>取消</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-md w-full hover:bg-indigo-700" disabled={isSubmitting}>
                            {isSubmitting ? '提交中...' : '确认新增'}
                        </button>
                    </div>
            </form>
        </Modal>
    );
}

export default NewVehicleModal;