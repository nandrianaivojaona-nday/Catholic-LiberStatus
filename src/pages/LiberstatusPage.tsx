

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { hasPermission } from '../utils/permissionUtils';
import { StatisticsService } from '../services/StatisticsService';
import logger from '../utils/logger';
import { Territory, User, Believer, ROLES, ExecTeam, ParishGroup } from '../types';
import AdminModal from '../components/AdminModal';
import BelieverForm from '../components/BelieverForm';
import FamilyForm from '../components/FamilyForm';
import TerritoryForm from '../components/TerritoryForm';
import ContributionForm from '../components/ContributionForm';
import ParishForm from '../components/ParishForm';

// --- ICONS ---
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const ArrowDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a1 1 0 011 1v1H3V5a1 1 0 011-1zm6 0h3a1 1 0 011 1v1h-4V5a1 1 0 011-1zM4 9h12v7a1 1 0 01-1 1H5a1 1 0 01-1-1V9zm2-4h6v1H6V5z" clipRule="evenodd" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-1.5 5.5a3 3 0 00-3 0V12a2 2 0 002 2h2a2 2 0 002-2v-.5a3 3 0 00-3 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zm-1.5 5.5a3 3 0 00-3 0V12a2 2 0 002 2h2a2 2 0 002-2v-.5a3 3 0 00-3 0z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.527 1.903 6.002 6.002 0 01-.85 3.055l-.42.723a1 1 0 01-1.664 0l-.42-.723a6.002 6.002 0 01-2.831-5.749A2 2 0 0010 8a2 2 0 01-1.527-1.903z" clipRule="evenodd" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;

const ICONS: { [key: string]: React.FC } = {
  PARISH: BuildingIcon,
  ZONE: GlobeIcon,
  APV: UsersIcon,
  FAMILY: UserIcon,
  default: UsersIcon,
};

const findNodeById = (node: Territory | null, nodeId: string): Territory | null => {
    if (!node) return null;
    if (node.id === nodeId) return node;
    if (node.children) {
        for (const child of node.children) {
            const found = findNodeById(child, nodeId);
            if (found) return found;
        }
    }
    return null;
};

const TerritoryNode = React.memo((
    { node, expandedNodes, onToggle, onSelect, selectedNode, level, currentUser }: 
    { node: Territory, expandedNodes: Set<string>, onToggle: (nodeId: string) => void, onSelect: (node: Territory) => void, selectedNode: Territory | null, level: number, currentUser: User | null }
) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const hasChildren = (node.children && node.children.length > 0) || (node.members && node.members.length > 0);
    const Icon = ICONS[node.type] || ICONS.default;

    const canViewFamilies = hasPermission(currentUser, 'viewFamilies');
    const isProtectedAPV = node.type === 'APV' && !canViewFamilies;

    const handleToggle = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle(node.id);
    }, [onToggle, node.id]);
    
    const handleSelect = useCallback(() => {
        onSelect(node);
    }, [onSelect, node]);

    return (
        <div style={{ paddingLeft: `${level * 20}px` }}>
            <div className={`flex items-center my-1 rounded-lg transition-colors duration-200 ${isSelected ? 'bg-primary-200 dark:bg-primary-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <div className="w-6 h-8 flex items-center justify-center flex-shrink-0">
                    {hasChildren && (
                        <button onClick={handleToggle} className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-white focus:outline-none focus:ring-1 focus:ring-primary-500" disabled={isProtectedAPV && !isExpanded}>
                            {isExpanded ? <ArrowDownIcon /> : <ArrowRightIcon />}
                        </button>
                    )}
                </div>
                <div onClick={handleSelect} className="flex items-center flex-grow cursor-pointer p-2">
                    <Icon />
                    <span className="font-medium text-gray-800 dark:text-gray-200">{node.name}</span>
                    {isProtectedAPV && <LockIcon/>}
                </div>
            </div>
            {isExpanded && hasChildren && (
                <div className="border-l-2 border-gray-300 dark:border-gray-600 ml-3">
                    {node.children?.map(child => (
                        <TerritoryNode key={child.id} node={child} expandedNodes={expandedNodes} onToggle={onToggle} onSelect={onSelect} selectedNode={selectedNode} level={level + 1} currentUser={currentUser}/>
                    ))}
                    {node.members?.map(member => (
                        <div key={member.id} className="flex items-center p-2 rounded-lg ml-4" style={{ paddingLeft: `${(level + 1) * 20}px` }}>
                            <UserIcon/> {member.fullName} ({member.relationshipToHead})
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

const formatRoleName = (roleKey: string) => {
  return roleKey
    .replace(/([A-Z0-9])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
};

const ExecTeamDisplay: React.FC<{ team?: ExecTeam, users: User[], title: string }> = ({ team, users, title }) => {
    if (!team || Object.values(team).every(v => !v)) return null;
    const teamMembers = Object.entries(team).map(([role, userId]) => {
        if (!userId) return null;
        const user = users.find(u => u.id === userId);
        return { role, name: user ? user.username : 'Unassigned' };
    }).filter(Boolean);
    if (teamMembers.length === 0) return null;
    return (
        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
            <h6 className="font-semibold text-md text-gray-700 dark:text-gray-300 mb-2">{title}</h6>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {teamMembers.map(({ role, name }) => (
                    <li key={role}><span className="font-medium text-gray-600 dark:text-gray-400">{formatRoleName(role)}:</span> {name}</li>
                ))}
            </ul>
        </div>
    );
};

const ParishGroupDisplay: React.FC<{ group: ParishGroup, users: User[], onToggle: () => void, isExpanded: boolean }> = ({ group, users, onToggle, isExpanded }) => {
    return (
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
            <button onClick={onToggle} className="w-full text-left p-3 flex justify-between items-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                <span className="font-bold text-primary-800 dark:text-primary-300">{group.name}</span>
                {/* FIX: Reduced icon size for better UI ergonomics */}
                <ChevronDownIcon className={`h-4 w-4 ${isExpanded ? 'transform rotate-180' : ''}`} />
            </button>
            {isExpanded && <ExecTeamDisplay team={group.execTeam} users={users} title="Leadership Team" />}
        </div>
    )
};

const ChevronDownIcon = ({ className = "h-5 w-5 transition-transform" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;

export default function LiberstatusPage() {
    const { t } = useTranslation();
    const { currentUser, openLoginModal } = useAuth();
    const { appData, addFamily, updateFamily, deleteFamily, addBeliever, updateBeliever, deleteBeliever, addUser, addTerritory, updateTerritory, deleteTerritory, addContributionToFamily, updateContributionInFamily, deleteContributionFromFamily, addBelieverToFamily } = useData();
    const { territory: initialParishData } = useOutletContext<{ territory: Territory; currentUser: User }>();

    const [treeData, setTreeData] = useState<Territory | null>(null);
    const [expandedNodes, setExpandedNodes] = useState(new Set<string>());
    const [selectedNode, setSelectedNode] = useState<Territory | null>(null);
    const [isFamilyModalOpen, setFamilyModalOpen] = useState(false);
    const [familyModalConfig, setFamilyModalConfig] = useState<any>(null);
    const [editingBeliever, setEditingBeliever] = useState<Partial<Believer> | null>(null);
    const [isTerritoryModalOpen, setTerritoryModalOpen] = useState(false);
    const [territoryModalConfig, setTerritoryModalConfig] = useState<any>(null);
    const [isContributionModalOpen, setContributionModalOpen] = useState(false);
    const [contributionModalConfig, setContributionModalConfig] = useState<any>(null);
    const [isParishModalOpen, setParishModalOpen] = useState(false);
    // FIX: Add state for eligible believers for the territory modal.
    const [eligibleBelieversForModal, setEligibleBelieversForModal] = useState<Believer[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, Set<string>>>({
        holyAssociations: new Set(),
        prayersGroups: new Set(),
        commissions: new Set(),
        // FIX: Add nodeGroups to support new feature.
        nodeGroups: new Set(),
    });

    // FIX: Add memo for parish believers to be used in modals.
    const parishBelievers = useMemo(() => {
        if (!initialParishData?.id) return [];
        return appData.believers.filter(b => b.parish === initialParishData.id);
    }, [appData.believers, initialParishData.id]);
    
    const believersForFamilyForm = useMemo(() => {
        if (!initialParishData?.id) return [];
        const familyHeads = new Set(appData.families.map(f => f.headOfFamily));
        return parishBelievers.filter(b => b.status === 'active' && !familyHeads.has(b.id));
    }, [parishBelievers, appData.families, initialParishData]);

    const familyDataForSelectedNode = useMemo(() => {
        if (selectedNode?.type === 'FAMILY') {
            return appData.families.find(f => f.id === selectedNode.id);
        }
        return null;
    }, [selectedNode, appData.families]);
    
    const parishUsers = useMemo(() => {
        if (!initialParishData?.id) return [];
        return appData.users.filter(u => u.territoryId === initialParishData.id);
    }, [appData.users, initialParishData.id]);

    useEffect(() => {
        if (!initialParishData?.id) return;
        const isParishChanged = treeData?.id !== initialParishData.id;
        logger.info(`LiberstatusPage: Re-evaluating tree for parish ${initialParishData.id}. Parish changed: ${isParishChanged}`);
        
        const builtTree = StatisticsService.buildLiberstatusTree(initialParishData, appData);
        setTreeData(builtTree);

        if (isParishChanged) {
            logger.info("New parish selected. Resetting view state.");
            setSelectedNode(null);
            const initialExpanded = new Set([builtTree.id]);
            builtTree.children?.forEach(zone => initialExpanded.add(zone.id));
            setExpandedNodes(initialExpanded);
        } else {
             logger.info("Data updated. Preserving view state.");
            if (selectedNode) {
                const newSelectedNode = findNodeById(builtTree, selectedNode.id);
                setSelectedNode(newSelectedNode);
            }
        }
    }, [initialParishData, appData]);
    
    const globalStats = useMemo(() => {
        if (!treeData) return null;
        return StatisticsService.aggregateStats(treeData);
    }, [treeData]);

    const { parentNode } = useMemo(() => {
        if (!treeData || !selectedNode?.parentId) return { parentNode: null };
        const parent = findNodeById(treeData, selectedNode.parentId);
        return { parentNode: parent };
    }, [treeData, selectedNode]);

    const handleToggleNode = useCallback((nodeId: string) => {
        const isCurrentlyExpanded = expandedNodes.has(nodeId);
        const nodeToToggle = findNodeById(treeData, nodeId);
        if (!isCurrentlyExpanded && nodeToToggle?.type === 'APV') {
            if (!currentUser) { logger.warn("Anonymous user trying to view families. Prompting for sign-in."); openLoginModal(); return; }
            if (!hasPermission(currentUser, 'viewFamilies')) { alert(t('common.permission_denied')); return; }
        }
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            newSet.has(nodeId) ? newSet.delete(nodeId) : newSet.add(nodeId);
            return newSet;
        });
    }, [expandedNodes, treeData, currentUser, openLoginModal, t]);

    const handleToggleGroup = (groupType: keyof typeof expandedGroups, groupId: string) => {
        setExpandedGroups(prev => {
            const newGroupSet = new Set(prev[groupType]);
            newGroupSet.has(groupId) ? newGroupSet.delete(groupId) : newGroupSet.add(groupId);
            return { ...prev, [groupType]: newGroupSet };
        });
    };
    
    const handleSelectNode = useCallback((node: Territory) => { setSelectedNode(node); }, []);
    const handleAddHousehold = () => { if (selectedNode?.type === 'APV') { setFamilyModalConfig({ mode: 'add', apvId: selectedNode.id }); setFamilyModalOpen(true); } };
    const handleModifyFamily = () => { if (selectedNode?.type === 'FAMILY') { const familyData = appData.families.find(f => f.id === selectedNode.id); if (familyData) { setFamilyModalConfig({ mode: 'edit', data: familyData }); setFamilyModalOpen(true); } } };
    const handleDeleteFamily = () => { if (selectedNode?.type === 'FAMILY' && hasPermission(currentUser, 'DELETE_FAMILY', { target: selectedNode, parent: parentNode })) { if (window.confirm(`Are you sure you want to delete this family? This will also permanently delete all associated believers.`)) { const familyData = appData.families.find(f => f.id === selectedNode.id); if (familyData) { familyData.members.forEach(memberId => deleteBeliever(memberId)); deleteFamily(selectedNode.id); setSelectedNode(parentNode); } } } };
    const handleCloseFamilyModal = () => { setFamilyModalOpen(false); setFamilyModalConfig(null); };
    const handleSaveFamily = (formData: any) => { if (familyModalConfig?.mode === 'add') { addFamily({ ...formData, parish: initialParishData.id, members: formData.headOfFamily ? [formData.headOfFamily] : [], contributions: [], }); } else if (familyModalConfig?.mode === 'edit') { const originalFamily = familyModalConfig.data; const newMembers = new Set(originalFamily.members); if(formData.headOfFamily) newMembers.add(formData.headOfFamily); updateFamily({ ...originalFamily, address: formData.address, headOfFamily: formData.headOfFamily, members: Array.from(newMembers), }); } handleCloseFamilyModal(); };
    const handleOpenAddMemberForm = () => { if (selectedNode?.type === 'FAMILY') setEditingBeliever({ familyId: selectedNode.id, parish: initialParishData.id } as Partial<Believer>); };
    const handleOpenEditBeliever = (believer: Believer) => setEditingBeliever(believer);
    const handleCloseBelieverModal = () => setEditingBeliever(null);
    const handleSaveBeliever = (believerData: Believer) => { if (believerData.id) { updateBeliever(believerData); } else { const newBeliever = addBeliever(believerData); addBelieverToFamily(newBeliever.familyId, newBeliever.id); } handleCloseBelieverModal(); };
    
    // FIX: Update handlers to set eligible believers for the territory modal.
    const handleAddZone = () => { 
        if (selectedNode?.type === 'PARISH') {
            setEligibleBelieversForModal(parishBelievers);
            setTerritoryModalConfig({ mode: 'add', type: 'ZONE', parentNode: selectedNode });
            setTerritoryModalOpen(true);
        }
    };
    const handleAddAPV = () => {
        if (selectedNode?.type === 'ZONE') {
            const believersInZone = StatisticsService.getBelieversInTerritory(selectedNode, appData);
            setEligibleBelieversForModal(believersInZone);
            setTerritoryModalConfig({ mode: 'add', type: 'APV', parentNode: selectedNode });
            setTerritoryModalOpen(true);
        }
    };
    const handleEditTerritory = () => {
        if (selectedNode && parentNode) {
            let eligible: Believer[] = [];
            if (parentNode.type === 'ZONE') { // Editing an APV, leaders come from the Zone
                eligible = StatisticsService.getBelieversInTerritory(parentNode, appData);
            } else if (parentNode.type === 'PARISH') { // Editing a Zone, leaders come from the Parish
                eligible = parishBelievers;
            }
            setEligibleBelieversForModal(eligible);
            setTerritoryModalConfig({ mode: 'edit', data: selectedNode });
            setTerritoryModalOpen(true);
        } else if (selectedNode) { // Fallback for nodes without a parent in the tree view (like Parish)
            setEligibleBelieversForModal(parishBelievers);
            setTerritoryModalConfig({ mode: 'edit', data: selectedNode });
            setTerritoryModalOpen(true);
        }
    };
    
    const handleDeleteTerritory = () => { if (selectedNode?.parentId) { if (selectedNode.children?.length) { alert("Cannot delete a territory with children."); return; } if (window.confirm(`Delete ${selectedNode.name}?`)) { deleteTerritory(selectedNode.id, selectedNode.parentId); setSelectedNode(parentNode); } } };
    // FIX: Changed signature to accept a Partial<Territory> object to match the form component.
    const handleSaveTerritory = (data: Partial<Territory>) => {
        if (territoryModalConfig?.mode === 'add') {
            const newTerritoryData = {
                name: data.name || 'Unnamed Territory',
                address: data.address,
                execTeam: data.execTeam, // This now contains believer IDs
                type: territoryModalConfig.type
            } as Omit<Territory, 'id' | 'children' | 'members'>;
            addTerritory(territoryModalConfig.parentNode.id, newTerritoryData);
        } else if (territoryModalConfig?.mode === 'edit') {
            updateTerritory(territoryModalConfig.data.id, data); // data contains believer IDs
        }
        handleCloseTerritoryModal();
    };
    const handleCloseTerritoryModal = () => { setTerritoryModalOpen(false); setTerritoryModalConfig(null); };
    const handleOpenParishModal = () => setParishModalOpen(true);
    const handleCloseParishModal = () => setParishModalOpen(false);
    const handleSaveParish = (updatedParishData: Partial<Territory>) => { if(selectedNode?.type === 'PARISH') { updateTerritory(selectedNode.id, updatedParishData); } handleCloseParishModal(); };
    const handleOpenContributionModal = (c: any = null) => { setContributionModalConfig({ mode: c ? 'edit' : 'add', data: c }); setContributionModalOpen(true); };
    const handleCloseContributionModal = () => { setContributionModalOpen(false); setContributionModalConfig(null); };
    const handleSaveContribution = (cData: any) => { if (selectedNode?.type !== 'FAMILY') return; if (cData.id) { updateContributionInFamily(selectedNode.id, cData); } else { addContributionToFamily(selectedNode.id, cData); } handleCloseContributionModal(); };
    const handleDeleteContribution = (cId: string) => { if (selectedNode?.type === 'FAMILY' && window.confirm('Delete contribution?')) deleteContributionFromFamily(selectedNode.id, cId); };
    
    const canAddZone = hasPermission(currentUser, 'CREATE_ZONE', { target: selectedNode });
    const canAddAPV = hasPermission(currentUser, 'CREATE_APV', { target: selectedNode });
    const canAddHousehold = hasPermission(currentUser, 'ADD_FAMILY', { target: selectedNode });
    const canEditFamily = hasPermission(currentUser, 'EDIT_FAMILY', { target: selectedNode, parent: parentNode });
    const canDeleteFamily = hasPermission(currentUser, 'DELETE_FAMILY', { target: selectedNode, parent: parentNode });
    // FIX: Corrected typo from 'EDIT_TERRITORI' to 'EDIT_TERRITORY'
    const canEditTerritory = hasPermission(currentUser, 'EDIT_TERRITORY', { target: selectedNode, parent: parentNode });
    const canDeleteTerritory = hasPermission(currentUser, 'DELETE_TERRITORY', { target: selectedNode, parent: parentNode });
    const canManageBelievers = hasPermission(currentUser, 'MANAGE_BELIEVERS_IN_FAMILY', { target: selectedNode, parent: parentNode });
    const canManageContributions = hasPermission(currentUser, 'MANAGE_CONTRIBUTIONS', { target: selectedNode, parent: parentNode });
    const canEditParishDetails = hasPermission(currentUser, 'EDIT_PARISH_DETAILS', { target: selectedNode });
    const getButtonTitle = (d: boolean, e: string, dt: string) => d ? (!currentUser ? t('liberstatus.management.loginRequired') : dt) : e;
    
    if (!initialParishData || !treeData || !globalStats) return <div className="text-center p-8">{t('common.loading')}</div>;

    return (
        <section className="space-y-8">
            <header className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('liberstatus.title')}</h2>
                <p className="text-md text-gray-500 dark:text-gray-400 mt-2">{t('liberstatus.description')}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg"><h3 className="text-xl font-bold mb-2">{t('liberstatus.territoryExplorer')}</h3><p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('liberstatus.treeInstructions')}</p><div className="overflow-y-auto max-h-[75vh]"><TerritoryNode node={treeData} expandedNodes={expandedNodes} onToggle={handleToggleNode} onSelect={handleSelectNode} selectedNode={selectedNode} level={0} currentUser={currentUser} /></div></div>
                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4">{t('liberstatus.management.header')}</h3>
                    {!selectedNode ? <div className="text-center text-gray-500 dark:text-gray-400 p-8 border-2 border-dashed rounded-lg"><p>{t('liberstatus.management.selectInstruction')}</p></div> : (
                        <div className="space-y-6">
                            <div><h4 className="text-2xl font-semibold">{selectedNode.name}</h4><p className="text-sm text-gray-500 uppercase">{t(`common.${selectedNode.type.toLowerCase()}` as const)}</p></div>
                            {selectedNode.type === 'PARISH' && (<div className="space-y-4"><div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2"><h5 className="font-bold text-lg">Clergy & Staff</h5><ul className="text-sm"><li><strong>Priest:</strong> {selectedNode.priest || 'N/A'}</li>{selectedNode.priestAssistant1 && <li><strong>Assistant Priest 1:</strong> {selectedNode.priestAssistant1}</li>}{selectedNode.priestAssistant2 && <li><strong>Assistant Priest 2:</strong> {selectedNode.priestAssistant2}</li>}{selectedNode.deacon && <li><strong>Deacon:</strong> {selectedNode.deacon}</li>}{selectedNode.sacristin && <li><strong>Sacristin:</strong> {selectedNode.sacristin}</li>}</ul></div><ExecTeamDisplay team={selectedNode.execTeam} users={parishUsers} title="Pastoral Council Team" /><ExecTeamDisplay team={selectedNode.financesCouncil} users={parishUsers} title="Pastoral Financial Team" /><div className="space-y-3">{selectedNode.holyAssociations?.length && (<div><h5 className="font-bold text-lg mt-4 mb-2">Holy Associations</h5><div className="space-y-2">{selectedNode.holyAssociations.map(g => <ParishGroupDisplay key={g.id} group={g} users={parishUsers} isExpanded={expandedGroups.holyAssociations.has(g.id)} onToggle={() => handleToggleGroup('holyAssociations', g.id)} />)}</div></div>)}{selectedNode.prayersGroups?.length && (<div><h5 className="font-bold text-lg mt-4 mb-2">Prayers Groups</h5><div className="space-y-2">{selectedNode.prayersGroups.map(g => <ParishGroupDisplay key={g.id} group={g} users={parishUsers} isExpanded={expandedGroups.prayersGroups.has(g.id)} onToggle={() => handleToggleGroup('prayersGroups', g.id)} />)}</div></div>)}{selectedNode.commissions?.length && (<div><h5 className="font-bold text-lg mt-4 mb-2">Commissions</h5><div className="space-y-2">{selectedNode.commissions.map(g => <ParishGroupDisplay key={g.id} group={g} users={parishUsers} isExpanded={expandedGroups.commissions.has(g.id)} onToggle={() => handleToggleGroup('commissions', g.id)} />)}</div></div>)}{selectedNode.nodeGroups?.length && (<div><h5 className="font-bold text-lg mt-4 mb-2">Node Groups</h5><div className="space-y-2">{selectedNode.nodeGroups.map(g => <ParishGroupDisplay key={g.id} group={g} users={parishUsers} isExpanded={expandedGroups.nodeGroups.has(g.id)} onToggle={() => handleToggleGroup('nodeGroups', g.id)} />)}</div></div>)}</div></div>)}
                            {selectedNode.type !== 'PARISH' && (<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2"><h5 className="font-bold text-lg text-gray-700 dark:text-gray-200">Territory Information</h5><p className="text-sm"><strong>ID:</strong> <code className="text-xs bg-gray-200 dark:bg-gray-600 p-1 rounded">{selectedNode.id}</code></p>{selectedNode.address && <p className="text-sm"><strong>Address:</strong> {selectedNode.address}</p>}{selectedNode.execTeam && <ExecTeamDisplay team={selectedNode.execTeam} users={parishUsers} title="Leadership Team" />}</div>)}
                            <div className="border-t dark:border-gray-600 pt-4"><h5 className="font-bold text-lg mb-2">Actions</h5><div className="flex flex-wrap gap-2">
                                {selectedNode.type === 'PARISH' && (<><button onClick={handleAddZone} disabled={!canAddZone} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center" title={getButtonTitle(!canAddZone, t('liberstatus.management.addZoneTitle'), t('liberstatus.management.addZoneDisabled'))}><PlusIcon/>{t('liberstatus.management.addZone')}</button><button onClick={handleOpenParishModal} disabled={!canEditParishDetails} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"><EditIcon/> Modify Parish</button></>)}
                                {selectedNode.type === 'ZONE' && (<><button onClick={handleAddAPV} disabled={!canAddAPV} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center" title={getButtonTitle(!canAddAPV, t('liberstatus.management.addAPVTitle'), t('liberstatus.management.addAPVDisabled'))}><PlusIcon/>{t('liberstatus.management.addAPV')}</button><button onClick={handleEditTerritory} disabled={!canEditTerritory} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"><EditIcon/> Edit Zone</button><button onClick={handleDeleteTerritory} disabled={!canDeleteTerritory} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"><TrashIcon/> Delete Zone</button></>)}
                                {selectedNode.type === 'APV' && (<><button onClick={handleAddHousehold} disabled={!canAddHousehold} className="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-700 flex items-center" title={getButtonTitle(!canAddHousehold, t('liberstatus.management.addHousehold'), t('liberstatus.management.addHouseholdDisabled'))}><PlusIcon/>{t('liberstatus.management.addHousehold')}</button><button onClick={handleEditTerritory} disabled={!canEditTerritory} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"><EditIcon/> Edit APV</button><button onClick={handleDeleteTerritory} disabled={!canDeleteTerritory} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"><TrashIcon/> Delete APV</button></>)}
                                {selectedNode.type === 'FAMILY' && (<><button onClick={handleModifyFamily} disabled={!canEditFamily} className="px-4 py-2 bg-yellow-500 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-yellow-600 flex items-center" title={getButtonTitle(!canEditFamily, t('liberstatus.management.modifyFamily'), t('liberstatus.management.modifyFamilyDisabled'))}><EditIcon /> {t('liberstatus.management.modifyFamily')}</button><button onClick={handleDeleteFamily} disabled={!canDeleteFamily} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"><TrashIcon/> Delete Family</button><button onClick={handleOpenAddMemberForm} disabled={!canManageBelievers} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"><PlusIcon /> Add Member</button></>)}
                            </div></div>
                            {selectedNode.type === 'FAMILY' && selectedNode.members && (<div className="border-t dark:border-gray-600 pt-4 mt-4"><h5 className="font-semibold text-lg mb-2">Members</h5><ul className="space-y-2">{selectedNode.members.map(member => (<li key={member.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md"><div><span className="font-medium">{member.fullName}</span><span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({member.relationshipToHead})</span></div><div className="space-x-2">{hasPermission(currentUser, 'EDIT_BELIEVER_SELF', { believer: member }) && (<button onClick={() => handleOpenEditBeliever(member)} className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 flex items-center gap-1"><EditIcon /> My Info</button>)}{canManageBelievers && !hasPermission(currentUser, 'EDIT_BELIEVER_SELF', { believer: member }) && (<button onClick={() => handleOpenEditBeliever(member)} className="text-sm px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center gap-1"><EditIcon /> Edit Member</button>)}</div></li>))}</ul></div>)}
                            {selectedNode.type === 'FAMILY' && familyDataForSelectedNode && (<div className="border-t dark:border-gray-600 pt-4 mt-4"><div className="flex justify-between items-center mb-2"><h5 className="font-semibold text-lg">Contributions</h5>{canManageContributions && (<button onClick={() => handleOpenContributionModal()} className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center"><PlusIcon /> Add</button>)}</div>{familyDataForSelectedNode.contributions.length > 0 ? (<ul className="space-y-2 max-h-60 overflow-y-auto pr-2">{familyDataForSelectedNode.contributions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(c => (<li key={c.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-sm"><div><span className="font-mono text-gray-600 dark:text-gray-300">{c.date}</span><span className="font-medium mx-2 text-gray-800 dark:text-gray-100">{c.category}</span></div><div className="flex items-center space-x-2"><span className="font-semibold text-green-700 dark:text-green-400">{c.amount.toLocaleString()} Ar</span>{canManageContributions && (<><button onClick={() => handleOpenContributionModal(c)} className="p-1 text-blue-600 hover:text-blue-800"><EditIcon /></button><button onClick={() => handleDeleteContribution(c.id)} className="p-1 text-red-600 hover:text-red-800"><TrashIcon /></button></>)}</div></li>))}</ul>) : (<p className="text-sm text-gray-500 dark:text-gray-400 italic">No contributions recorded for this family.</p>)}</div>)}
                        </div>
                    )}
                </div>
            </div>
            <AdminModal title={familyModalConfig?.mode === 'add' ? t('liberstatus.management.addHousehold') : t('liberstatus.management.modifyFamily')} isOpen={isFamilyModalOpen} onClose={handleCloseFamilyModal}><FamilyForm family={familyModalConfig?.mode === 'edit' ? familyModalConfig.data : { apvId: familyModalConfig?.apvId }} believers={believersForFamilyForm} onSave={handleSaveFamily} onCancel={handleCloseFamilyModal} /></AdminModal>
            {editingBeliever && (<AdminModal title={editingBeliever.id ? `Edit ${editingBeliever.firstName} ${editingBeliever.lastName}` : "Add New Member"} isOpen={!!editingBeliever} onClose={handleCloseBelieverModal}><BelieverForm believer={editingBeliever as Believer} families={appData.families} onSave={handleSaveBeliever} onCancel={handleCloseBelieverModal} defaultParishId={initialParishData.id} /></AdminModal>)}
            {/* FIX: Pass eligibleBelieversForModal to parishBelievers prop */}
            <AdminModal title={territoryModalConfig?.mode === 'edit' ? `Edit ${territoryModalConfig.data.name}`: territoryModalConfig?.type === 'ZONE' ? 'Add New Zone' : 'Add New APV'} isOpen={isTerritoryModalOpen} onClose={handleCloseTerritoryModal}><TerritoryForm onSave={handleSaveTerritory} onCancel={handleCloseTerritoryModal} initialData={territoryModalConfig?.mode === 'edit' ? territoryModalConfig.data : undefined} parishBelievers={eligibleBelieversForModal} /></AdminModal>
            {/* FIX: Pass parishBelievers to ParishForm */}
            {selectedNode?.type === 'PARISH' && (<AdminModal title={`Modify ${selectedNode.name}`} isOpen={isParishModalOpen} onClose={handleCloseParishModal}><ParishForm parish={selectedNode} parishBelievers={parishBelievers} onSave={handleSaveParish} onCancel={handleCloseParishModal} /></AdminModal>)}
            <AdminModal title={contributionModalConfig?.mode === 'add' ? 'Add Contribution' : 'Edit Contribution'} isOpen={isContributionModalOpen} onClose={handleCloseContributionModal}><ContributionForm contribution={contributionModalConfig?.data} onSave={handleSaveContribution} onCancel={handleCloseContributionModal} /></AdminModal>
        </section>
    );
}