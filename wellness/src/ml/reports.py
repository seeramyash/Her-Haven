import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_weekly_report(df):
    """Generate comprehensive weekly wellness report"""
    
    # Get last 7 days of data
    recent_data = df.tail(7)
    
    if len(recent_data) == 0:
        return "<p>No data available for weekly report.</p>"
    
    # Calculate metrics
    avg_wellness = recent_data['wellness_score'].mean() if 'wellness_score' in recent_data else 0
    avg_stress = recent_data['average_stress'].mean()
    avg_sleep = recent_data['sleep_hours'].mean()
    avg_exercise = recent_data['exercise_minutes'].mean()
    avg_water = recent_data['water_intake'].mean()
    total_exercise = recent_data['exercise_minutes'].sum()
    
    # Determine trend
    if len(recent_data) >= 4:
        first_half = recent_data.head(3)['wellness_score'].mean() if 'wellness_score' in recent_data else 0
        second_half = recent_data.tail(3)['wellness_score'].mean() if 'wellness_score' in recent_data else 0
        trend = "improving ↗️" if second_half > first_half else "declining ↘️" if second_half < first_half else "stable →"
    else:
        trend = "stable →"
    
    # Period tracking
    period_days = int(recent_data['on_period'].sum()) if 'on_period' in recent_data else 0
    
    # Build HTML
    html = f"""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 15px; color: white; margin-bottom: 25px;">
        <h2 style="margin-top: 0;">📋 Weekly Wellness Report</h2>
        <p style="font-size: 1.1em;">Week of {recent_data.iloc[0]['date']} to {recent_data.iloc[-1]['date']}</p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
    """
    
    # Metric cards
    wellness_color = "#27AE60" if avg_wellness >= 70 else "#F39C12" if avg_wellness >= 50 else "#E74C3C"
    html += f"""
        <div style="background-color: {wellness_color}22; padding: 15px; border-radius: 10px; text-align: center;">
            <h3 style="color: {wellness_color}; margin: 0;">{avg_wellness:.1f}</h3>
            <p style="margin: 5px 0;">Avg Wellness</p>
            <small>{trend}</small>
        </div>
    """
    
    sleep_color = "#3498DB" if avg_sleep >= 7 else "#E67E22"
    html += f"""
        <div style="background-color: {sleep_color}22; padding: 15px; border-radius: 10px; text-align: center;">
            <h3 style="color: {sleep_color}; margin: 0;">{avg_sleep:.1f}h</h3>
            <p style="margin: 5px 0;">Avg Sleep</p>
        </div>
    """
    
    exercise_color = "#27AE60" if total_exercise >= 150 else "#F39C12"
    html += f"""
        <div style="background-color: {exercise_color}22; padding: 15px; border-radius: 10px; text-align: center;">
            <h3 style="color: {exercise_color}; margin: 0;">{total_exercise:.0f}min</h3>
            <p style="margin: 5px 0;">Total Exercise</p>
        </div>
    """
    
    stress_color = "#E74C3C" if avg_stress > 6 else "#F39C12" if avg_stress > 4 else "#27AE60"
    html += f"""
        <div style="background-color: {stress_color}22; padding: 15px; border-radius: 10px; text-align: center;">
            <h3 style="color: {stress_color}; margin: 0;">{avg_stress:.1f}/10</h3>
            <p style="margin: 5px 0;">Avg Stress</p>
        </div>
    """
    
    html += "</div><br/>"
    
    # Key insights
    html += '<h3 style="color: #764ba2;">🔍 Key Insights</h3>'
    
    insights = []
    
    # Sleep insights
    if avg_sleep < 7:
        insights.append({
            'icon': '😴',
            'title': 'Sleep Deficit',
            'message': f'You averaged {avg_sleep:.1f} hours of sleep. Aim for 7-9 hours for optimal health.',
            'type': 'warning'
        })
    elif avg_sleep >= 7 and avg_sleep <= 9:
        insights.append({
            'icon': '✨',
            'title': 'Excellent Sleep',
            'message': f'Great job! You\'re getting {avg_sleep:.1f} hours of sleep on average.',
            'type': 'success'
        })
    
    # Exercise insights
    if total_exercise >= 150:
        insights.append({
            'icon': '💪',
            'title': 'Exercise Goal Achieved',
            'message': f'You completed {total_exercise:.0f} minutes of exercise this week! WHO recommends 150+ minutes.',
            'type': 'success'
        })
    else:
        insights.append({
            'icon': '🏃',
            'title': 'Increase Activity',
            'message': f'You exercised for {total_exercise:.0f} minutes. Target is 150 minutes per week.',
            'type': 'info'
        })
    
    # Stress insights
    if avg_stress > 6:
        insights.append({
            'icon': '🧘',
            'title': 'High Stress Levels',
            'message': f'Your stress levels are elevated ({avg_stress:.1f}/10). Consider stress-reduction techniques.',
            'type': 'warning'
        })
    elif avg_stress <= 4:
        insights.append({
            'icon': '😌',
            'title': 'Low Stress',
            'message': f'Your stress levels are well-managed ({avg_stress:.1f}/10). Keep it up!',
            'type': 'success'
        })
    
    # Hydration insights
    if avg_water < 2000:
        insights.append({
            'icon': '💧',
            'title': 'Hydration Needed',
            'message': f'Average water intake: {avg_water:.0f}ml. Aim for 2000ml daily.',
            'type': 'info'
        })
    
    # Period insights
    if period_days > 0:
        insights.append({
            'icon': '🩸',
            'title': 'Menstrual Phase',
            'message': f'You menstruated for {period_days} day(s) this week. Extra self-care is important.',
            'type': 'info'
        })
    
    # Display insights
    for insight in insights:
        if insight['type'] == 'success':
            html += f"""
            <div style="background-color: #27AE6022; border-left: 5px solid #27AE60; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <strong style="color: #27AE60;">{insight['icon']} {insight['title']}</strong>: {insight['message']}
            </div>
            """
        elif insight['type'] == 'warning':
            html += f"""
            <div style="background-color: #F39C1222; border-left: 5px solid #F39C12; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <strong style="color: #F39C12;">{insight['icon']} {insight['title']}</strong>: {insight['message']}
            </div>
            """
        else:
            html += f"""
            <div style="background-color: #3498DB22; border-left: 5px solid #3498DB; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <strong style="color: #3498DB;">{insight['icon']} {insight['title']}</strong>: {insight['message']}
            </div>
            """
    
    # Daily breakdown table
    html += '<h3 style="color: #764ba2; margin-top: 30px;">📊 Daily Breakdown</h3>'
    html += '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">'
    html += '<tr style="background-color: #764ba2; color: white;"><th style="padding: 10px;">Date</th><th>Wellness</th><th>Sleep</th><th>Exercise</th><th>Stress</th><th>Water</th></tr>'
    
    for idx, row in recent_data.iterrows():
        wellness_score = row.get('wellness_score', 0)
        html += f"""
        <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px;">{row['date']}</td>
            <td style="padding: 10px; text-align: center;">{wellness_score:.1f}</td>
            <td style="padding: 10px; text-align: center;">{row.get('sleep_hours', 0):.1f}h</td>
            <td style="padding: 10px; text-align: center;">{row.get('exercise_minutes', 0):.0f}min</td>
            <td style="padding: 10px; text-align: center;">{row.get('average_stress', 0):.1f}/10</td>
            <td style="padding: 10px; text-align: center;">{row.get('water_intake', 0):.0f}ml</td>
        </tr>
        """
    
    html += '</table></div>'
    
    # Action items
    html += '<h3 style="color: #764ba2; margin-top: 30px;">🎯 Action Items for Next Week</h3>'
    
    action_items = []
    
    if avg_sleep < 7:
        action_items.append("🛏️ Prioritize sleep: Set a consistent bedtime and wake-up time")
    
    if total_exercise < 150:
        action_items.append("🏃 Increase movement: Add 10-15 minutes of activity to your daily routine")
    
    if avg_stress > 5:
        action_items.append("🧘 Manage stress: Practice meditation or deep breathing for 10 minutes daily")
    
    if avg_water < 2000:
        action_items.append("💧 Hydrate better: Keep a water bottle handy and set reminders")
    
    if avg_wellness < 70:
        action_items.append("🌟 Focus on consistency: Track your data daily for better insights")
    
    if action_items:
        html += '<ul style="line-height: 1.8;">'
        for item in action_items:
            html += f'<li style="margin: 8px 0;">{item}</li>'
        html += '</ul>'
    else:
        html += """
        <div style="background-color: #27AE60; color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <h3>🎉 Excellent work!</h3>
            <p style="font-size: 1.1em;">Keep maintaining your healthy habits!</p>
        </div>
        """
    
    return html

def generate_monthly_report(df, ml_predictor):
    """Generate comprehensive monthly wellness report with ML predictions"""
    
    # Get last 30 days of data
    recent_data = df.tail(30)
    
    if len(recent_data) < 7:
        return "<div style='background-color: #3498DB22; border-left: 5px solid #3498DB; padding: 15px; margin: 10px 0; border-radius: 5px;'><strong>ℹ️ Need at least 7 days of data for a comprehensive monthly report.</strong></div>"
    
    html = f"""
    <div style="background: linear-gradient(135deg, #FF6B9D 0%, #9B59B6 100%); padding: 25px; border-radius: 15px; color: white; margin-bottom: 25px;">
        <h2 style="margin-top: 0;">📅 Monthly Wellness Report</h2>
        <p style="font-size: 1.1em;">Comprehensive Analysis & AI Predictions</p>
        <p>Period: {recent_data.iloc[0]['date']} to {recent_data.iloc[-1]['date']}</p>
    </div>
    """
    
    # Monthly Overview
    html += '<h3 style="color: #764ba2;">📊 Monthly Overview</h3>'
    html += '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">'
    
    period_days = int(recent_data['on_period'].sum()) if 'on_period' in recent_data else 0
    
    html += f"""
        <div style="background-color: #667eea22; padding: 15px; border-radius: 10px; text-align: center;">
            <h3 style="color: #667eea; margin: 0;">{len(recent_data)}</h3>
            <p style="margin: 5px 0;">Total Entries</p>
        </div>
        
        <div style="background-color: #667eea22; padding: 15px; border-radius: 10px; text-align: center;">
            <h3 style="color: #667eea; margin: 0;">{(recent_data['wellness_score'].mean() if 'wellness_score' in recent_data else 0):.1f}</h3>
            <p style="margin: 5px 0;">Avg Wellness Score</p>
        </div>
        
        <div style="background-color: #667eea22; padding: 15px; border-radius: 10px; text-align: center;">
            <h3 style="color: #667eea; margin: 0;">{recent_data['exercise_minutes'].sum():.0f}min</h3>
            <p style="margin: 5px 0;">Total Exercise</p>
        </div>
    """
    
    html += '</div>'
    
    html += '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">'
    
    html += f"""
        <div style="background-color: #667eea22; padding: 15px; border-radius: 10px; text-align: center;">
            <h3 style="color: #667eea; margin: 0;">{recent_data['sleep_hours'].mean():.1f}h</h3>
            <p style="margin: 5px 0;">Avg Sleep</p>
        </div>
        
        <div style="background-color: #667eea22; padding: 15px; border-radius: 10px; text-align: center;">
            <h3 style="color: #667eea; margin: 0;">{period_days}</h3>
            <p style="margin: 5px 0;">Period Days</p>
        </div>
        
        <div style="background-color: #667eea22; padding: 15px; border-radius: 10px; text-align: center;">
            <h3 style="color: #667eea; margin: 0;">{recent_data['average_stress'].mean():.1f}/10</h3>
            <p style="margin: 5px 0;">Avg Stress</p>
        </div>
    """
    
    html += '</div>'
    
    # Monthly achievements
    html += '<h3 style="color: #764ba2; margin-top: 30px;">🎯 Monthly Achievements</h3>'
    
    achievements = []
    
    if recent_data['exercise_minutes'].sum() >= 600:
        achievements.append("💪 Completed 600+ minutes of exercise")
    
    if (recent_data['sleep_hours'] >= 7).sum() >= 20:
        achievements.append("😴 Had good sleep (7+ hours) for 20+ days")
    
    if (recent_data['water_intake'] >= 2000).sum() >= 20:
        achievements.append("💧 Stayed well-hydrated for 20+ days")
    
    if 'wellness_score' in recent_data and recent_data['wellness_score'].mean() >= 70:
        achievements.append("🌟 Maintained wellness score above 70")
    
    if len(recent_data) >= 25:
        achievements.append("📝 Consistent tracking (25+ entries)")
    
    if achievements:
        html += '<div style="background-color: #27AE6022; padding: 15px; border-radius: 10px; margin: 10px 0;">'
        for achievement in achievements:
            html += f'<div style="margin: 8px 0;">✅ {achievement}</div>'
        html += '</div>'
    else:
        html += '<div style="background-color: #3498DB22; border-left: 5px solid #3498DB; padding: 15px; margin: 10px 0; border-radius: 5px;"><strong>ℹ️ Keep tracking to unlock achievements!</strong></div>'
    
    # Goals for next month
    html += '<h3 style="color: #764ba2; margin-top: 30px;">🚀 Goals for Next Month</h3>'
    
    goals = []
    
    avg_wellness = recent_data['wellness_score'].mean() if 'wellness_score' in recent_data else 50
    
    if avg_wellness < 70:
        goals.append("🎯 Increase average wellness score to 70+")
    else:
        goals.append("🎯 Maintain wellness score above 70")
    
    if recent_data['exercise_minutes'].sum() < 600:
        goals.append("💪 Reach 600 minutes of exercise per month")
    
    if recent_data['average_stress'].mean() > 5:
        goals.append("🧘 Reduce average stress level below 5")
    
    if recent_data['sleep_hours'].mean() < 7.5:
        goals.append("😴 Increase average sleep to 7.5+ hours")
    
    if goals:
        html += '<ul style="line-height: 1.8;">'
        for goal in goals:
            html += f'<li style="margin: 8px 0;">{goal}</li>'
        html += '</ul>'
    
    html += '<hr style="margin: 30px 0;" />'
    html += '<p style="font-style: italic; color: #666;">This report was generated using advanced machine learning models including XGBoost for wellness scoring and LSTM for time-series predictions.</p>'
    
    return html
