# Women's Wellness Tracker

## Overview

This is a comprehensive women's wellness tracking application built with Streamlit that enables users to monitor their daily health metrics, menstrual cycle, and overall wellbeing. The application uses machine learning models to predict wellness scores, analyze trends, and provide personalized recommendations based on user data. It tracks multiple health indicators including nutrition, stress levels, exercise, sleep quality, water intake, and menstrual cycle symptoms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Streamlit web application framework
- **Layout**: Wide layout with expandable sidebar for navigation
- **Visualization**: Plotly for interactive charts and dashboards
- **State Management**: Streamlit session state for maintaining user data and ML model instances across reruns

### Backend Architecture
- **Core Application**: `app.py` serves as the main entry point, orchestrating data flow between components
- **Data Persistence**: JSON file-based storage (`wellness_data.json`) for user entries
- **Modular Design**: Functionality separated into distinct modules:
  - `ml_models.py` - Machine learning prediction models
  - `visualizations.py` - Chart and dashboard generation
  - `recommendations.py` - Personalized health recommendations
  - `reports.py` - Weekly and monthly report generation

### Machine Learning Architecture
- **XGBoost Regressor**: For wellness score prediction using gradient boosting
- **LSTM Neural Network**: Time-series forecasting for energy levels and trend prediction (TensorFlow/Keras)
- **Sentiment Analysis**: TextBlob for natural language processing of user notes
- **Feature Engineering**: StandardScaler and MinMaxScaler for data normalization
- **Model Persistence**: Models saved to `ml_models_saved/` directory for reuse across sessions

**Rationale**: Multiple ML approaches provide complementary insights - XGBoost for accurate scoring, LSTM for temporal patterns, and NLP for qualitative data analysis.

### Data Storage
- **Format**: JSON for human-readable and easily portable data storage
- **Schema**: Entries contain date, timestamp, meal information, stress levels (morning/afternoon/night), exercise minutes, water intake, sleep data, menstrual cycle information, symptoms, notes, and computed metrics (wellness score, sentiment score, predicted energy)
- **Location**: Single `wellness_data.json` file in project root

**Trade-offs**: JSON chosen for simplicity and portability over database performance. Suitable for personal use with moderate data volumes but may need migration to database for multi-user scenarios.

### Health Tracking Components
- **Menstrual Cycle**: 28-day cycle tracking with phase determination (Menstrual, Follicular, Ovulation, Luteal)
- **Symptom Tracking**: Binary flags for 10 common symptoms (headache, flow levels, cramping, bloating, mood swings, fatigue, nausea, back pain, breast tenderness)
- **Stress Monitoring**: Three daily measurements (morning, afternoon, night) averaged for daily stress score
- **Wellness Scoring**: Composite score (0-100) calculated from multiple health factors

## External Dependencies

### Core Frameworks
- **Streamlit**: Web application framework for rapid UI development
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing

### Machine Learning Libraries
- **scikit-learn**: Traditional ML algorithms (GradientBoostingRegressor, RandomForestClassifier) and preprocessing (StandardScaler, MinMaxScaler)
- **XGBoost**: Gradient boosting framework for wellness score prediction
- **TensorFlow/Keras**: Deep learning framework for LSTM time-series models
- **TextBlob**: NLP library for sentiment analysis of user notes

### Visualization
- **Plotly**: Interactive charting library (plotly.graph_objects, plotly.express) for dashboards and trend visualization

### Data Handling
- **JSON**: Built-in Python module for data persistence
- **datetime**: Date and time manipulation for cycle tracking and trends
- **pathlib**: File system path handling

**Note**: Application currently uses local file storage. No external database or cloud services are integrated, making it suitable for single-user desktop deployment.