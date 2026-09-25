import React, { useState } from 'react';

export default function Dashboard() {
  const [showScoringModal, setShowScoringModal] = useState(false);

  return (
    <div>
      <h1>Achievement Hub</h1>

      <button onClick={() => setShowScoringModal(true)}>
        How scoring works
      </button>

      {showScoringModal && (
        <div>
          <h2>Scoring</h2>
          <button onClick={() => setShowScoringModal(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}