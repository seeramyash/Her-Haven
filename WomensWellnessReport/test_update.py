#!/usr/bin/env python3
"""Test update functionality"""

from datetime import datetime
from db_storage import save_wellness_entry, get_all_entries

# Get current entry
entries = get_all_entries()
print(f"Current entries: {len(entries)}")

if entries:
    latest = entries[-1]
    print(f"\nBefore update:")
    print(f"  morning_meal: {latest.get('morning_meal')}")
    print(f"  exercise_minutes: {latest.get('exercise_minutes')}")
    print(f"  wellness_score: {latest.get('wellness_score')}")
    
    # Update with new values
    test_entry = {
        'date': latest['date'],  # Same date to trigger update
        'morning_meal': 'UPDATED BREAKFAST - ' + datetime.now().strftime("%H:%M:%S"),
        'afternoon_meal': 'Updated Lunch',
        'night_meal': 'Updated Dinner',
        'stress_morning': 8,
        'stress_afternoon': 8,
        'stress_night': 8,
        'exercise_minutes': 60,
        'water_intake': 3500,
        'sleep_hours': 9.0,
        'sleep_quality': 9.0,
        'on_period': False,
        'symptoms': {},
        'additional_notes': 'UPDATE TEST - ' + datetime.now().strftime("%H:%M:%S"),
        'wellness_score': 95.0,
        'timestamp': datetime.now().isoformat()
    }
    
    print("\nSaving update...")
    saved = save_wellness_entry(test_entry)
    
    # Verify update
    entries_after = get_all_entries()
    if entries_after:
        updated = entries_after[-1]
        print(f"\nAfter update:")
        print(f"  morning_meal: {updated.get('morning_meal')}")
        print(f"  exercise_minutes: {updated.get('exercise_minutes')}")
        print(f"  wellness_score: {updated.get('wellness_score')}")
        print(f"  water_intake: {updated.get('water_intake')}")
        
        # Check if update worked
        if updated.get('morning_meal') == test_entry['morning_meal']:
            print("\n[OK] UPDATE WORKING - morning_meal updated correctly!")
        else:
            print(f"\n[FAIL] UPDATE FAILED - morning_meal not updated. Expected: {test_entry['morning_meal']}, Got: {updated.get('morning_meal')}")
        
        if updated.get('exercise_minutes') == test_entry['exercise_minutes']:
            print("[OK] UPDATE WORKING - exercise_minutes updated correctly!")
        else:
            print(f"[FAIL] UPDATE FAILED - exercise_minutes not updated")
else:
    print("No entries to update")

