#!/usr/bin/env python3
"""Check database entries and verify they're retrievable"""

from db_storage import get_all_entries

entries = get_all_entries()
print(f"Total entries in database: {len(entries)}")

if entries:
    print(f"\nUnique dates: {len(set(e.get('date') for e in entries))}")
    print("\nAll entries:")
    for i, entry in enumerate(entries, 1):
        print(f"\nEntry {i}:")
        print(f"  Date: {entry.get('date')}")
        print(f"  Morning Meal: {entry.get('morning_meal', 'N/A')[:50]}")
        print(f"  Exercise: {entry.get('exercise_minutes', 0)} min")
        print(f"  Wellness Score: {entry.get('wellness_score', 0)}")
        print(f"  Sleep Hours: {entry.get('sleep_hours', 0)}")
        print(f"  Stress (M/A/N): {entry.get('stress_morning', 0)}/{entry.get('stress_afternoon', 0)}/{entry.get('stress_night', 0)}")
    
    # Check if we have enough for trends
    print(f"\nTrends Check:")
    print(f"  Need: 3 entries")
    print(f"  Have: {len(entries)} entries")
    if len(entries) >= 3:
        print("  [OK] Can show trends")
    else:
        print(f"  [WARNING] Need {3 - len(entries)} more entries for trends")
    
    # Check if we have enough for cycle prediction
    print(f"\nCycle Prediction Check:")
    period_entries = [e for e in entries if e.get('on_period', False)]
    print(f"  Period entries: {len(period_entries)}")
    if len(period_entries) >= 2:
        print("  [OK] Can predict cycle")
    else:
        print(f"  [WARNING] Need at least 2 periods tracked")
    
    # Check for weekly report
    print(f"\nWeekly Report Check:")
    print(f"  Need: 3 entries")
    print(f"  Have: {len(entries)} entries")
    if len(entries) >= 3:
        print("  [OK] Can generate weekly report")
    else:
        print(f"  [WARNING] Need {3 - len(entries)} more entries")
    
    print(f"\nIMPORTANT:")
    print(f"  - Saving entries for the SAME DATE will UPDATE the existing entry")
    print(f"  - To create multiple entries, save entries for DIFFERENT DATES")
    print(f"  - You currently have entries for {len(set(e.get('date') for e in entries))} unique date(s)")
else:
    print("\n❌ No entries found in database!")

