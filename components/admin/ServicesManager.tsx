
import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { Service, ServiceType } from '../../types';
import { updateService } from '../../api/servicesApi';

const ServicesManager: React.FC = () => {
    const appContext = useContext(AppContext);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Service>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleEditClick = (service: Service) => {
        setEditingId(service.id);
        setEditForm({ ...service });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSave = async () => {
        if (!editingId) return;
        setIsSaving(true);
        try {
            await updateService(editingId, editForm);
            await appContext?.refreshServices();
            appContext?.showMessage('تم تحديث الخدمة بنجاح ✅', 'success');
            setEditingId(null);
            setEditForm({});
        } catch (error) {
            appContext?.showMessage('فشل تحديث الخدمة ❌', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field: keyof Service, value: any) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#13343B] mb-4">إدارة الخدمات والأسعار</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appContext?.services.map(service => (
                    <div key={service.id} className={`bg-white p-4 rounded-lg border shadow-sm transition-all ${editingId === service.id ? 'border-[#21808D] ring-2 ring-[#21808D]/20' : 'border-gray-200'}`}>
                        {editingId === service.id ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">اسم الخدمة</label>
                                    <input 
                                        type="text" 
                                        value={editForm.name_ar} 
                                        onChange={e => handleChange('name_ar', e.target.value)}
                                        className="w-full border rounded px-2 py-1 text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">السعر (جنيه)</label>
                                        <input 
                                            type="number" 
                                            value={editForm.price} 
                                            onChange={e => handleChange('price', Number(e.target.value))}
                                            className="w-full border rounded px-2 py-1 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">النوع</label>
                                        <select 
                                            value={editForm.type} 
                                            onChange={e => handleChange('type', e.target.value as ServiceType)}
                                            className="w-full border rounded px-2 py-1 text-sm"
                                        >
                                            <option value="fixed">ثابت</option>
                                            <option value="meter">بالمتر</option>
                                            <option value="consultation">معاينة</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">الوصف</label>
                                    <textarea 
                                        value={editForm.description_ar} 
                                        onChange={e => handleChange('description_ar', e.target.value)}
                                        rows={2}
                                        className="w-full border rounded px-2 py-1 text-sm"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button 
                                        onClick={handleSave} 
                                        disabled={isSaving}
                                        className="flex-1 bg-[#21808D] text-white py-1.5 rounded text-sm font-bold hover:bg-[#1D7480] disabled:opacity-50"
                                    >
                                        {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                                    </button>
                                    <button 
                                        onClick={handleCancel} 
                                        disabled={isSaving}
                                        className="flex-1 bg-gray-100 text-gray-600 py-1.5 rounded text-sm font-bold hover:bg-gray-200"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <i className={`${service.icon} text-[#21808D] text-xl`}></i>
                                        <h4 className="font-bold text-[#13343B]">{service.name_ar}</h4>
                                    </div>
                                    <button 
                                        onClick={() => handleEditClick(service)}
                                        className="text-gray-400 hover:text-[#21808D] transition-colors"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mb-3 h-10 overflow-hidden">{service.description_ar}</p>
                                <div className="flex justify-between items-center text-sm font-bold bg-gray-50 p-2 rounded">
                                    <span className="text-[#21808D]">
                                        {service.type === 'consultation' ? 'حسب المعاينة' : `${service.price} جنيه ${service.type === 'meter' ? '/ م' : ''}`}
                                    </span>
                                    <span className="text-xs text-gray-500 font-normal border border-gray-200 px-2 py-0.5 rounded-full">
                                        {service.category === 'home_cleaning' ? 'منازل' : 
                                         service.category === 'furniture' ? 'مفروشات' : 
                                         service.category === 'carpets_curtains' ? 'سجاد' : 'أخرى'}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServicesManager;
