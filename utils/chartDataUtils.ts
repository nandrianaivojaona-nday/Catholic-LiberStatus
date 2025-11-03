
export const prepareGrowthData = (historicalGrowth: Record<string, Record<string, number>>) => {
    if (!historicalGrowth) return { keys: [], years: [], historicalTotals: {} };

    const years = Object.keys(historicalGrowth).sort();
    const keys = new Set<string>();
    const historicalTotals: Record<string, Record<string, number>> = {};

    years.forEach(year => {
        Object.keys(historicalGrowth[year]).forEach(key => {
            keys.add(key);
            if (!historicalTotals[key]) {
                historicalTotals[key] = {};
            }
            historicalTotals[key][year] = historicalGrowth[year][key];
        });
    });

    return { keys: Array.from(keys), years, historicalTotals };
};
