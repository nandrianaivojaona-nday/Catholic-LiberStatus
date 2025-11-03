import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Family, Believer } from '../types';

const FamilyForm: React.FC<{
    family?: Partial<Family>;
    believers: Believer[];
    onSave: (family: Family) => void;
    onCancel: () => void;
    showBelieverForm?: () => void;
}> = ({ family, believers, onSave, onCancel, showBelieverForm }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Partial<Family>>(family || {
        address: '', apvId: '', headOfFamily: '', parish: 'PAR001-DIS01-VIC03-DIO01-ARC02', members: [], contributions: []
    });

    useEffect(() => {
        setFormData(family || { address: '', apvId: '', headOfFamily: '', parish: 'PAR001-DIS01-VIC03-DIO01-ARC02', members: [], contributions: [] });
    }, [family]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Family);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">{t('adminConsole.forms.family.address')}</label>
                <input name="address" value={formData.address || ''} onChange={handleChange} required className="mt-1 block w-full input"/>
            </div>
            <div>
                <label className="block text-sm font-medium">{t('adminConsole.forms.family.apvId')}</label>
                <input name="apvId" value={formData.apvId || ''} onChange={handleChange} required className="mt-1 block w-full input"/>
            </div>
            <div>
                <label className="block text-sm font-medium">{t('adminConsole.forms.family.headOfFamily')}</label>
                <div className="flex items-center space-x-2">
                    <select name="headOfFamily" value={formData.headOfFamily || ''} onChange={handleChange} required className="mt-1 block w-full input">
                        <option value="">-- Select Head of Family --</option>
                        {believers.map(b => <option key={b.id} value={b.id}>{b.firstName} {b.lastName}</option>)}
                    </select>
                    {showBelieverForm && (
                        <button
                            type="button"
                            onClick={showBelieverForm}
                            title={t('adminConsole.buttons.addNewBeliever')}
                            className="mt-1 px-3 py-2 text-lg bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                        >
                            +
                        </button>
                    )}
                </div>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary">{t('adminConsole.buttons.cancel')}</button>
                <button type="submit" className="btn-primary">{t('adminConsole.buttons.save')}</button>
            </div>
        </form>
    );
};

export default FamilyForm;