import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Believer, Family, Territory } from '../types';

interface BelieverFormProps {
    believer?: Partial<Believer>;
    parish: Territory;
    families: Family[];
    onSave: (believerData: any) => void;
    onCancel: () => void;
}

const BelieverForm: React.FC<BelieverFormProps> = ({ believer, parish, families, onSave, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Partial<Believer>>(believer || {});
    const [selectedZoneId, setSelectedZoneId] = useState('');
    const [selectedApvId, setSelectedApvId] = useState('');
    const [showNewFamilyInput, setShowNewFamilyInput] = useState(false);
    const [newFamilyAddress, setNewFamilyAddress] = useState('');

    useEffect(() => {
        const initialFormData = believer || {
            firstName: '', lastName: '', dateOfBirth: '', placeOfBirth: '', gender: 'Male',
            contactPhone: '', contactEmail: '', residentialAddress: '', familyId: '',
            relationshipToHead: 'Member', civilStatus: 'Single', occupation: '', notes: '',
            isBaptized: false, isFirstConfession: false, isFirstCommunion: false, isRenewalBaptism: false,
            isConfirmed: false, isMarriedSacramentally: false, parish: parish.id, status: 'active'
        };
        setFormData(initialFormData);

        if (believer?.familyId) {
            const family = families.find(f => f.id === believer.familyId);
            if (family) {
                const parentApvId = family.apvId;
                const parentZone = parish.zones?.find(z => z.apvs?.some(a => a.id === parentApvId));
                if (parentZone) {
                    setSelectedZoneId(parentZone.id);
                    setSelectedApvId(parentApvId);
                }
            }
        } else {
            setSelectedZoneId('');
            setSelectedApvId('');
        }
        setShowNewFamilyInput(false);
        setNewFamilyAddress('');
    }, [believer, families, parish]);

    const handleGenericChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedZoneId(e.target.value);
        setSelectedApvId('');
        setFormData(prev => ({ ...prev, familyId: '' }));
    };
    
    const handleApvChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedApvId(e.target.value);
        setFormData(prev => ({ ...prev, familyId: '' }));
    };

    const handleFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === '_NEW_FAMILY_') {
            setShowNewFamilyInput(true);
            setFormData(prev => ({ ...prev, familyId: '' }));
        } else {
            setShowNewFamilyInput(false);
            setFormData(prev => ({ ...prev, familyId: e.target.value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (showNewFamilyInput) {
            if (!newFamilyAddress.trim() || !selectedApvId) {
                alert("Please provide a new family address and select an APV.");
                return;
            }
            onSave({
                ...formData,
                newFamilyAddress: newFamilyAddress,
                apvIdForNewFamily: selectedApvId,
                familyId: undefined, // Ensure familyId is not sent
            });
        } else {
            if (!formData.familyId) {
                alert("Please select a family for the believer.");
                return;
            }
            onSave(formData as Believer);
        }
    };
    
    const apvsInSelectedZone = parish.zones?.find(z => z.id === selectedZoneId)?.apvs || [];
    const familiesInSelectedApv = families.filter(f => f.apvId === selectedApvId);

    const inputStyle = "mt-1 block w-full input";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <style>{`.input { margin-top: 0.25rem; display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; } .dark .input { background-color: #374151; border-color: #4B5563; }`}</style>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">{t('adminConsole.forms.believer.firstName')}</label><input name="firstName" value={formData.firstName} onChange={handleGenericChange} required className={inputStyle}/></div>
                <div><label className="block text-sm font-medium">{t('adminConsole.forms.believer.lastName')}</label><input name="lastName" value={formData.lastName} onChange={handleGenericChange} required className={inputStyle}/></div>
                <div><label className="block text-sm font-medium">{t('adminConsole.forms.believer.dateOfBirth')}</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleGenericChange} required className={inputStyle}/></div>
                <div><label className="block text-sm font-medium">{t('adminConsole.forms.believer.gender')}</label><select name="gender" value={formData.gender} onChange={handleGenericChange} className={inputStyle}><option value="Male">{t('adminConsole.forms.believer.male')}</option><option value="Female">{t('adminConsole.forms.believer.female')}</option></select></div>
            </div>

            <div className="p-4 border rounded-lg dark:border-gray-600 space-y-4">
                <h4 className="font-semibold text-lg">Location</h4>
                <div>
                    <label className="block text-sm font-medium">Zone</label>
                    <select value={selectedZoneId} onChange={handleZoneChange} className={inputStyle}>
                        <option value="">-- Select Zone --</option>
                        {parish.zones?.map(zone => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">APV</label>
                    <select value={selectedApvId} onChange={handleApvChange} className={inputStyle} disabled={!selectedZoneId}>
                        <option value="">-- Select APV --</option>
                        {apvsInSelectedZone.map(apv => <option key={apv.id} value={apv.id}>{apv.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Family</label>
                    <select value={showNewFamilyInput ? '_NEW_FAMILY_' : formData.familyId || ''} onChange={handleFamilyChange} className={inputStyle} disabled={!selectedApvId}>
                        <option value="">-- Select Family --</option>
                        <option value="_NEW_FAMILY_">-- Create New Family --</option>
                        {familiesInSelectedApv.map(f => <option key={f.id} value={f.id}>{f.address}</option>)}
                    </select>
                </div>
                {showNewFamilyInput && (
                    <div>
                        <label className="block text-sm font-medium">New Family Address</label>
                        <input type="text" value={newFamilyAddress} onChange={(e) => setNewFamilyAddress(e.target.value)} required className={inputStyle} placeholder="Enter the new family's address" />
                    </div>
                )}
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">{t('adminConsole.buttons.cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">{t('adminConsole.buttons.save')}</button>
            </div>
        </form>
    );
};

export default BelieverForm;
