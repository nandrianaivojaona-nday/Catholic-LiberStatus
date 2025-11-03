import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Contribution, CONTRIBUTION_CATEGORIES } from '../types';

interface ContributionFormProps {
  contribution?: Contribution | null;
  onSave: (contribution: Omit<Contribution, 'id'> | Contribution) => void;
  onCancel: () => void;
}

const ContributionForm: React.FC<ContributionFormProps> = ({ contribution, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: CONTRIBUTION_CATEGORIES[0],
    amount: '',
  });

  useEffect(() => {
    if (contribution) {
      setFormData({
        date: contribution.date,
        category: contribution.category,
        amount: String(contribution.amount),
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: CONTRIBUTION_CATEGORIES[0],
        amount: '',
      });
    }
  }, [contribution]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...contribution, // This will include the ID if it's an edit
      date: formData.date,
      category: formData.category as Contribution['category'],
      amount: parseFloat(formData.amount) || 0,
    };
    onSave(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <style>{`.input { margin-top: 0.25rem; display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; } .dark .input { background-color: #374151; border-color: #4B5563; }`}</style>
      <div>
        <label className="block text-sm font-medium">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Category</label>
        <select name="category" value={formData.category} onChange={handleChange} className="input">
          {CONTRIBUTION_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Amount (Ar)</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          className="input"
          placeholder="e.g., 50000"
        />
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">{t('adminConsole.buttons.cancel')}</button>
        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">{t('adminConsole.buttons.save')}</button>
      </div>
    </form>
  );
};

export default ContributionForm;
