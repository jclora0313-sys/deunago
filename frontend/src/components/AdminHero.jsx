function AdminHero({ cargarUsuarios, cargarEstadisticasAdmin }) {
  return (
    <div className="admin-hero">
      <h2>👑 Panel Administrativo</h2>

      <p>
        Administra usuarios, runners, mandados y documentos en tiempo real desde
        DeUnaGo.
      </p>

      <div className="admin-actions">
        <button onClick={cargarUsuarios} className="button button-primary">
          👥 Cargar usuarios
        </button>

        <button
          onClick={cargarEstadisticasAdmin}
          className="button button-success"
        >
          📊 Ver estadísticas
        </button>
      </div>
    </div>
  );
}

export default AdminHero;