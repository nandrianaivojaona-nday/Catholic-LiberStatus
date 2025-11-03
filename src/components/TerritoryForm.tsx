
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// FIX: Import Believer type to use it in the component props.
import { Territory, User, ExecTeam, Believer } from '../types';

interface TerritoryFormProps {
  onSave: (data: Partial<Territory>) => void;
  onCancel: () => void;
  initialData?: Partial<Territory>;
  // FIX: Changed prop from parishUsers: User[] to parishBelievers: Believer[] to match the data being passed and the component's logic.
  parishBelievers: Believer[];
}

const TerritoryForm: React.FC<TerritoryFormProps> = ({ onSave, onCancel, initialData, parishBelievers }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Territory>>(initialData || { name: '', address: '', execTeam: {} });

  useEffect(() => {
    setFormData(initialData || { name: '', address: '', execTeam: {} });
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTeamChange = (role: keyof ExecTeam, value: string) => {
      setFormData(prev => ({
          ...prev,
          execTeam: {
              ...(prev.execTeam || {}),
              [role]: value
          }
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name?.trim()) {
      onSave(formData);
    }
  };

  const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white";
  const selectStyle = inputStyle;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input name="name" value={formData.name || ''} onChange={handleChange} required className={inputStyle} />
      </div>
      <div>
        <label className="block text-sm font-medium">Address</label>
        <input name="address" value={formData.address || ''} onChange={handleChange} className={inputStyle} />
      </div>

      <div className="space-y-4 p-4 border rounded-lg dark:border-gray-600">
          <h4 className="font-semibold text-lg">Leadership Team</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['president', 'vicePresident1', 'vicePresident2', 'secretary1', 'secretary2', 'treasurer1', 'treasurer2'] as (keyof ExecTeam)[]).map(role => (
                  <div key={role}>
                      <label className="block text-sm font-medium capitalize">{role.replace(/([A-Z0-9])/g, ' $1')}</label>
                      <select name={role} value={formData.execTeam?.[role] || ''} onChange={(e) => handleTeamChange(role, e.target.value)} className={selectStyle}>
                          <option value="">-- Unassigned --</option>
                          {/* FIX: Mapped over parishBelievers to correctly display believer names for selection. */}
                          {parishBelievers.map(b => <option key={b.id} value={b.id}>{b.firstName} {b.lastName}</option>)}
                      </select>
                  </div>
              ))}
          </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
          {t('adminConsole.buttons.cancel')}
        </button>
        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          {t('adminConsole.buttons.save')}
        </button>
      </div>
    </form>
  );
};

export default TerritoryForm;