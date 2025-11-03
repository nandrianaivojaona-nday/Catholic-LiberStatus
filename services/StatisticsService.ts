

import { liturgicalCalendar } from '../data/calendarData';
import { Believer, Family, Territory } from '../types';
import { MockData } from '../data/mockData';

export const StatisticsService = {
  findTerritoryById(territoryId: string, archdioceses: any[]): Territory | null {
    const find = (territories: any[]): any => {
      for (const t of territories) {
        if (t.id === territoryId) return t;
        const children = t.dioceses || t.vicariates || t.districts || t.parishes || t.zones || t.apvs;
        if (children) {
          const found = find(children);
          if (found) return found;
        }
      }
      return null;
    };
    return find(archdioceses);
  },

  findFamiliesByApvId(apvId: string, appData: MockData): Family[] {
    return appData.families.filter(f => f.apvId === apvId);
  },

  getDashboardStats(parish: Territory, appData: MockData) {
    if (!parish) return null;

    const believers = appData.believers.filter(b => b.parish === parish.id);
    const families = appData.families.filter(f => f.parish === parish.id);

    const sacraments = {
      baptism: believers.filter(b => b.isBaptized).length,
      firstConfession: believers.filter(b => b.isFirstConfession).length,
      firstCommunion: believers.filter(b => b.isFirstCommunion).length,
      renewalBaptism: believers.filter(b => b.isRenewalBaptism).length,
      confirmation: believers.filter(b => b.isConfirmed).length,
      marriage: believers.filter(b => b.isMarriedSacramentally).length,
    };

    const totalContributions = families.reduce((sum, family) => {
        return sum + (family.contributions || []).reduce((famSum, c) => famSum + c.amount, 0);
    }, 0);

    const totals = {
      believers: believers.length,
      families: families.length,
      contributions: totalContributions,
    };
    
    const historicalGrowth = {
      '2022': { baptism: 3, confirmation: 1, marriage: 1 },
      '2023': { baptism: 5, confirmation: 2, marriage: 2 },
      '2024': { baptism: sacraments.baptism, confirmation: sacraments.confirmation, marriage: sacraments.marriage },
    };

    const zoneBreakdown = parish.zones?.map(zone => {
      const zoneFamilies = families.filter(f => {
        const apv = zone.apvs?.find((a: any) => a.id === f.apvId);
        return !!apv;
      });
      const zoneBelievers = believers.filter(b => zoneFamilies.some(f => f.members.includes(b.id)));
      const presidentId = zone.execTeam?.president;
      const leader = presidentId ? appData.users.find(u => u.id === presidentId) : null;
      
      const apvBelieverBreakdown = zone.apvs?.map((apv: any) => {
        const familiesInApv = families.filter(f => f.apvId === apv.id);
        const believerCount = familiesInApv.reduce((count, family) => count + (family.members?.length || 0), 0);
        return {
          id: apv.id,
          name: apv.name,
          believerCount: believerCount,
          familyCount: familiesInApv.length
        };
      }) || [];

      return {
        id: zone.id,
        name: zone.name,
        believers: zoneBelievers.length,
        families: zoneFamilies.length,
        apvCount: zone.apvs?.length || 0,
        leaderName: leader ? leader.username : undefined,
        apvBelieverBreakdown,
      };
    }) || [];

    const leadership = {
        priest: parish.priest,
        pastoralCouncil: parish.execTeam,
        financeCouncil: parish.financesCouncil
    };

    return {
      parishName: parish.name,
      parishAddress: parish.address,
      parishLogoUrl: parish.logo,
      priestMessage: parish.priestMessage,
      leadership,
      sacraments,
      totals,
      historicalGrowth,
      holyAssociations: parish.holyAssociations,
      prayersGroups: parish.prayersGroups,
      commissions: parish.commissions,
      nodeGroups: parish.nodeGroups,
      zoneBreakdown,
    };
  },
  
  buildLiberstatusTree(parish: Territory, appData: MockData): Territory {
    const parishNode: Territory = { ...parish, type: 'PARISH', children: [] };

    parishNode.children = parish.zones?.map(zone => {
      const zoneNode: Territory = { ...zone, type: 'ZONE', children: [], parentId: parish.id };
      
      zoneNode.children = zone.apvs?.map((apv: any) => {
        const apvNode: Territory = { ...apv, type: 'APV', children: [], parentId: zone.id };

        const familiesInApv = appData.families.filter(f => f.apvId === apv.id);
        apvNode.children = familiesInApv.map(family => {
          const headLastName = appData.believers.find(b => b.id === family.headOfFamily)?.lastName || 'N/A';
          const memberCount = family.members.length;
          
          const familyNode: Territory = { 
            id: family.id, 
            name: `Family of ${headLastName} (${memberCount})`,
            type: 'FAMILY', 
            members: [],
            headOfFamily: family.headOfFamily,
            parentId: apv.id
          };
          
          familyNode.members = appData.believers
            .filter(b => family.members.includes(b.id))
            .map(b => ({...b, fullName: `${b.firstName} ${b.lastName}`})) as Believer[];

          return familyNode;
        });
        return apvNode;
      }) || [];
      return zoneNode;
    }) || [];
    
    return parishNode;
  },

  aggregateStats(treeData: Territory) {
    let believers = 0;
    let families = 0;
    let apvs = 0;
    let zones = 0;

    treeData.children?.forEach(zone => {
        zones++;
        zone.children?.forEach(apv => {
            apvs++;
            apv.children?.forEach(family => {
                families++;
                believers += family.members?.length || 0;
            });
        });
    });

    return { believers, families, apvs, zones };
  },
  
  getContributionsByParishId(parishId: string, appData: MockData) {
    const familiesInParish = appData.families.filter(f => f.parish === parishId);
    const contributions: { category: string; familyName: string; amount: number; memberId: string}[] = [];

    familiesInParish.forEach(family => {
      const head = appData.believers.find(b => b.id === family.headOfFamily);
      if (family.contributions) {
        family.contributions.forEach(c => {
          contributions.push({
            category: c.category,
            familyName: `Family of ${head?.lastName || 'N/A'}`,
            amount: c.amount,
            memberId: family.headOfFamily,
          });
        });
      }
    });
    return contributions;
  },

  getParishStatsById(parishId: string, believers: Believer[]) {
      const parishBelievers = believers.filter(b => b.parish === parishId);
      return {
          totalInParishBelievers: parishBelievers.length,
          totalInParishbaptized: parishBelievers.filter(b => b.isBaptized).length,
          totalInParishConfirmed: parishBelievers.filter(b => b.isConfirmed).length,
          totalInParishMarried: parishBelievers.filter(b => b.isMarriedSacramentally).length
      }
  },

  getZoneStatsByParishId(parishId: string, appData: MockData) {
      const parish = this.findTerritoryById(parishId, appData.territories.archdioceses);
      if (!parish || !parish.zones) return [];

      return parish.zones.map(zone => {
          const familiesInZone = appData.families.filter(f => zone.apvs?.some((apv: any) => apv.id === f.apvId));
          const believersInZone = familiesInZone.reduce((count, family) => count + family.members.length, 0);
          return {
              id: zone.id,
              name: zone.name,
              believersCount: believersInZone,
              familiesCount: familiesInZone.length,
              apvs: zone.apvs || []
          }
      });
  },

  getPathToTerritory(targetId: string, nodes: any[], path: any[] = []): any[] | null {
      for (const node of nodes) {
          const currentPath = [...path, node];
          if (node.id === targetId) {
              return currentPath;
          }

          const childKeys = ['dioceses', 'vicariates', 'districts', 'parishes', 'zones', 'apvs'];
          for (const key of childKeys) {
              if (node[key] && Array.isArray(node[key])) {
                  const foundPath = this.getPathToTerritory(targetId, node[key], currentPath);
                  if (foundPath) {
                      return foundPath;
                  }
              }
          }
      }
      return null;
  },

  searchParishes(query: string, archdioceses: any[]): any[] {
    const results: any[] = [];
    if (!query || query.length < 3) return results;
    const lowerCaseQuery = query.toLowerCase();

    for (const arch of archdioceses) {
        for (const diocese of arch.dioceses || []) {
            for (const vicariate of diocese.vicariates || []) {
                for (const district of vicariate.districts || []) {
                    for (const parish of district.parishes || []) {
                        if (parish.name.toLowerCase().includes(lowerCaseQuery)) {
                            results.push({
                                ...parish,
                                fullPath: [arch.name, diocese.name, vicariate.name, district.name, parish.name].join(' > '),
                                pathIds: [arch.id, diocese.id, vicariate.id, district.id, parish.id]
                            });
                        }
                    }
                }
            }
        }
    }

    return results;
  },

  getUpcomingEvents(parishId: string, archdioceses: any[]): any[] {
    const path = this.getPathToTerritory(parishId, archdioceses);
    const relevantTerritoryIds = new Set(path ? path.map(p => p.id) : [parishId]);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const currentYear = today.getFullYear();

    const processedEvents = liturgicalCalendar.map(event => {
      let eventDate: Date;
      if (event.calculate) {
        eventDate = event.calculate(currentYear);
      } else {
        const [month, day] = event.date.split('-').map(Number);
        eventDate = new Date(currentYear, month - 1, day);
      }
      return { ...event, computedDate: eventDate };
    });

    const relevantEvents = processedEvents.filter(event => {
      if (event.level === 'GLOBAL' || event.level === 'NATIONAL') {
        return true;
      }
      return event.territoryId && relevantTerritoryIds.has(event.territoryId);
    });

    const upcomingEvents = relevantEvents.filter(event => event.computedDate >= today);

    const nextYearEvents = processedEvents.map(event => {
        let eventDate: Date;
        if (event.calculate) {
            eventDate = event.calculate(currentYear + 1);
        } else {
            const [month, day] = event.date.split('-').map(Number);
            eventDate = new Date(currentYear + 1, month - 1, day);
        }
        return { ...event, computedDate: eventDate };
    }).filter(event => {
        if (event.level === 'GLOBAL' || event.level === 'NATIONAL') return true;
        return event.territoryId && relevantTerritoryIds.has(event.territoryId);
    });
    
    const sortedUpcoming = [...upcomingEvents, ...nextYearEvents]
        .sort((a, b) => a.computedDate.getTime() - b.computedDate.getTime())
        .slice(0, 20);

    return sortedUpcoming;
  },

  getAllApvIds(zone: Territory): string[] {
    return zone.apvs?.map(apv => apv.id) || [];
  },

  getBelieversInTerritory(territory: Territory, appData: MockData): Believer[] {
    const { families, believers } = appData;

    switch (territory.type) {
      case 'PARISH':
        return believers.filter(b => b.parish === territory.id);
      
      case 'ZONE': {
        const apvIdsInZone = this.getAllApvIds(territory);
        const familiesInZone = families.filter(f => apvIdsInZone.includes(f.apvId));
        const believerIdsInZone = new Set(familiesInZone.flatMap(f => f.members));
        return believers.filter(b => believerIdsInZone.has(b.id));
      }

      case 'APV': {
        const familiesInApv = families.filter(f => f.apvId === territory.id);
        const believerIdsInApv = new Set(familiesInApv.flatMap(f => f.members));
        return believers.filter(b => believerIdsInApv.has(b.id));
      }
      
      default:
        return [];
    }
  },
};
