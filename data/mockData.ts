import { ROLES as R, User, Believer, Family, Territory } from '../types';

const isToday = new Date().toISOString();

const logoBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/wAARCAJAAkADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1VXV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIydLT1NXW19jZ2uLj5OXm5+jp6vLz9PX2+Pn6v/aAAwDAQACEQMRAD8A/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigA-";

export const HOLY_ASSOCIATION_CATEGORIES = ["Fikambanana Masina", "Vovonana ara-panahy"];

export interface MockData {
  territories: any;
  users: User[];
  believers: Believer[];
  families: Family[];
}

export const mockData: MockData = {
  territories: {
    archdioceses: [
      {
        id: "ARC02",
        name: "Center Antananarivo",
        type: 'ARCHDIOCESE',
        dioceses: [
          {
            id: "DIO01-ARC02",
            name: "Diocese Antananarivo",
            type: 'DIOCESE',
            vicariates: [
              {
                id: "VIC03-DIO01-ARC02",
                name: "Vikaria Manodidina Atsinanana",
                type: 'VICARIATE',
                districts: [
                  {
                    id: "DIS01-VIC03-DIO01-ARC02",
                    name: "District Alasora",
                    type: 'DISTRICT',
                    parishes: [
                      {
                        id: "PAR001-DIS01-VIC03-DIO01-ARC02",
                        name: "EKAR Masindahy Laurent Ambohinierana",
                        type: 'PARISH',
                        logo: logoBase64,
                        address: "Alasora, Antananarivo Avaradrano, Analamanga",
                        priest: "Père Randrianantenaina Rémi Jean Ferdinand",
                        priestMessage: "Welcome to our digital home, EKAR Masindahy Laurent Ambohinierana. This platform is a tool to strengthen our community bonds and manage our spiritual journey together.",
                        execTeam: {
                          president: "U001-PAR001-DIS01-VIC03-DIO01-ARC02",
                          vicePresident1: "U002-PAR001-DIS01-VIC03-DIO01-ARC02",
                          vicePresident2: "U003-PAR001-DIS01-VIC03-DIO01-ARC02",
                        },
                        financesCouncil: {
                          president: "U006-PAR001-DIS01-VIC03-DIO01-ARC02",
                          treasurer: "U007-PAR001-DIS01-VIC03-DIO01-ARC02",
                          secretary1: "U008-PAR001-DIS01-VIC03-DIO01-ARC02",
                          secretary2: "U009-PAR001-DIS01-VIC03-DIO01-ARC02",
                          counselor: "U010-PAR001-DIS01-VIC03-DIO01-ARC02",
                        },
                        holyAssociations: [
                          { id: "HAS001", name: "FIFAKRI", execTeam: {} },
                          { id: "HAS002", name: "VOAFAFIA", execTeam: {} },
                        ],
                        commissions: [
                           { id: "C01", name: "Catechism Commission", execTeam: {} }
                        ],
                        prayersGroups: [
                           { id: "PG01", name: "Charismatic Renewal", execTeam: {} }
                        ],
                        nodeGroups: [
                          { id: "NG001", name: "Youth Group", execTeam: {} },
                        ],
                        zones: [
                          {
                            id: "ZONE001-PAR001-DIS01-VIC03-DIO01-ARC02",
                            name: "Masina Maria Mpanjakavavy",
                            type: 'ZONE',
                            execTeam: { president: "U003-PAR001-DIS01-VIC03-DIO01-ARC02" },
                            apvs: [
                              { id: "APV001-ZONE001-PAR001-DIS01-VIC03-DIO01-ARC02", name: "APV Ambodivoanjo", type: 'APV' },
                            ],
                          },
                          {
                            id: "ZONE002-PAR001-DIS01-VIC03-DIO01-ARC02",
                            name: "Md François d'Assise",
                            type: 'ZONE',
                            execTeam: { president: "U005-PAR001-DIS01-VIC03-DIO01-ARC02" },
                            apvs: [
                              { id: "APV001-ZONE002-PAR001-DIS01-VIC03-DIO01-ARC02", name: "APV1 Ambohidrazaka", type: 'APV' },
                              { id: "APV002-ZONE002-PAR001-DIS01-VIC03-DIO01-ARC02", name: "APV2 Ambohidrazaka", type: 'APV' },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  users: [
    { id: "U001-PAR001-DIS01-VIC03-DIO01-ARC02", email: "pres.par001@nday.mg", password: "123", role: R.parish_leader, username: "Hasina Mario", highestTerritoryLevel: "PARISH", highestLevelTerritoryId: "PAR001-DIS01-VIC03-DIO01-ARC02", territoryId: "PAR001-DIS01-VIC03-DIO01-ARC02", believerId: "M999-PAR001-DIS01-VIC03-DIO01-ARC02" },
    { id: "U_PRIEST_001", email: "priest@nday.mg", password: "123", role: R.priest, username: "Père Rémi", highestTerritoryLevel: "PARISH", highestLevelTerritoryId: "PAR001-DIS01-VIC03-DIO01-ARC02", territoryId: "PAR001-DIS01-VIC03-DIO01-ARC02" },
    { id: "U003-PAR001-DIS01-VIC03-DIO01-ARC02", email: "zone.lead.far001@nday.mg", password: "123", role: R.zone_leader, username: "Rakoto Filoha", contactPhone: "032 02 123 45", highestTerritoryLevel: "ZONE", highestLevelTerritoryId: "ZONE001-PAR001-DIS01-VIC03-DIO01-ARC02", territoryId: "PAR001-DIS01-VIC03-DIO01-ARC02", actingPermissions: ["APV001-ZONE002-PAR001-DIS01-VIC03-DIO01-ARC02"] },
    { id: "U004-PAR001-DIS01-VIC03-DIO01-ARC02", email: "apv.lead.apv001@nday.mg", password: "123", role: R.apv_leader, username: "Bema Mpitarika", highestTerritoryLevel: "APV", highestLevelTerritoryId: "APV001-ZONE001-PAR001-DIS01-VIC03-DIO01-ARC02", territoryId: "PAR001-DIS01-VIC03-DIO01-ARC02" },
    { id: "U005-PAR001-DIS01-VIC03-DIO01-ARC02", email: "zone.lead.far002@nday.mg", password: "123", role: R.zone_leader, username: "Rabe Mpitarika", contactPhone: "033 03 456 78", highestTerritoryLevel: "ZONE", highestLevelTerritoryId: "ZONE002-PAR001-DIS01-VIC03-DIO01-ARC02", territoryId: "PAR001-DIS01-VIC03-DIO01-ARC02", believerId: "M996-PAR001-DIS01-VIC03-DIO01-ARC02" },
    { id: "U_ADMIN_GLOBAL", email: "admin@nday.mg", password: "admin", role: R.admin, username: "Global Admin", highestTerritoryLevel: "GLOBAL", highestLevelTerritoryId: "ARC02", territoryId: "PAR001-DIS01-VIC03-DIO01-ARC02" },
    { id: "U_BELIEVER_M997", email: "tiana.rakoto@email.com", password: "123", role: R.believer, username: "Tiana R.", believerId: "M997-PAR001-DIS01-VIC03-DIO01-ARC02", highestTerritoryLevel: "FAMILY", highestLevelTerritoryId: "F001", territoryId: "PAR001-DIS01-VIC03-DIO01-ARC02" }
  ],
  believers: [
    { id: "M999-PAR001-DIS01-VIC03-DIO01-ARC02", firstName: "Jean", lastName: "Rakoto", dateOfBirth: "1985-01-15", placeOfBirth: "Antananarivo", gender: "Male", contactPhone: "0341122233", contactEmail: "jean.rakoto@email.com", residentialAddress: "123 Main St", familyId: "F001", relationshipToHead: "Head", civilStatus: "Married", occupation: "Farmer", notes: "", isBaptized: true, baptismDate: "1985-06-18", isFirstConfession: true, firstConfessionDate: "1991-05-10", isFirstCommunion: true, firstCommunionDate: "1991-05-10", isRenewalBaptism: false, isConfirmed: true, confirmationDate: "1998-08-15", isMarriedSacramentally: true, marriageDate: "2008-11-22", parish: "PAR001-DIS01-VIC03-DIO01-ARC02", status: 'active' },
    { id: "M998-PAR001-DIS01-VIC03-DIO01-ARC02", firstName: "Lydia", lastName: "Rasoa", dateOfBirth: "1988-05-20", placeOfBirth: "Antananarivo", gender: "Female", contactPhone: "0341122233", contactEmail: "lydia.rasoa@email.com", residentialAddress: "123 Main St", familyId: "F001", relationshipToHead: "Spouse", civilStatus: "Married", occupation: "Teacher", notes: "", isBaptized: true, baptismDate: "1988-07-12", isFirstConfession: true, firstConfessionDate: "1995-04-20", isFirstCommunion: true, firstCommunionDate: "1995-04-20", isRenewalBaptism: false, isConfirmed: true, confirmationDate: "2001-06-10", isMarriedSacramentally: true, marriageDate: "2008-11-22", parish: "PAR001-DIS01-VIC03-DIO01-ARC02", status: 'active' },
    { id: "M997-PAR001-DIS01-VIC03-DIO01-ARC02", firstName: "Tiana", lastName: "Rakoto", dateOfBirth: "2010-02-10", placeOfBirth: "Antananarivo", gender: "Male", contactPhone: "", contactEmail: "tiana.rakoto@email.com", residentialAddress: "123 Main St", familyId: "F001", relationshipToHead: "Son", civilStatus: "Single", occupation: "Student", notes: "", isBaptized: true, baptismDate: "2010-04-10", isFirstConfession: false, isFirstCommunion: false, isRenewalBaptism: false, isConfirmed: false, isMarriedSacramentally: false, parish: "PAR001-DIS01-VIC03-DIO01-ARC02", status: 'active' },
    { id: "M996-PAR001-DIS01-VIC03-DIO01-ARC02", firstName: "Andry", lastName: "Rabe", dateOfBirth: "1980-03-03", placeOfBirth: "Fianarantsoa", gender: "Male", contactPhone: "0334455566", contactEmail: "andry.rabe@email.com", residentialAddress: "456 Oak Ave", familyId: "F002", relationshipToHead: "Head", civilStatus: "Married", occupation: "Engineer", notes: "", isBaptized: true, baptismDate: "1980-05-05", isFirstConfession: true, firstConfessionDate: "1987-03-15", isFirstCommunion: true, firstCommunionDate: "1987-03-15", isRenewalBaptism: false, isConfirmed: true, confirmationDate: "1995-09-20", isMarriedSacramentally: true, marriageDate: "2005-01-15", parish: "PAR001-DIS01-VIC03-DIO01-ARC02", status: 'active' },
    { id: "M995-PAR001-DIS01-VIC03-DIO01-ARC02", firstName: "Voary", lastName: "Rabe", dateOfBirth: "2008-07-07", placeOfBirth: "Antananarivo", gender: "Female", contactPhone: "", contactEmail: "", residentialAddress: "456 Oak Ave", familyId: "F002", relationshipToHead: "Daughter", civilStatus: "Single", occupation: "Student", notes: "", isBaptized: true, baptismDate: "2008-09-09", isFirstConfession: false, isFirstCommunion: false, isRenewalBaptism: false, isConfirmed: false, isMarriedSacramentally: false, parish: "PAR001-DIS01-VIC03-DIO01-ARC02", status: 'active' },
  ],
  families: [
    { id: "F001", headOfFamily: "M999-PAR001-DIS01-VIC03-DIO01-ARC02", members: ["M999-PAR001-DIS01-VIC03-DIO01-ARC02", "M998-PAR001-DIS01-VIC03-DIO01-ARC02", "M997-PAR001-DIS01-VIC03-DIO01-ARC02"], address: "Lot IVX 101 Alasora", apvId: "APV001-ZONE001-PAR001-DIS01-VIC03-DIO01-ARC02", parish: "PAR001-DIS01-VIC03-DIO01-ARC02", contributions: [
        {id: 'C001', date: '2024-05-01', category: "Fetim-piangonana", amount: 50000}, 
        {id: 'C002', date: '2024-04-15', category: "Seminera", amount: 10000}
    ]},
    { id: "F002", headOfFamily: "M996-PAR001-DIS01-VIC03-DIO01-ARC02", members: ["M996-PAR001-DIS01-VIC03-DIO01-ARC02", "M995-PAR001-DIS01-VIC03-DIO01-ARC02"], address: "Lot IVX 102 Alasora", apvId: "APV001-ZONE002-PAR001-DIS01-VIC03-DIO01-ARC02", parish: "PAR001-DIS01-VIC03-DIO01-ARC02", contributions: [
        {id: 'C003', date: '2024-03-31', category: "Hasin'Andriamanitra (Paka)", amount: 75000}
    ]},
  ]
};