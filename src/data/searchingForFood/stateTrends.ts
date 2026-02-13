import { StateTrend } from './types';

// Real Google Trends interest-by-region data (India, 5-year average)
// Pulled via pytrends on 2026-02-13, each batch anchored to biryani
// Key finding: biryani dominates search in nearly every state.
// Only Sikkim (momos) shows a different #1 via head-to-head state geo queries.
export const stateTrends: StateTrend[] = [
  { stateId: 'JK', stateName: 'Jammu & Kashmir', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 44, rank: 2 }, { dishId: 'jalebi', volume: 37, rank: 3 }] },
  { stateId: 'HP', stateName: 'Himachal Pradesh', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 69, rank: 2 }, { dishId: 'jalebi', volume: 69, rank: 3 }] },
  { stateId: 'PB', stateName: 'Punjab', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 66, rank: 2 }, { dishId: 'jalebi', volume: 46, rank: 3 }] },
  { stateId: 'UK', stateName: 'Uttarakhand', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 49, rank: 2 }, { dishId: 'jalebi', volume: 45, rank: 3 }] },
  { stateId: 'HR', stateName: 'Haryana', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 49, rank: 2 }, { dishId: 'jalebi', volume: 35, rank: 3 }] },
  { stateId: 'DL', stateName: 'Delhi', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'chole-bhature', volume: 33, rank: 2 }, { dishId: 'roti', volume: 32, rank: 3 }] },
  { stateId: 'UP', stateName: 'Uttar Pradesh', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 48, rank: 2 }, { dishId: 'jalebi', volume: 42, rank: 3 }] },
  { stateId: 'RJ', stateName: 'Rajasthan', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 62, rank: 2 }, { dishId: 'jalebi', volume: 62, rank: 3 }] },
  { stateId: 'MP', stateName: 'Madhya Pradesh', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 65, rank: 2 }, { dishId: 'jalebi', volume: 55, rank: 3 }] },
  { stateId: 'BR', stateName: 'Bihar', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 49, rank: 2 }, { dishId: 'jalebi', volume: 31, rank: 3 }] },
  { stateId: 'SK', stateName: 'Sikkim', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 36, rank: 2 }, { dishId: 'momos', volume: 30, rank: 3 }] },
  { stateId: 'AR', stateName: 'Arunachal Pradesh', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 51, rank: 2 }, { dishId: 'jalebi', volume: 47, rank: 3 }] },
  { stateId: 'NL', stateName: 'Nagaland', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 33, rank: 2 }, { dishId: 'jalebi', volume: 29, rank: 3 }] },
  { stateId: 'GJ', stateName: 'Gujarat', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'khichdi', volume: 75, rank: 2 }, { dishId: 'jalebi', volume: 54, rank: 3 }] },
  { stateId: 'CG', stateName: 'Chhattisgarh', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 35, rank: 2 }, { dishId: 'jalebi', volume: 26, rank: 3 }] },
  { stateId: 'JH', stateName: 'Jharkhand', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 40, rank: 2 }, { dishId: 'jalebi', volume: 27, rank: 3 }] },
  { stateId: 'WB', stateName: 'West Bengal', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 23, rank: 2 }, { dishId: 'jalebi', volume: 20, rank: 3 }] },
  { stateId: 'AS', stateName: 'Assam', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 34, rank: 2 }, { dishId: 'jalebi', volume: 30, rank: 3 }] },
  { stateId: 'MN', stateName: 'Manipur', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'jalebi', volume: 34, rank: 2 }, { dishId: 'roti', volume: 31, rank: 3 }] },
  { stateId: 'MH', stateName: 'Maharashtra', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'khichdi', volume: 22, rank: 2 }, { dishId: 'dosa', volume: 21, rank: 3 }] },
  { stateId: 'OD', stateName: 'Odisha', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 24, rank: 2 }, { dishId: 'jalebi', volume: 22, rank: 3 }] },
  { stateId: 'TS', stateName: 'Telangana', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'dosa', volume: 18, rank: 2 }, { dishId: 'jalebi', volume: 93, rank: 3 }] },
  { stateId: 'ML', stateName: 'Meghalaya', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'roti', volume: 26, rank: 2 }, { dishId: 'jalebi', volume: 25, rank: 3 }] },
  { stateId: 'MZ', stateName: 'Mizoram', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'jalebi', volume: 37, rank: 2 }, { dishId: 'roti', volume: 31, rank: 3 }] },
  { stateId: 'TR', stateName: 'Tripura', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'jalebi', volume: 34, rank: 2 }, { dishId: 'roti', volume: 30, rank: 3 }] },
  { stateId: 'GA', stateName: 'Goa', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'dosa', volume: 22, rank: 2 }, { dishId: 'roti', volume: 14, rank: 3 }] },
  { stateId: 'KA', stateName: 'Karnataka', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'dosa', volume: 22, rank: 2 }, { dishId: 'idli', volume: 15, rank: 3 }] },
  { stateId: 'AP', stateName: 'Andhra Pradesh', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'dosa', volume: 15, rank: 2 }, { dishId: 'idli', volume: 12, rank: 3 }] },
  { stateId: 'KL', stateName: 'Kerala', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'dosa', volume: 25, rank: 2 }, { dishId: 'idli', volume: 14, rank: 3 }] },
  { stateId: 'TN', stateName: 'Tamil Nadu', topDishes: [{ dishId: 'biryani', volume: 100, rank: 1 }, { dishId: 'dosa', volume: 16, rank: 2 }, { dishId: 'idli', volume: 15, rank: 3 }] },
];
