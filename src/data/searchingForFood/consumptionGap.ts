import { ConsumptionGap } from './types';

// Search ranks from real Google Trends data (pytrends, 2026-02-13)
// Consumption ranks triangulated from: NSSO/HCES household expenditure surveys
// (2022-23), Tea Board of India consumption survey, Swiggy/Zomato annual reports
// (2024-25), and ICMR-NIN dietary guidelines. No single source ranks all prepared
// dishes — these are editorial estimates informed by multiple data points.
// High-confidence: roti, chai, dal-rice. Low-confidence: khichdi, rasam, poha.
export const consumptionGap: ConsumptionGap[] = [
  { dishId: 'biryani', searchRank: 1, consumptionRank: 12, note: 'Most searched, but a weekend indulgence. Swiggy\'s #1 order (93M/yr) is still <0.02% of daily meals' },
  { dishId: 'roti', searchRank: 2, consumptionRank: 1, note: 'NSSO data: 83kg wheat/yr per capita. ~3 billion rotis eaten daily across India' },
  { dishId: 'dosa', searchRank: 3, consumptionRank: 5, note: 'High on both. Swiggy\'s #4 dish (26.2M orders) and daily breakfast for 250M+ South Indians' },
  { dishId: 'idli', searchRank: 4, consumptionRank: 4, note: 'Swiggy\'s #5 (11M orders). Daily breakfast for 250M+, and people search for variations' },
  { dishId: 'samosa', searchRank: 7, consumptionRank: 8, note: '60 million samosas sold daily across India, a street food icon' },
  { dishId: 'khichdi', searchRank: 8, consumptionRank: 3, note: 'Pan-India comfort food, 1-2x/week for most families. No hard data; ranking is an estimate' },
  { dishId: 'pav-bhaji', searchRank: 11, consumptionRank: 14, note: 'Mumbai\'s pride, more aspiration than daily meal' },
  { dishId: 'gulab-jamun', searchRank: 12, consumptionRank: 16, note: 'Swiggy\'s #7 (4.5M orders). 41% of urban households eat sweets 3+/month' },
  { dishId: 'momos', searchRank: 5, consumptionRank: 20, note: 'Swiggy: only 1.63M momo orders (2024). High curiosity, but regional (NE + Delhi)' },
  { dishId: 'masala-chai', searchRank: 28, consumptionRank: 1, note: 'Tea Board: 88% household penetration, 2-3 cups/day. 800M+ cups daily, too routine to search' },
  { dishId: 'poha', searchRank: 9, consumptionRank: 7, note: 'Dominant breakfast in MP/Maharashtra (~200M pop). 60% more ordered than idli in Maharashtra' },
  { dishId: 'dal-rice', searchRank: 22, consumptionRank: 2, note: 'NSSO: pulses ~30kg/yr + rice 165kg/yr per capita. Most homes cook dal at least once a day' },
  { dishId: 'paneer-tikka', searchRank: 20, consumptionRank: 15, note: 'Party dish, searched for recipes, not daily food' },
  { dishId: 'rasam', searchRank: 25, consumptionRank: 9, note: 'Daily in 4-5 South Indian states (~250M pop), but sambar is more popular even there' },
  { dishId: 'butter-chicken', searchRank: 19, consumptionRank: 18, note: 'Restaurant dish. Punjab chicken consumption surprisingly low at 205g/month per capita' },
];
