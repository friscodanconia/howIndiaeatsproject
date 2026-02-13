import { SeasonalTrend } from './types';

// Real Google Trends data — 5-year monthly averages, normalized per dish (peak month = 100)
// Pulled via pytrends on 2026-02-13, timeframe='today 5-y', geo='IN'
export const seasonalTrends: SeasonalTrend[] = [
  {
    dishId: 'biryani',
    monthly: [92, 90, 93, 95, 97, 97, 96, 92, 89, 92, 91, 100],
    festivals: [{ month: 3, name: 'Ramadan / Eid season' }, { month: 11, name: 'Wedding season' }],
  },
  {
    dishId: 'modak',
    monthly: [17, 16, 14, 14, 14, 15, 20, 80, 100, 16, 14, 14],
    festivals: [{ month: 8, name: 'Ganesh Chaturthi' }],
  },
  {
    dishId: 'ladoo',
    monthly: [100, 54, 44, 42, 41, 44, 51, 76, 66, 89, 65, 62],
    festivals: [{ month: 0, name: 'Makar Sankranti' }, { month: 9, name: 'Diwali / Navratri' }],
  },
  {
    dishId: 'haleem',
    monthly: [19, 26, 100, 99, 31, 14, 16, 14, 12, 13, 15, 17],
    festivals: [{ month: 2, name: 'Ramadan' }],
  },
  {
    dishId: 'gulab-jamun',
    monthly: [61, 61, 69, 54, 65, 59, 61, 71, 57, 100, 69, 62],
    festivals: [{ month: 9, name: 'Diwali' }],
  },
  {
    dishId: 'masala-chai',
    monthly: [96, 79, 71, 63, 66, 66, 75, 71, 74, 70, 94, 100],
    festivals: [{ month: 11, name: 'Winter peak' }],
  },
  {
    dishId: 'pani-puri',
    monthly: [78, 79, 79, 78, 88, 85, 100, 76, 72, 72, 75, 76],
    festivals: [{ month: 6, name: 'Monsoon / summer peak' }],
  },
  {
    dishId: 'jalebi',
    monthly: [39, 36, 35, 67, 100, 55, 37, 37, 35, 39, 57, 39],
    festivals: [{ month: 4, name: 'Akshaya Tritiya / Ramadan' }],
  },
];
