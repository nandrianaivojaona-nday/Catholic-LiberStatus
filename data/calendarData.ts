// Date calculation helpers for movable feasts
const getEaster = (year: number): Date => {
    // Butcher's algorithm to find the date of Easter for a given year
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(Date.UTC(year, month - 1, day));
};

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
};

export const liturgicalCalendar = [
    // --- GLOBAL ---
    { title: "Solemnity of Mary, Mother of God", date: "01-01", level: 'GLOBAL' },
    { title: "Epiphany", date: "01-06", level: 'GLOBAL' },
    { title: "Presentation of the Lord", date: "02-02", level: 'GLOBAL' },
    { title: "Saint Joseph, Husband of Mary", date: "03-19", level: 'GLOBAL' },
    { title: "Annunciation", date: "03-25", level: 'GLOBAL' },
    { title: "Ash Wednesday", level: 'GLOBAL', calculate: (year: number) => addDays(getEaster(year), -46) },
    { title: "Palm Sunday", level: 'GLOBAL', calculate: (year: number) => addDays(getEaster(year), -7) },
    { title: "Holy Thursday", level: 'GLOBAL', calculate: (year: number) => addDays(getEaster(year), -3) },
    { title: "Good Friday", level: 'GLOBAL', calculate: (year: number) => addDays(getEaster(year), -2) },
    { title: "Easter Sunday", level: 'GLOBAL', calculate: (year: number) => getEaster(year) },
    { title: "Divine Mercy Sunday", level: 'GLOBAL', calculate: (year: number) => addDays(getEaster(year), 7) },
    { title: "Ascension of Jesus", level: 'GLOBAL', calculate: (year: number) => addDays(getEaster(year), 39) },
    { title: "Pentecost Sunday", level: 'GLOBAL', calculate: (year: number) => addDays(getEaster(year), 49) },
    { title: "Trinity Sunday", level: 'GLOBAL', calculate: (year: number) => addDays(getEaster(year), 56) },
    { title: "Corpus Christi", level: 'GLOBAL', calculate: (year: number) => addDays(getEaster(year), 60) },
    { title: "Most Sacred Heart of Jesus", level: 'GLOBAL', calculate: (year: number) => addDays(getEaster(year), 68) },
    { title: "Nativity of John the Baptist", date: "06-24", level: 'GLOBAL' },
    { title: "Saints Peter and Paul", date: "06-29", level: 'GLOBAL' },
    { title: "Transfiguration of the Lord", date: "08-06", level: 'GLOBAL' },
    { title: "Assumption of Mary", date: "08-15", level: 'GLOBAL' },
    { title: "Triumph of the Cross", date: "09-14", level: 'GLOBAL' },
    { title: "All Saints' Day", date: "11-01", level: 'GLOBAL' },
    { title: "All Souls' Day", date: "11-02", level: 'GLOBAL' },
    { title: "Christ the King", level: 'GLOBAL', calculate: (year: number) => addDays(getEaster(year), 245) }, // Aprox, real calculation is last Sunday before advent
    { title: "Immaculate Conception", date: "12-08", level: 'GLOBAL' },
    { title: "Christmas", date: "12-25", level: 'GLOBAL' },
    { title: "Holy Family", date: "12-30", level: 'GLOBAL' },

    // --- NATIONAL (Example for Madagascar) ---
    { title: "Blessed Victoire Rasoamanarivo", date: "08-21", level: 'NATIONAL', territoryId: 'COUNTRY-MG' }, // Assuming a country code
    { title: "Martyrs of Madagascar", date: "03-29", level: 'NATIONAL', territoryId: 'COUNTRY-MG' },

    // --- DIOCESE (Examples for Antananarivo) ---
    { title: "Feast of Seminera Zandriny", date: "01-06", level: 'DIOCESE', territoryId: 'DIO01-ARC02' },
    { title: "Feast of Seminera Zokiny", level: 'DIOCESE', territoryId: 'DIO01-ARC02', calculate: (year: number) => addDays(getEaster(year), 7) },

    // --- DISTRICT (Example for Alasora) ---
    { title: "Patron Saint of District Alasora", date: "07-20", level: 'DISTRICT', territoryId: 'DIS01-VIC03-DIO01-ARC02' },
    
    
    // --- PARISH (Examples for EKAR Masindahy Laurent) ---
    { title: "Feast of Saint Laurent (Patron)", date: "08-10", level: 'PARISH', territoryId: 'PAR001-DIS01-VIC03-DIO01-ARC02' },
    { title: "Homecoming for Former Members", date: "09-15", level: 'PARISH', territoryId: 'PAR001-DIS01-VIC03-DIO01-ARC02' },
    { title: "Fetin'ny Taranaka", date: "11-23", level: 'PARISH', territoryId: 'PAR001-DIS01-VIC03-DIO01-ARC02' },
];
