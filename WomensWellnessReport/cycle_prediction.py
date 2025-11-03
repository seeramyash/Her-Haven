import pandas as pd
import numpy as np
import streamlit as st
from datetime import datetime, timedelta
import plotly.graph_objects as go
import plotly.express as px

def predict_next_cycle(data):
    """Predict next menstrual period using historical data"""
    if not data or 'entries' not in data:
        return None
    
    df = pd.DataFrame(data['entries'])
    
    if 'on_period' not in df.columns:
        return None
    
    # Find all period start dates
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    
    period_starts = []
    in_period = False
    
    for idx, row in df.iterrows():
        if row['on_period'] and not in_period:
            period_starts.append(row['date'])
            in_period = True
        elif not row['on_period']:
            in_period = False
    
    if len(period_starts) < 2:
        return None
    
    # Calculate average cycle length
    cycle_lengths = []
    for i in range(1, len(period_starts)):
        cycle_length = (period_starts[i] - period_starts[i-1]).days
        if 21 <= cycle_length <= 35:  # Normal cycle range
            cycle_lengths.append(cycle_length)
    
    if not cycle_lengths:
        avg_cycle_length = 28  # Default
        cycle_regularity = "Unknown"
    else:
        avg_cycle_length = np.mean(cycle_lengths)
        std_cycle_length = np.std(cycle_lengths) if len(cycle_lengths) > 1 else 0
        
        # Determine regularity
        if std_cycle_length <= 2:
            cycle_regularity = "Very Regular"
        elif std_cycle_length <= 4:
            cycle_regularity = "Regular"
        elif std_cycle_length <= 7:
            cycle_regularity = "Somewhat Irregular"
        else:
            cycle_regularity = "Irregular"
    
    # Predict next period
    last_period_start = period_starts[-1]
    predicted_next_period = last_period_start + timedelta(days=int(avg_cycle_length))
    
    # Calculate confidence based on regularity
    if cycle_regularity == "Very Regular":
        confidence = "High"
        confidence_range = 1
    elif cycle_regularity == "Regular":
        confidence = "Good"
        confidence_range = 2
    elif cycle_regularity == "Somewhat Irregular":
        confidence = "Moderate"
        confidence_range = 3
    else:
        confidence = "Low"
        confidence_range = 5
    
    return {
        'predicted_date': predicted_next_period,
        'confidence': confidence,
        'confidence_range_days': confidence_range,
        'avg_cycle_length': avg_cycle_length,
        'cycle_regularity': cycle_regularity,
        'total_cycles_tracked': len(period_starts),
        'last_period_start': last_period_start,
        'cycle_lengths': cycle_lengths
    }

def predict_symptom_likelihood(data):
    """Predict likelihood of experiencing specific symptoms in next cycle"""
    if not data or 'entries' not in data:
        return {}
    
    df = pd.DataFrame(data['entries'])
    
    if 'on_period' not in df.columns:
        return {}
    
    period_entries = df[df['on_period'] == True]
    
    if len(period_entries) == 0:
        return {}
    
    # Count symptom occurrences
    symptom_counts = {}
    total_period_days = len(period_entries)
    
    for _, entry in period_entries.iterrows():
        symptoms = entry.get('symptoms', {})
        if isinstance(symptoms, dict):
            for symptom, has_it in symptoms.items():
                if has_it:
                    symptom_counts[symptom] = symptom_counts.get(symptom, 0) + 1
    
    # Calculate probabilities
    symptom_likelihoods = {}
    for symptom, count in symptom_counts.items():
        likelihood = (count / total_period_days) * 100
        symptom_likelihoods[symptom] = {
            'percentage': likelihood,
            'category': 'Very Likely' if likelihood >= 70 else 'Likely' if likelihood >= 40 else 'Possible' if likelihood >= 20 else 'Unlikely'
        }
    
    return symptom_likelihoods

def display_cycle_forecast(data, ml_predictor):
    """Display cycle prediction and forecast page"""
    st.markdown('<p class="sub-header">🔮 Menstrual Cycle Forecast</p>', unsafe_allow_html=True)
    
    if not data or 'entries' not in data or len(data['entries']) == 0:
        st.info("📝 No data available. Start tracking your cycle to see predictions!")
        return
    
    st.markdown("""
    <div style="background: linear-gradient(135deg, #FF6B9D 0%, #9B59B6 100%); padding: 20px; border-radius: 15px; color: white; margin-bottom: 20px;">
        <h3>🌙 AI-Powered Cycle Predictions</h3>
        <p>Based on your historical menstrual cycle data and machine learning analysis</p>
    </div>
    """, unsafe_allow_html=True)
    
    prediction = predict_next_cycle(data)
    
    if prediction is None:
        st.warning("📊 Need at least 2 menstrual cycles tracked to generate predictions. Keep logging your data!")
        return
    
    # Display prediction summary
    col1, col2, col3 = st.columns(3)
    
    with col1:
        days_until = (prediction['predicted_date'] - datetime.now()).days
        st.markdown(f"""
        <div style="background-color: #FF6B9D22; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="color: #FF6B9D; margin: 0;">{days_until}</h2>
            <p style="margin: 5px 0;">Days Until Next Period</p>
            <small>Predicted: {prediction['predicted_date'].strftime('%B %d, %Y')}</small>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div style="background-color: #9B59B622; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="color: #9B59B6; margin: 0;">{prediction['avg_cycle_length']:.1f}</h2>
            <p style="margin: 5px 0;">Average Cycle Length</p>
            <small>{prediction['cycle_regularity']} Cycle</small>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown(f"""
        <div style="background-color: #5DADE222; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="color: #5DADE2; margin: 0;">{prediction['confidence']}</h2>
            <p style="margin: 5px 0;">Prediction Confidence</p>
            <small>±{prediction['confidence_range_days']} days</small>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("<br/>", unsafe_allow_html=True)
    
    # Cycle calendar visualization
    st.markdown("### 📅 Cycle Calendar")
    
    # Create calendar view for next 90 days
    today = datetime.now()
    calendar_data = []
    
    for i in range(90):
        date = today + timedelta(days=i)
        
        # Determine cycle phase
        days_from_prediction = (date - prediction['predicted_date']).days
        
        if -5 <= days_from_prediction <= 0:
            phase = "Predicted Period (±{})".format(prediction['confidence_range_days'])
            color = "#FF6B9D"
            intensity = 1.0
        elif 1 <= days_from_prediction <= 5:
            phase = "Predicted Period (±{})".format(prediction['confidence_range_days'])
            color = "#FFB6C1"
            intensity = 0.6
        elif -prediction['avg_cycle_length'] + 28 <= days_from_prediction <= -prediction['avg_cycle_length'] + 32:
            phase = "Next Predicted Period"
            color = "#FF6B9D"
            intensity = 0.8
        else:
            # Calculate phase based on predicted cycle
            days_into_cycle = (date - prediction['predicted_date']).days % int(prediction['avg_cycle_length'])
            
            if days_into_cycle <= 13:
                phase = "Follicular Phase"
                color = "#87CEEB"
                intensity = 0.5
            elif days_into_cycle <= 17:
                phase = "Ovulation Phase"
                color = "#FFD700"
                intensity = 0.6
            else:
                phase = "Luteal Phase"
                color = "#DDA0DD"
                intensity = 0.5
        
        calendar_data.append({
            'date': date,
            'phase': phase,
            'color': color,
            'intensity': intensity
        })
    
    calendar_df = pd.DataFrame(calendar_data)
    
    # Create timeline visualization
    fig = go.Figure()
    
    # Group by phase for better visualization
    for phase in calendar_df['phase'].unique():
        phase_data = calendar_df[calendar_df['phase'] == phase]
        
        fig.add_trace(go.Scatter(
            x=phase_data['date'],
            y=[1] * len(phase_data),
            mode='markers',
            name=phase,
            marker=dict(
                size=15,
                color=phase_data['color'].iloc[0],
                line=dict(width=1, color='white')
            ),
            hovertemplate='<b>%{x|%B %d}</b><br>' + phase + '<extra></extra>'
        ))
    
    fig.update_layout(
        title="Next 90 Days Cycle Forecast",
        xaxis_title="Date",
        yaxis=dict(visible=False),
        height=250,
        showlegend=True,
        hovermode='closest',
        template='plotly_white'
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Symptom predictions
    st.markdown("### 🩺 Predicted Symptoms for Next Cycle")
    
    symptom_predictions = predict_symptom_likelihood(data)
    
    if symptom_predictions:
        # Sort by likelihood
        sorted_symptoms = sorted(symptom_predictions.items(), key=lambda x: x[1]['percentage'], reverse=True)
        
        col1, col2 = st.columns(2)
        
        for idx, (symptom, info) in enumerate(sorted_symptoms):
            symptom_name = symptom.replace('_', ' ').title()
            
            col = col1 if idx % 2 == 0 else col2
            
            with col:
                # Color based on likelihood
                if info['category'] == 'Very Likely':
                    bg_color = "#E74C3C22"
                    text_color = "#E74C3C"
                elif info['category'] == 'Likely':
                    bg_color = "#F39C1222"
                    text_color = "#F39C12"
                elif info['category'] == 'Possible':
                    bg_color = "#F1C40F22"
                    text_color = "#F1C40F"
                else:
                    bg_color = "#95A5A622"
                    text_color = "#95A5A6"
                
                st.markdown(f"""
                <div style="background-color: {bg_color}; padding: 12px; margin: 8px 0; border-radius: 8px; border-left: 4px solid {text_color};">
                    <strong style="color: {text_color};">{symptom_name}</strong><br/>
                    <small>{info['category']}: {info['percentage']:.0f}% likelihood</small>
                    <div style="background-color: {text_color}; width: {info['percentage']}%; height: 6px; border-radius: 3px; margin-top: 5px;"></div>
                </div>
                """, unsafe_allow_html=True)
    else:
        st.info("Track more cycles with symptoms to see predictions!")
    
    # Cycle history
    st.markdown("### 📊 Cycle History")
    
    if len(prediction['cycle_lengths']) > 0:
        # Create bar chart of cycle lengths
        fig_history = go.Figure()
        
        fig_history.add_trace(go.Bar(
            x=list(range(1, len(prediction['cycle_lengths']) + 1)),
            y=prediction['cycle_lengths'],
            marker_color='#9B59B6',
            text=[f"{int(length)} days" for length in prediction['cycle_lengths']],
            textposition='auto'
        ))
        
        # Add average line
        fig_history.add_hline(
            y=prediction['avg_cycle_length'],
            line_dash="dash",
            line_color="green",
            annotation_text=f"Average: {prediction['avg_cycle_length']:.1f} days"
        )
        
        fig_history.update_layout(
            title="Your Cycle Length History",
            xaxis_title="Cycle Number",
            yaxis_title="Days",
            height=350,
            template='plotly_white'
        )
        
        st.plotly_chart(fig_history, use_container_width=True)
        
        # Statistics
        st.markdown(f"""
        **Cycle Statistics:**
        - **Shortest Cycle:** {min(prediction['cycle_lengths']):.0f} days
        - **Longest Cycle:** {max(prediction['cycle_lengths']):.0f} days
        - **Average Cycle:** {prediction['avg_cycle_length']:.1f} days
        - **Cycles Tracked:** {len(prediction['cycle_lengths'])}
        """)
    
    # Tips based on prediction
    st.markdown("---")
    st.markdown("### 💡 Preparation Tips")
    
    if days_until <= 7:
        st.info(f"""
        🗓️ **Your next period is predicted in about {days_until} days!**
        
        **Preparation checklist:**
        - Stock up on menstrual products
        - Plan light activities if you expect fatigue
        - Prepare comfort items (heating pad, favorite tea)
        - Consider meal prep for easy, nutritious meals
        """)
    elif days_until <= 14:
        st.success(f"""
        🌸 **You're likely in your follicular phase!**
        
        **Make the most of it:**
        - Energy levels may be higher - great time for challenging workouts
        - Social activities and new projects are well-timed
        - Metabolism may be slower - maintain balanced nutrition
        """)
    else:
        st.success(f"""
        🌙 **You have about {days_until} days until your next predicted period.**
        
        **Stay on track:**
        - Continue daily wellness tracking for better predictions
        - Monitor any PMS symptoms in the luteal phase
        - Maintain healthy habits to optimize cycle health
        """)
