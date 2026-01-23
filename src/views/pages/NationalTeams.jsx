import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerService from '../../services/PlayerService';
import GenericCard from '../components/GenericCard';

export default function NationalTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lista di nazioni di esempio per popolare la vista iniziale
  const topNations = ["Italy", "France", "Argentina", "Brazil", "Spain", "Germany", "England", "Portugal"];

  useEffect(() => {
    const fetchNationalTeams = async () => {
      setLoading(true);
      try {
        // Cerchiamo le nazionali basandoci sui nomi dei paesi principali
        const requests = topNations.map(name => PlayerService.searchTeams(name));
        const results = await Promise.all(requests);
        
        // Filtriamo solo i risultati che sono effettivamente squadre nazionali
        const nationalTeams = results
          .flat()
          .filter(item => item.team.national)
          .map(item => ({
            id: item.team.id,
            name: item.team.name,
            logo: item.team.logo
          }));

        // Rimuoviamo duplicati
        const uniqueTeams = Array.from(new Map(nationalTeams.map(t => [t.id, t])).values());
        setTeams(uniqueTeams);
      } catch (error) {
        console.error("Errore caricamento nazionali:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNationalTeams();
  }, []);

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