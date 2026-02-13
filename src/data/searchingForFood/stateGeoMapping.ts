/**
 * Maps GeoJSON feature `ST_NM` property names to our 2-letter state IDs.
 * States not in our data (Andaman & Nicobar, Lakshadweep, Chandigarh, etc.)
 * are intentionally omitted — they won't be interactive on the map.
 */
export const stateGeoMapping: Record<string, string> = {
  'Jammu & Kashmir': 'JK',
  'Ladakh': 'LA',
  'Himachal Pradesh': 'HP',
  'Punjab': 'PB',
  'Uttarakhand': 'UK',
  'Haryana': 'HR',
  'Delhi': 'DL',
  'Uttar Pradesh': 'UP',
  'Rajasthan': 'RJ',
  'Madhya Pradesh': 'MP',
  'Bihar': 'BR',
  'Sikkim': 'SK',
  'Arunachal Pradesh': 'AR',
  'Nagaland': 'NL',
  'Gujarat': 'GJ',
  'Chhattisgarh': 'CG',
  'Jharkhand': 'JH',
  'West Bengal': 'WB',
  'Assam': 'AS',
  'Manipur': 'MN',
  'Maharashtra': 'MH',
  'Odisha': 'OD',
  'Telangana': 'TS',
  'Meghalaya': 'ML',
  'Mizoram': 'MZ',
  'Tripura': 'TR',
  'Goa': 'GA',
  'Karnataka': 'KA',
  'Andhra Pradesh': 'AP',
  'Kerala': 'KL',
  'Tamil Nadu': 'TN',
};
