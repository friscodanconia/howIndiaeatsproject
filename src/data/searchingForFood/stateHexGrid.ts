import { StateHex } from './types';

// Hex grid layout for Indian states — arranged to approximate India's geography
// Even rows are offset to the right by half a hex width
export const stateHexGrid: StateHex[] = [
  // Row 0 — far north
  { id: 'JK', name: 'Jammu & Kashmir', abbreviation: 'JK', row: 0, col: 1 },
  { id: 'LA', name: 'Ladakh', abbreviation: 'LA', row: 0, col: 2 },

  // Row 1
  { id: 'HP', name: 'Himachal Pradesh', abbreviation: 'HP', row: 1, col: 1 },
  { id: 'PB', name: 'Punjab', abbreviation: 'PB', row: 1, col: 0 },
  { id: 'UK', name: 'Uttarakhand', abbreviation: 'UK', row: 1, col: 2 },

  // Row 2
  { id: 'HR', name: 'Haryana', abbreviation: 'HR', row: 2, col: 0 },
  { id: 'DL', name: 'Delhi', abbreviation: 'DL', row: 2, col: 1 },
  { id: 'UP', name: 'Uttar Pradesh', abbreviation: 'UP', row: 2, col: 2 },
  { id: 'SK', name: 'Sikkim', abbreviation: 'SK', row: 2, col: 4 },

  // Row 3
  { id: 'RJ', name: 'Rajasthan', abbreviation: 'RJ', row: 3, col: 0 },
  { id: 'MP', name: 'Madhya Pradesh', abbreviation: 'MP', row: 3, col: 1 },
  { id: 'BR', name: 'Bihar', abbreviation: 'BR', row: 3, col: 3 },
  { id: 'AR', name: 'Arunachal Pradesh', abbreviation: 'AR', row: 3, col: 5 },
  { id: 'NL', name: 'Nagaland', abbreviation: 'NL', row: 3, col: 6 },

  // Row 4
  { id: 'GJ', name: 'Gujarat', abbreviation: 'GJ', row: 4, col: 0 },
  { id: 'CG', name: 'Chhattisgarh', abbreviation: 'CG', row: 4, col: 2 },
  { id: 'JH', name: 'Jharkhand', abbreviation: 'JH', row: 4, col: 3 },
  { id: 'WB', name: 'West Bengal', abbreviation: 'WB', row: 4, col: 4 },
  { id: 'AS', name: 'Assam', abbreviation: 'AS', row: 4, col: 5 },
  { id: 'MN', name: 'Manipur', abbreviation: 'MN', row: 4, col: 6 },

  // Row 5
  { id: 'MH', name: 'Maharashtra', abbreviation: 'MH', row: 5, col: 1 },
  { id: 'OD', name: 'Odisha', abbreviation: 'OD', row: 5, col: 3 },
  { id: 'TS', name: 'Telangana', abbreviation: 'TS', row: 5, col: 2 },
  { id: 'ML', name: 'Meghalaya', abbreviation: 'ML', row: 5, col: 5 },
  { id: 'MZ', name: 'Mizoram', abbreviation: 'MZ', row: 5, col: 6 },
  { id: 'TR', name: 'Tripura', abbreviation: 'TR', row: 5, col: 7 },

  // Row 6
  { id: 'GA', name: 'Goa', abbreviation: 'GA', row: 6, col: 0 },
  { id: 'KA', name: 'Karnataka', abbreviation: 'KA', row: 6, col: 1 },
  { id: 'AP', name: 'Andhra Pradesh', abbreviation: 'AP', row: 6, col: 2 },

  // Row 7
  { id: 'KL', name: 'Kerala', abbreviation: 'KL', row: 7, col: 1 },
  { id: 'TN', name: 'Tamil Nadu', abbreviation: 'TN', row: 7, col: 2 },
];
