#!/usr/bin/env python3
"""
Pull real Google Trends data for Indian food dishes.
Writes static JSON files for the frontend.

Usage: python3 scripts/pull-trends-data.py
"""

import json
import time
import os
from pytrends.request import TrendReq

# Google Trends region codes for Indian states
# https://support.google.com/business/answer/6270107
INDIA_STATE_GEO = {
    'JK': 'IN-JK', 'LA': 'IN-LA', 'HP': 'IN-HP', 'PB': 'IN-PB',
    'UK': 'IN-UK', 'HR': 'IN-HR', 'DL': 'IN-DL', 'UP': 'IN-UP',
    'RJ': 'IN-RJ', 'MP': 'IN-MP', 'BR': 'IN-BR', 'SK': 'IN-SK',
    'AR': 'IN-AR', 'NL': 'IN-NL', 'GJ': 'IN-GJ', 'CG': 'IN-CG',
    'JH': 'IN-JH', 'WB': 'IN-WB', 'AS': 'IN-AS', 'MN': 'IN-MN',
    'MH': 'IN-MH', 'OD': 'IN-OR', 'TS': 'IN-TG', 'ML': 'IN-ML',
    'MZ': 'IN-MZ', 'TR': 'IN-TR', 'GA': 'IN-GA', 'KA': 'IN-KA',
    'AP': 'IN-AP', 'KL': 'IN-KL', 'TN': 'IN-TN',
}

STATE_NAMES = {
    'JK': 'Jammu & Kashmir', 'LA': 'Ladakh', 'HP': 'Himachal Pradesh',
    'PB': 'Punjab', 'UK': 'Uttarakhand', 'HR': 'Haryana', 'DL': 'Delhi',
    'UP': 'Uttar Pradesh', 'RJ': 'Rajasthan', 'MP': 'Madhya Pradesh',
    'BR': 'Bihar', 'SK': 'Sikkim', 'AR': 'Arunachal Pradesh',
    'NL': 'Nagaland', 'GJ': 'Gujarat', 'CG': 'Chhattisgarh',
    'JH': 'Jharkhand', 'WB': 'West Bengal', 'AS': 'Assam',
    'MN': 'Manipur', 'MH': 'Maharashtra', 'OD': 'Odisha',
    'TS': 'Telangana', 'ML': 'Meghalaya', 'MZ': 'Mizoram',
    'TR': 'Tripura', 'GA': 'Goa', 'KA': 'Karnataka',
    'AP': 'Andhra Pradesh', 'KL': 'Kerala', 'TN': 'Tamil Nadu',
}

# Dishes to search — use the actual search terms people type
DISH_SEARCHES = {
    'biryani': 'biryani',
    'butter-chicken': 'butter chicken',
    'dosa': 'dosa',
    'paneer-tikka': 'paneer tikka',
    'samosa': 'samosa',
    'chole-bhature': 'chole bhature',
    'dal-makhani': 'dal makhani',
    'idli': 'idli',
    'pav-bhaji': 'pav bhaji',
    'tandoori-chicken': 'tandoori chicken',
    'gulab-jamun': 'gulab jamun',
    'vada-pav': 'vada pav',
    'momos': 'momos',
    'rasgulla': 'rasgulla',
    'poha': 'poha',
    'rogan-josh': 'rogan josh',
    'masala-chai': 'masala chai',
    'fish-curry': 'fish curry',
    'dal-rice': 'dal rice',
    'roti': 'roti recipe',
    'pani-puri': 'pani puri',
    'khichdi': 'khichdi',
    'dhokla': 'dhokla',
    'dal-bati': 'dal bati',
    'litti-chokha': 'litti chokha',
    'vindaloo': 'vindaloo',
    'pulihora': 'pulihora',
}

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'searchingForFood')

def pull_national_trends():
    """Pull national-level relative search volumes for all dishes."""
    pytrends = TrendReq(hl='en-IN', tz=330)

    # Google Trends allows max 5 keywords at once
    # We need to chain comparisons using a common anchor (biryani)
    anchor = 'biryani'
    dish_ids = list(DISH_SEARCHES.keys())

    results = {}

    # First, get biryani baseline
    results[anchor] = 100

    # Process in batches of 4 (+ anchor)
    non_anchor = [d for d in dish_ids if d != anchor]

    for i in range(0, len(non_anchor), 4):
        batch = non_anchor[i:i+4]
        keywords = [anchor] + [DISH_SEARCHES[d] for d in batch]

        print(f"  National batch: {keywords}")

        try:
            pytrends.build_payload(keywords, cat=71, timeframe='today 5-y', geo='IN')
            data = pytrends.interest_over_time()

            if data.empty:
                print(f"  WARNING: No data for {keywords}")
                for d in batch:
                    results[d] = 0
                continue

            # Get average values
            anchor_avg = data[anchor].mean()
            if anchor_avg == 0:
                anchor_avg = 1

            for d in batch:
                search_term = DISH_SEARCHES[d]
                if search_term in data.columns:
                    avg = data[search_term].mean()
                    # Scale relative to biryani = 100
                    results[d] = round(avg / anchor_avg * 100)
                else:
                    results[d] = 0

        except Exception as e:
            print(f"  ERROR: {e}")
            for d in batch:
                results[d] = 0

        time.sleep(15)  # Rate limiting

    # Sort by volume descending
    sorted_dishes = sorted(results.items(), key=lambda x: x[1], reverse=True)

    national = []
    for rank, (dish_id, volume) in enumerate(sorted_dishes, 1):
        national.append({
            'dishId': dish_id,
            'searchVolume': volume,
            'rank': rank,
        })

    return national


def pull_state_trends():
    """Pull state-level data — top dishes per state."""
    pytrends = TrendReq(hl='en-IN', tz=330)

    # For each state, find the top dishes
    # We'll query the top 15 most popular dishes nationally in groups
    top_dishes = [
        'biryani', 'butter-chicken', 'dosa', 'paneer-tikka', 'samosa',
        'chole-bhature', 'vada-pav', 'momos', 'poha', 'idli',
        'pav-bhaji', 'fish-curry', 'dhokla', 'dal-bati', 'litti-chokha',
        'rogan-josh', 'dal-makhani', 'masala-chai', 'vindaloo', 'pulihora',
    ]

    state_data = {}

    for state_id, geo_code in INDIA_STATE_GEO.items():
        print(f"\n  State: {state_id} ({geo_code})")
        state_results = {}

        # Query in batches of 5
        for i in range(0, len(top_dishes), 5):
            batch = top_dishes[i:i+5]
            keywords = [DISH_SEARCHES[d] for d in batch]

            try:
                pytrends.build_payload(keywords, cat=71, timeframe='today 5-y', geo=geo_code)
                data = pytrends.interest_over_time()

                if data.empty:
                    continue

                for d in batch:
                    term = DISH_SEARCHES[d]
                    if term in data.columns:
                        state_results[d] = round(data[term].mean())

            except Exception as e:
                print(f"    ERROR batch {batch}: {e}")

            time.sleep(12)  # Rate limiting

        # Get top 3 dishes for this state
        sorted_dishes_state = sorted(state_results.items(), key=lambda x: x[1], reverse=True)
        top3 = sorted_dishes_state[:3]

        if not top3:
            print(f"    WARNING: No data for {state_id}")
            continue

        # Normalize: top dish = 100
        max_vol = top3[0][1] if top3[0][1] > 0 else 1

        state_data[state_id] = {
            'stateId': state_id,
            'stateName': STATE_NAMES[state_id],
            'topDishes': [
                {
                    'dishId': dish_id,
                    'volume': round(vol / max_vol * 100),
                    'rank': rank + 1,
                }
                for rank, (dish_id, vol) in enumerate(top3)
            ],
        }

    return list(state_data.values())


def write_ts_file(filename, var_name, type_name, data):
    """Write a TypeScript data file."""
    path = os.path.join(OUT_DIR, filename)
    json_str = json.dumps(data, indent=2, ensure_ascii=False)

    content = f"""import {{ {type_name} }} from './types';

// Auto-generated from Google Trends data via scripts/pull-trends-data.py
export const {var_name}: {type_name}[] = {json_str};
"""

    with open(path, 'w') as f:
        f.write(content)

    print(f"Wrote {path}")


def main():
    print("=== Pulling Google Trends data for Indian food dishes ===\n")

    print("1. National trends...")
    national = pull_national_trends()
    write_ts_file('nationalTrends.ts', 'nationalTrends', 'NationalTrend', national)

    print("\n2. State trends...")
    state_trends = pull_state_trends()
    write_ts_file('stateTrends.ts', 'stateTrends', 'StateTrend', state_trends)

    print("\n=== Done! ===")
    print(f"National: {len(national)} dishes ranked")
    print(f"States: {len(state_trends)} states with top dishes")


if __name__ == '__main__':
    main()
