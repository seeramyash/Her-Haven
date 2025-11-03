import pandas as pd
import json
import streamlit as st
from datetime import datetime
import io

def export_to_csv(data):
    """Export wellness data to CSV format"""
    if not data or 'entries' not in data or len(data['entries']) == 0:
        return None
    
    df = pd.DataFrame(data['entries'])
    
    # Flatten symptoms dictionary
    if 'symptoms' in df.columns:
        symptoms_df = df['symptoms'].apply(lambda x: pd.Series(x) if isinstance(x, dict) else pd.Series())
        symptoms_df.columns = [f'symptom_{col}' for col in symptoms_df.columns]
        df = pd.concat([df.drop('symptoms', axis=1), symptoms_df], axis=1)
    
    # Convert to CSV
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    return csv_buffer.getvalue()

def export_to_json(data):
    """Export wellness data to JSON format"""
    if not data:
        return None
    
    # Add metadata
    export_data = {
        'export_date': datetime.now().isoformat(),
        'total_entries': len(data.get('entries', [])),
        'data': data
    }
    
    return json.dumps(export_data, indent=2)

def create_summary_report(data):
    """Create a text summary report of wellness data"""
    if not data or 'entries' not in data or len(data['entries']) == 0:
        return "No data available for summary report."
    
    df = pd.DataFrame(data['entries'])
    
    report = []
    report.append("=" * 60)
    report.append("WOMEN'S WELLNESS TRACKER - DATA SUMMARY")
    report.append("=" * 60)
    report.append(f"\nExport Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report.append(f"Total Entries: {len(df)}")
    report.append(f"Date Range: {df['date'].min()} to {df['date'].max()}")
    
    # Overall statistics
    report.append("\n" + "-" * 60)
    report.append("OVERALL STATISTICS")
    report.append("-" * 60)
    
    if 'wellness_score' in df.columns:
        report.append(f"Average Wellness Score: {df['wellness_score'].mean():.1f}/100")
        report.append(f"Highest Wellness Score: {df['wellness_score'].max():.1f}")
        report.append(f"Lowest Wellness Score: {df['wellness_score'].min():.1f}")
    
    report.append(f"\nAverage Sleep Duration: {df['sleep_hours'].mean():.1f} hours")
    report.append(f"Average Sleep Quality: {df['sleep_quality'].mean():.1f}/10")
    report.append(f"Average Stress Level: {df['average_stress'].mean():.1f}/10")
    report.append(f"Average Exercise: {df['exercise_minutes'].mean():.0f} minutes/day")
    report.append(f"Average Water Intake: {df['water_intake'].mean():.0f} ml/day")
    
    # Menstrual cycle statistics
    if 'on_period' in df.columns:
        period_days = df['on_period'].sum()
        report.append(f"\nTotal Period Days Tracked: {period_days}")
        
        # Count most common symptoms
        all_symptoms = {}
        for _, entry in df.iterrows():
            symptoms = entry.get('symptoms', {})
            if isinstance(symptoms, dict):
                for symptom, value in symptoms.items():
                    if value:
                        all_symptoms[symptom] = all_symptoms.get(symptom, 0) + 1
        
        if all_symptoms:
            report.append("\nMost Common Period Symptoms:")
            sorted_symptoms = sorted(all_symptoms.items(), key=lambda x: x[1], reverse=True)
            for symptom, count in sorted_symptoms[:5]:
                symptom_name = symptom.replace('_', ' ').title()
                percentage = (count / period_days) * 100 if period_days > 0 else 0
                report.append(f"  - {symptom_name}: {count} times ({percentage:.1f}%)")
    
    # Sentiment analysis
    if 'sentiment_score' in df.columns:
        positive_days = (df['sentiment_score'] > 0).sum()
        negative_days = (df['sentiment_score'] < 0).sum()
        neutral_days = (df['sentiment_score'] == 0).sum()
        
        report.append(f"\nEmotional Wellness:")
        report.append(f"  - Positive days: {positive_days}")
        report.append(f"  - Negative days: {negative_days}")
        report.append(f"  - Neutral days: {neutral_days}")
    
    # Best and worst days
    if 'wellness_score' in df.columns and len(df) > 0:
        best_day = df.loc[df['wellness_score'].idxmax()]
        worst_day = df.loc[df['wellness_score'].idxmin()]
        
        report.append("\n" + "-" * 60)
        report.append("BEST DAY")
        report.append("-" * 60)
        report.append(f"Date: {best_day['date']}")
        report.append(f"Wellness Score: {best_day['wellness_score']:.1f}")
        report.append(f"Sleep: {best_day['sleep_hours']:.1f}h (Quality: {best_day['sleep_quality']}/10)")
        report.append(f"Exercise: {best_day['exercise_minutes']:.0f} minutes")
        report.append(f"Stress: {best_day['average_stress']:.1f}/10")
        
        report.append("\n" + "-" * 60)
        report.append("MOST CHALLENGING DAY")
        report.append("-" * 60)
        report.append(f"Date: {worst_day['date']}")
        report.append(f"Wellness Score: {worst_day['wellness_score']:.1f}")
        report.append(f"Sleep: {worst_day['sleep_hours']:.1f}h (Quality: {worst_day['sleep_quality']}/10)")
        report.append(f"Stress: {worst_day['average_stress']:.1f}/10")
    
    report.append("\n" + "=" * 60)
    report.append("END OF REPORT")
    report.append("=" * 60)
    
    return "\n".join(report)

def display_export_page(data):
    """Display the data export page in Streamlit"""
    st.markdown('<p class="sub-header">📥 Export Your Wellness Data</p>', unsafe_allow_html=True)
    
    if not data or 'entries' not in data or len(data['entries']) == 0:
        st.info("📝 No data available to export. Start by adding some daily entries!")
        return
    
    total_entries = len(data['entries'])
    
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; color: white; margin-bottom: 20px;">
        <h3>📊 Export Your Health Records</h3>
        <p>Download your complete wellness data for personal records or to share with healthcare providers.</p>
        <p><strong>Total Entries:</strong> {total_entries}</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Export options
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 📄 CSV Export")
        st.write("Download your data in spreadsheet format - perfect for Excel, Google Sheets, or data analysis.")
        
        csv_data = export_to_csv(data)
        if csv_data:
            st.download_button(
                label="⬇️ Download CSV",
                data=csv_data,
                file_name=f"wellness_data_{datetime.now().strftime('%Y%m%d')}.csv",
                mime="text/csv",
                use_container_width=True
            )
    
    with col2:
        st.markdown("### 📋 JSON Export")
        st.write("Download your data in JSON format - ideal for backups or importing into other applications.")
        
        json_data = export_to_json(data)
        if json_data:
            st.download_button(
                label="⬇️ Download JSON",
                data=json_data,
                file_name=f"wellness_data_{datetime.now().strftime('%Y%m%d')}.json",
                mime="application/json",
                use_container_width=True
            )
    
    st.markdown("---")
    
    # Summary report
    st.markdown("### 📊 Summary Report")
    st.write("Generate a text-based summary of your wellness journey.")
    
    if st.button("📄 Generate Summary Report", use_container_width=True):
        summary = create_summary_report(data)
        
        st.text_area(
            "Your Wellness Summary",
            value=summary,
            height=400,
            disabled=True
        )
        
        st.download_button(
            label="⬇️ Download Summary Report",
            data=summary,
            file_name=f"wellness_summary_{datetime.now().strftime('%Y%m%d')}.txt",
            mime="text/plain",
            use_container_width=True
        )
    
    # Data preview
    st.markdown("---")
    st.markdown("### 👁️ Data Preview")
    
    df = pd.DataFrame(data['entries'])
    
    # Show basic preview
    preview_columns = ['date', 'wellness_score', 'average_stress', 'sleep_hours', 
                      'exercise_minutes', 'water_intake', 'on_period']
    
    available_columns = [col for col in preview_columns if col in df.columns]
    
    if available_columns:
        st.dataframe(
            df[available_columns].tail(10).sort_values('date', ascending=False),
            use_container_width=True
        )
        
        st.caption(f"Showing last 10 entries out of {total_entries} total entries")
    
    # Privacy notice
    st.info("🔒 **Privacy Note:** Your data is stored locally and never transmitted to external servers. "
            "All exports are generated on your device for your personal use only.")
