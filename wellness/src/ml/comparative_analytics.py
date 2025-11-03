import pandas as pd
import numpy as np
import streamlit as st
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from datetime import datetime, timedelta

def calculate_monthly_aggregates(df):
    """Calculate monthly aggregated metrics"""
    df['date'] = pd.to_datetime(df['date'])
    df['month'] = df['date'].dt.to_period('M')
    
    monthly_stats = df.groupby('month').agg({
        'wellness_score': ['mean', 'std', 'min', 'max'],
        'average_stress': 'mean',
        'sleep_hours': 'mean',
        'sleep_quality': 'mean',
        'exercise_minutes': ['mean', 'sum'],
        'water_intake': 'mean',
        'on_period': 'sum'
    }).reset_index()
    
    # Flatten column names
    monthly_stats.columns = ['_'.join(col).strip('_') if col[1] else col[0] 
                             for col in monthly_stats.columns.values]
    
    monthly_stats['month_str'] = monthly_stats['month'].astype(str)
    
    return monthly_stats

def compare_months(df):
    """Compare metrics between different months"""
    monthly_data = calculate_monthly_aggregates(df)
    
    if len(monthly_data) < 2:
        return None
    
    # Calculate month-over-month changes
    changes = {}
    
    for i in range(1, len(monthly_data)):
        current = monthly_data.iloc[i]
        previous = monthly_data.iloc[i-1]
        
        changes[current['month_str']] = {
            'wellness_change': current['wellness_score_mean'] - previous['wellness_score_mean'],
            'stress_change': current['average_stress_mean'] - previous['average_stress_mean'],
            'sleep_change': current['sleep_hours_mean'] - previous['sleep_hours_mean'],
            'exercise_change': current['exercise_minutes_mean'] - previous['exercise_minutes_mean'],
            'current_wellness': current['wellness_score_mean'],
            'previous_wellness': previous['wellness_score_mean']
        }
    
    return changes

def display_comparative_analytics(data):
    """Display comparative analytics dashboard"""
    st.markdown('<p class="sub-header">📊 Comparative Analytics</p>', unsafe_allow_html=True)
    
    if not data or 'entries' not in data or len(data['entries']) < 14:
        st.info("📊 Need at least 14 days of data spanning multiple months for comparative analysis.")
        return
    
    df = pd.DataFrame(data['entries'])
    df['date'] = pd.to_datetime(df['date'])
    
    # Check if we have multiple months
    month_count = df['date'].dt.to_period('M').nunique()
    
    if month_count < 2:
        st.info("📅 Keep tracking! Comparative analytics will be available once you have data from multiple months.")
        return
    
    st.markdown("""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; color: white; margin-bottom: 20px;">
        <h3>📈 Month-Over-Month Progress Analysis</h3>
        <p>Track your wellness improvements across multiple menstrual cycles</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Calculate monthly aggregates
    monthly_stats = calculate_monthly_aggregates(df)
    
    # Overview metrics
    st.markdown("### 🎯 Overall Progress")
    
    col1, col2, col3, col4 = st.columns(4)
    
    if len(monthly_stats) >= 2:
        latest = monthly_stats.iloc[-1]
        previous = monthly_stats.iloc[-2]
        
        wellness_change = latest['wellness_score_mean'] - previous['wellness_score_mean']
        stress_change = latest['average_stress_mean'] - previous['average_stress_mean']
        sleep_change = latest['sleep_hours_mean'] - previous['sleep_hours_mean']
        exercise_change = latest['exercise_minutes_mean'] - previous['exercise_minutes_mean']
        
        with col1:
            delta_color = "normal" if wellness_change >= 0 else "inverse"
            st.metric(
                "Wellness Score",
                f"{latest['wellness_score_mean']:.1f}",
                f"{wellness_change:+.1f} vs last month",
                delta_color=delta_color
            )
        
        with col2:
            delta_color = "inverse" if stress_change >= 0 else "normal"
            st.metric(
                "Stress Level",
                f"{latest['average_stress_mean']:.1f}",
                f"{stress_change:+.1f} vs last month",
                delta_color=delta_color
            )
        
        with col3:
            delta_color = "normal" if sleep_change >= 0 else "inverse"
            st.metric(
                "Sleep Hours",
                f"{latest['sleep_hours_mean']:.1f}h",
                f"{sleep_change:+.1f}h vs last month",
                delta_color=delta_color
            )
        
        with col4:
            delta_color = "normal" if exercise_change >= 0 else "inverse"
            st.metric(
                "Exercise",
                f"{latest['exercise_minutes_mean']:.0f}min",
                f"{exercise_change:+.0f}min vs last month",
                delta_color=delta_color
            )
    
    # Month-over-month trend charts
    st.markdown("### 📈 Trend Comparison")
    
    # Create multi-metric comparison chart
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Wellness Score Trend', 'Stress Level Trend', 
                       'Sleep Quality Trend', 'Exercise Trend'),
        vertical_spacing=0.12,
        horizontal_spacing=0.1
    )
    
    # Wellness score
    fig.add_trace(
        go.Scatter(
            x=monthly_stats['month_str'],
            y=monthly_stats['wellness_score_mean'],
            mode='lines+markers',
            name='Wellness Score',
            line=dict(color='#9B59B6', width=3),
            marker=dict(size=10),
            fill='tozeroy',
            fillcolor='rgba(155, 89, 182, 0.2)'
        ),
        row=1, col=1
    )
    
    # Stress level
    fig.add_trace(
        go.Scatter(
            x=monthly_stats['month_str'],
            y=monthly_stats['average_stress_mean'],
            mode='lines+markers',
            name='Stress Level',
            line=dict(color='#E74C3C', width=3),
            marker=dict(size=10)
        ),
        row=1, col=2
    )
    
    # Sleep hours
    fig.add_trace(
        go.Scatter(
            x=monthly_stats['month_str'],
            y=monthly_stats['sleep_hours_mean'],
            mode='lines+markers',
            name='Sleep Hours',
            line=dict(color='#3498DB', width=3),
            marker=dict(size=10)
        ),
        row=2, col=1
    )
    
    # Exercise
    fig.add_trace(
        go.Scatter(
            x=monthly_stats['month_str'],
            y=monthly_stats['exercise_minutes_mean'],
            mode='lines+markers',
            name='Exercise',
            line=dict(color='#27AE60', width=3),
            marker=dict(size=10)
        ),
        row=2, col=2
    )
    
    fig.update_xaxes(title_text="Month", row=2, col=1)
    fig.update_xaxes(title_text="Month", row=2, col=2)
    
    fig.update_yaxes(title_text="Score (0-100)", row=1, col=1)
    fig.update_yaxes(title_text="Level (1-10)", row=1, col=2)
    fig.update_yaxes(title_text="Hours", row=2, col=1)
    fig.update_yaxes(title_text="Minutes", row=2, col=2)
    
    fig.update_layout(
        height=600,
        showlegend=False,
        template='plotly_white'
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Best and worst months
    st.markdown("### 🏆 Performance Highlights")
    
    col1, col2 = st.columns(2)
    
    with col1:
        best_month_idx = monthly_stats['wellness_score_mean'].idxmax()
        best_month = monthly_stats.iloc[best_month_idx]
        
        st.markdown(f"""
        <div style="background-color: #27AE6022; padding: 20px; border-radius: 10px; border-left: 5px solid #27AE60;">
            <h4 style="color: #27AE60; margin-top: 0;">🌟 Best Month</h4>
            <p><strong>{best_month['month_str']}</strong></p>
            <p>Wellness Score: {best_month['wellness_score_mean']:.1f}/100</p>
            <p>Avg Sleep: {best_month['sleep_hours_mean']:.1f}h</p>
            <p>Avg Exercise: {best_month['exercise_minutes_mean']:.0f}min/day</p>
            <p>Avg Stress: {best_month['average_stress_mean']:.1f}/10</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        worst_month_idx = monthly_stats['wellness_score_mean'].idxmin()
        worst_month = monthly_stats.iloc[worst_month_idx]
        
        st.markdown(f"""
        <div style="background-color: #E74C3C22; padding: 20px; border-radius: 10px; border-left: 5px solid #E74C3C;">
            <h4 style="color: #E74C3C; margin-top: 0;">📉 Room for Growth</h4>
            <p><strong>{worst_month['month_str']}</strong></p>
            <p>Wellness Score: {worst_month['wellness_score_mean']:.1f}/100</p>
            <p>Avg Sleep: {worst_month['sleep_hours_mean']:.1f}h</p>
            <p>Avg Exercise: {worst_month['exercise_minutes_mean']:.0f}min/day</p>
            <p>Avg Stress: {worst_month['average_stress_mean']:.1f}/10</p>
        </div>
        """, unsafe_allow_html=True)
    
    # Improvement percentage
    if len(monthly_stats) >= 2:
        first_month = monthly_stats.iloc[0]
        latest_month = monthly_stats.iloc[-1]
        
        total_improvement = ((latest_month['wellness_score_mean'] - first_month['wellness_score_mean']) / 
                           first_month['wellness_score_mean'] * 100)
        
        if total_improvement > 0:
            st.success(f"""
            🎉 **Amazing Progress!** Your wellness score has improved by **{total_improvement:.1f}%** 
            from {first_month['month_str']} to {latest_month['month_str']}!
            """)
        elif total_improvement < -5:
            st.info(f"""
            💙 Your wellness score has decreased by {abs(total_improvement):.1f}% since {first_month['month_str']}. 
            This is normal - wellness has natural fluctuations. Focus on consistent healthy habits!
            """)
        else:
            st.info(f"""
            ⚖️ Your wellness score has remained stable since {first_month['month_str']}. 
            Consistency is key to long-term health!
            """)
    
    # Monthly details table
    st.markdown("### 📋 Monthly Summary Table")
    
    # Prepare display dataframe
    display_df = monthly_stats[[
        'month_str', 'wellness_score_mean', 'average_stress_mean',
        'sleep_hours_mean', 'exercise_minutes_sum', 'on_period_sum'
    ]].copy()
    
    display_df.columns = ['Month', 'Avg Wellness', 'Avg Stress', 'Avg Sleep (h)', 
                          'Total Exercise (min)', 'Period Days']
    
    # Format numbers
    display_df['Avg Wellness'] = display_df['Avg Wellness'].round(1)
    display_df['Avg Stress'] = display_df['Avg Stress'].round(1)
    display_df['Avg Sleep (h)'] = display_df['Avg Sleep (h)'].round(1)
    display_df['Total Exercise (min)'] = display_df['Total Exercise (min)'].round(0).astype(int)
    display_df['Period Days'] = display_df['Period Days'].astype(int)
    
    st.dataframe(display_df.sort_values('Month', ascending=False), use_container_width=True)
    
    # Cycle-specific analysis
    if 'on_period' in df.columns and df['on_period'].any():
        st.markdown("### 🌙 Cycle Impact Analysis")
        
        # Compare period vs non-period days across months
        period_comparison = []
        
        for month in df['date'].dt.to_period('M').unique():
            month_data = df[df['date'].dt.to_period('M') == month]
            
            period_days = month_data[month_data['on_period'] == True]
            non_period_days = month_data[month_data['on_period'] == False]
            
            if len(period_days) > 0 and len(non_period_days) > 0:
                period_comparison.append({
                    'Month': str(month),
                    'Period Wellness': period_days['wellness_score'].mean() if 'wellness_score' in period_days else 0,
                    'Non-Period Wellness': non_period_days['wellness_score'].mean() if 'wellness_score' in non_period_days else 0,
                    'Difference': (non_period_days['wellness_score'].mean() - period_days['wellness_score'].mean()) if 'wellness_score' in period_days else 0
                })
        
        if period_comparison:
            comparison_df = pd.DataFrame(period_comparison)
            
            fig_cycle = go.Figure()
            
            fig_cycle.add_trace(go.Bar(
                name='During Period',
                x=comparison_df['Month'],
                y=comparison_df['Period Wellness'],
                marker_color='#E91E63'
            ))
            
            fig_cycle.add_trace(go.Bar(
                name='Other Days',
                x=comparison_df['Month'],
                y=comparison_df['Non-Period Wellness'],
                marker_color='#9C27B0'
            ))
            
            fig_cycle.update_layout(
                title='Wellness Score: Period vs Non-Period Days by Month',
                barmode='group',
                yaxis_title='Wellness Score',
                height=400,
                template='plotly_white'
            )
            
            st.plotly_chart(fig_cycle, use_container_width=True)
            
            avg_impact = comparison_df['Difference'].mean()
            if avg_impact > 5:
                st.info(f"""
                📊 **Pattern Detected:** Your wellness score tends to be **{avg_impact:.1f} points lower** during your period. 
                This is normal - consider extra self-care during this time.
                """)
