import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
import streamlit as st
from datetime import datetime, timedelta

def create_wellness_dashboard(df):
    """Create comprehensive wellness dashboard with interactive charts"""
    
    st.markdown("### 📊 Your Wellness Overview")
    
    # Prepare data
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    
    # Wellness Score Trend with Flowchart
    st.markdown("#### 🌟 Wellness Score Progression")
    
    fig_wellness = go.Figure()
    
    # Add wellness score line
    fig_wellness.add_trace(go.Scatter(
        x=df['date'],
        y=df['wellness_score'],
        mode='lines+markers',
        name='Wellness Score',
        line=dict(color='#9B59B6', width=3),
        marker=dict(size=10, color='#9B59B6'),
        fill='tozeroy',
        fillcolor='rgba(155, 89, 182, 0.2)'
    ))
    
    # Add target line
    fig_wellness.add_hline(y=70, line_dash="dash", line_color="green", 
                           annotation_text="Target: 70", annotation_position="right")
    
    fig_wellness.update_layout(
        title="Daily Wellness Score Trend",
        xaxis_title="Date",
        yaxis_title="Wellness Score (0-100)",
        hovermode='x unified',
        height=400,
        template='plotly_white'
    )
    
    st.plotly_chart(fig_wellness, use_container_width=True)
    
    # Multi-metric comparison
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### 😰 Stress Levels")
        
        fig_stress = go.Figure()
        
        fig_stress.add_trace(go.Scatter(
            x=df['date'],
            y=df['morning_stress'],
            mode='lines+markers',
            name='Morning',
            line=dict(color='#3498DB', width=2)
        ))
        
        fig_stress.add_trace(go.Scatter(
            x=df['date'],
            y=df['afternoon_stress'],
            mode='lines+markers',
            name='Afternoon',
            line=dict(color='#F39C12', width=2)
        ))
        
        fig_stress.add_trace(go.Scatter(
            x=df['date'],
            y=df['night_stress'],
            mode='lines+markers',
            name='Night',
            line=dict(color='#E74C3C', width=2)
        ))
        
        fig_stress.update_layout(
            xaxis_title="Date",
            yaxis_title="Stress Level (1-10)",
            hovermode='x unified',
            height=350,
            template='plotly_white',
            showlegend=True
        )
        
        st.plotly_chart(fig_stress, use_container_width=True)
    
    with col2:
        st.markdown("#### 😴 Sleep Quality & Duration")
        
        fig_sleep = make_subplots(specs=[[{"secondary_y": True}]])
        
        fig_sleep.add_trace(
            go.Bar(
                x=df['date'],
                y=df['sleep_hours'],
                name='Sleep Hours',
                marker_color='#5DADE2'
            ),
            secondary_y=False
        )
        
        fig_sleep.add_trace(
            go.Scatter(
                x=df['date'],
                y=df['sleep_quality'],
                mode='lines+markers',
                name='Sleep Quality',
                line=dict(color='#F1C40F', width=3),
                marker=dict(size=8)
            ),
            secondary_y=True
        )
        
        fig_sleep.update_xaxes(title_text="Date")
        fig_sleep.update_yaxes(title_text="Hours", secondary_y=False)
        fig_sleep.update_yaxes(title_text="Quality (1-10)", secondary_y=True)
        
        fig_sleep.update_layout(
            height=350,
            hovermode='x unified',
            template='plotly_white'
        )
        
        st.plotly_chart(fig_sleep, use_container_width=True)
    
    # Exercise and Water Intake
    col3, col4 = st.columns(2)
    
    with col3:
        st.markdown("#### 💪 Exercise Activity")
        
        fig_exercise = go.Figure()
        
        fig_exercise.add_trace(go.Bar(
            x=df['date'],
            y=df['exercise_minutes'],
            marker_color='#27AE60',
            marker_line_color='#229954',
            marker_line_width=2,
            name='Exercise Minutes'
        ))
        
        fig_exercise.add_hline(y=30, line_dash="dash", line_color="orange",
                              annotation_text="Goal: 30 min")
        
        fig_exercise.update_layout(
            xaxis_title="Date",
            yaxis_title="Minutes",
            height=300,
            template='plotly_white'
        )
        
        st.plotly_chart(fig_exercise, use_container_width=True)
    
    with col4:
        st.markdown("#### 💧 Hydration Tracking")
        
        fig_water = go.Figure()
        
        colors = ['#3498DB' if w >= 2000 else '#E67E22' for w in df['water_intake']]
        
        fig_water.add_trace(go.Bar(
            x=df['date'],
            y=df['water_intake'],
            marker_color=colors,
            name='Water Intake (ml)'
        ))
        
        fig_water.add_hline(y=2000, line_dash="dash", line_color="blue",
                           annotation_text="Goal: 2000ml")
        
        fig_water.update_layout(
            xaxis_title="Date",
            yaxis_title="Water (ml)",
            height=300,
            template='plotly_white'
        )
        
        st.plotly_chart(fig_water, use_container_width=True)

def create_trend_charts(df):
    """Create advanced trend analysis charts"""
    
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    
    st.markdown("### 📈 Advanced Trend Analysis")
    
    # Correlation heatmap
    st.markdown("#### 🔗 Health Metrics Correlation")
    
    correlation_metrics = ['average_stress', 'sleep_hours', 'sleep_quality', 
                          'exercise_minutes', 'water_intake', 'wellness_score']
    
    if all(col in df.columns for col in correlation_metrics):
        corr_data = df[correlation_metrics].corr()
        
        fig_corr = go.Figure(data=go.Heatmap(
            z=corr_data.values,
            x=['Stress', 'Sleep Hours', 'Sleep Quality', 'Exercise', 'Water', 'Wellness'],
            y=['Stress', 'Sleep Hours', 'Sleep Quality', 'Exercise', 'Water', 'Wellness'],
            colorscale='RdYlGn',
            zmid=0,
            text=corr_data.values.round(2),
            texttemplate='%{text}',
            textfont={"size": 12},
            colorbar=dict(title="Correlation")
        ))
        
        fig_corr.update_layout(
            title="How Your Health Metrics Relate to Each Other",
            height=500,
            template='plotly_white'
        )
        
        st.plotly_chart(fig_corr, use_container_width=True)
        
        st.info("💡 **Reading the chart:** Green = positive correlation, Red = negative correlation. "
                "For example, higher sleep quality often correlates with higher wellness scores!")
    
    # Menstrual cycle impact analysis
    if 'on_period' in df.columns and df['on_period'].any():
        st.markdown("#### 🩸 Menstrual Cycle Impact Analysis")
        
        period_df = df[df['on_period'] == True]
        non_period_df = df[df['on_period'] == False]
        
        col1, col2 = st.columns(2)
        
        with col1:
            metrics_comparison = pd.DataFrame({
                'During Period': [
                    period_df['wellness_score'].mean(),
                    period_df['average_stress'].mean(),
                    period_df['sleep_quality'].mean(),
                    period_df['exercise_minutes'].mean()
                ],
                'Other Days': [
                    non_period_df['wellness_score'].mean(),
                    non_period_df['average_stress'].mean(),
                    non_period_df['sleep_quality'].mean(),
                    non_period_df['exercise_minutes'].mean()
                ]
            }, index=['Wellness Score', 'Stress Level', 'Sleep Quality', 'Exercise'])
            
            fig_comparison = go.Figure()
            
            fig_comparison.add_trace(go.Bar(
                name='During Period',
                x=metrics_comparison.index,
                y=metrics_comparison['During Period'],
                marker_color='#E91E63'
            ))
            
            fig_comparison.add_trace(go.Bar(
                name='Other Days',
                x=metrics_comparison.index,
                y=metrics_comparison['Other Days'],
                marker_color='#9C27B0'
            ))
            
            fig_comparison.update_layout(
                title="Period vs Non-Period Metrics",
                barmode='group',
                height=350,
                template='plotly_white'
            )
            
            st.plotly_chart(fig_comparison, use_container_width=True)
        
        with col2:
            # Symptom frequency chart
            all_symptoms = {}
            for _, entry in period_df.iterrows():
                symptoms = entry.get('symptoms', {})
                if isinstance(symptoms, dict):
                    for symptom, value in symptoms.items():
                        if value:
                            all_symptoms[symptom] = all_symptoms.get(symptom, 0) + 1
            
            if all_symptoms:
                symptom_names = [s.replace('_', ' ').title() for s in all_symptoms.keys()]
                symptom_counts = list(all_symptoms.values())
                
                fig_symptoms = go.Figure(go.Bar(
                    x=symptom_counts,
                    y=symptom_names,
                    orientation='h',
                    marker_color='#FF6B9D',
                    text=symptom_counts,
                    textposition='auto'
                ))
                
                fig_symptoms.update_layout(
                    title="Most Common Period Symptoms",
                    xaxis_title="Frequency",
                    height=350,
                    template='plotly_white'
                )
                
                st.plotly_chart(fig_symptoms, use_container_width=True)
    
    # Weekly improvement flowchart
    st.markdown("#### 📊 Weekly Improvement Flowchart")
    
    # Calculate weekly averages
    df['week'] = df['date'].dt.to_period('W').astype(str)
    weekly_data = df.groupby('week').agg({
        'wellness_score': 'mean',
        'average_stress': 'mean',
        'sleep_quality': 'mean',
        'exercise_minutes': 'mean'
    }).reset_index()
    
    fig_weekly = go.Figure()
    
    fig_weekly.add_trace(go.Scatter(
        x=weekly_data['week'],
        y=weekly_data['wellness_score'],
        mode='lines+markers',
        name='Wellness Score',
        line=dict(color='#9B59B6', width=4),
        marker=dict(size=12, symbol='diamond'),
        fill='tozeroy'
    ))
    
    # Add arrows showing improvement
    for i in range(1, len(weekly_data)):
        if weekly_data.iloc[i]['wellness_score'] > weekly_data.iloc[i-1]['wellness_score']:
            fig_weekly.add_annotation(
                x=weekly_data.iloc[i]['week'],
                y=weekly_data.iloc[i]['wellness_score'],
                text="↑",
                showarrow=False,
                font=dict(size=20, color='green')
            )
    
    fig_weekly.update_layout(
        title="Weekly Wellness Progress - Your Journey to Better Health",
        xaxis_title="Week",
        yaxis_title="Average Wellness Score",
        height=400,
        template='plotly_white',
        hovermode='x unified'
    )
    
    st.plotly_chart(fig_weekly, use_container_width=True)
    
    # Sentiment analysis over time
    if 'sentiment_score' in df.columns:
        st.markdown("#### 😊 Emotional Wellness Trend")
        
        fig_sentiment = go.Figure()
        
        sentiment_colors = ['#27AE60' if s > 0 else '#E74C3C' if s < 0 else '#95A5A6' 
                           for s in df['sentiment_score']]
        
        fig_sentiment.add_trace(go.Scatter(
            x=df['date'],
            y=df['sentiment_score'],
            mode='markers+lines',
            marker=dict(size=10, color=sentiment_colors),
            line=dict(color='#7F8C8D', width=2),
            name='Sentiment'
        ))
        
        fig_sentiment.add_hline(y=0, line_dash="dash", line_color="gray")
        
        fig_sentiment.update_layout(
            title="Your Emotional Journey (Based on Daily Notes)",
            xaxis_title="Date",
            yaxis_title="Sentiment Score",
            height=350,
            template='plotly_white'
        )
        
        st.plotly_chart(fig_sentiment, use_container_width=True)
        
        st.info("💭 **Sentiment Analysis:** Green dots indicate positive emotions, "
                "red dots indicate stress or negative feelings in your notes.")
