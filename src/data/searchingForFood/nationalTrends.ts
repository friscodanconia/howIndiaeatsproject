import { NationalTrend } from './types';

// Real Google Trends data (India, 5-year average, relative to biryani=100)
// Pulled via pytrends on 2026-02-13 using interest_over_time with geo='IN'
// Each dish compared head-to-head with biryani as anchor
export const nationalTrends: NationalTrend[] = [
  { "dishId": "biryani", "searchVolume": 100, "rank": 1 },
  { "dishId": "roti", "searchVolume": 50.9, "rank": 2 },
  { "dishId": "dosa", "searchVolume": 41.2, "rank": 3 },
  { "dishId": "idli", "searchVolume": 27.4, "rank": 4 },
  { "dishId": "momos", "searchVolume": 23.2, "rank": 5 },
  { "dishId": "jalebi", "searchVolume": 21.4, "rank": 6 },
  { "dishId": "samosa", "searchVolume": 15.7, "rank": 7 },
  { "dishId": "khichdi", "searchVolume": 13.4, "rank": 8 },
  { "dishId": "poha", "searchVolume": 12.2, "rank": 9 },
  { "dishId": "pani-puri", "searchVolume": 10.1, "rank": 10 },
  { "dishId": "pav-bhaji", "searchVolume": 10.0, "rank": 11 },
  { "dishId": "gulab-jamun", "searchVolume": 8.5, "rank": 12 },
  { "dishId": "vada-pav", "searchVolume": 7.2, "rank": 13 },
  { "dishId": "rasgulla", "searchVolume": 7.1, "rank": 14 },
  { "dishId": "ladoo", "searchVolume": 6.8, "rank": 15 },
  { "dishId": "dhokla", "searchVolume": 6.6, "rank": 16 },
  { "dishId": "chole-bhature", "searchVolume": 6.4, "rank": 17 },
  { "dishId": "modak", "searchVolume": 5.1, "rank": 18 },
  { "dishId": "butter-chicken", "searchVolume": 4.3, "rank": 19 },
  { "dishId": "paneer-tikka", "searchVolume": 3.9, "rank": 20 },
];
