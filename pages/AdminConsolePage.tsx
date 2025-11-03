import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { User, ROLES, Believer, Family, Territory } from '../types';
import { useTranslation } from 'react-i18next';
import AdminModal from '../components/AdminModal';
import UserForm from '../components/UserForm';
import BelieverForm from '../components/BelieverForm';
import FamilyForm from '../components/FamilyForm';
import TerritoryForm from '../components/TerritoryForm';
import { StatisticsService } from '../services/StatisticsService';

type AdminTab = 'overview' | 'users' | 'believers' | 'families' | 'territories';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-vatican-gold/20 dark:bg-vatican-gold/30 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">{title}</h3>
            <p className="text-3xl font-bold text-swiss-guard-blue dark:text-vatican-gold mt-1">{value}</p>
        </div>
    </div>
);

export default function AdminConsolePage() {
    const { appData, ...actions } = useData();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const { t } = useTranslation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [territoryParent, setTerritoryParent] = useState<string | null>(null);
    const [believersForTerritoryModal, setBelieversForTerritoryModal] = useState<Believer[]>([]);

    const believersWithoutAccounts = useMemo(() => {
        const userBelieverIds = new Set(appData.users.map(u => u.believerId).filter(Boolean));
        return appData.believers.filter(b => !userBelieverIds.has(b.id));
    }, [appData.users, appData.believers]);


    if (!appData) {
        return <div className="text-center p-8">Loading admin data...</div>;
    }

    const allTerritories = useMemo(() => {
        const territories: (Territory & { parentId?: string })[] = [];
        const traverse = (nodes: Territory[], parentId?: string) => {
            if (!nodes) return;
            for (const node of nodes) {
                territories.push({ ...node, parentId });
                const childKeys = ['dioceses', 'vicariates', 'districts', 'parishes', 'zones', 'apvs'];
                for (const key of childKeys) {
                    if ((node as any)[key]) {
                        traverse((node as any)[key], node.id);
                    }
                }
            }
        };
        traverse(appData.territories.archdioceses);
        return territories;
    }, [appData.territories]);
    
    const openModal = (item: any = null) => {
        if (activeTab === 'territories') {
            const parentId = item ? item.parentId : territoryParent;
            let eligibleBelievers: Believer[] = [];
            
            if (parentId) {
                const parentTerritory = allTerritories.find(t => t.id === parentId);
                if (parentTerritory) {
                    // Context-aware filtering for leadership selection
                    eligibleBelievers = StatisticsService.getBelieversInTerritory(parentTerritory, appData);
                }
            } else {
                 // Fallback for top-level territories or if parent isn't found
                 eligibleBelievers = appData.believers;
            }
            setBelieversForTerritoryModal(eligibleBelievers);
        }
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => { setEditingItem(null); setIsModalOpen(false); setTerritoryParent(null); };
    
    const handleDelete = (id: string, parentId?: string) => {
        if (window.confirm(t('adminConsole.confirm.deleteMessage') as string)) {
            if (activeTab === 'users') actions.deleteUser(id);
            if (activeTab === 'believers') actions.deleteBeliever(id);
            if (activeTab === 'families') actions.deleteFamily(id);
            if (activeTab === 'territories' && parentId) actions.deleteTerritory(id, parentId);
        }
    };
    
    const handleSave = (item: any) => {
        if (activeTab === 'users') { 
            editingItem ? actions.updateUser(item) : actions.addUser(item); 
        }
        if (activeTab === 'believers') { 
            const believerData = item as Believer;
            if(editingItem) {
                actions.updateBeliever(believerData);
            } else {
                const newBeliever = actions.addBeliever(believerData);
                if (newBeliever.familyId) {
                    actions.addBelieverToFamily(newBeliever.familyId, newBeliever.id);
                }
            }
        }
        if (activeTab === 'families') { editingItem ? actions.updateFamily(item) : actions.addFamily(item); }
        if (activeTab === 'territories') {
            if (editingItem) {
                actions.updateTerritory(editingItem.id, item);
            } else if (territoryParent) {
                const parentTerritory = allTerritories.find(t => t.id === territoryParent);
                let childType: Territory['type'] | null = null;
                if(parentTerritory) {
                    switch(parentTerritory.type) {
                        case 'DISTRICT': childType = 'PARISH'; break;
                        case 'PARISH': childType = 'ZONE'; break;
                        case 'ZONE': childType = 'APV'; break;
                        case 'VICARIATE': childType = 'DISTRICT'; break;
                        case 'DIOCESE': childType = 'VICARIATE'; break;
                        case 'ARCHDIOCESE': childType = 'DIOCESE'; break;
                    }
                }
                if (childType) {
                    const newTerritoryData = { ...item, type: childType } as Omit<Territory, 'id' | 'children' | 'members'>;
                    actions.addTerritory(territoryParent, newTerritoryData);
                } else {
                    alert("Cannot determine child territory type for the selected parent.");
                }
            }
        }
        closeModal();
    };

    const filteredData = useMemo(() => {
        if (!search) {
            if (activeTab === 'users') return appData.users;
            if (activeTab === 'believers') return appData.believers;
            if (activeTab === 'families') return appData.families;
            if (activeTab === 'territories') return allTerritories;
        }
        const lowerCaseSearch = search.toLowerCase();
        if (activeTab === 'users') return appData.users.filter(u => u.username.toLowerCase().includes(lowerCaseSearch));
        if (activeTab === 'believers') return appData.believers.filter(b => `${b.firstName} ${b.lastName}`.toLowerCase().includes(lowerCaseSearch));
        if (activeTab === 'families') return appData.families.filter(f => f.address.toLowerCase().includes(lowerCaseSearch));
        if (activeTab === 'territories') return allTerritories.filter(t => t.name.toLowerCase().includes(lowerCaseSearch));

        return [];
    }, [search, activeTab, appData, allTerritories]);

    const tabs: { id: AdminTab, label: string }[] = [
        { id: 'overview', label: t('adminConsole.tabs.overview') as string },
        { id: 'users', label: t('adminConsole.tabs.users') as string },
        { id: 'believers', label: t('adminConsole.tabs.believers') as string },
        { id: 'families', label: t('adminConsole.tabs.families') as string },
        { id: 'territories', label: "Territories" as string },
    ];

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title={t('adminConsole.overview.totalUsers') as string} value={appData.users.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-swiss-guard-blue dark:text-vatican-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
            <StatCard title={t('adminConsole.overview.totalBelievers') as string} value={appData.believers.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-swiss-guard-blue dark:text-vatican-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
            <StatCard title={t('adminConsole.overview.totalFamilies') as string} value={appData.families.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-swiss-guard-blue dark:text-vatican-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} />
        </div>
    );
    
    const renderContent = () => {
        if (activeTab === 'overview') {
            return renderOverview();
        }
        const data = filteredData || [];
        return (
             <>
                <div className="flex justify-between items-center mb-4">
                     <input type="text" placeholder={t('adminConsole.searchPlaceholder') as string} value={search} onChange={e => setSearch(e.target.value)}
                        className="px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-vatican-gold focus:border-vatican-gold" />
                    <button onClick={() => { 
                        if (activeTab === 'territories') { 
                            const parentId = prompt("Enter Parent ID (e.g., DIS01... to add a Parish):");
                            if (parentId) {
                                setTerritoryParent(parentId);
                                openModal();
                            }
                        } else { 
                            openModal(); 
                        } 
                    }} className="px-4 py-2 bg-swiss-guard-blue text-white rounded-md hover:bg-blue-800 transition-colors">
                        {addNewButtonLabel()}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    {renderTable(data)}
                </div>
            </>
        )
    };
    
    const renderTable = (data: any[]) => {
        switch (activeTab) {
            case 'users': return ( <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"> <thead className="bg-gray-50 dark:bg-gray-700"><tr><th>{t('adminConsole.forms.user.username') as string}</th><th>{t('adminConsole.forms.user.email') as string}</th><th>{t('adminConsole.forms.user.role') as string}</th><th>{t('adminConsole.buttons.actions') as string}</th></tr></thead> <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"> {data.map((user: User) => (<tr key={user.id}><td>{user.username}</td><td>{user.email}</td><td>{user.role}</td><td className="text-right"><button onClick={() => openModal(user)} className="btn-edit">{t('adminConsole.buttons.edit') as string}</button><button onClick={() => handleDelete(user.id)} className="btn-delete">{t('adminConsole.buttons.delete') as string}</button></td></tr>))} </tbody> </table>);
            case 'believers': return ( <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"> <thead className="bg-gray-50 dark:bg-gray-700"><tr><th>{t('adminConsole.forms.believer.name') as string}</th><th>{t('adminConsole.forms.believer.gender') as string}</th><th>{t('adminConsole.forms.believer.contactPhone') as string}</th><th>{t('adminConsole.forms.believer.status') as string}</th><th>{t('adminConsole.buttons.actions') as string}</th></tr></thead> <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"> {data.map((b: Believer) => (<tr key={b.id}><td>{b.firstName} {b.lastName}</td><td>{b.gender}</td><td>{b.contactPhone}</td><td>{b.status}</td><td className="text-right"><button onClick={() => openModal(b)} className="btn-edit">{t('adminConsole.buttons.edit') as string}</button><button onClick={() => handleDelete(b.id)} className="btn-delete">{t('adminConsole.buttons.delete') as string}</button></td></tr>))} </tbody> </table>);
            case 'families': const believersById = new Map(appData.believers.map(b => [b.id, `${b.firstName} ${b.lastName}`])); return ( <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"> <thead className="bg-gray-50 dark:bg-gray-700"><tr><th>{t('adminConsole.forms.family.address') as string}</th><th>{t('adminConsole.forms.family.headOfFamily') as string}</th><th>{t('adminConsole.forms.family.members') as string}</th><th>{t('adminConsole.buttons.actions') as string}</th></tr></thead> <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"> {data.map((f: Family) => (<tr key={f.id}><td>{f.address}</td><td>{believersById.get(f.headOfFamily) || f.headOfFamily}</td><td>{f.members.length.toString()}</td><td className="text-right"><button onClick={() => openModal(f)} className="btn-edit">{t('adminConsole.buttons.edit') as string}</button><button onClick={() => handleDelete(f.id)} className="btn-delete">{t('adminConsole.buttons.delete') as string}</button></td></tr>))} </tbody> </table>);
            case 'territories': return ( <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"> <thead className="bg-gray-50 dark:bg-gray-700"><tr><th>Name</th><th>Type</th><th>ID</th><th>Actions</th></tr></thead> <tbody className="bg-white dark:bg-gray-800 divide-y divide-y-gray-200 dark:divide-gray-700"> {data.map((t: Territory & { parentId?: string }) => (<tr key={t.id}><td>{t.name}</td><td>{t.type}</td><td>{t.id}</td><td className="text-right"><button onClick={() => openModal(t)} className="btn-edit">Edit</button><button onClick={() => handleDelete(t.id, t.parentId)} className="btn-delete">Delete</button></td></tr>))} </tbody> </table>);
            default: return null;
        }
    };

    const renderModal = () => {
        switch (activeTab) {
            case 'users': return <AdminModal title={editingItem ? t('adminConsole.forms.user.titleEdit') as string : t('adminConsole.forms.user.titleAdd') as string} isOpen={isModalOpen} onClose={closeModal}><UserForm user={editingItem} believersWithoutAccounts={believersWithoutAccounts} onSave={handleSave} onCancel={closeModal} /></AdminModal>;
            case 'believers': 
                const parishForBelieverForm = StatisticsService.findTerritoryById("PAR001-DIS01-VIC03-DIO01-ARC02", appData.territories.archdioceses);
                if (!parishForBelieverForm) return null;
                return <AdminModal title={editingItem ? t('adminConsole.forms.believer.titleEdit') as string : t('adminConsole.forms.believer.titleAdd') as string} isOpen={isModalOpen} onClose={closeModal}><BelieverForm believer={editingItem} parish={parishForBelieverForm} families={appData.families} onSave={handleSave} onCancel={closeModal} /></AdminModal>;
            case 'families': return <AdminModal title={editingItem ? t('adminConsole.forms.family.titleEdit') as string : t('adminConsole.forms.family.titleAdd') as string} isOpen={isModalOpen} onClose={closeModal}><FamilyForm family={editingItem} believers={appData.believers} onSave={handleSave} onCancel={closeModal} /></AdminModal>;
            case 'territories': return <AdminModal title={editingItem ? "Edit Territory" : "Add New Territory"} isOpen={isModalOpen} onClose={closeModal}><TerritoryForm onSave={handleSave} onCancel={closeModal} initialData={editingItem} parishBelievers={believersForTerritoryModal} /></AdminModal>;
            default: return null;
        }
    }

    const addNewButtonLabel = () => {
        switch (activeTab) {
            case 'users': return t('adminConsole.buttons.addNewUser') as string;
            case 'believers': return t('adminConsole.buttons.addNewBeliever') as string;
            case 'families': return t('adminConsole.buttons.addNewFamily') as string;
            case 'territories': return 'Add Territory';
            default: return '';
        }
    }

    return (
        <section className="space-y-8">
            <style>{` .input { margin-top: 0.25rem; display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } .dark .input { background-color: #374151; border-color: #4B5563; } .btn-primary { padding: 0.5rem 1rem; background-color: #005493; color: white; border-radius: 0.375rem; } .btn-primary:hover { background-color: #004a83; } .btn-secondary { padding: 0.5rem 1rem; background-color: #E5E7EB; color: #1F2937; border-radius: 0.375rem; } .btn-secondary:hover { background-color: #D1D5DB; } .btn-edit { color: #005493; } .btn-edit:hover { color: #004a83; } .btn-delete { color: #B31917; margin-left: 0.5rem; } .btn-delete:hover { color: #9a1513; } .dark .btn-edit { color: #FFD700; } .dark .btn-edit:hover { color: #e6c200; } .dark .btn-delete { color: #E4002B; } .dark .btn-delete:hover { #c90026; } table th { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; } table td { padding: 1rem 1.5rem; white-space: nowrap; font-size: 0.875rem; } `}</style>
            <header className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('navigation.adminConsole') as string}</h2>
                <p className="text-md text-gray-500 dark:text-gray-400 mt-2">Manage application data directly.</p>
            </header>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`${ activeTab === tab.id ? 'border-vatican-gold text-vatican-gold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600' }
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="mt-6">
                    {renderContent()}
                </div>
            </div>

            {renderModal()}
        </section>
    );
}
