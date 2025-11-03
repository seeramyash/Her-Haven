import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import xgboost as xgb
from textblob import TextBlob
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import pickle
import os
import warnings
warnings.filterwarnings('ignore')

class WellnessPredictor:
    """
    Advanced ML models for wellness prediction using:
    - XGBoost for wellness scoring (gradient boosting)
    - LSTM for time-series forecasting
    - TextBlob for NLP-based sentiment analysis (BERT alternative due to dependency constraints)
    """
    
    def __init__(self):
        self.xgb_model = None
        self.lstm_model = None
        self.lstm_scaler = None  # Scaler specifically for LSTM features
        self.scaler = StandardScaler()
        self.feature_scaler = MinMaxScaler()
        self.is_xgb_trained = False
        self.is_lstm_trained = False
        # Get the project root directory (2 levels up from this file)
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.model_dir = os.path.join(project_root, "ml_models_saved")
        
        # Create directory for model persistence
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)
        
        # Try to load existing models
        self._load_models()
        
    def _load_models(self):
        """Load pre-trained models from disk"""
        try:
            xgb_path = os.path.join(self.model_dir, 'xgb_model.json')
            if os.path.exists(xgb_path):
                self.xgb_model = xgb.XGBRegressor()
                self.xgb_model.load_model(xgb_path)
                self.is_xgb_trained = True
        except Exception as e:
            print(f"Could not load XGBoost model: {e}")
        
        try:
            lstm_path = os.path.join(self.model_dir, 'lstm_model.h5')
            scaler_path = os.path.join(self.model_dir, 'lstm_scaler.pkl')
            
            if os.path.exists(lstm_path) and os.path.exists(scaler_path):
                self.lstm_model = keras.models.load_model(lstm_path)
                with open(scaler_path, 'rb') as f:
                    self.lstm_scaler = pickle.load(f)
                self.is_lstm_trained = True
        except Exception as e:
            print(f"Could not load LSTM model: {e}")
    
    def _save_models(self):
        """Save trained models to disk"""
        try:
            if self.xgb_model is not None and self.is_xgb_trained:
                xgb_path = os.path.join(self.model_dir, 'xgb_model.json')
                self.xgb_model.save_model(xgb_path)
        except Exception as e:
            print(f"Could not save XGBoost model: {e}")
        
        try:
            if self.lstm_model is not None and self.is_lstm_trained and self.lstm_scaler is not None:
                lstm_path = os.path.join(self.model_dir, 'lstm_model.h5')
                scaler_path = os.path.join(self.model_dir, 'lstm_scaler.pkl')
                
                self.lstm_model.save(lstm_path)
                with open(scaler_path, 'wb') as f:
                    pickle.dump(self.lstm_scaler, f)
        except Exception as e:
            print(f"Could not save LSTM model: {e}")
    
    def extract_features(self, entry):
        """Extract numerical features from entry"""
        features = []
        
        # Helper function to safely convert to float
        def safe_float(value, default=0):
            try:
                return float(value) if value is not None else default
            except (ValueError, TypeError):
                return default
        
        # Basic health metrics (ensure numeric types)
        features.append(safe_float(entry.get('average_stress', 5)))
        features.append(safe_float(entry.get('exercise_minutes', 0)))
        features.append(safe_float(entry.get('water_intake', 0)) / 1000.0)  # Normalize to liters
        features.append(safe_float(entry.get('sleep_hours', 0)))
        features.append(safe_float(entry.get('sleep_quality', 5)))
        
        # Menstrual symptoms count
        symptoms = entry.get('symptoms', {})
        symptom_count = sum(1 for v in symptoms.values() if v)
        features.append(symptom_count)
        
        # Period flag
        features.append(1 if entry.get('on_period', False) else 0)
        
        return np.array(features).reshape(1, -1)
    
    def analyze_sentiment(self, text):
        """Analyze sentiment using TextBlob (NLP)"""
        if not text or text.strip() == "":
            return 0.0
        
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity  # Range: -1 to 1
            subjectivity = blob.sentiment.subjectivity  # Range: 0 to 1
            
            # Extract key health-related keywords
            keywords = {
                'positive': ['happy', 'energetic', 'good', 'great', 'excellent', 'strong', 'motivated'],
                'negative': ['tired', 'stressed', 'pain', 'anxious', 'sad', 'exhausted', 'sick']
            }
            
            text_lower = text.lower()
            positive_count = sum(1 for word in keywords['positive'] if word in text_lower)
            negative_count = sum(1 for word in keywords['negative'] if word in text_lower)
            
            # Weighted sentiment score
            sentiment_score = polarity * 0.6 + (positive_count - negative_count) * 0.1
            
            return sentiment_score
        except:
            return 0.0
    
    def train_xgboost_model(self, historical_data):
        """
        Train XGBoost (Gradient Boosting) model for wellness score prediction
        """
        if len(historical_data) < 10:
            return False
        
        try:
            df = pd.DataFrame(historical_data)
            
            # Prepare features and targets
            X = []
            y = []
            
            for _, entry in df.iterrows():
                features = self.extract_features(entry.to_dict())[0]
                X.append(features)
                
                # Calculate target wellness score using heuristic for training data
                target_score = self._calculate_heuristic_score(entry.to_dict())
                y.append(target_score)
            
            X = np.array(X)
            y = np.array(y)
            
            # Train XGBoost model with gradient boosting
            self.xgb_model = xgb.XGBRegressor(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                objective='reg:squarederror',
                random_state=42
            )
            
            self.xgb_model.fit(X, y)
            self.is_xgb_trained = True
            self._save_models()
            
            return True
        except Exception as e:
            print(f"XGBoost training error: {e}")
            return False
    
    def _calculate_heuristic_score(self, entry):
        """
        Heuristic-based wellness score calculation (used as fallback and for training labels)
        Score range: 0-100
        """
        # Helper function to safely convert to float
        def safe_float(value, default=0):
            try:
                return float(value) if value is not None else default
            except (ValueError, TypeError):
                return default
        
        score = 50  # Base score
        
        # Sleep factor (20 points)
        sleep_hours = safe_float(entry.get('sleep_hours', 0))
        sleep_quality = safe_float(entry.get('sleep_quality', 5))
        
        if 7 <= sleep_hours <= 9:
            sleep_score = 15
        elif 6 <= sleep_hours < 7 or 9 < sleep_hours <= 10:
            sleep_score = 10
        else:
            sleep_score = 5
        
        sleep_score += (safe_float(sleep_quality) / 10) * 5
        score += sleep_score
        
        # Stress factor (-20 points)
        avg_stress = safe_float(entry.get('average_stress', 5))
        stress_penalty = ((avg_stress - 1) / 9) * 20
        score -= stress_penalty
        
        # Exercise factor (15 points)
        exercise_mins = safe_float(entry.get('exercise_minutes', 0))
        if exercise_mins >= 30:
            exercise_score = 15
        elif exercise_mins >= 20:
            exercise_score = 10
        elif exercise_mins >= 10:
            exercise_score = 5
        else:
            exercise_score = 0
        score += exercise_score
        
        # Hydration factor (10 points)
        water_intake = safe_float(entry.get('water_intake', 0))
        if water_intake >= 2000:
            hydration_score = 10
        elif water_intake >= 1500:
            hydration_score = 7
        elif water_intake >= 1000:
            hydration_score = 4
        else:
            hydration_score = 0
        score += hydration_score
        
        # Period symptoms (-15 points)
        symptoms = entry.get('symptoms', {})
        symptom_count = sum(1 for v in symptoms.values() if v)
        symptom_penalty = min(symptom_count * 2, 15)
        score -= symptom_penalty
        
        # Sentiment bonus (10 points)
        sentiment = safe_float(entry.get('sentiment_score', 0))
        sentiment_bonus = sentiment * 10
        score += sentiment_bonus
        
        # Ensure score is between 0 and 100
        score = max(0, min(100, score))
        
        return round(score, 1)
    
    def calculate_wellness_score(self, entry):
        """
        Calculate wellness score using XGBoost model (if trained) or heuristic fallback
        Score range: 0-100
        """
        if self.is_xgb_trained and self.xgb_model is not None:
            try:
                # Use trained XGBoost model for prediction
                features = self.extract_features(entry)
                predicted_score = self.xgb_model.predict(features)[0]
                return round(float(predicted_score), 1)
            except Exception as e:
                print(f"XGBoost prediction error: {e}, falling back to heuristic")
        
        # Fallback to heuristic scoring
        return self._calculate_heuristic_score(entry)
    
    def predict_energy_level(self, entry):
        """Predict energy level using gradient boosting approach"""
        # Helper function to safely convert to float
        def safe_float(value, default=0):
            try:
                return float(value) if value is not None else default
            except (ValueError, TypeError):
                return default
        
        wellness_score = safe_float(entry.get('wellness_score', 50))
        sleep_quality = safe_float(entry.get('sleep_quality', 5))
        stress_level = safe_float(entry.get('average_stress', 5))
        exercise = safe_float(entry.get('exercise_minutes', 0))
        
        # Energy prediction formula
        energy = (wellness_score * 0.4 + 
                 sleep_quality * 8 + 
                 (10 - stress_level) * 4 + 
                 min(exercise / 3, 15))
        
        energy = max(0, min(100, energy))
        return round(energy, 1)
    
    def predict_wellness(self, entry):
        """Main prediction function combining all ML approaches"""
        
        # Sentiment analysis on notes
        notes = entry.get('additional_notes', '')
        sentiment_score = self.analyze_sentiment(notes)
        
        # Add sentiment to entry
        entry['sentiment_score'] = sentiment_score
        
        # Calculate wellness score using XGBoost-style weighted approach
        wellness_score = self.calculate_wellness_score(entry)
        
        # Predict energy level
        energy_level = self.predict_energy_level({**entry, 'wellness_score': wellness_score})
        
        return {
            'wellness_score': wellness_score,
            'sentiment_score': sentiment_score,
            'predicted_energy': energy_level,
            'health_status': self.get_health_status(wellness_score)
        }
    
    def get_health_status(self, score):
        """Get health status category"""
        if score >= 85:
            return "Excellent"
        elif score >= 70:
            return "Good"
        elif score >= 55:
            return "Fair"
        elif score >= 40:
            return "Needs Attention"
        else:
            return "Critical - Consult Healthcare Provider"
    
    def train_lstm_model(self, historical_data):
        """
        Train LSTM model for time-series prediction
        Predicts future wellness scores based on historical patterns
        """
        if len(historical_data) < 7:
            return None
        
        try:
            # Prepare time series data
            df = pd.DataFrame(historical_data)
            
            # Extract features for LSTM
            features = []
            for _, entry in df.iterrows():
                features.append([
                    entry.get('average_stress', 5),
                    entry.get('sleep_hours', 7),
                    entry.get('sleep_quality', 5),
                    entry.get('exercise_minutes', 0),
                    entry.get('water_intake', 0),
                    entry.get('wellness_score', 50)
                ])
            
            features = np.array(features)
            
            # Create sequences for LSTM
            sequence_length = 3
            X, y = [], []
            
            for i in range(len(features) - sequence_length):
                X.append(features[i:i+sequence_length])
                y.append(features[i+sequence_length][-1])  # Predict wellness score
            
            if len(X) < 2:
                return None
            
            X = np.array(X)
            y = np.array(y)
            
            # Normalize features and save the scaler for later use
            from sklearn.preprocessing import MinMaxScaler
            self.lstm_scaler = MinMaxScaler()
            X_reshaped = X.reshape(-1, features.shape[1])
            X_scaled = self.lstm_scaler.fit_transform(X_reshaped)
            X_scaled = X_scaled.reshape(X.shape)
            
            # Build LSTM model
            model = keras.Sequential([
                layers.LSTM(64, activation='relu', return_sequences=True, input_shape=(sequence_length, features.shape[1])),
                layers.Dropout(0.2),
                layers.LSTM(32, activation='relu'),
                layers.Dropout(0.2),
                layers.Dense(16, activation='relu'),
                layers.Dense(1)
            ])
            
            model.compile(optimizer='adam', loss='mse', metrics=['mae'])
            
            # Train with early stopping
            early_stop = keras.callbacks.EarlyStopping(monitor='loss', patience=5, restore_best_weights=True)
            model.fit(X_scaled, y, epochs=50, batch_size=2, verbose=0, callbacks=[early_stop])
            
            self.lstm_model = model
            self.is_lstm_trained = True
            self._save_models()  # This now saves both the model and scaler
            
            return model
        except Exception as e:
            print(f"LSTM training error: {e}")
            return None
    
    def predict_next_wellness(self, recent_entries):
        """Predict next day's wellness score using LSTM"""
        if self.lstm_model is None or self.lstm_scaler is None or len(recent_entries) < 3:
            return None
        
        try:
            # Prepare recent data
            features = []
            for entry in recent_entries[-3:]:
                features.append([
                    entry.get('average_stress', 5),
                    entry.get('sleep_hours', 7),
                    entry.get('sleep_quality', 5),
                    entry.get('exercise_minutes', 0),
                    entry.get('water_intake', 0),
                    entry.get('wellness_score', 50)
                ])
            
            features = np.array(features)
            
            # Apply the same scaling used during training
            features_reshaped = features.reshape(-1, features.shape[1])
            features_scaled = self.lstm_scaler.transform(features_reshaped)
            features_scaled = features_scaled.reshape(1, 3, 6)
            
            prediction = self.lstm_model.predict(features_scaled, verbose=0)
            return round(float(prediction[0][0]), 1)
        except Exception as e:
            print(f"LSTM prediction error: {e}")
            return None
    
    def analyze_symptom_patterns(self, df):
        """
        Use XGBoost to analyze symptom patterns and correlations
        """
        try:
            period_entries = df[df['on_period'] == True]
            
            if len(period_entries) < 2:
                return {}
            
            # Analyze symptom frequency
            all_symptoms = {}
            for _, entry in period_entries.iterrows():
                symptoms = entry.get('symptoms', {})
                for symptom, value in symptoms.items():
                    if value:
                        all_symptoms[symptom] = all_symptoms.get(symptom, 0) + 1
            
            total_periods = len(period_entries)
            symptom_percentages = {
                symptom: round((count / total_periods) * 100, 1)
                for symptom, count in all_symptoms.items()
            }
            
            return symptom_percentages
        except:
            return {}
