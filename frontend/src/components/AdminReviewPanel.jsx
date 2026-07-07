function AdminReviewPanel({
  users,
  cargarMandadosAdmin,
  showOnlyPendingUsers,
  setShowOnlyPendingUsers,
}) {
  if (!users || users.length === 0) return null;

  return (
    <div className="card">
      <h2>📋 Pendientes de revisión</h2>

      <button
        onClick={cargarMandadosAdmin}
        className="button button-primary"
      >
        🧾 Ver pagos
      </button>

      <button
        onClick={() => setShowOnlyPendingUsers(!showOnlyPendingUsers)}
        className="button button-success"
      >
        {showOnlyPendingUsers
          ? "Ver todos los usuarios"
          : "Ver solo pendientes"}
      </button>
    </div>
  );
}

export default AdminReviewPanel;