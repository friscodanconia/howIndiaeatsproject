import { WeeklyPattern } from './types';

// Real Google Trends data — 7-day hourly data aggregated by day of week
// Pulled via pytrends on 2026-02-13, timeframe='now 7-d', geo='IN'
// Values normalized per dish (peak day = 100)
export const weeklyPatterns: WeeklyPattern[] = [
  { dishId: 'biryani', pattern: [69, 69, 74, 75, 77, 79, 100] },       // Peaks Sunday
  { dishId: 'dosa', pattern: [76, 76, 73, 78, 79, 87, 100] },          // Peaks Sunday
  { dishId: 'butter-chicken', pattern: [87, 70, 80, 100, 72, 48, 72] }, // Peaks Thursday
  { dishId: 'samosa', pattern: [91, 86, 84, 100, 78, 66, 74] },        // Peaks Thursday
  { dishId: 'pav-bhaji', pattern: [90, 85, 68, 100, 71, 73, 89] },     // Peaks Thursday
  { dishId: 'dal-rice', pattern: [91, 90, 100, 87, 78, 79, 90] },      // Peaks Wednesday
];
