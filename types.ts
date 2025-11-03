

export interface ExecTeam {
  president?: string;
  vicePresident1?: string;
  vicePresident2?: string;
  secretary1?: string;
  secretary2?: string;
  treasurer1?: string;
  treasurer2?: string;
  counselor?: string;
}

export interface ParishGroup {
    id: string;
    name: string;
    execTeam?: ExecTeam;
}

export interface Territory {
  id: string;
  name: string;
  type: 'ARCHDIOCESE' | 'DIOCESE' | 'VICARIATE' | 'DISTRICT' | 'PARISH' | 'ZONE' | 'APV' | 'FAMILY' | 'MEMBER';
  priest?: string;
  priestAssistant1?: string;
  priestAssistant2?: string;
  deacon?: string;
  sacristin?: string;
  children?: Territory[];
  // Specific properties for different levels
  logo?: string;
  address?: string;
  holyAssociations?: ParishGroup[];
  prayersGroups?: ParishGroup[];
  commissions?: ParishGroup[];
  nodeGroups?: ParishGroup[]; // Added for the new feature
  sacraments?: any;
  totals?: any;
  historicalGrowth?: any;
  zoneBreakdown?: any[];
  calendarEvents?: any[];
  parishName?: string;
  parishAddress?: string;
  parishLogoUrl?: string;
  priestMessage?: string;
  members?: Believer[];
  headOfFamily?: string;
  // Relationship to parent
  parentId?: string;
  execTeam?: ExecTeam;
  financesCouncil?: ExecTeam;
  zones?: Territory[];
  apvs?: Territory[];
  dioceses?: Territory[];
  vicariates?: Territory[];
  districts?: Territory[];
  parishes?: Territory[];
  leaderId?: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  role: string;
  username: string;
  highestTerritoryLevel: string;
  highestLevelTerritoryId: string;
  fullName?: string; // for display
  territoryId?: string; // for navigation
  contactPhone?: string;
  believerId?: string; // Link to a believer record
  actingPermissions?: string[]; // Array of territory IDs where user has delegated authority
}

export interface Believer {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: 'Male' | 'Female';
  contactPhone: string;
  contactEmail: string;
  residentialAddress: string;
  familyId: string;
  relationshipToHead: string;
  civilStatus: string;
  occupation: string;
  notes: string;
  isBaptized: boolean;
  baptismDate?: string;
  isFirstConfession: boolean;
  firstConfessionDate?: string;
  isFirstCommunion: boolean;
  firstCommunionDate?: string;
  isRenewalBaptism: boolean;
  renewalBaptismDate?: string;
  isConfirmed: boolean;
  confirmationDate?: string;
  isMarriedSacramentally: boolean;
  marriageDate?: string;
  parish: string;
  status: 'active' | 'inactive' | 'deceased';
}

export interface Family {
  id: string;
  headOfFamily: string; // Believer ID
  members: string[]; // Believer IDs
  address: string;
  apvId: string;
  parish: string;
  contributions: Contribution[];
}

export type Contribution = {
  id: string;
  date: string;
  category: 'Tithe' | 'Donation' | 'Seminera' | 'Fetim-piangonana' | 'Hasin\'Andriamanitra (Paka)';
  amount: number;
};

export const CONTRIBUTION_CATEGORIES: Contribution['category'][] = [
    'Tithe', 'Donation', 'Seminera', 'Fetim-piangonana', 'Hasin\'Andriamanitra (Paka)'
];

export const ROLES = {
  visitor: "Mpitsidika",
  believer: "Mpino Katolika",
  headOfFamily: "Loham-Pianakaviana",
  apv_leader: "Mpitarika APV",
  zone_leader: "Filohan'ny Faritra",
  priest: "Pretra",
  parish_leader: "Filohan'ny Filan-Kevitra Paroasy",
  admin: "Mpiandraikitra Feno",
  pastoral_council_member: "Mpikambana Filan-Kevitra Pastoraly",
  holy_association_leader: "Mpitarika Fikambanana Masina",
  economic_social_council_leader: "Mpitarika CAES",
  holy_group_leader: "Mpitarika Vovonana Masina",
  committee_leader: "Mpitarika Vaomiera",
  district_leader: "Mpitarika Distrika",
  vicariate_leader: "Mpitarika Vikaria",
  diocese_leader: "Mpitarika Diosezy",
  archdiocese_leader: "Mpitarika Arsidiosezy",
};
