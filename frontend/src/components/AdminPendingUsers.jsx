function AdminPendingUsers({
  users,
  aprobarUsuario,
  rechazarUsuario,
}) {
  const pendingUsers = users.filter(
    (u) => u.status === "PENDING"
  );

  if (pendingUsers.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h2>📋 Usuarios pendientes</h2>

      {pendingUsers.map((u) => (
        <div key={u.id} className="task-card">

          <strong>{u.name}</strong>

          <p>{u.email}</p>

          <p>{u.role}</p>

          <div className="button-group">

            <button
              className="button button-success"
              onClick={() => aprobarUsuario(u.id)}
            >
              ✅ Aprobar
            </button>

            <button
              className="button button-danger"
              onClick={() => rechazarUsuario(u.id)}
            >
              ❌ Rechazar
            </button>

          </div>

        </div>
      ))}
    </div>
  );
}

export default AdminPendingUsers;