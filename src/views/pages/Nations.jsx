/**
 * @component Nations
 * @description Vista "Level 1" della navigazione gerarchica.
 * Visualizza la griglia delle nazioni supportate recuperate dal ViewModel.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNationsViewModel } from '../../viewmodels/useNationsViewModel';
import GenericCard from '../components/GenericCard';

export default function Nations() {
  const { nations, loading, error } = useNationsViewModel();
  const navigate = useNavigate();

  if (loading) return <div className="loading">Analisi geografica...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2 className="pageTitle">Seleziona una Nazione</h2>
      <div className="grid">
        {nations.map(nation => (
          <GenericCard 
            key={nation.name}
            title={nation.name}
            image={nation.flag}
            onClick={() => navigate(`/nazioni/${nation.name}`)}
          />
        ))}
      </div>
    </div>
  );
}