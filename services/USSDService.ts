import { User, ROLES, Family, Believer, CONTRIBUTION_CATEGORIES, Territory } from '../types';
import { StatisticsService } from './StatisticsService';
import { TFunction } from 'i18next';
import { MockData } from '../data/mockData';

// Define the shape of the data context needed by the USSD service
type DataContextActions = {
    appData: MockData;
    addContributionToFamily: (familyId: string, contribution: { category: any; amount: number; date: string }) => void;
    updateBelieverSacrament: (believerId: string, sacrament: any, date: string) => void;
    addBeliever: (newBeliever: Omit<Believer, 'id'> & { newFamilyAddress?: string, apvIdForNewFamily?: string }) => Believer;
    updateFamily: (updatedFamily: Family) => void;
    deleteFamily: (familyId: string) => void;
    updateBeliever: (updatedBeliever: Believer) => void;
    deleteBeliever: (believerId: string) => void;
};

// Define the structure of a USSD session
interface USSDSession {
    step: string;
    data: any;
    history: string[];
    paginatedList?: any[];
}

export interface USSDResponse {
    display: string;
    sessionEnded: boolean;
}

let session: USSDSession | null = null;

const SACRAMENT_OPTIONS: { key: keyof Believer, label: string }[] = [
    { key: 'isBaptized', label: 'Baptism' },
    { key: 'isConfirmed', label: 'Confirmation' },
    { key: 'isMarriedSacramentally', label: 'Marriage' }
];

const BELIEVER_EDIT_FIELDS = ['firstName', 'lastName', 'dateOfBirth'];


// --- Helper Functions ---

function getTerritoryPathInfo(user: User, dataContext: DataContextActions) {
    const territoryId = user.role === ROLES.believer 
        ? dataContext.appData.believers.find(b => b.id === user.believerId)?.parish
        : user.territoryId;

    if (!territoryId) return { parishName: '', zoneName: '', territoryName: 'N/A' };

    const path = StatisticsService.getPathToTerritory(user.highestLevelTerritoryId, dataContext.appData.territories.archdioceses);
    const info = { parishName: '', zoneName: '', territoryName: '' };
    if (path) {
        const parish = path.find(p => p.type === 'PARISH');
        const zone = path.find(p => p.type === 'ZONE');
        const userTerritory = path[path.length - 1];

        if (parish) info.parishName = parish.name;
        if (zone) info.zoneName = zone.name;
        if (userTerritory) info.territoryName = userTerritory.name;
    }
    return info;
}


function getFamiliesForUser(user: User, dataContext: DataContextActions): Family[] {
    const { appData } = dataContext;
    const { role, highestLevelTerritoryId, territoryId } = user;

    if (!highestLevelTerritoryId) return [];

    switch (role) {
        case ROLES.admin:
            return appData.families.filter(f => f.parish === territoryId);
        case ROLES.parish_leader:
            return appData.families.filter(f => f.parish === highestLevelTerritoryId);
        case ROLES.zone_leader:
            const zone = StatisticsService.findTerritoryById(highestLevelTerritoryId, appData.territories.archdioceses);
            if (!zone || !zone.apvs) return [];
            const apvIdsInZone = zone.apvs.map(apv => apv.id);
            return appData.families.filter(f => apvIdsInZone.includes(f.apvId));
        case ROLES.apv_leader:
            return appData.families.filter(f => f.apvId === highestLevelTerritoryId);
        case ROLES.headOfFamily:
            return appData.families.filter(f => f.id === user.highestLevelTerritoryId);
        default:
            return [];
    }
}

function getBelieversForUser(user: User, familyId: string, dataContext: DataContextActions): Believer[] {
    const family = dataContext.appData.families.find(f => f.id === familyId);
    if (!family) return [];
    
    // Leaders can manage all members
    const isLeader = [ROLES.admin, ROLES.parish_leader, ROLES.zone_leader, ROLES.apv_leader].includes(user.role);
    if (isLeader) {
        return dataContext.appData.believers.filter(b => family.members.includes(b.id));
    }
    
    // Head of Family can manage their own family members
    if (user.role === ROLES.headOfFamily && user.highestLevelTerritoryId === family.id) {
        return dataContext.appData.believers.filter(b => family.members.includes(b.id));
    }

    return [];
}


// --- Menu Generation Functions ---

function getRoleBasedMainMenu(user: User, t: TFunction): string {
    const { parishName, zoneName, territoryName } = session!.data.pathInfo;
    const welcome = t('ussd.mainMenuTitle', { username: user.username, parishName, zoneName, territoryName });
    
    switch(user.role) {
        case ROLES.admin:
        case ROLES.parish_leader:
        case ROLES.zone_leader:
        case ROLES.apv_leader:
            session!.step = 'LEADER_MAIN_MENU';
            return `${welcome}\n${t('ussd.leaderMenu.title')}\n${t('ussd.leaderMenu.options')}\n${t('ussd.general.exit')}`;
        case ROLES.headOfFamily:
            session!.step = 'HOF_MAIN_MENU';
            return `${welcome}\n${t('ussd.headOfFamilyMenu.title')}\n${t('ussd.headOfFamilyMenu.options')}\n${t('ussd.general.exit')}`;
        case ROLES.believer:
            session!.step = 'BELIEVER_MAIN_MENU';
            return `${welcome}\n${t('ussd.believerMenu.title')}\n${t('ussd.believerMenu.options')}\n${t('ussd.general.exit')}`;
        default:
            return t('common.permission_denied');
    }
}

function getListMenu(items: any[], displayFn: (item: any, index: number) => string, title: string, t: TFunction): string {
    if (items.length === 0) {
        return title.includes("family") ? t('ussd.general.noFamiliesFound') : t('ussd.general.noBelieversFound');
    }
    session!.paginatedList = items;
    const menuItems = items.map(displayFn).join('\n');
    return `${title}\n${menuItems}\n${t('ussd.general.goBack')}`;
}

const familyDisplayFn = (fam: Family, index: number, dataContext: DataContextActions) => {
    const head = dataContext.appData.believers.find(b => b.id === fam.headOfFamily);
    return `${index + 1}. Fam. ${head?.lastName || 'N/A'} - ${fam.address}`;
};

const believerDisplayFn = (bel: Believer, index: number) => `${index + 1}. ${bel.firstName} ${bel.lastName}`;


// --- Main Service Logic ---

export const USSDService = {
    startSession(user: User, dataContext: DataContextActions, t: TFunction) {
        session = {
            step: 'ROLE_ROUTER',
            data: {
                pathInfo: getTerritoryPathInfo(user, dataContext)
            },
            history: []
        };
    },

    endSession() {
        session = null;
    },

    processRequest(input: string, user: User, dataContext: DataContextActions, t: TFunction): USSDResponse {
        if (!session) {
            if (input === '*123#') {
                this.startSession(user, dataContext, t);
                return this.processRequest('START', user, dataContext, t);
            }
            return { display: t('ussd.startPrompt'), sessionEnded: false };
        }

        if (input === '00') {
            this.endSession();
            return { display: t('ussd.general.operationCancelled'), sessionEnded: true };
        }
        if (input === '0') {
            const lastStep = session.history.pop() || 'ROLE_ROUTER';
            session.step = lastStep;
            return this.processRequest('BACK', user, dataContext, t);
        }

        const currentStep = session.step;
        if(input !== 'BACK' && input !== 'START') session.history.push(currentStep);

        let responseText = '';
        const families = getFamiliesForUser(user, dataContext);

        switch (currentStep) {
            case 'ROLE_ROUTER':
                responseText = getRoleBasedMainMenu(user, t);
                break;
            
            // --- LEADER MENU ---
            case 'LEADER_MAIN_MENU':
                switch (input) {
                    case '1': session.step = 'CONTRIBUTION_SELECT_FAMILY'; responseText = getListMenu(families, (f, i) => familyDisplayFn(f, i, dataContext), t('ussd.contributionMenu.selectFamily'), t); break;
                    case '2': session.step = 'BELIEVER_SELECT_FAMILY'; responseText = getListMenu(families, (f, i) => familyDisplayFn(f, i, dataContext), t('ussd.believerMenu.selectFamily'), t); break;
                    // ADD FAMILY/BELIEVER flows are complex, handled in their own steps.
                    case '5': session.step = 'EDIT_FAMILY_SELECT_FAMILY'; responseText = getListMenu(families, (f,i) => familyDisplayFn(f,i,dataContext), t('ussd.editFamilyMenu.selectFamily'), t); break;
                    case '6': session.step = 'DELETE_FAMILY_SELECT_FAMILY'; responseText = getListMenu(families, (f,i) => familyDisplayFn(f,i,dataContext), t('ussd.deleteFamilyMenu.selectFamily'), t); break;
                    case '7': session.step = 'EDIT_BELIEVER_SELECT_FAMILY'; responseText = getListMenu(families, (f,i) => familyDisplayFn(f,i,dataContext), t('ussd.editBelieverMenu.selectFamily'), t); break;
                    case '8': session.step = 'DELETE_BELIEVER_SELECT_FAMILY'; responseText = getListMenu(families, (f,i) => familyDisplayFn(f,i,dataContext), t('ussd.deleteBelieverMenu.selectFamily'), t); break;
                    default: responseText = t('ussd.general.invalidOption'); session.history.pop(); break;
                }
                break;
            
            // --- HOF MENU ---
            case 'HOF_MAIN_MENU':
                 switch (input) {
                    case '1': session.step = 'EDIT_FAMILY_ENTER_ADDRESS'; session.data.family = families[0]; responseText = t('ussd.editFamilyMenu.enterAddress'); break;
                    // Other cases...
                    default: responseText = t('ussd.general.invalidOption'); session.history.pop(); break;
                 }
                 break;

            // --- BELIEVER MENU ---
            case 'BELIEVER_MAIN_MENU':
                switch(input) {
                    case '1': // Edit My Info
                        session.step = 'BELIEVER_EDIT_INFO_SELECT_FIELD';
                        responseText = t('ussd.editMyInfoMenu.selectField');
                        break;
                    case '2': // Update My Sacraments
                        session.step = 'BELIEVER_UPDATE_SACRAMENT_SELECT_SACRAMENT';
                        responseText = t('ussd.updateMySacramentMenu.selectSacrament');
                        break;
                    default:
                        responseText = t('ussd.general.invalidOption');
                        session.history.pop();
                        break;
                }
                break;

             // --- EDIT MY INFO FLOW ---
            case 'BELIEVER_EDIT_INFO_SELECT_FIELD':
                const fieldIndex = parseInt(input, 10) - 1;
                if (fieldIndex >= 0 && fieldIndex < BELIEVER_EDIT_FIELDS.length) {
                    session.data.field = BELIEVER_EDIT_FIELDS[fieldIndex];
                    session.step = 'BELIEVER_EDIT_INFO_ENTER_VALUE';
                    responseText = t('ussd.editMyInfoMenu.enterNewValue', { fieldName: session.data.field });
                } else {
                    responseText = t('ussd.general.invalidOption');
                    session.history.pop();
                }
                break;
            
            case 'BELIEVER_EDIT_INFO_ENTER_VALUE':
                if (!user.believerId) {
                    responseText = t('common.error_occurred');
                    this.endSession();
                    return { display: responseText, sessionEnded: true };
                }
                const believerToUpdate = dataContext.appData.believers.find(b => b.id === user.believerId);
                if (!believerToUpdate) {
                    responseText = t('common.error_occurred');
                    this.endSession();
                    return { display: responseText, sessionEnded: true };
                }
                if (!input.trim()) {
                    responseText = t('ussd.general.invalidInput');
                    session.history.pop(); // Stay on this step
                    break;
                }
                const updatedBel = { ...believerToUpdate, [session.data.field]: input };
                dataContext.updateBeliever(updatedBel);
                responseText = t('ussd.editMyInfoMenu.success', { fieldName: session.data.field });
                this.endSession();
                return { display: responseText, sessionEnded: true };

            // --- UPDATE MY SACRAMENT FLOW ---
            case 'BELIEVER_UPDATE_SACRAMENT_SELECT_SACRAMENT':
                const sacramentIndex = parseInt(input, 10) - 1;
                if (sacramentIndex >= 0 && sacramentIndex < SACRAMENT_OPTIONS.length) {
                    session.data.sacrament = SACRAMENT_OPTIONS[sacramentIndex];
                    session.step = 'BELIEVER_UPDATE_SACRAMENT_ENTER_DATE';
                    responseText = t('ussd.updateMySacramentMenu.enterDate');
                } else {
                    responseText = t('ussd.general.invalidOption');
                    session.history.pop();
                }
                break;

            case 'BELIEVER_UPDATE_SACRAMENT_ENTER_DATE':
                if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
                    responseText = t('ussd.general.invalidDate');
                    session.history.pop(); // Stay on this step
                    break;
                }
                 if (!user.believerId) {
                    responseText = t('common.error_occurred');
                    this.endSession();
                    return { display: responseText, sessionEnded: true };
                }
                dataContext.updateBelieverSacrament(user.believerId, session.data.sacrament.key, input);
                responseText = t('ussd.updateMySacramentMenu.success', { sacramentName: session.data.sacrament.label });
                this.endSession();
                return { display: responseText, sessionEnded: true };

            // --- SHARED FLOWS (Family & Believer CRUD) ---

            // EDIT FAMILY
            case 'EDIT_FAMILY_SELECT_FAMILY':
                const famIndex = parseInt(input, 10) - 1;
                if (session.paginatedList && famIndex >= 0 && famIndex < session.paginatedList.length) {
                    session.data.family = session.paginatedList[famIndex];
                    session.step = 'EDIT_FAMILY_ENTER_ADDRESS';
                    responseText = t('ussd.editFamilyMenu.enterAddress');
                } else {
                    responseText = t('ussd.general.invalidOption');
                }
                break;
            
            case 'EDIT_FAMILY_ENTER_ADDRESS':
                const newAddress = input;
                const updatedFamily = { ...session.data.family, address: newAddress };
                dataContext.updateFamily(updatedFamily);
                responseText = t('ussd.editFamilyMenu.success', { address: newAddress });
                this.endSession();
                return { display: responseText, sessionEnded: true };

            // DELETE FAMILY
            case 'DELETE_FAMILY_SELECT_FAMILY':
                 const delFamIndex = parseInt(input, 10) - 1;
                 if (session.paginatedList && delFamIndex >= 0 && delFamIndex < session.paginatedList.length) {
                     session.data.family = session.paginatedList[delFamIndex];
                     const head = dataContext.appData.believers.find(b => b.id === session.data.family.headOfFamily);
                     session.step = 'DELETE_FAMILY_CONFIRM';
                     responseText = t('ussd.deleteFamilyMenu.confirm', { familyName: `Fam. ${head?.lastName}`});
                 } else {
                     responseText = t('ussd.general.invalidOption');
                 }
                 break;
            
            case 'DELETE_FAMILY_CONFIRM':
                if (input === '1') {
                    const head = dataContext.appData.believers.find(b => b.id === session.data.family.headOfFamily);
                    dataContext.deleteFamily(session.data.family.id);
                    responseText = t('ussd.deleteFamilyMenu.success', { familyName: `Fam. ${head?.lastName}`});
                    this.endSession();
                    return { display: responseText, sessionEnded: true };
                }
                // Any other input cancels
                session.step = 'LEADER_MAIN_MENU';
                responseText = t('ussd.general.operationCancelled');
                break;
                
            // EDIT BELIEVER
            case 'EDIT_BELIEVER_SELECT_FAMILY':
                const editBelFamIndex = parseInt(input, 10) - 1;
                if (session.paginatedList && editBelFamIndex >= 0 && editBelFamIndex < session.paginatedList.length) {
                    const family = session.paginatedList[editBelFamIndex];
                    session.data.family = family;
                    const believers = getBelieversForUser(user, family.id, dataContext);
                    session.step = 'EDIT_BELIEVER_SELECT_BELIEVER';
                    responseText = getListMenu(believers, believerDisplayFn, t('ussd.editBelieverMenu.selectBeliever'), t);
                } else {
                    responseText = t('ussd.general.invalidOption');
                }
                break;

            case 'EDIT_BELIEVER_SELECT_BELIEVER':
                const editBelIndex = parseInt(input, 10) - 1;
                if(session.paginatedList && editBelIndex >= 0 && editBelIndex < session.paginatedList.length) {
                    session.data.believer = session.paginatedList[editBelIndex];
                    session.step = 'EDIT_BELIEVER_SELECT_FIELD';
                    responseText = t('ussd.editBelieverMenu.selectField', { believerName: session.data.believer.firstName });
                } else {
                     responseText = t('ussd.general.invalidOption');
                }
                break;

            case 'EDIT_BELIEVER_SELECT_FIELD':
                const leaderFieldIndex = parseInt(input, 10) - 1;
                if (leaderFieldIndex >= 0 && leaderFieldIndex < BELIEVER_EDIT_FIELDS.length) {
                    session.data.field = BELIEVER_EDIT_FIELDS[leaderFieldIndex];
                    session.step = 'EDIT_BELIEVER_ENTER_VALUE';
                    responseText = t('ussd.editBelieverMenu.enterNewValue', { fieldName: session.data.field });
                } else {
                    responseText = t('ussd.general.invalidOption');
                }
                break;

            case 'EDIT_BELIEVER_ENTER_VALUE':
                const updatedBeliever = { ...session.data.believer, [session.data.field]: input };
                dataContext.updateBeliever(updatedBeliever);
                responseText = t('ussd.editBelieverMenu.success', { fieldName: session.data.field, believerName: session.data.believer.firstName });
                this.endSession();
                return { display: responseText, sessionEnded: true };

            // DELETE BELIEVER
            case 'DELETE_BELIEVER_SELECT_FAMILY':
                const delBelFamIndex = parseInt(input, 10) - 1;
                if (session.paginatedList && delBelFamIndex >= 0 && delBelFamIndex < session.paginatedList.length) {
                     const family = session.paginatedList[delBelFamIndex];
                    session.data.family = family;
                    const believers = getBelieversForUser(user, family.id, dataContext);
                    session.step = 'DELETE_BELIEVER_SELECT_BELIEVER';
                    responseText = getListMenu(believers, believerDisplayFn, t('ussd.deleteBelieverMenu.selectBeliever'), t);
                } else {
                     responseText = t('ussd.general.invalidOption');
                }
                break;

            case 'DELETE_BELIEVER_SELECT_BELIEVER':
                 const delBelIndex = parseInt(input, 10) - 1;
                if(session.paginatedList && delBelIndex >= 0 && delBelIndex < session.paginatedList.length) {
                    session.data.believer = session.paginatedList[delBelIndex];
                    session.step = 'DELETE_BELIEVER_CONFIRM';
                    responseText = t('ussd.deleteBelieverMenu.confirm', { believerName: session.data.believer.firstName });
                } else {
                     responseText = t('ussd.general.invalidOption');
                }
                break;

            case 'DELETE_BELIEVER_CONFIRM':
                if (input === '1') {
                    dataContext.deleteBeliever(session.data.believer.id);
                    responseText = t('ussd.deleteBelieverMenu.success', { believerName: session.data.believer.firstName });
                    this.endSession();
                    return { display: responseText, sessionEnded: true };
                }
                session.step = 'LEADER_MAIN_MENU'; // Or HOF_MAIN_MENU
                responseText = t('ussd.general.operationCancelled');
                break;

            default:
                // Fallback to router if step is unknown
                session.step = 'ROLE_ROUTER';
                responseText = getRoleBasedMainMenu(user, t);
                break;
        }

        if (input === 'BACK') {
            switch(session.step) {
                case 'ROLE_ROUTER': responseText = getRoleBasedMainMenu(user, t); break;
                // Add more specific 'back' logic if needed for complex flows
                default: 
                    session.step = 'ROLE_ROUTER';
                    responseText = getRoleBasedMainMenu(user, t);
                    break;
            }
        }

        return { display: responseText, sessionEnded: false };
    }
};