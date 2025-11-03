"""
Flask API Server for Women's Wellness Tracker
Replaces Streamlit backend with REST API for React frontend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import os

from database import init_db
from db_storage import get_all_entries, save_wellness_entry, get_recent_entries, get_user_profile, update_user_profile
from ml_models import WellnessPredictor
from reports import generate_weekly_report, generate_monthly_report
from recommendations import get_personalized_recommendations
from cycle_prediction import predict_next_cycle, predict_symptom_likelihood
from comparative_analytics import calculate_monthly_aggregates, compare_months
from data_export import export_to_csv, export_to_json, create_summary_report

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize database and ML predictor
init_db()
ml_predictor = WellnessPredictor()

# Load ML models if available
try:
    entries = get_all_entries()
    if len(entries) >= 10:
        ml_predictor.train_xgboost_model(entries)
    if len(entries) >= 7:
        ml_predictor.train_lstm_model(entries)
except:
    pass

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "API is running"})

# ==================== Entries Endpoints ====================

@app.route('/api/entries', methods=['GET'])
def get_entries():
    """Get all wellness entries"""
    try:
        entries = get_all_entries()
        # Map database field names to frontend field names for compatibility
        mapped_entries = []
        for entry in entries:
            mapped_entry = entry.copy()
            # Add frontend field names for charts compatibility
            if 'stress_morning' in mapped_entry and 'morning_stress' not in mapped_entry:
                mapped_entry['morning_stress'] = mapped_entry.get('stress_morning', 0)
                mapped_entry['afternoon_stress'] = mapped_entry.get('stress_afternoon', 0)
                mapped_entry['night_stress'] = mapped_entry.get('stress_night', 0)
            mapped_entries.append(mapped_entry)
        return jsonify({"success": True, "data": mapped_entries})
    except Exception as e:
        import traceback
        print(f"Error in get_entries: {e}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/entries/recent', methods=['GET'])
def get_recent():
    """Get recent entries"""
    try:
        limit = int(request.args.get('limit', 30))
        entries = get_recent_entries(limit=limit)
        return jsonify({"success": True, "data": entries})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/entries', methods=['POST'])
def create_entry():
    """Create a new wellness entry"""
    try:
        if not request.json:
            return jsonify({"success": False, "error": "No data received"}), 400
        entry_data = request.json
        print(f"Received entry data: {entry_data.keys() if entry_data else 'None'}")
        
        # Convert all numeric fields to proper types (React sends everything as strings)
        # Include both form field names and database field names
        numeric_fields = [
            'morning_stress', 'afternoon_stress', 'night_stress',  # Form field names
            'stress_morning', 'stress_afternoon', 'stress_night',  # Database field names
            'exercise_minutes', 'water_intake', 'sleep_hours', 'sleep_quality'
        ]
        
        for field in numeric_fields:
            if field in entry_data:
                try:
                    entry_data[field] = float(entry_data[field]) if '.' in str(entry_data[field]) else int(entry_data[field])
                except (ValueError, TypeError):
                    entry_data[field] = 0
        
        # Map form field names to database field names
        field_mapping = {
            'morning_stress': 'stress_morning',
            'afternoon_stress': 'stress_afternoon',
            'night_stress': 'stress_night'
        }
        
        for form_field, db_field in field_mapping.items():
            if form_field in entry_data:
                entry_data[db_field] = entry_data.pop(form_field)
        
        # Convert boolean fields
        if 'on_period' in entry_data:
            entry_data['on_period'] = bool(entry_data['on_period'])
        
        # Calculate average stress (using database field names now)
        if 'stress_morning' in entry_data and 'stress_afternoon' in entry_data and 'stress_night' in entry_data:
            entry_data['average_stress'] = (
                float(entry_data.get('stress_morning', 0)) + 
                float(entry_data.get('stress_afternoon', 0)) + 
                float(entry_data.get('stress_night', 0))
            ) / 3.0
        
        # Add date if not present
        if 'date' not in entry_data:
            entry_data['date'] = datetime.now().strftime("%Y-%m-%d")
        # Note: timestamp will be converted to datetime object in db_storage.save_wellness_entry()
        # We keep it as ISO string here for JSON serialization, it gets converted when saving
        if 'timestamp' not in entry_data:
            entry_data['timestamp'] = datetime.now().isoformat()
        
        # Get ML predictions (create a copy with both field name formats for compatibility)
        ml_data = entry_data.copy()
        # ML models might use either format, so include both
        if 'stress_morning' in ml_data and 'morning_stress' not in ml_data:
            ml_data['morning_stress'] = ml_data['stress_morning']
            ml_data['afternoon_stress'] = ml_data.get('stress_afternoon', ml_data.get('afternoon_stress', 0))
            ml_data['night_stress'] = ml_data.get('stress_night', ml_data.get('night_stress', 0))
        
        try:
            ml_insights = ml_predictor.predict_wellness(ml_data)
            entry_data['wellness_score'] = ml_insights['wellness_score']
            entry_data['sentiment_score'] = ml_insights['sentiment_score']
            entry_data['predicted_energy'] = ml_insights['predicted_energy']
        except Exception as e:
            print(f"ML prediction error: {e}")
            entry_data['wellness_score'] = 0
            entry_data['sentiment_score'] = 0
            entry_data['predicted_energy'] = 0
        
        # Clean up: Remove any form field names that shouldn't be in entry_data
        # (they should have been converted to db field names already)
        form_fields_to_remove = ['morning_stress', 'afternoon_stress', 'night_stress']
        for field in form_fields_to_remove:
            entry_data.pop(field, None)  # Remove if present, ignore if not
        
        # Save entry
        saved_entry = save_wellness_entry(entry_data)
        
        # Train ML models if enough data
        all_entries = get_all_entries()
        if len(all_entries) >= 10 and not ml_predictor.is_xgb_trained:
            ml_predictor.train_xgboost_model(all_entries)
        if len(all_entries) >= 7 and not ml_predictor.is_lstm_trained:
            ml_predictor.train_lstm_model(all_entries)
        
        return jsonify({"success": True, "data": entry_data, "ml_trained": {
            "xgboost": ml_predictor.is_xgb_trained,
            "lstm": ml_predictor.is_lstm_trained
        }})
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in create_entry: {str(e)}")
        print(error_trace)
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/entries/<date>', methods=['GET'])
def get_entry_by_date(date):
    """Get entry by date"""
    try:
        entries = get_all_entries()
        entry = next((e for e in entries if e['date'] == date), None)
        if entry:
            return jsonify({"success": True, "data": entry})
        else:
            return jsonify({"success": False, "error": "Entry not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== Dashboard Endpoints ====================

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        entries = get_all_entries()
        if not entries:
            return jsonify({"success": True, "data": {
                "avg_wellness": 0,
                "avg_sleep": 0,
                "avg_exercise": 0,
                "avg_stress": 0,
                "total_entries": 0
            }})
        
        import pandas as pd
        df = pd.DataFrame(entries)
        recent = df.tail(7)
        
        # Helper function to safely get mean
        def safe_mean(series, default=0):
            try:
                return float(series.mean()) if len(series) > 0 else default
            except:
                return default
        
        return jsonify({"success": True, "data": {
            "avg_wellness": safe_mean(recent['wellness_score']) if 'wellness_score' in recent.columns else 0,
            "avg_sleep": safe_mean(recent['sleep_hours'], 0),
            "avg_exercise": safe_mean(recent['exercise_minutes'], 0),
            "avg_stress": safe_mean(recent['average_stress'], 0),
            "total_entries": len(entries)
        }})
    except Exception as e:
        import traceback
        print(f"Error in get_dashboard_stats: {e}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/dashboard/charts', methods=['GET'])
def get_dashboard_charts():
    """Get dashboard chart data"""
    try:
        entries = get_all_entries()
        if not entries:
            return jsonify({"success": True, "data": {
                "wellness_scores": [],
                "stress_levels": [],
                "sleep_data": [],
                "exercise_data": [],
                "water_data": []
            }})
        
        import pandas as pd
        df = pd.DataFrame(entries)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Helper function to safely get numeric values
        def safe_float(value, default=0):
            try:
                return float(value) if value is not None else default
            except (ValueError, TypeError):
                return default
        
        def safe_int(value, default=0):
            try:
                return int(value) if value is not None else default
            except (ValueError, TypeError):
                return default
        
        chart_data = {
            "wellness_scores": [{"date": str(row['date']), "score": safe_float(row.get('wellness_score', 0))} 
                                for _, row in df.iterrows()] if 'wellness_score' in df.columns else [],
            "stress_levels": [{
                "date": str(row['date']),
                "morning": safe_float(row.get('stress_morning', row.get('morning_stress', 0))),
                "afternoon": safe_float(row.get('stress_afternoon', row.get('afternoon_stress', 0))),
                "night": safe_float(row.get('stress_night', row.get('night_stress', 0)))
            } for _, row in df.iterrows()],
            "sleep_data": [{
                "date": str(row['date']),
                "hours": safe_float(row.get('sleep_hours', 0)),
                "quality": safe_float(row.get('sleep_quality', 0))
            } for _, row in df.iterrows()],
            "exercise_data": [{"date": str(row['date']), "minutes": safe_int(row.get('exercise_minutes', 0))} 
                             for _, row in df.iterrows()],
            "water_data": [{"date": str(row['date']), "intake": safe_int(row.get('water_intake', 0))} 
                           for _, row in df.iterrows()]
        }
        
        return jsonify({"success": True, "data": chart_data})
    except Exception as e:
        import traceback
        print(f"Error in get_dashboard_charts: {e}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== Reports Endpoints ====================

@app.route('/api/reports/weekly', methods=['GET'])
def get_weekly_report():
    """Generate weekly report"""
    try:
        entries = get_all_entries()
        if len(entries) < 3:
            return jsonify({"success": False, "error": "Need at least 3 entries"}), 400
        
        import pandas as pd
        df = pd.DataFrame(entries)
        
        # Generate report HTML (simplified version)
        report_html = generate_weekly_report(df)
        
        # Also return structured data
        recent = df.tail(7)
        report_data = {
            "avg_wellness": float(recent['wellness_score'].mean()) if 'wellness_score' in recent.columns else 0,
            "avg_stress": float(recent['average_stress'].mean()),
            "avg_sleep": float(recent['sleep_hours'].mean()),
            "total_exercise": int(recent['exercise_minutes'].sum()),
            "avg_water": float(recent['water_intake'].mean()),
            "period_days": int(recent['on_period'].sum()) if 'on_period' in recent.columns else 0
        }
        
        return jsonify({"success": True, "html": report_html, "data": report_data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/reports/monthly', methods=['GET'])
def get_monthly_report():
    """Generate monthly report"""
    try:
        entries = get_all_entries()
        if len(entries) < 7:
            return jsonify({"success": False, "error": "Need at least 7 entries"}), 400
        
        import pandas as pd
        df = pd.DataFrame(entries)
        
        report_html = generate_monthly_report(df, ml_predictor)
        
        # Structured data
        recent = df.tail(30)
        report_data = {
            "total_entries": len(recent),
            "avg_wellness": float(recent['wellness_score'].mean()) if 'wellness_score' in recent.columns else 0,
            "total_exercise": int(recent['exercise_minutes'].sum()),
            "avg_sleep": float(recent['sleep_hours'].mean()),
            "period_days": int(recent['on_period'].sum()) if 'on_period' in recent.columns else 0,
            "avg_stress": float(recent['average_stress'].mean())
        }
        
        return jsonify({"success": True, "html": report_html, "data": report_data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== Recommendations Endpoint ====================

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    """Get personalized recommendations"""
    try:
        entries = get_all_entries()
        if not entries:
            return jsonify({"success": False, "error": "No data available"}), 400
        
        import pandas as pd
        df = pd.DataFrame(entries)
        
        recommendations_html = get_personalized_recommendations(df)
        
        return jsonify({"success": True, "html": recommendations_html})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== Cycle Prediction Endpoints ====================

@app.route('/api/cycle/predict', methods=['GET'])
def get_cycle_prediction():
    """Get cycle prediction"""
    try:
        entries = get_all_entries()
        data = {"entries": entries}
        
        prediction = predict_next_cycle(data)
        
        if prediction is None:
            return jsonify({"success": False, "error": "Need at least 2 cycles tracked"}), 400
        
        return jsonify({"success": True, "data": {
            "predicted_date": prediction['predicted_date'].isoformat(),
            "days_until": (prediction['predicted_date'] - datetime.now()).days,
            "confidence": prediction['confidence'],
            "confidence_range_days": prediction['confidence_range_days'],
            "avg_cycle_length": float(prediction['avg_cycle_length']),
            "cycle_regularity": prediction['cycle_regularity'],
            "total_cycles_tracked": prediction['total_cycles_tracked']
        }})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/cycle/symptoms', methods=['GET'])
def get_symptom_predictions():
    """Get symptom predictions"""
    try:
        entries = get_all_entries()
        data = {"entries": entries}
        
        predictions = predict_symptom_likelihood(data)
        
        return jsonify({"success": True, "data": predictions})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== Analytics Endpoints ====================

@app.route('/api/analytics/trends', methods=['GET'])
def get_trends():
    """Get trend analysis data"""
    try:
        entries = get_all_entries()
        if len(entries) < 3:
            return jsonify({"success": False, "error": "Need at least 3 entries"}), 400
        
        import pandas as pd
        df = pd.DataFrame(entries)
        df['date'] = pd.to_datetime(df['date'])
        
        # Calculate correlations
        correlation_metrics = ['average_stress', 'sleep_hours', 'sleep_quality', 
                              'exercise_minutes', 'water_intake', 'wellness_score']
        
        corr_data = {}
        if all(col in df.columns for col in correlation_metrics):
            corr_matrix = df[correlation_metrics].corr()
            corr_data = corr_matrix.to_dict()
        
        # Monthly aggregates
        monthly_data = calculate_monthly_aggregates(df) if len(df) >= 14 else None
        
        return jsonify({"success": True, "data": {
            "correlations": corr_data,
            "monthly_aggregates": monthly_data.to_dict('records') if monthly_data is not None else None
        }})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analytics/comparative', methods=['GET'])
def get_comparative_analytics():
    """Get comparative analytics"""
    try:
        entries = get_all_entries()
        if len(entries) < 14:
            return jsonify({"success": False, "error": "Need at least 14 entries"}), 400
        
        import pandas as pd
        df = pd.DataFrame(entries)
        df['date'] = pd.to_datetime(df['date'])
        
        monthly_stats = calculate_monthly_aggregates(df)
        comparisons = compare_months(df)
        
        return jsonify({"success": True, "data": {
            "monthly_stats": monthly_stats.to_dict('records'),
            "comparisons": comparisons
        }})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== Export Endpoints ====================

@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    """Export data as CSV"""
    try:
        entries = get_all_entries()
        data = {"entries": entries}
        
        csv_data = export_to_csv(data)
        
        if csv_data:
            return csv_data, 200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': f'attachment; filename=wellness_data_{datetime.now().strftime("%Y%m%d")}.csv'
            }
        else:
            return jsonify({"success": False, "error": "No data to export"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/export/json', methods=['GET'])
def export_json():
    """Export data as JSON"""
    try:
        entries = get_all_entries()
        data = {"entries": entries}
        
        json_data = export_to_json(data)
        
        return json_data, 200, {
            'Content-Type': 'application/json',
            'Content-Disposition': f'attachment; filename=wellness_data_{datetime.now().strftime("%Y%m%d")}.json'
        }
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/export/summary', methods=['GET'])
def export_summary():
    """Generate summary report"""
    try:
        entries = get_all_entries()
        data = {"entries": entries}
        
        summary = create_summary_report(data)
        
        return summary, 200, {
            'Content-Type': 'text/plain',
            'Content-Disposition': f'attachment; filename=wellness_summary_{datetime.now().strftime("%Y%m%d")}.txt'
        }
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== ML Model Endpoints ====================

@app.route('/api/ml/predict', methods=['POST'])
def predict_wellness():
    """Predict wellness using ML models"""
    try:
        entry_data = request.json
        predictions = ml_predictor.predict_wellness(entry_data)
        return jsonify({"success": True, "data": predictions})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/ml/status', methods=['GET'])
def ml_status():
    """Get ML model training status"""
    try:
        entries = get_all_entries()
        return jsonify({"success": True, "data": {
            "xgboost_trained": ml_predictor.is_xgb_trained,
            "lstm_trained": ml_predictor.is_lstm_trained,
            "total_entries": len(entries),
            "xgboost_ready": len(entries) >= 10,
            "lstm_ready": len(entries) >= 7
        }})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== User Profile Endpoints ====================

@app.route('/api/profile', methods=['GET'])
def get_profile():
    """Get user profile"""
    try:
        profile = get_user_profile()
        return jsonify({"success": True, "data": profile})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/profile', methods=['PUT'])
def update_profile():
    """Update user profile"""
    try:
        profile_data = request.json
        update_user_profile(profile_data)
        return jsonify({"success": True, "message": "Profile updated"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

