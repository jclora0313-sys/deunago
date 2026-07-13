function UsersTable({
  users = [],
  showOnlyPendingUsers,
  validarIdentificacionRunner,
  validarLicenciaRunner,
  aprobarRunner,
}) {
  const filteredUsers = users.filter((user) => {
    if (!showOnlyPendingUsers) return true;

    return (
      user.role === "RUNNER" &&
      (!user.identificationValid ||
        !user.licenseValid ||
        user.status !== "APPROVED")
    );
  });

  return (
    <div id="users-section" className="card">
      <h2 className="admin-section-title">👥 Usuarios</h2>

      {users.length === 0 && (
        <p className="empty">No hay usuarios cargados.</p>
      )}

      {users.length > 0 && filteredUsers.length === 0 && (
        <p className="empty">
          No hay runners pendientes de revisión.
        </p>
      )}

      <div className="admin-users-grid">
        {filteredUsers.map((user) => (
          <div key={user.id} className="admin-user-card">
            <div className="admin-user-header">
              <div className="admin-user-main">
                {user.profilePhotoUrl && (
                  <img
                    src={user.profilePhotoUrl}
                    alt={user.name}
                    className="admin-user-avatar"
                  />
                )}

                <div>
                  <h3>{user.name}</h3>
                  <p className="admin-user-meta">{user.phone}</p>
                </div>
              </div>

              <div className="admin-user-role">
                {user.role}
              </div>
            </div>

            <p className="admin-user-meta">
              Estado: {user.status}
            </p>

            {user.role === "RUNNER" && (
              <>
                <p className="admin-user-meta">
                  Disponible: {user.isAvailable ? "Sí" : "No"}
                </p>

                <p className="admin-user-meta">
                  Identificación:{" "}
                  {user.identificationValid
                    ? "Validada"
                    : "Pendiente"}
                </p>

                <p className="admin-user-meta">
                  Licencia:{" "}
                  {user.licenseValid
                    ? "Validada"
                    : "Pendiente"}
                </p>

                {user.identificationUrl && (
                  <a
                    href={user.identificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="document-link"
                  >
                    🪪 Ver identificación
                  </a>
                )}

                {user.licenseUrl && (
                  <a
                    href={user.licenseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="document-link"
                  >
                    🚗 Ver licencia
                  </a>
                )}

                {!user.identificationValid && (
                  <button
                    onClick={() =>
                      validarIdentificacionRunner(user.id)
                    }
                    className="button button-primary"
                  >
                    🪪 Validar identificación
                  </button>
                )}

                {!user.licenseValid && (
                  <button
                    onClick={() =>
                      validarLicenciaRunner(user.id)
                    }
                    className="button button-primary"
                  >
                    🚗 Validar licencia
                  </button>
                )}

                {(!user.identificationValid ||
                  !user.licenseValid ||
                  user.status !== "APPROVED") && (
                  <button
                    onClick={() => aprobarRunner(user.id)}
                    className="button button-success"
                  >
                    ✅ Aprobar runner
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UsersTable;