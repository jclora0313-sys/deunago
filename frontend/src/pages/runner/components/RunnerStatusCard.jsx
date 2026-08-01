function RunnerStatusCard({
  user,
  actualizarDisponibilidadRunner,
}) {
  return (
    <div className="runner-profile-card">
      <h2>🛵 Perfil del mandadero</h2>

      <div className="runner-status-grid">
        <div className="status-box">
          <span>Disponibilidad</span>

          <strong
            style={{
              color: user.isAvailable ? "#22c55e" : "#ef4444",
            }}
          >
            {user.isAvailable ? "Disponible" : "No disponible"}
          </strong>
        </div>

        <div className="status-box">
          <span>Identificación</span>

          <strong
            style={{
              color: user.identificationValid
                ? "#22c55e"
                : "#f59e0b",
            }}
          >
            {user.identificationValid
              ? "Validada"
              : "Pendiente"}
          </strong>
        </div>

        <div className="status-box">
          <span>Licencia</span>

          <strong
            style={{
              color: user.licenseValid
                ? "#22c55e"
                : "#f59e0b",
            }}
          >
            {user.licenseValid ? "Validada" : "Pendiente"}
          </strong>
        </div>
      </div>

      <button
        className={
          user.isAvailable
            ? "button button-danger"
            : "button button-success"
        }
        onClick={() =>
          actualizarDisponibilidadRunner(!user.isAvailable)
        }
      >
        {user.isAvailable
          ? "🔴 Ponerse no disponible"
          : "🟢 Ponerse disponible"}
      </button>
    </div>
  );
}

export default RunnerStatusCard;