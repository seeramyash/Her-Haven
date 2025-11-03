from database import get_db, close_db, WellnessEntry, UserProfile
from datetime import datetime
from sqlalchemy import desc

def save_wellness_entry(entry_data, user_id='default_user'):
    """Save a wellness entry to the database"""
    db = get_db()
    
    try:
        # Convert timestamp string to datetime object if present
        if 'timestamp' in entry_data and isinstance(entry_data['timestamp'], str):
            try:
                entry_data['timestamp'] = datetime.fromisoformat(entry_data['timestamp'])
            except (ValueError, TypeError):
                # If parsing fails, use current time
                entry_data['timestamp'] = datetime.utcnow()
        
        existing = db.query(WellnessEntry).filter(
            WellnessEntry.date == entry_data['date'],
            WellnessEntry.user_id == user_id
        ).first()
        
        if existing:
            # Get valid column names from the model
            from sqlalchemy import inspect as sql_inspect
            mapper = sql_inspect(WellnessEntry)
            valid_columns = {col.key for col in mapper.columns}
            
            # Fields to skip (internal/metadata fields)
            skip_fields = {'user_id', 'id'}
            
            updated_fields = []
            for key, value in entry_data.items():
                # Skip internal fields
                if key in skip_fields:
                    continue
                
                # Skip if not a valid database column
                if key not in valid_columns:
                    continue
                    
                # Convert timestamp if needed
                if key == 'timestamp' and isinstance(value, str):
                    try:
                        value = datetime.fromisoformat(value)
                    except (ValueError, TypeError):
                        value = datetime.utcnow()
                
                # Update the field
                try:
                    old_value = getattr(existing, key, None)
                    setattr(existing, key, value)
                    if old_value != value:
                        updated_fields.append(key)
                except Exception as e:
                    print(f"Warning: Could not update {key}: {e}")
                    continue
            
            db.commit()
            db.refresh(existing)
            return existing
        else:
            db_entry = WellnessEntry(
                user_id=user_id,
                **entry_data
            )
            db.add(db_entry)
            db.commit()
            db.refresh(db_entry)
            return db_entry
            
    except Exception as e:
        db.rollback()
        raise e
    finally:
        close_db(db)

def get_all_entries(user_id='default_user'):
    """Get all wellness entries for a user"""
    db = get_db()
    
    try:
        entries = db.query(WellnessEntry).filter(
            WellnessEntry.user_id == user_id
        ).order_by(WellnessEntry.date).all()
        
        result = []
        for entry in entries:
            entry_dict = {
                'date': entry.date,
                'timestamp': entry.timestamp.isoformat() if entry.timestamp else entry.date,
                'breakfast': entry.breakfast or '',
                'lunch': entry.lunch or '',
                'dinner': entry.dinner or '',
                'snacks': entry.snacks or '',
                'morning_meal': entry.morning_meal or '',
                'afternoon_meal': entry.afternoon_meal or '',
                'night_meal': entry.night_meal or '',
                'stress_morning': entry.stress_morning,
                'stress_afternoon': entry.stress_afternoon,
                'stress_night': entry.stress_night,
                # Also include frontend field names for compatibility
                'morning_stress': entry.stress_morning,
                'afternoon_stress': entry.stress_afternoon,
                'night_stress': entry.stress_night,
                'average_stress': entry.average_stress,
                'exercise_minutes': entry.exercise_minutes,
                'water_intake': entry.water_intake,
                'sleep_hours': entry.sleep_hours,
                'sleep_quality': entry.sleep_quality,
                'on_period': entry.on_period,
                'period_day': entry.period_day,
                'cycle_phase': entry.cycle_phase or '',
                'symptoms': entry.symptoms or {},
                'notes': entry.notes or '',
                'additional_notes': entry.additional_notes or '',
                'wellness_score': entry.wellness_score,
                'sentiment_score': entry.sentiment_score,
                'predicted_energy': entry.predicted_energy
            }
            result.append(entry_dict)
        return result
        
    finally:
        close_db(db)

def get_recent_entries(user_id='default_user', limit=30):
    """Get recent wellness entries"""
    db = get_db()
    
    try:
        entries = db.query(WellnessEntry).filter(
            WellnessEntry.user_id == user_id
        ).order_by(desc(WellnessEntry.date)).limit(limit).all()
        
        result = []
        for entry in reversed(entries):
            entry_dict = {
                'date': entry.date,
                'timestamp': entry.timestamp.isoformat() if entry.timestamp else entry.date,
                'breakfast': entry.breakfast or '',
                'lunch': entry.lunch or '',
                'dinner': entry.dinner or '',
                'snacks': entry.snacks or '',
                'morning_meal': entry.morning_meal or '',
                'afternoon_meal': entry.afternoon_meal or '',
                'night_meal': entry.night_meal or '',
                'stress_morning': entry.stress_morning,
                'stress_afternoon': entry.stress_afternoon,
                'stress_night': entry.stress_night,
                # Also include frontend field names for compatibility
                'morning_stress': entry.stress_morning,
                'afternoon_stress': entry.stress_afternoon,
                'night_stress': entry.stress_night,
                'average_stress': entry.average_stress,
                'exercise_minutes': entry.exercise_minutes,
                'water_intake': entry.water_intake,
                'sleep_hours': entry.sleep_hours,
                'sleep_quality': entry.sleep_quality,
                'on_period': entry.on_period,
                'period_day': entry.period_day,
                'cycle_phase': entry.cycle_phase or '',
                'symptoms': entry.symptoms or {},
                'notes': entry.notes or '',
                'additional_notes': entry.additional_notes or '',
                'wellness_score': entry.wellness_score,
                'sentiment_score': entry.sentiment_score,
                'predicted_energy': entry.predicted_energy
            }
            result.append(entry_dict)
        return result
        
    finally:
        close_db(db)

def delete_entry(date, user_id='default_user'):
    """Delete a wellness entry by date"""
    db = get_db()
    
    try:
        entry = db.query(WellnessEntry).filter(
            WellnessEntry.date == date,
            WellnessEntry.user_id == user_id
        ).first()
        
        if entry:
            db.delete(entry)
            db.commit()
            return True
        return False
        
    except Exception as e:
        db.rollback()
        raise e
    finally:
        close_db(db)

def get_user_profile(user_id='default_user'):
    """Get user profile"""
    db = get_db()
    
    try:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        
        if not profile:
            profile = UserProfile(
                user_id=user_id,
                average_cycle_length=28,
                preferences={}
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        
        return {
            'user_id': profile.user_id,
            'average_cycle_length': profile.average_cycle_length,
            'last_period_start': profile.last_period_start,
            'preferences': profile.preferences or {}
        }
        
    finally:
        close_db(db)

def update_user_profile(profile_data, user_id='default_user'):
    """Update user profile"""
    db = get_db()
    
    try:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        
        if not profile:
            profile = UserProfile(user_id=user_id)
            db.add(profile)
        
        for key, value in profile_data.items():
            if hasattr(profile, key):
                setattr(profile, key, value)
        
        profile.last_updated = datetime.utcnow()
        db.commit()
        
        return True
        
    except Exception as e:
        db.rollback()
        raise e
    finally:
        close_db(db)
