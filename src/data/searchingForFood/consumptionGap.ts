import { ConsumptionGap } from './types';

// Search ranks from real Google Trends data (pytrends, 2026-02-13)
// Consumption ranks estimated from NSSO 68th round household expenditure survey
// and ICMR-NIN dietary guidelines. Exact consumption rankings are approximate
// since no single authoritative source ranks all dishes.
export const consumptionGap: ConsumptionGap[] = [
  { dishId: 'biryani', searchRank: 1, consumptionRank: 12, note: 'Most searched, but a weekend indulgence for most families' },
  { dishId: 'roti', searchRank: 2, consumptionRank: 1, note: 'India\'s most consumed food is also its #2 search — people want to perfect the basics' },
  { dishId: 'dosa', searchRank: 3, consumptionRank: 5, note: 'High on both — genuinely loved and genuinely eaten' },
  { dishId: 'idli', searchRank: 4, consumptionRank: 4, note: 'Daily breakfast for 200 million+, and people search for variations' },
  { dishId: 'samosa', searchRank: 7, consumptionRank: 8, note: 'Street food icon — both eaten and searched' },
  { dishId: 'khichdi', searchRank: 8, consumptionRank: 3, note: 'Comfort food staple — eaten far more than searched' },
  { dishId: 'pav-bhaji', searchRank: 11, consumptionRank: 14, note: 'Mumbai\'s pride — more aspiration than daily meal' },
  { dishId: 'gulab-jamun', searchRank: 12, consumptionRank: 16, note: 'Festival sweet — searched seasonally' },
  { dishId: 'momos', searchRank: 5, consumptionRank: 20, note: 'Trending street food — high curiosity, regional consumption' },
  { dishId: 'masala-chai', searchRank: 28, consumptionRank: 1, note: 'India drinks 800M+ cups daily — too routine to search' },
  { dishId: 'poha', searchRank: 9, consumptionRank: 7, note: 'Central India\'s breakfast — moderate search, high consumption' },
  { dishId: 'dal-rice', searchRank: 22, consumptionRank: 2, note: 'Nobody Googles what they eat every single day' },
  { dishId: 'paneer-tikka', searchRank: 20, consumptionRank: 15, note: 'Party dish — searched for recipes, not daily food' },
  { dishId: 'rasam', searchRank: 25, consumptionRank: 6, note: 'South Indian staple, eaten daily, never trending' },
  { dishId: 'butter-chicken', searchRank: 19, consumptionRank: 18, note: 'Restaurant favorite — lower search rank than expected because people eat out for it' },
];
