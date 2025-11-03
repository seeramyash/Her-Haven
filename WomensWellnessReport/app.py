import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os
from pathlib import Path

from ml_models import WellnessPredictor
from visualizations import create_wellness_dashboard, create_trend_charts
from recommendations import get_personalized_recommendations
from reports import generate_weekly_report, generate_monthly_report
from data_export import display_export_page
from database import init_db
from db_storage import get_all_entries, save_wellness_entry

st.set_page_config(
    page_title="Women's Wellness Tracker",
    page_icon="🌸",
    layout="wide",
    initial_sidebar_state="expanded"
)

init_db()

def load_data():
    """Load user wellness data from database"""
    entries = get_all_entries()
    return {"entries": entries}

def save_data(data):
    """Save user wellness data to database"""
    # Get the most recent entry from the data
    if data and 'entries' in data and len(data['entries']) > 0:
        entry = data['entries'][-1]  # Get the last entry
        try:
            save_wellness_entry(entry)
        except Exception as e:
            st.error(f"Error saving entry: {e}")

def initialize_session_state():
    """Initialize session state variables"""
    if 'data' not in st.session_state:
        st.session_state.data = load_data()
    if 'ml_predictor' not in st.session_state:
        st.session_state.ml_predictor = WellnessPredictor()

def main():
    initialize_session_state()
    
    st.markdown("""
    <style>
        .main-header {
            font-size: 2.5rem;
            color: #9B59B6;
            text-align: center;
            margin-bottom: 1rem;
        }
        .sub-header {
            color: #5DADE2;
            font-size: 1.5rem;
            margin-top: 1.5rem;
        }
        .metric-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 1.5rem;
            border-radius: 10px;
            color: white;
            margin: 1rem 0;
        }
        .stCheckbox label {
            font-size: 1.1rem;
        }
    </style>
    """, unsafe_allow_html=True)
    
    st.markdown('<p class="main-header">🌸 Women\'s Wellness Tracker</p>', unsafe_allow_html=True)
    st.markdown("##### Your AI-Powered Health Companion for Holistic Wellness")
    
    menu = st.sidebar.selectbox(
        "Navigation",
        ["📝 Daily Entry", "📊 Dashboard", "📈 Trends & Analytics", "🔮 Cycle Forecast", "📋 Weekly Report", "📅 Monthly Report", "💡 Recommendations", "📥 Export Data"]
    )
    
    if menu == "📝 Daily Entry":
        daily_entry_page()
    elif menu == "📊 Dashboard":
        dashboard_page()
    elif menu == "📈 Trends & Analytics":
        trends_page()
    elif menu == "🔮 Cycle Forecast":
        cycle_forecast_page()
    elif menu == "📋 Weekly Report":
        weekly_report_page()
    elif menu == "📅 Monthly Report":
        monthly_report_page()
    elif menu == "💡 Recommendations":
        recommendations_page()
    elif menu == "📥 Export Data":
        export_data_page()

def daily_entry_page():
    """Daily data entry form"""
    st.markdown('<p class="sub-header">Daily Wellness Entry</p>', unsafe_allow_html=True)
    st.write("Track your daily health metrics for personalized insights")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("🍽️ Nutrition")
        morning_meal = st.text_area("Morning Meal", placeholder="e.g., Oatmeal with berries, green tea")
        afternoon_meal = st.text_area("Afternoon Meal", placeholder="e.g., Grilled chicken salad, quinoa")
        night_meal = st.text_area("Night Meal", placeholder="e.g., Salmon, vegetables, brown rice")
        
        st.subheader("💧 Hydration & Sleep")
        water_intake = st.slider("Water Intake (ml)", 0, 5000, 2000, 100)
        sleep_hours = st.slider("Sleep Duration (hours)", 0.0, 12.0, 7.0, 0.5)
        sleep_quality = st.slider("Sleep Quality", 1, 10, 7)
    
    with col2:
        st.subheader("😌 Stress & Activity")
        morning_stress = st.slider("Morning Stress Level", 1, 10, 5, key="morning_stress")
        afternoon_stress = st.slider("Afternoon Stress Level", 1, 10, 5, key="afternoon_stress")
        night_stress = st.slider("Night Stress Level", 1, 10, 5, key="night_stress")
        
        exercise_minutes = st.number_input("Exercise Duration (minutes)", 0, 300, 30)
        
        st.subheader("🩸 Menstrual Cycle Tracking")
        on_period = st.checkbox("Currently Menstruating")
        
        symptoms = {}
        if on_period:
            st.write("**Select any symptoms you're experiencing:**")
            
            col_a, col_b = st.columns(2)
            with col_a:
                symptoms['headache'] = st.checkbox("Headache")
                symptoms['heavy_flow'] = st.checkbox("Heavy Blood Flow")
                symptoms['light_flow'] = st.checkbox("Light Blood Flow")
                symptoms['cramping'] = st.checkbox("Cramping")
                symptoms['bloating'] = st.checkbox("Bloating")
            
            with col_b:
                symptoms['mood_swings'] = st.checkbox("Mood Swings")
                symptoms['fatigue'] = st.checkbox("Fatigue")
                symptoms['nausea'] = st.checkbox("Nausea")
                symptoms['back_pain'] = st.checkbox("Back Pain")
                symptoms['breast_tenderness'] = st.checkbox("Breast Tenderness")
    
    st.subheader("📝 Additional Notes")
    additional_notes = st.text_area(
        "Anything else you'd like to share?",
        placeholder="Share any thoughts, feelings, or observations about your day...",
        height=100
    )
    
    if st.button("💾 Save Today's Entry", type="primary", use_container_width=True):
        entry = {
            'date': datetime.now().strftime("%Y-%m-%d"),
            'timestamp': datetime.now().isoformat(),
            'morning_meal': morning_meal,
            'afternoon_meal': afternoon_meal,
            'night_meal': night_meal,
            'morning_stress': morning_stress,
            'afternoon_stress': afternoon_stress,
            'night_stress': night_stress,
            'average_stress': (morning_stress + afternoon_stress + night_stress) / 3,
            'exercise_minutes': exercise_minutes,
            'water_intake': water_intake,
            'sleep_hours': sleep_hours,
            'sleep_quality': sleep_quality,
            'on_period': on_period,
            'symptoms': symptoms if on_period else {},
            'additional_notes': additional_notes
        }
        
        # Add ML predictions
        try:
            ml_insights = st.session_state.ml_predictor.predict_wellness(entry)
            entry['wellness_score'] = ml_insights['wellness_score']
            entry['sentiment_score'] = ml_insights['sentiment_score']
            entry['predicted_energy'] = ml_insights['predicted_energy']
        except Exception as e:
            entry['wellness_score'] = 0
            entry['sentiment_score'] = 0
            entry['predicted_energy'] = 0
        
        st.session_state.data['entries'].append(entry)
        save_data(st.session_state.data)
        
        # Train ML models if enough data is available
        total_entries = len(st.session_state.data['entries'])
        
        if total_entries >= 10 and not st.session_state.ml_predictor.is_xgb_trained:
            with st.spinner("🤖 Training XGBoost model with your data..."):
                success = st.session_state.ml_predictor.train_xgboost_model(st.session_state.data['entries'])
                if success:
                    st.info("✨ XGBoost model trained! Your wellness predictions are now powered by AI.")
        
        if total_entries >= 7 and not st.session_state.ml_predictor.is_lstm_trained:
            with st.spinner("🤖 Training LSTM model for time-series forecasting..."):
                result = st.session_state.ml_predictor.train_lstm_model(st.session_state.data['entries'])
                if result is not None:
                    st.info("✨ LSTM model trained! You'll now see AI-powered predictions in your reports.")
        
        st.success("✅ Entry saved successfully!")
        st.balloons()
        
        # Show quick insights
        model_status = ""
        if st.session_state.ml_predictor.is_xgb_trained:
            model_status = " (XGBoost AI-powered)"
        
        st.info(f"**Today's Wellness Score:** {entry['wellness_score']:.1f}/100{model_status}")
        if entry['sentiment_score'] > 0:
            st.success(f"**Mood Analysis:** Positive sentiment detected! 😊")
        elif entry['sentiment_score'] < 0:
            st.warning(f"**Mood Analysis:** You might be feeling stressed. Consider relaxation activities. 🧘")
        
        # Show ML model status
        if total_entries >= 3:
            with st.expander("🤖 ML Model Status"):
                col1, col2, col3 = st.columns(3)
                with col1:
                    if st.session_state.ml_predictor.is_xgb_trained:
                        st.success("✅ XGBoost Active")
                    else:
                        st.info(f"📊 XGBoost: {total_entries}/10 entries")
                
                with col2:
                    if st.session_state.ml_predictor.is_lstm_trained:
                        st.success("✅ LSTM Active")
                    else:
                        st.info(f"📈 LSTM: {total_entries}/7 entries")
                
                with col3:
                    st.success("✅ NLP Active")
                
                st.caption("AI models automatically train when you have enough data!")

def dashboard_page():
    """Display wellness dashboard"""
    st.markdown('<p class="sub-header">Your Wellness Dashboard</p>', unsafe_allow_html=True)
    
    if len(st.session_state.data['entries']) == 0:
        st.info("📝 No data yet. Start by adding your first daily entry!")
        return
    
    df = pd.DataFrame(st.session_state.data['entries'])
    
    # Recent stats
    col1, col2, col3, col4 = st.columns(4)
    
    recent_entries = df.tail(7)
    
    with col1:
        avg_wellness = recent_entries['wellness_score'].mean() if 'wellness_score' in recent_entries else 0
        st.metric("Avg Wellness Score (7d)", f"{avg_wellness:.1f}/100")
    
    with col2:
        avg_sleep = recent_entries['sleep_hours'].mean()
        st.metric("Avg Sleep (7d)", f"{avg_sleep:.1f}h")
    
    with col3:
        avg_exercise = recent_entries['exercise_minutes'].mean()
        st.metric("Avg Exercise (7d)", f"{avg_exercise:.0f}min")
    
    with col4:
        avg_stress = recent_entries['average_stress'].mean()
        st.metric("Avg Stress (7d)", f"{avg_stress:.1f}/10")
    
    # Visualizations
    create_wellness_dashboard(df)

def weekly_report_page():
    """Generate and display weekly report"""
    st.markdown('<p class="sub-header">Weekly Wellness Report</p>', unsafe_allow_html=True)
    
    if len(st.session_state.data['entries']) < 3:
        st.info("📋 Need at least 3 entries to generate a weekly report.")
        return
    
    df = pd.DataFrame(st.session_state.data['entries'])
    report = generate_weekly_report(df)
    
    st.markdown(report, unsafe_allow_html=True)

def monthly_report_page():
    """Generate and display monthly report"""
    st.markdown('<p class="sub-header">Monthly Wellness Report</p>', unsafe_allow_html=True)
    
    if len(st.session_state.data['entries']) < 7:
        st.info("📅 Need at least 7 entries to generate a comprehensive monthly report.")
        return
    
    df = pd.DataFrame(st.session_state.data['entries'])
    report = generate_monthly_report(df, st.session_state.ml_predictor)
    
    st.markdown(report, unsafe_allow_html=True)

def recommendations_page():
    """Display personalized recommendations"""
    st.markdown('<p class="sub-header">Personalized Recommendations</p>', unsafe_allow_html=True)
    
    if len(st.session_state.data['entries']) == 0:
        st.info("💡 Add some entries first to get personalized recommendations!")
        return
    
    df = pd.DataFrame(st.session_state.data['entries'])
    recommendations = get_personalized_recommendations(df)
    
    st.markdown(recommendations, unsafe_allow_html=True)

def export_data_page():
    """Display data export page"""
    display_export_page(st.session_state.data)

def cycle_forecast_page():
    """Display menstrual cycle forecast page"""
    from cycle_prediction import display_cycle_forecast
    display_cycle_forecast(st.session_state.data, st.session_state.ml_predictor)

def trends_page():
    """Display trend analysis and charts"""
    from comparative_analytics import display_comparative_analytics
    
    st.markdown('<p class="sub-header">Trends & Analytics</p>', unsafe_allow_html=True)
    
    # Check minimum data requirement
    if len(st.session_state.data.get('entries', [])) < 3:
        st.info("📊 Need at least 3 entries to show trends. Keep logging your data!")
        return
    
    df = pd.DataFrame(st.session_state.data['entries'])
    df['date'] = pd.to_datetime(df['date'])
    month_count = df['date'].dt.to_period('M').nunique()
    
    # If we have 14+ entries spanning 2+ months, show comparative analytics in tabs
    if len(st.session_state.data['entries']) >= 14 and month_count >= 2:
        tab1, tab2 = st.tabs(["📊 Month Comparison", "📈 Detailed Trends"])
        
        with tab1:
            display_comparative_analytics(st.session_state.data)
        
        with tab2:
            create_trend_charts(df)
    else:
        # Show regular trends only
        create_trend_charts(df)

if __name__ == "__main__":
    main()
