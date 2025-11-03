import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, ROLES, Believer } from '../types';

interface UserFormProps {
    user?: User; // For editing
    believersWithoutAccounts?: Believer[]; // For adding
    onSave: (data: any) => void;
    onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, believersWithoutAccounts, onSave, onCancel }) => {
    const { t } = useTranslation();
    const isEditMode = !!user;

    const [formData, setFormData] = useState<Partial<User>>(user || {});
    const [selectedBelieverId, setSelectedBelieverId] = useState('');
    const [selectedRole, setSelectedRole] = useState(ROLES.believer);

    useEffect(() => {
        if (isEditMode) {
            setFormData(user || {});
        }
    }, [user, isEditMode]);

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode) {
            onSave(formData);
        } else {
            if (selectedBelieverId && selectedRole) {
                onSave({ believerId: selectedBelieverId, role: selectedRole });
            }
        }
    };

    if (isEditMode) {
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" name="id" value={formData.id} />
                <div>
                    <label className="block text-sm font-medium">{t('adminConsole.forms.user.username')}</label>
                    <input name="username" value={formData.username} onChange={handleEditChange} required className="mt-1 block w-full input"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">{t('adminConsole.forms.user.email')}</label>
                    <input type="email" name="email" value={formData.email} onChange={handleEditChange} required className="mt-1 block w-full input"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">{t('adminConsole.forms.user.role')}</label>
                    <select name="role" value={formData.role} onChange={handleEditChange} className="mt-1 block w-full input">
                        {Object.values(ROLES).map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
                 <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onCancel} className="btn-secondary">{t('adminConsole.buttons.cancel')}</button>
                    <button type="submit" className="btn-primary">{t('adminConsole.buttons.save')}</button>
                </div>
            </form>
        );
    }

    // ADD MODE
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Select Believer</label>
                <select value={selectedBelieverId} onChange={(e) => setSelectedBelieverId(e.target.value)} required className="mt-1 block w-full input">
                    <option value="">-- Choose a believer --</option>
                    {believersWithoutAccounts?.map(b => (
                        <option key={b.id} value={b.id}>{b.firstName} {b.lastName} ({b.id})</option>
                    ))}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium">{t('adminConsole.forms.user.role')}</label>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="mt-1 block w-full input">
                    {Object.values(ROLES).map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
            </div>
             <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary">{t('adminConsole.buttons.cancel')}</button>
                <button type="submit" className="btn-primary">{t('adminConsole.buttons.save')}</button>
            </div>
        </form>
    );
};

export default UserForm;
