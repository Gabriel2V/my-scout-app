/**
 * @component NationalTeams
 * @description Vista dedicata alle squadre nazionali.
 * Permette di esplorare le rose delle selezioni nazionali caricate nel sistema.
 * Utilizza il ViewModel useNationalTeamsViewModel per la gestione dei dati.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNationalTeamsViewModel } from '../../viewmodels/useNationalTeamsViewModel';
import GenericCard from '../components/GenericCard';

export default function NationalTeams() {
  const { teams, loading } = useNationalTeamsViewModel();
  const navigate = useNavigate();

  if (loading) return <div className="loading">Convocazione nazionali in corso...</div>;
  return (
    <div>
      <h2 className="pageTitle">Squadre Nazionali Maggiori</h2>
      <div className="grid">
        {teams.map(team => (
          <GenericCard 
            key={team.id}
            title={team.name}
            image={team.logo}
            subtitle="Vedi Rosa Convocati"
            onClick={() => navigate(`/squadre/${team.id}/giocatori`)}
          />
        ))}
      </div>
    </div>
  );
}