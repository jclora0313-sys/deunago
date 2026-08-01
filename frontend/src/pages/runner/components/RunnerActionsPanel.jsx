function RunnerActionsPanel({
  trackingTaskId,
  cargarMandados,
  cargarMisMandados,
  cargarGanancias,
  cargarEstadisticasRunner,
  detenerTrackingRunner,
}) {
  return (
    <>
      <div className="runner-actions">
        <button
          onClick={cargarMandados}
          className="button button-primary"
        >
          📦 Ver disponibles
        </button>

        <button
          onClick={cargarMisMandados}
          className="button button-primary"
        >
          🛵 Mis mandados
        </button>

        <button
          onClick={() => {
            cargarGanancias();
            cargarEstadisticasRunner();
          }}
          className="button button-success"
        >
          💰 Ver ganancias
        </button>
      </div>

      {trackingTaskId && (
        <div className="runner-highlight">
          <div className="tracking-live">Tracking activo</div>

          <h2>📡 Mandado #{trackingTaskId}</h2>

          <button
            onClick={detenerTrackingRunner}
            className="button button-danger"
          >
            Detener tracking
          </button>
        </div>
      )}
    </>
  );
}

export default RunnerActionsPanel;