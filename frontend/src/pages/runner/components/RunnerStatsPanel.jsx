function RunnerStatsPanel({
  earnings,
  runnerStats,
}) {
  return (
    <>
      {earnings && (
        <div className="runner-highlight">
          <h2>💰 Ganancias</h2>

          <div className="runner-stats-grid">
            <div className="runner-stat-card">
              <p className="runner-stat-label">
                Total ganado 70%
              </p>

              <p className="runner-stat-value">
                RD${earnings.totalEarnings || 0}
              </p>
            </div>

            <div className="runner-stat-card">
              <p className="runner-stat-label">
                Mandados completados
              </p>

              <p className="runner-stat-value">
                {earnings.completedCount || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {runnerStats && (
        <div className="runner-highlight">
          <h2>⭐ Reputación</h2>

          <p>
            Rating promedio: {runnerStats.averageRating || 0}/5
          </p>

          <p>
            Calificaciones recibidas:{" "}
            {runnerStats.ratingsCount || 0}
          </p>

          <p>
            Mandados completados:{" "}
            {runnerStats.completedCount || 0}
          </p>
        </div>
      )}
    </>
  );
}

export default RunnerStatsPanel;