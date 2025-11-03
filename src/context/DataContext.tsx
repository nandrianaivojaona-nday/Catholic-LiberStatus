
import React, { createContext, useState, useContext } from 'react';
import { mockData as initialData, MockData } from '../data/mockData';
import { User, Believer, Family, Contribution, Territory } from '../types';
import { StatisticsService } from '../services/StatisticsService';

interface DataContextType {
  appData: MockData;
  // User functions
  updateUser: (updatedUser: User) => void;
  addUser: (newUser: Omit<User, 'id'>) => void;
  deleteUser: (userId: string) => void;
  // Believer functions
  addBeliever: (newBeliever: Omit<Believer, 'id'>) => Believer;
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

const generateHierarchicalBelieverId = (familyId: string, appData: MockData): string => {
    const family = appData.families.find(f => f.id === familyId);
    if (!family) return `BEL${Date.now()}`;

    const believerCountInFamily = appData.believers.filter(b => b.familyId === familyId).length + 1;

    // Helper to extract numeric part of ID, e.g., "PAR001" -> "001"
    const getNumericId = (id: string) => id.replace(/^[A-Z]*/, '');

    const path = StatisticsService.getPathToTerritory(family.apvId, appData.territories.archdioceses);
    if (!path) {
        // Fallback if the APV isn't found in the main tree
        return `BEL${believerCountInFamily}-FAM${getNumericId(family.id)}-APV${getNumericId(family.apvId)}`;
    }
    
    // Path is [ARCH, DIO, ..., APV]. Reverse it to get [APV, ..., ARCH] for the ID string.
    const reversedPath = [...path].reverse();
    
    const pathParts = reversedPath.map(territory => 
        `${territory.type.substring(0, 3)}${getNumericId(territory.id)}`
    );

    const familyPart = `FAM${getNumericId(family.id)}`;
    
    const finalId = `BEL${believerCountInFamily}-${familyPart}-${pathParts.join('-')}`;
    
    return finalId;
};

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
  const [appData, setAppData] = useState<MockData>(initialData);

  // --- User Management ---
  const updateUser = (updatedUser: User) => { setAppData(prev => ({ ...prev, users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u) })); };
  const addUser = (newUser: Omit<User, 'id'>) => { const userWithId = { ...newUser, id: `U${Date.now()}` }; setAppData(prev => ({ ...prev, users: [...prev.users, userWithId] })); };
  const deleteUser = (userId: string) => { setAppData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) })); };

  // --- Believer Management ---
  const addBeliever = (newBeliever: Omit<Believer, 'id'>): Believer => {
      const hierarchicalId = generateHierarchicalBelieverId(newBeliever.familyId, appData);
      const believerWithId = { ...newBeliever, id: hierarchicalId };
      setAppData(prev => ({ ...prev, believers: [...prev.believers, believerWithId] }));
      return believerWithId;
  };
  
  const updateBeliever = (updatedBeliever: Believer) => { setAppData(prev => ({ ...prev, believers: prev.believers.map(b => b.id === updatedBeliever.id ? updatedBeliever : b) })); };
  const deleteBeliever = (believerId: string) => { setAppData(prev => ({ ...prev, believers: prev.believers.filter(b => b.id !== believerId) })); };
  
  const updateBelieverSacrament = (believerId: string, sacrament: keyof Believer, date: string) => {
    setAppData(prev => ({ ...prev, believers: prev.believers.map(b => {
        if (b.id === believerId) {
            const updated = { ...b };
            if (sacrament === 'isBaptized') { updated.isBaptized = true; updated.baptismDate = date; } 
            else if (sacrament === 'isConfirmed') { updated.isConfirmed = true; updated.confirmationDate = date; } 
            else if (sacrament === 'isMarriedSacramentally') { updated.isMarriedSacramentally = true; updated.marriageDate = date; }
            return updated;
        }
        return b;
    })}));
  };

  // --- Family Management ---
  const addFamily = (newFamily: Omit<Family, 'id'>): Family => {
      const familyWithId = { ...newFamily, id: `F${Date.now()}` };
      setAppData(prev => ({ ...prev, families: [...prev.families, familyWithId] }));
      return familyWithId;
  };
  const updateFamily = (updatedFamily: Family) => { setAppData(prev => ({ ...prev, families: prev.families.map(f => f.id === updatedFamily.id ? updatedFamily : f) })); };
  const deleteFamily = (familyId: string) => { setAppData(prev => ({ ...prev, families: prev.families.filter(f => f.id !== familyId) })); };
  const addContributionToFamily = (familyId: string, contribution: Omit<Contribution, 'id'>) => { const newC = { ...contribution, id: `C${Date.now()}` }; setAppData(prev => ({ ...prev, families: prev.families.map(f => f.id === familyId ? { ...f, contributions: [...(f.contributions || []), newC] } : f) })); };
  const updateContributionInFamily = (familyId: string, updatedC: Contribution) => { setAppData(prev => ({ ...prev, families: prev.families.map(f => f.id === familyId ? { ...f, contributions: f.contributions.map(c => c.id === updatedC.id ? updatedC : c) } : f) })); };
  const deleteContributionFromFamily = (familyId: string, cId: string) => { setAppData(prev => ({ ...prev, families: prev.families.map(f => f.id === familyId ? { ...f, contributions: f.contributions.filter(c => c.id !== cId) } : f) })); };
  const addBelieverToFamily = (familyId: string, believerId: string) => { setAppData(prev => ({ ...prev, families: prev.families.map(f => (f.id === familyId && !f.members.includes(believerId)) ? { ...f, members: [...f.members, believerId] } : f) })); };
  
  // --- Territory Management ---
  const addTerritory = (parentId: string, newTerritoryData: Omit<Territory, 'id' | 'children' | 'members'>) => {
    const newTerritory: Territory = { ...newTerritoryData, id: `${newTerritoryData.type.substring(0, 4)}${Date.now()}` } as Territory;
    
    setAppData(prev => ({
      ...prev,
      territories: {
        ...prev.territories,
        archdioceses: recursivelyUpdateTerritories(prev.territories.archdioceses, (node) => {
          if (node.id === parentId) {
            const updatedNode = { ...node };
            if (node.type === 'PARISH' && newTerritory.type === 'ZONE') {
              updatedNode.zones = [...(node.zones || []), newTerritory];
            } else if (node.type === 'ZONE' && newTerritory.type === 'APV') {
              updatedNode.apvs = [...(node.apvs || []), newTerritory];
            } else {
                 console.error(`Mismatch: Cannot add territory of type ${newTerritory.type} to parent of type ${node.type}`);
            }
            return updatedNode;
          }
          return node;
        })
      }
    }));
  };

  const updateTerritory = (territoryId: string, updatedData: Partial<Territory>) => {
      setAppData(prev => ({
        ...prev,
        territories: {
          ...prev.territories,
          archdioceses: recursivelyUpdateTerritories(prev.territories.archdioceses, (node) => {
            if (node.id === territoryId) {
              return { ...node, ...updatedData };
            }
            return node;
          })
        }
      }));
  };

  const deleteTerritory = (territoryId: string, parentId: string) => {
    setAppData(prev => ({
      ...prev,
      territories: {
        ...prev.territories,
        archdioceses: recursivelyUpdateTerritories(prev.territories.archdioceses, (node) => {
          if (node.id === parentId) {
              const updatedNode = { ...node };
              const childKeys: (keyof Territory)[] = ['zones', 'apvs'];
              for (const key of childKeys) {
                  if (updatedNode[key] && Array.isArray(updatedNode[key])) {
                      (updatedNode as any)[key] = (updatedNode as any)[key].filter((child: Territory) => child.id !== territoryId);
                  }
              }
              return updatedNode;
          }
          return node;
        })
      }
    }));
  };


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
