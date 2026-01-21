import React from 'react';

export default function FilterBar({ minRating, setMinRating, roleFilter, setRoleFilter }) {
  const roles = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];

  return (
    <div style={{
      backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', 
      marginBottom: '2rem', display: 'flex', gap: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      alignItems: 'center', flexWrap: 'wrap'
    }}>
      <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
        <label style={{fontWeight: 'bold', color: '#003366'}}>Rating Minimo: {minRating}</label>
        <input 
          type="range" min="0" max="10" step="0.1" 
          value={minRating} onChange={(e) => setMinRating(e.target.value)} 
        />
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
        <label style={{fontWeight: 'bold', color: '#003366'}}>Ruolo:</label>
        <select 
          value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          style={{padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc'}}
        >
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
    </div>
  );
}