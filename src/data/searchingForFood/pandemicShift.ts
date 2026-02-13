import { PandemicShift } from './types';

// Real Google Trends data — 2019 vs 2021, pulled in single 2018-2022 query for consistent normalization
// Pulled via pytrends on 2026-02-13, geo='IN'
// Values normalized per dish (peak month across both years = 100)
export const pandemicShifts: PandemicShift[] = [
  {
    dishId: 'biryani',
    pre:  [73, 70, 70, 73, 79, 83, 80, 82, 76, 85, 82, 98],
    post: [85, 85, 86, 87, 100, 93, 92, 81, 75, 80, 76, 90],
    changePercent: 8,
  },
  {
    dishId: 'dosa',
    pre:  [84, 77, 72, 69, 71, 77, 84, 79, 81, 78, 80, 73],
    post: [83, 85, 82, 76, 100, 92, 86, 75, 72, 65, 68, 69],
    changePercent: 3,
  },
  {
    dishId: 'masala-chai',
    pre:  [56, 53, 48, 44, 45, 46, 55, 67, 58, 61, 67, 67],
    post: [100, 78, 82, 86, 97, 77, 75, 70, 72, 60, 85, 81],
    changePercent: 44,
  },
  {
    dishId: 'khichdi',
    pre:  [100, 79, 75, 58, 57, 59, 66, 70, 75, 63, 64, 66],
    post: [67, 49, 53, 58, 60, 51, 50, 47, 42, 44, 40, 43],
    changePercent: -27,
  },
  {
    dishId: 'dal-rice',
    pre:  [51, 51, 49, 52, 52, 57, 60, 65, 60, 56, 61, 56],
    post: [72, 73, 79, 77, 100, 95, 81, 73, 73, 63, 65, 62],
    changePercent: 36,
  },
  {
    dishId: 'samosa',
    pre:  [100, 89, 83, 78, 91, 75, 80, 85, 77, 74, 77, 71],
    post: [70, 63, 65, 77, 96, 78, 74, 66, 63, 59, 52, 63],
    changePercent: -16,
  },
];
