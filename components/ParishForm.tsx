import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Territory, ExecTeam, ParishGroup, Believer } from '../types';
import { defaultHolyAssociations, defaultCommissions, defaultPrayersGroups, defaultNodeGroups } from '../data/defaultGroups';

interface ParishFormProps {
  parish: Territory;
  parishBelievers: Believer[];
  onSave: (updatedData: Partial<Territory>) => void;
  onCancel: () => void;
}

const ParishForm: React.FC<ParishFormProps> = ({ parish, parishBelievers, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Territory>>(parish);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Ensure default structures exist if they are missing from the data
    const initialData = {
        ...parish,
        execTeam: parish.execTeam || {},
        financesCouncil: parish.financesCouncil || {},
        holyAssociations: parish.holyAssociations || [],
        prayersGroups: parish.prayersGroups || [],
        commissions: parish.commissions || [],
        nodeGroups: parish.nodeGroups || [],
    };
    setFormData(initialData);
  }, [parish]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTeamChange = (teamName: keyof Territory, role: keyof ExecTeam, value: string) => {
      setFormData(prev => ({
          ...prev,
          [teamName]: {
              ...(prev as any)[teamName],
              [role]: value
          }
      }));
  };

  const handleGroupChange = (groupType: 'holyAssociations' | 'prayersGroups' | 'commissions' | 'nodeGroups', index: number, field: 'name' | keyof ExecTeam, value: string, isExec: boolean = false) => {
      setFormData(prev => {
          const newGroups = [...((prev as any)[groupType] || [])];
          if (isExec) {
              newGroups[index].execTeam = { ...newGroups[index].execTeam, [field]: value };
          } else {
              newGroups[index][field as 'name'] = value;
          }
          return { ...prev, [groupType]: newGroups };
      });
  };

  const addGroup = (groupType: 'holyAssociations' | 'prayersGroups' | 'commissions' | 'nodeGroups', name: string = 'New Custom Group') => {
      const newGroup: ParishGroup = { id: `new-${groupType}-${Date.now()}`, name, execTeam: {} };
      setFormData(prev => ({ ...prev, [groupType]: [...((prev as any)[groupType] || []), newGroup] }));
      setOpenDropdown(null);
  };
  
  const removeGroup = (groupType: 'holyAssociations' | 'prayersGroups' | 'commissions' | 'nodeGroups', index: number) => {
      setFormData(prev => ({ ...prev, [groupType]: (prev as any)[groupType].filter((_: any, i: number) => i !== index) }));
  };

  const toggleDropdown = (groupType: string) => {
    setOpenDropdown(prev => (prev === groupType ? null : groupType));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white";
  const selectStyle = inputStyle;

  const renderExecTeamFields = (teamName: keyof Territory, title: string) => (
      <div className="space-y-4 p-4 border rounded-lg dark:border-gray-600">
          <h4 className="font-semibold text-lg">{title}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['president', 'vicePresident1', 'vicePresident2', 'secretary1', 'secretary2', 'treasurer1', 'treasurer2'] as (keyof ExecTeam)[]).map(role => (
                  <div key={role}>
                      <label className="block text-sm font-medium capitalize">{role.replace(/([A-Z0-9])/g, ' $1')}</label>
                      <select name={role} value={(formData as any)[teamName]?.[role] || ''} onChange={(e) => handleTeamChange(teamName, role, e.target.value)} className={selectStyle}>
                          <option value="">-- Unassigned --</option>
                          {parishBelievers.map(b => <option key={b.id} value={b.id}>{b.firstName} {b.lastName}</option>)}
                      </select>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderGroupFields = (groupType: 'holyAssociations' | 'prayersGroups' | 'commissions' | 'nodeGroups', title: string) => {
    let defaults: string[] = [];
    switch (groupType) {
        case 'holyAssociations': defaults = defaultHolyAssociations; break;
        case 'commissions': defaults = defaultCommissions; break;
        case 'prayersGroups': defaults = defaultPrayersGroups; break;
        case 'nodeGroups': defaults = defaultNodeGroups; break;
    }

    return (
      <div className="space-y-4 p-4 border rounded-lg dark:border-gray-600">
          <div className="flex justify-between items-center">
              <h4 className="font-semibold text-lg">{title}</h4>
              <div className="relative" ref={groupType === openDropdown ? dropdownRef : null}>
                  <button type="button" onClick={() => toggleDropdown(groupType)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 flex items-center">
                      Add...
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {openDropdown === groupType && (
                      <div className="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10 max-h-60 overflow-y-auto">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                              {defaults.map(name => (
                                  <a key={name} href="#" onClick={(e) => { e.preventDefault(); addGroup(groupType, name); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">{name}</a>
                              ))}
                              <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                              <a href="#" onClick={(e) => { e.preventDefault(); addGroup(groupType, 'New Custom Group'); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 font-semibold">Add Custom Group...</a>
                          </div>
                      </div>
                  )}
              </div>
          </div>
          {((formData as any)[groupType] || []).map((group: ParishGroup, index: number) => (
              <div key={group.id || index} className="p-3 border rounded-md dark:border-gray-500 space-y-3">
                  <div className="flex items-center space-x-2">
                      <input value={group.name} onChange={(e) => handleGroupChange(groupType, index, 'name', e.target.value)} className={`${inputStyle} flex-grow`} />
                      <button type="button" onClick={() => removeGroup(groupType, index)} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">&times;</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                      {(['president', 'vicePresident1', 'vicePresident2', 'secretary1', 'secretary2', 'treasurer1', 'treasurer2'] as (keyof ExecTeam)[]).map(role => (
                          <div key={role}>
                              <label className="block text-xs font-medium capitalize text-gray-500">{role.replace(/([A-Z0-9])/g, ' $1')}</label>
                              <select value={group.execTeam?.[role] || ''} onChange={(e) => handleGroupChange(groupType, index, role, e.target.value, true)} className={selectStyle}>
                                  <option value="">-- Unassigned --</option>
                                  {parishBelievers.map(b => <option key={b.id} value={b.id}>{b.firstName} {b.lastName}</option>)}
                              </select>
                          </div>
                      ))}
                  </div>
              </div>
          ))}
      </div>
    );
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 p-4 border rounded-lg dark:border-gray-600">
        <h4 className="font-semibold text-lg">Basic Information</h4>
        <div>
            <label className="block text-sm font-medium">Parish Name</label>
            <input name="name" value={formData.name || ''} onChange={handleChange} required className={inputStyle} />
        </div>
      </div>

      <div className="space-y-4 p-4 border rounded-lg dark:border-gray-600">
          <h4 className="font-semibold text-lg">Clergy & Staff</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium">Main Priest</label><input name="priest" value={formData.priest || ''} onChange={handleChange} className={inputStyle} /></div>
              <div><label className="block text-sm font-medium">Deacon</label><input name="deacon" value={formData.deacon || ''} onChange={handleChange} className={inputStyle} /></div>
              <div><label className="block text-sm font-medium">Assistant Priest 1</label><input name="priestAssistant1" value={formData.priestAssistant1 || ''} onChange={handleChange} className={inputStyle} /></div>
              <div><label className="block text-sm font-medium">Assistant Priest 2</label><input name="priestAssistant2" value={formData.priestAssistant2 || ''} onChange={handleChange} className={inputStyle} /></div>
              <div><label className="block text-sm font-medium">Sacristin</label><input name="sacristin" value={formData.sacristin || ''} onChange={handleChange} className={inputStyle} /></div>
          </div>
      </div>
      
      {renderExecTeamFields('execTeam', 'Pastoral Council Team')}
      {renderExecTeamFields('financesCouncil', 'Pastoral Financial Team')}
      {renderGroupFields('holyAssociations', 'Holy Associations')}
      {renderGroupFields('prayersGroups', 'Prayers Groups')}
      {renderGroupFields('commissions', 'Commissions')}
      {renderGroupFields('nodeGroups', 'Node Groups')}


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

export default ParishForm;
