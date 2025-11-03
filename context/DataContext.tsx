

import React, { createContext, useState, useContext, useEffect } from 'react';
import { mockData as initialData, MockData } from '../data/mockData';
import { User, Believer, Family, Contribution, Territory, ExecTeam, ROLES } from '../types';
import { StatisticsService } from '../services/StatisticsService';

interface DataContextType {
  appData: MockData;
  // User functions
  updateUser: (updatedUser: User) => void;
  addUser: (userData: { believerId: string; role: string }) => User | undefined;
  deleteUser: (userId: string) => void;
  // Believer functions
  addBeliever: (believerData: Omit<Believer, 'id'> & { newFamilyAddress?: string, apvIdForNewFamily?: string }) => Believer;
  updateBeliever: (updatedBeliever: Believer) => void;
  deleteBeliever: (believerId: string) => void;
  updateBelieverSacrament: (believerId: string, sacrament: keyof Believer, date: string) => void;
  // Family functions
  addFamily: (newFamily: Omit<Family, 'id'>) => Family;
  updateFamily: (updatedFamily: Family) => void;
  deleteFamily: (familyId: string) => void;
  addContributionToFamily: (familyId: string, contribution: Omit<Contribution, 'id'>) => void;
  updateContributionInFamily: (familyId: string, updatedContribution: Contribution) => void;
  deleteContributionFromFamily: (familyId: string, contributionId: string) => void;
  addBelieverToFamily: (familyId: string, believerId: string) => void;
  // Territory functions
  addTerritory: (parentId: string, newTerritoryData: Omit<Territory, 'id' | 'children' | 'members'>) => void;
  updateTerritory: (territoryId: string, updatedData: Partial<Territory>) => void;
  deleteTerritory: (territoryId: string, parentId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'liberstatus-app-data';


// --- Recursive Helpers for Immutable Updates ---
const recursivelyUpdateTerritories = (nodes: Territory[], updateFn: (node: Territory) => Territory): Territory[] => {
    return nodes.map(node => {
        let updatedNode = updateFn(node);
        const childKeys: (keyof Territory)[] = ['dioceses', 'vicariates', 'districts', 'parishes', 'zones', 'apvs', 'children'];
        childKeys.forEach(key => {
            if (updatedNode[key] && Array.isArray(updatedNode[key])) {
                updatedNode = { ...updatedNode, [key]: recursivelyUpdateTerritories(updatedNode[key] as Territory[], updateFn) };
            }
        });
        return updatedNode;
    });
};


export const DataProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [appData, setAppData] = useState<MockData>(() => {
    try {
      const storedData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        console.log("Liberstatus: Loading saved data from localStorage.");
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error("Liberstatus: Error reading from localStorage.", error);
    }
    console.log("Liberstatus: No saved data found. Initializing with mock data.");
    return initialData;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
    } catch (error) {
      console.error("Liberstatus: Error saving data to localStorage.", error);
    }
  }, [appData]);

  // --- User Management ---
  const updateUser = (updatedUser: User) => { setAppData(prev => ({ ...prev, users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u) })); };
  
  const addUser = (userData: { believerId: string; role: string }): User | undefined => {
    let createdUser: User | undefined;
    setAppData(prev => {
        const believer = prev.believers.find(b => b.id === userData.believerId);
        if (!believer) {
            console.error(`addUser: Believer with ID ${userData.believerId} not found.`);
            return prev;
        }

        const newUser: User = {
            id: `U-${believer.id}`,
            email: believer.contactEmail || `${believer.lastName.toLowerCase()}.${believer.id.slice(-4)}@liberstatus.app`,
            password: '123', // Default password
            username: `${believer.firstName} ${believer.lastName}`,
            role: userData.role,
            highestTerritoryLevel: 'FAMILY', // Default level
            highestLevelTerritoryId: believer.familyId,
            believerId: believer.id,
            territoryId: believer.parish,
        };
        
        createdUser = newUser;
        return { ...prev, users: [...prev.users, newUser] };
    });
    return createdUser;
  };

  const deleteUser = (userId: string) => { 
    setAppData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) })); 
  };
  
  // --- Believer Management ---
  const addBeliever = (believerData: Omit<Believer, 'id'> & { newFamilyAddress?: string, apvIdForNewFamily?: string }): Believer => {
    let createdBeliever: Believer | null = null;
    
    setAppData(prev => {
        let finalFamilyId = believerData.familyId;
        let nextFamilies = prev.families;

        // If creating a new family
        if (believerData.newFamilyAddress && believerData.apvIdForNewFamily) {
            const newFamily: Family = {
                id: `F-${Date.now()}`,
                address: believerData.newFamilyAddress,
                apvId: believerData.apvIdForNewFamily,
                headOfFamily: '', // Will be set after believer is created
                members: [],
                contributions: [],
                parish: believerData.parish,
            };
            finalFamilyId = newFamily.id;
            nextFamilies = [...prev.families, newFamily];
        }

        if (!finalFamilyId) {
            console.error("addBeliever: Family ID is missing.");
            return prev;
        }

        const newBelieverId = `M-${Date.now()}`;
        const newBeliever: Believer = {
            id: newBelieverId,
            ...believerData,
            familyId: finalFamilyId,
        };
        
        // Update the family with the new believer as head (if new) or member
        nextFamilies = nextFamilies.map(f => {
            if (f.id === finalFamilyId) {
                const updatedFamily = { ...f, members: [...f.members, newBelieverId] };
                if (believerData.newFamilyAddress) {
                    updatedFamily.headOfFamily = newBelieverId;
                }
                return updatedFamily;
            }
            return f;
        });

        createdBeliever = newBeliever;
        return { ...prev, believers: [...prev.believers, newBeliever], families: nextFamilies };
    });

    if (!createdBeliever) throw new Error("Failed to create believer.");
    return createdBeliever;
  };

  const updateBeliever = (updatedBeliever: Believer) => { setAppData(prev => ({ ...prev, believers: prev.believers.map(b => b.id === updatedBeliever.id ? updatedBeliever : b) })); };
  
  const deleteBeliever = (believerId: string) => {
    setAppData(prev => {
      const believer = prev.believers.find(b => b.id === believerId);
      if (!believer) return prev;

      // Remove from families
      const nextFamilies = prev.families.map(f => {
        if (f.members.includes(believerId)) {
          return { ...f, members: f.members.filter(mId => mId !== believerId) };
        }
        return f;
      });

      // Remove user account if it exists
      const nextUsers = prev.users.filter(u => u.believerId !== believerId);
      
      // Remove believer
      const nextBelievers = prev.believers.filter(b => b.id !== believerId);
      
      return { ...prev, believers: nextBelievers, families: nextFamilies, users: nextUsers };
    });
  };

  const updateBelieverSacrament = (believerId: string, sacrament: keyof Believer, date: string) => { setAppData(prev => ({ ...prev, believers: prev.believers.map(b => { if (b.id === believerId) { const updated = { ...b }; if (sacrament === 'isBaptized') { updated.isBaptized = true; updated.baptismDate = date; } else if (sacrament === 'isConfirmed') { updated.isConfirmed = true; updated.confirmationDate = date; } else if (sacrament === 'isMarriedSacramentally') { updated.isMarriedSacramentally = true; updated.marriageDate = date; } return updated; } return b; })})); };

  // --- Family Management ---
  const addFamily = (newFamily: Omit<Family, 'id'>): Family => { const familyWithId = { ...newFamily, id: `F${Date.now()}` }; setAppData(prev => ({ ...prev, families: [...prev.families, familyWithId] })); return familyWithId; };
  const updateFamily = (updatedFamily: Family) => { setAppData(prev => ({ ...prev, families: prev.families.map(f => f.id === updatedFamily.id ? updatedFamily : f) })); };
  const deleteFamily = (familyId: string) => {
    setAppData(prev => {
        const familyToDelete = prev.families.find(f => f.id === familyId);
        if (!familyToDelete) return prev;
        
        // Get list of believers to delete
        const memberIds = new Set(familyToDelete.members);
        
        // Remove believers and their associated users
        const nextBelievers = prev.believers.filter(b => !memberIds.has(b.id));
        const nextUsers = prev.users.filter(u => !u.believerId || !memberIds.has(u.believerId));

        // Remove the family
        const nextFamilies = prev.families.filter(f => f.id !== familyId);
        
        return { ...prev, families: nextFamilies, believers: nextBelievers, users: nextUsers };
    });
  };
  const addContributionToFamily = (familyId: string, contribution: Omit<Contribution, 'id'>) => { const newC = { ...contribution, id: `C${Date.now()}` }; setAppData(prev => ({ ...prev, families: prev.families.map(f => f.id === familyId ? { ...f, contributions: [...(f.contributions || []), newC] } : f) })); };
  const updateContributionInFamily = (familyId: string, updatedC: Contribution) => { setAppData(prev => ({ ...prev, families: prev.families.map(f => f.id === familyId ? { ...f, contributions: f.contributions.map(c => c.id === updatedC.id ? updatedC : c) } : f) })); };
  const deleteContributionFromFamily = (familyId: string, cId: string) => { setAppData(prev => ({ ...prev, families: prev.families.map(f => f.id === familyId ? { ...f, contributions: f.contributions.filter(c => c.id !== cId) } : f) })); };
  const addBelieverToFamily = (familyId: string, believerId: string) => { setAppData(prev => ({ ...prev, families: prev.families.map(f => (f.id === familyId && !f.members.includes(believerId)) ? { ...f, members: [...f.members, believerId] } : f) })); };
  
  // --- Territory Management ---
  const processExecTeam = (team: Partial<ExecTeam> | undefined, territory: Territory, currentUsers: User[], addUserFn: (data: { believerId: string; role: string }) => User | undefined): { updatedTeam: ExecTeam, newUsers: User[] } => {
    if (!team) return { updatedTeam: {}, newUsers: [] };

    const newUsers: User[] = [];
    const updatedTeam: ExecTeam = {};
    const rolesMap: Record<string, string> = {
        'president': ROLES.parish_leader, // Simplified mapping
        'vicePresident1': ROLES.pastoral_council_member,
        // ... more specific roles
    };

    for (const [role, believerId] of Object.entries(team)) {
        if (believerId) {
            let user = currentUsers.find(u => u.believerId === believerId);
            if (!user) {
                const userRole = rolesMap[role] || ROLES.pastoral_council_member;
                const newUser = addUserFn({ believerId, role: userRole });
                if (newUser) {
                    newUsers.push(newUser);
                    user = newUser;
                }
            }
            if (user) {
                (updatedTeam as any)[role] = user.id;
            }
        }
    }
    return { updatedTeam, newUsers };
  };

  const addTerritory = (parentId: string, newTerritoryData: Omit<Territory, 'id' | 'children' | 'members'>) => {
    setAppData(prev => {
        let allUsers = [...prev.users];
        const { updatedTeam, newUsers } = processExecTeam(newTerritoryData.execTeam, newTerritoryData as Territory, allUsers, (data) => {
            const believer = prev.believers.find(b => b.id === data.believerId);
            if (!believer) return undefined;
            const newUser: User = { id: `U-${believer.id}`, email: believer.contactEmail || `user${Date.now()}@app.com`, role: data.role, username: `${believer.firstName} ${believer.lastName}`, believerId: believer.id, highestLevelTerritoryId: '', highestTerritoryLevel: '' };
            return newUser;
        });

        if (newUsers.length > 0) {
            allUsers.push(...newUsers);
        }
        
        const newTerritoryWithUserIds: Territory = { ...newTerritoryData, execTeam: updatedTeam, id: `${newTerritoryData.type.substring(0, 4)}${Date.now()}` } as Territory;

        const nextTerritories = recursivelyUpdateTerritories(prev.territories.archdioceses, (node) => {
          if (node.id === parentId) {
            const updatedNode = { ...node };
            const key = `${newTerritoryData.type.toLowerCase()}s` as keyof Territory;
            (updatedNode as any)[key] = [...((updatedNode as any)[key] || []), newTerritoryWithUserIds];
            return updatedNode;
          }
          return node;
        });

        return { ...prev, users: allUsers, territories: { ...prev.territories, archdioceses: nextTerritories }};
    });
  };

  const updateTerritory = (territoryId: string, updatedData: Partial<Territory>) => {
      setAppData(prev => {
          let allUsers = [...prev.users];
          let finalUpdatedData = { ...updatedData };
          
          const processTeam = (team: Partial<ExecTeam> | undefined, territory: Territory) => {
            if (!team) return undefined;
            const { updatedTeam, newUsers } = processExecTeam(team, territory, allUsers, (data) => {
                const believer = prev.believers.find(b => b.id === data.believerId);
                if (!believer) return undefined;
                const newUser: User = { id: `U-${believer.id}`, email: believer.contactEmail || `user${Date.now()}@app.com`, role: data.role, username: `${believer.firstName} ${believer.lastName}`, believerId: believer.id, highestLevelTerritoryId: territoryId, highestTerritoryLevel: territory.type };
                return newUser;
            });

            if (newUsers.length > 0) {
                allUsers.push(...newUsers);
            }
            return updatedTeam;
          };

          const territory = StatisticsService.findTerritoryById(territoryId, prev.territories.archdioceses);
          if (!territory) return prev;
          
          if (updatedData.execTeam) finalUpdatedData.execTeam = processTeam(updatedData.execTeam, territory);
          if (updatedData.financesCouncil) finalUpdatedData.financesCouncil = processTeam(updatedData.financesCouncil, territory);

          const groupKeys: (keyof Territory)[] = ['holyAssociations', 'prayersGroups', 'commissions', 'nodeGroups'];
          groupKeys.forEach(key => {
            if(updatedData[key] && Array.isArray(updatedData[key])) {
              (finalUpdatedData as any)[key] = (updatedData as any)[key].map((group: any) => ({
                ...group,
                execTeam: processTeam(group.execTeam, territory)
              }));
            }
          });

          const nextTerritories = recursivelyUpdateTerritories(prev.territories.archdioceses, (node) => {
            if (node.id === territoryId) return { ...node, ...finalUpdatedData };
            return node;
          });

          return { ...prev, users: allUsers, territories: { ...prev.territories, archdioceses: nextTerritories } };
      });
  };

  const deleteTerritory = (territoryId: string, parentId: string) => { setAppData(prev => ({ ...prev, territories: { ...prev.territories, archdioceses: recursivelyUpdateTerritories(prev.territories.archdioceses, (node) => { if (node.id === parentId) { const updatedNode = { ...node }; const childKeys: (keyof Territory)[] = ['dioceses','vicariates','districts','parishes','zones', 'apvs']; for (const key of childKeys) { if (updatedNode[key] && Array.isArray(updatedNode[key])) { (updatedNode as any)[key] = (updatedNode as any)[key].filter((child: Territory) => child.id !== territoryId); } } return updatedNode; } return node; }) } })); };

  return (
    <DataContext.Provider value={{ 
        appData, 
        updateUser, addUser, deleteUser,
        addBeliever, updateBeliever, deleteBeliever,
        addFamily, updateFamily, deleteFamily,
        addContributionToFamily, updateContributionInFamily, deleteContributionFromFamily,
        addBelieverToFamily, updateBelieverSacrament,
        addTerritory, updateTerritory, deleteTerritory
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
