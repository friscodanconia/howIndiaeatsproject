export type DishCategory = 'rice' | 'bread' | 'curry' | 'snack' | 'sweet' | 'drink' | 'street-food' | 'lentil' | 'seafood';

export interface Dish {
  id: string;
  name: string;
  nameHindi?: string;
  category: DishCategory;
  region: string[];
  isVeg: boolean;
  color: string;
  funFact?: string;
  recipeUrl?: string;
}

export interface NationalTrend {
  dishId: string;
  searchVolume: number; // 0-100 relative
  rank: number;
}

export interface StateTrend {
  stateId: string;
  stateName: string;
  topDishes: { dishId: string; volume: number; rank: 1 | 2 | 3 }[];
}

export interface StateHex {
  id: string;
  name: string;
  abbreviation: string;
  row: number;
  col: number;
}

export interface WeeklyPattern {
  dishId: string;
  pattern: [number, number, number, number, number, number, number]; // Mon-Sun
}

export interface SeasonalTrend {
  dishId: string;
  monthly: number[]; // 12 values, Jan-Dec average over 5 years
  festivals?: { month: number; name: string }[];
}

export interface ConsumptionGap {
  dishId: string;
  searchRank: number;
  consumptionRank: number;
  note: string;
}

export interface PandemicShift {
  dishId: string;
  pre: number[]; // 12 monthly values (2019)
  post: number[]; // 12 monthly values (2021)
  changePercent: number;
}
