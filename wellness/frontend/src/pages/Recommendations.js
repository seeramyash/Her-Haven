import React, { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import { getRecommendations } from '../services/api';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const response = await getRecommendations();
      setRecommendations(response.data);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  if (!recommendations || !recommendations.success) {
    return (
      <div>
        <h1 className="sub-header">Recommendations</h1>
        <div className="alert alert-info">Add some entries first to get personalized recommendations!</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="sub-header">Personalized Recommendations</h1>
      <div className="card">
        {recommendations.html && <div>{parse(recommendations.html)}</div>}
      </div>
    </div>
  );
};

export default Recommendations;

