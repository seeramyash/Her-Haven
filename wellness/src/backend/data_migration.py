import json
import os
from datetime import datetime
from database import init_db, get_db, close_db, WellnessEntry, UserProfile
from sqlalchemy import text

def migrate_json_to_db(json_file='wellness_data.json'):
    """Migrate data from JSON file to PostgreSQL database"""
    
    print("Initializing database...")
    init_db()
    
    if not os.path.exists(json_file):
        print(f"No {json_file} found. Starting with empty database.")
        return
    
    print(f"Loading data from {json_file}...")
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    db = get_db()
    
    try:
        entries = data.get('entries', [])
        print(f"Found {len(entries)} entries to migrate...")
        
        migrated = 0
        for entry in entries:
            existing = db.query(WellnessEntry).filter(
                WellnessEntry.date == entry['date'],
                WellnessEntry.user_id == 'default_user'
            ).first()
            
            if existing:
                print(f"Entry for {entry['date']} already exists. Skipping...")
                continue
            
            db_entry = WellnessEntry(
                user_id='default_user',
                date=entry['date'],
                timestamp=datetime.fromisoformat(entry['timestamp']) if 'timestamp' in entry else datetime.utcnow(),
                breakfast=entry.get('breakfast', ''),
                lunch=entry.get('lunch', ''),
                dinner=entry.get('dinner', ''),
                snacks=entry.get('snacks', ''),
                morning_meal=entry.get('morning_meal', ''),
                afternoon_meal=entry.get('afternoon_meal', ''),
                night_meal=entry.get('night_meal', ''),
                stress_morning=entry.get('morning_stress', entry.get('stress_morning', 0)),
                stress_afternoon=entry.get('afternoon_stress', entry.get('stress_afternoon', 0)),
                stress_night=entry.get('night_stress', entry.get('stress_night', 0)),
                average_stress=entry.get('average_stress', 0),
                exercise_minutes=entry.get('exercise_minutes', 0),
                water_intake=entry.get('water_intake', 0),
                sleep_hours=entry.get('sleep_hours', 0),
                sleep_quality=entry.get('sleep_quality', 7),
                on_period=entry.get('on_period', False),
                period_day=entry.get('period_day', 0),
                cycle_phase=entry.get('cycle_phase', ''),
                symptoms=entry.get('symptoms', {}),
                notes=entry.get('notes', ''),
                additional_notes=entry.get('additional_notes', ''),
                wellness_score=entry.get('wellness_score', 0),
                sentiment_score=entry.get('sentiment_score', 0),
                predicted_energy=entry.get('predicted_energy', 0)
            )
            
            db.add(db_entry)
            migrated += 1
        
        db.commit()
        print(f"Successfully migrated {migrated} entries to database!")
        
        user_profile = db.query(UserProfile).filter(UserProfile.user_id == 'default_user').first()
        if not user_profile:
            user_profile = UserProfile(
                user_id='default_user',
                average_cycle_length=28,
                preferences={}
            )
            db.add(user_profile)
            db.commit()
            print("Created default user profile.")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
        raise
    finally:
        close_db(db)
    
    print("Migration complete!")

def export_db_to_json(json_file='wellness_data_backup.json'):
    """Export database to JSON file (backup)"""
    
    db = get_db()
    
    try:
        entries = db.query(WellnessEntry).filter(WellnessEntry.user_id == 'default_user').order_by(WellnessEntry.date).all()
        
        data = {
            'entries': [
                {
                    'date': entry.date,
                    'timestamp': entry.timestamp.isoformat(),
                    'breakfast': entry.breakfast,
                    'lunch': entry.lunch,
                    'dinner': entry.dinner,
                    'snacks': entry.snacks,
                    'stress_morning': entry.stress_morning,
                    'stress_afternoon': entry.stress_afternoon,
                    'stress_night': entry.stress_night,
                    'average_stress': entry.average_stress,
                    'exercise_minutes': entry.exercise_minutes,
                    'water_intake': entry.water_intake,
                    'sleep_hours': entry.sleep_hours,
                    'sleep_quality': entry.sleep_quality,
                    'on_period': entry.on_period,
                    'period_day': entry.period_day,
                    'cycle_phase': entry.cycle_phase,
                    'symptoms': entry.symptoms,
                    'notes': entry.notes,
                    'wellness_score': entry.wellness_score,
                    'sentiment_score': entry.sentiment_score,
                    'predicted_energy': entry.predicted_energy
                }
                for entry in entries
            ]
        }
        
        with open(json_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"Exported {len(entries)} entries to {json_file}")
        
    finally:
        close_db(db)

if __name__ == "__main__":
    migrate_json_to_db()
