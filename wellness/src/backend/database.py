import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Use SQLite for local development, PostgreSQL if DATABASE_URL is provided
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    # Get the project root directory (2 levels up from this file)
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    db_path = os.path.join(project_root, 'wellness.db')
    DATABASE_URL = f'sqlite:///{db_path}'

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class WellnessEntry(Base):
    __tablename__ = 'wellness_entries'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, default='default_user')
    date = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    breakfast = Column(String)
    lunch = Column(String)
    dinner = Column(String)
    snacks = Column(String)
    
    # Alternative meal names for compatibility
    morning_meal = Column(String)
    afternoon_meal = Column(String)
    night_meal = Column(String)
    
    stress_morning = Column(Float)
    stress_afternoon = Column(Float)
    stress_night = Column(Float)
    average_stress = Column(Float)
    
    exercise_minutes = Column(Integer)
    water_intake = Column(Integer)
    sleep_hours = Column(Float)
    sleep_quality = Column(Float)  # Changed from String to Float
    additional_notes = Column(Text)  # Add this field for compatibility
    
    on_period = Column(Boolean, default=False)
    period_day = Column(Integer)
    cycle_phase = Column(String)
    
    symptoms = Column(JSON)
    
    notes = Column(Text)
    
    wellness_score = Column(Float)
    sentiment_score = Column(Float)
    predicted_energy = Column(Float)

class UserProfile(Base):
    __tablename__ = 'user_profiles'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    average_cycle_length = Column(Integer, default=28)
    last_period_start = Column(String)
    
    preferences = Column(JSON)

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        return db
    finally:
        pass

def close_db(db):
    """Close database session"""
    db.close()
