import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def get_cycle_phase(last_period_date, current_date):
    """Determine menstrual cycle phase (28-day average cycle)"""
    if not last_period_date:
        return "Unknown"
    
    days_since = (current_date - last_period_date).days % 28
    
    if days_since <= 5:
        return "Menstrual"
    elif days_since <= 13:
        return "Follicular"
    elif days_since <= 17:
        return "Ovulation"
    else:
        return "Luteal"

def get_personalized_recommendations(df):
    """Generate personalized recommendations based on user data"""
    
    recommendations_html = ""
    
    # Get recent data (last 7 days)
    recent_data = df.tail(7)
    
    # Calculate averages
    avg_wellness = recent_data['wellness_score'].mean() if 'wellness_score' in recent_data else 50
    avg_stress = recent_data['average_stress'].mean()
    avg_sleep = recent_data['sleep_hours'].mean()
    avg_exercise = recent_data['exercise_minutes'].mean()
    avg_water = recent_data['water_intake'].mean()
    
    # Determine cycle phase
    period_entries = df[df['on_period'] == True]
    if len(period_entries) > 0:
        last_period = pd.to_datetime(period_entries.iloc[-1]['date'])
        current_phase = get_cycle_phase(last_period, datetime.now())
    else:
        current_phase = "Unknown"
    
    recommendations_html += f"""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; color: white; margin-bottom: 20px;">
        <h3>🌸 Your Personalized Wellness Plan</h3>
        <p style="font-size: 1.1em;">Based on your recent health data and cycle phase</p>
    </div>
    """
    
    # Current status
    recommendations_html += f"""
    <div style="margin: 20px 0;">
        <h3 style="color: #764ba2;">📊 Current Status</h3>
        <ul style="font-size: 1.1em; line-height: 1.8;">
            <li><strong>Wellness Score:</strong> {avg_wellness:.1f}/100</li>
            <li><strong>Current Cycle Phase:</strong> {current_phase}</li>
            <li><strong>Average Stress Level:</strong> {avg_stress:.1f}/10</li>
            <li><strong>Average Sleep:</strong> {avg_sleep:.1f} hours</li>
        </ul>
    </div>
    """
    
    # Priority recommendations
    recommendations_html += '<h3 style="color: #764ba2;">🎯 Priority Recommendations</h3>'
    
    priorities = []
    
    # Sleep recommendations
    if avg_sleep < 7:
        priorities.append({
            'title': '😴 Improve Sleep Duration',
            'description': f'You\'re averaging {avg_sleep:.1f} hours of sleep. Aim for 7-9 hours.',
            'actions': [
                'Set a consistent bedtime routine',
                'Avoid screens 1 hour before bed',
                'Keep your bedroom cool (60-67°F)',
                'Try relaxation techniques like deep breathing'
            ],
            'color': '#E74C3C'
        })
    
    # Stress recommendations
    if avg_stress > 6:
        priorities.append({
            'title': '🧘 Reduce Stress Levels',
            'description': f'Your stress levels are high ({avg_stress:.1f}/10). Let\'s work on managing this.',
            'actions': [
                'Practice 10 minutes of meditation daily',
                'Try progressive muscle relaxation',
                'Journal your thoughts and feelings',
                'Take short breaks every hour during work',
                'Consider yoga or tai chi'
            ],
            'color': '#F39C12'
        })
    
    # Exercise recommendations
    if avg_exercise < 30:
        priorities.append({
            'title': '💪 Increase Physical Activity',
            'description': f'You\'re averaging {avg_exercise:.0f} minutes of exercise. Aim for at least 30 minutes daily.',
            'actions': [
                'Start with a 15-minute walk daily',
                'Try bodyweight exercises at home',
                'Use stairs instead of elevators',
                'Dance to your favorite music for 20 minutes',
                'Join a fitness class or online workout'
            ],
            'color': '#27AE60'
        })
    
    # Hydration recommendations
    if avg_water < 2000:
        priorities.append({
            'title': '💧 Improve Hydration',
            'description': f'You\'re drinking {avg_water:.0f}ml daily. Target is 2000ml (8 glasses).',
            'actions': [
                'Keep a water bottle with you at all times',
                'Set hourly reminders to drink water',
                'Drink a glass of water before each meal',
                'Infuse water with fruits for flavor',
                'Track your intake using an app'
            ],
            'color': '#3498DB'
        })
    
    # Display priority recommendations
    for priority in priorities[:3]:  # Show top 3 priorities
        recommendations_html += f"""
        <div style="background-color: {priority['color']}22; border-left: 5px solid {priority['color']}; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <h4 style="color: {priority['color']}; margin-top: 0;">{priority['title']}</h4>
            <p><strong>{priority['description']}</strong></p>
        </div>
        """
        
        recommendations_html += '<p><strong>Action Steps:</strong></p><ul>'
        for action in priority['actions']:
            recommendations_html += f"<li>{action}</li>"
        recommendations_html += '</ul><hr style="margin: 20px 0;" />'
    
    # Cycle-based nutrition recommendations
    recommendations_html += '<h3 style="color: #764ba2;">🍽️ Nutrition Recommendations</h3>'
    
    nutrition_guide = get_cycle_nutrition_recommendations(current_phase, recent_data)
    recommendations_html += nutrition_guide
    
    # Symptom-specific recommendations
    if len(period_entries) > 0:
        recent_period = period_entries.tail(1).iloc[0]
        symptoms = recent_period.get('symptoms', {})
        
        if any(symptoms.values()):
            recommendations_html += '<h3 style="color: #764ba2;">🩺 Symptom Management</h3>'
            
            symptom_recommendations = get_symptom_recommendations(symptoms)
            for symptom, advice in symptom_recommendations.items():
                recommendations_html += f"""
                <div style="background-color: #FF6B9D22; padding: 12px; margin: 10px 0; border-radius: 8px;">
                    <strong>{symptom}:</strong> {advice}
                </div>
                """
    
    # Wellness activities
    recommendations_html += '<h3 style="color: #764ba2;">🌟 Recommended Wellness Activities</h3>'
    
    activities = get_wellness_activities(current_phase, avg_stress, avg_wellness)
    
    recommendations_html += """
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
        <div>
            <h4 style="color: #667eea;">🧘 Mind & Spirit</h4>
            <ul style="line-height: 1.8;">
    """
    
    for activity in activities['mind']:
        recommendations_html += f"<li>{activity}</li>"
    
    recommendations_html += """
            </ul>
        </div>
        <div>
            <h4 style="color: #667eea;">💪 Body & Movement</h4>
            <ul style="line-height: 1.8;">
    """
    
    for activity in activities['body']:
        recommendations_html += f"<li>{activity}</li>"
    
    recommendations_html += """
            </ul>
        </div>
    </div>
    """
    
    # Positive reinforcement
    if avg_wellness >= 70:
        recommendations_html += """
        <div style="background-color: #27AE60; color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <h3>🎉 Great job!</h3>
            <p style="font-size: 1.1em;">You're maintaining excellent wellness habits. Keep up the amazing work!</p>
        </div>
        """
    elif avg_wellness >= 55:
        recommendations_html += """
        <div style="background-color: #3498DB; color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <h3>🌱 You're making progress!</h3>
            <p style="font-size: 1.1em;">A few adjustments will help you reach optimal wellness.</p>
        </div>
        """
    else:
        recommendations_html += """
        <div style="background-color: #F39C12; color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <h3>💙 Remember to be kind to yourself</h3>
            <p style="font-size: 1.1em;">Small, consistent changes make a big difference. You've got this!</p>
        </div>
        """
    
    return recommendations_html

def get_cycle_nutrition_recommendations(phase, recent_data):
    """Provide nutrition recommendations based on cycle phase"""
    
    recommendations = {
        "Menstrual": {
            "focus": "Iron-rich foods and anti-inflammatory nutrients",
            "foods": [
                "🥬 Leafy greens (spinach, kale) for iron",
                "🍫 Dark chocolate for magnesium and mood",
                "🐟 Fatty fish (salmon) for omega-3s",
                "🍓 Berries for antioxidants",
                "🥜 Nuts and seeds for healthy fats",
                "🍵 Ginger tea for nausea and cramping"
            ],
            "avoid": "Excessive caffeine, salty foods, processed sugars"
        },
        "Follicular": {
            "focus": "Fresh, light foods to support rising energy",
            "foods": [
                "🥗 Fresh salads and vegetables",
                "🐔 Lean proteins (chicken, turkey)",
                "🥑 Avocados for healthy fats",
                "🥕 Fermented foods for gut health",
                "🌰 Pumpkin seeds for zinc",
                "🍋 Citrus fruits for vitamin C"
            ],
            "avoid": "Heavy, greasy foods"
        },
        "Ovulation": {
            "focus": "Fiber and antioxidant-rich foods",
            "foods": [
                "🥦 Cruciferous vegetables (broccoli, cauliflower)",
                "🍅 Colorful vegetables",
                "🌾 Whole grains (quinoa, brown rice)",
                "🫐 Berries for antioxidants",
                "🥚 Eggs for protein",
                "🍉 Watermelon for hydration"
            ],
            "avoid": "Excessive caffeine"
        },
        "Luteal": {
            "focus": "Complex carbs and magnesium-rich foods",
            "foods": [
                "🍠 Sweet potatoes for complex carbs",
                "🍌 Bananas for B6 and potassium",
                "🥬 Dark leafy greens for magnesium",
                "🥜 Almonds and cashews",
                "🐟 Fatty fish for omega-3s",
                "🫘 Chickpeas and lentils"
            ],
            "avoid": "Refined sugars, excessive salt, alcohol"
        },
        "Unknown": {
            "focus": "Balanced, whole-food nutrition",
            "foods": [
                "🥗 Variety of colorful vegetables",
                "🥩 Lean proteins",
                "🌾 Whole grains",
                "🍎 Fresh fruits",
                "🥜 Healthy fats from nuts and seeds",
                "💧 Plenty of water"
            ],
            "avoid": "Processed foods, excessive sugar"
        }
    }
    
    phase_rec = recommendations.get(phase, recommendations["Unknown"])
    
    html = f"""
    <div style="background: linear-gradient(135deg, #FFA07A 0%, #FF6B9D 100%); padding: 20px; border-radius: 10px; color: white; margin: 15px 0;">
        <h4>🌙 {phase} Phase Nutrition</h4>
        <p><strong>Focus:</strong> {phase_rec['focus']}</p>
    </div>
    
    <div style="background-color: #F0F8FF; padding: 15px; border-radius: 10px; margin: 10px 0;">
        <strong>🍽️ Recommended Foods:</strong><br/>
    """
    
    for food in phase_rec['foods']:
        html += f"&nbsp;&nbsp;{food}<br/>"
    
    html += f"""
    </div>
    
    <div style="background-color: #FFF5EE; padding: 12px; border-radius: 8px; margin: 10px 0;">
        <strong>⚠️ Foods to Limit:</strong> {phase_rec['avoid']}
    </div>
    """
    
    return html

def get_symptom_recommendations(symptoms):
    """Provide recommendations for specific menstrual symptoms"""
    
    advice_map = {
        'headache': 'Stay hydrated, apply cold compress, try peppermint oil, reduce screen time, get adequate sleep',
        'heavy_flow': 'Increase iron intake, stay hydrated, use proper protection, consult doctor if severe',
        'light_flow': 'Normal variation, ensure adequate nutrition, track for patterns',
        'cramping': 'Use heating pad, gentle exercise, magnesium supplements, herbal teas (chamomile, ginger)',
        'bloating': 'Reduce salt intake, avoid carbonated drinks, try fennel tea, gentle yoga poses',
        'mood_swings': 'Regular exercise, omega-3 fatty acids, mindfulness practice, adequate sleep',
        'fatigue': 'Iron-rich foods, B-vitamins, gentle movement, power naps (20min), stay hydrated',
        'nausea': 'Ginger tea, small frequent meals, avoid greasy foods, fresh air, peppermint',
        'back_pain': 'Heat therapy, gentle stretching, proper posture, massage, anti-inflammatory foods',
        'breast_tenderness': 'Supportive bra, reduce caffeine, evening primrose oil, cold compress'
    }
    
    recommendations = {}
    for symptom, has_it in symptoms.items():
        if has_it and symptom in advice_map:
            symptom_name = symptom.replace('_', ' ').title()
            recommendations[symptom_name] = advice_map[symptom]
    
    return recommendations

def get_wellness_activities(phase, stress_level, wellness_score):
    """Recommend wellness activities based on current state"""
    
    activities = {
        'mind': [],
        'body': []
    }
    
    # Mind activities based on stress
    if stress_level > 6:
        activities['mind'] = [
            "10-minute guided meditation",
            "Journaling your thoughts",
            "Deep breathing exercises (4-7-8 technique)",
            "Progressive muscle relaxation",
            "Listen to calming music or nature sounds"
        ]
    else:
        activities['mind'] = [
            "Gratitude journaling",
            "Reading for pleasure",
            "Creative activities (drawing, coloring)",
            "Mindful tea ceremony",
            "Connect with loved ones"
        ]
    
    # Body activities based on cycle phase
    if phase == "Menstrual":
        activities['body'] = [
            "Gentle yoga or yin yoga",
            "Light walking in nature",
            "Stretching exercises",
            "Swimming (if comfortable)",
            "Restorative poses"
        ]
    elif phase == "Follicular" or phase == "Ovulation":
        activities['body'] = [
            "High-intensity interval training (HIIT)",
            "Running or jogging",
            "Dance classes",
            "Strength training",
            "Team sports"
        ]
    elif phase == "Luteal":
        activities['body'] = [
            "Moderate cardio (cycling, swimming)",
            "Pilates",
            "Strength training with lighter weights",
            "Yoga flow",
            "Hiking"
        ]
    else:
        activities['body'] = [
            "30-minute brisk walk",
            "Yoga",
            "Bodyweight exercises",
            "Swimming",
            "Dancing"
        ]
    
    return activities
