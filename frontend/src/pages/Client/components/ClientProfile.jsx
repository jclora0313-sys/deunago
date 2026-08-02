function ClientProfile({
  profile,
  profileName,
  setProfileName,
  profileAddress,
  setProfileAddress,
  setProfilePhotoFile,
  cargarPerfil,
  guardarPerfil,
  subirFotoPerfil,
  clientTasks,
  clientCompletedTasks,
  clientCancelledTasks,
  clientTotalSpent,
}) {
  return (
    <div id="profile-section" className="card">
      <h2>👤 Mi perfil</h2>

      <button
        onClick={cargarPerfil}
        className="button button-primary"
      >
        Cargar perfil
      </button>

      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <span>Mandados creados</span>
          <strong>{clientTasks.length}</strong>
        </div>

        <div className="profile-stat-card">
          <span>Completados</span>
          <strong>{clientCompletedTasks.length}</strong>
        </div>

        <div className="profile-stat-card">
          <span>Cancelados</span>
          <strong>{clientCancelledTasks.length}</strong>
        </div>

        <div className="profile-stat-card">
          <span>Total gastado</span>
          <strong>RD${clientTotalSpent}</strong>
        </div>
      </div>

      {profile && (
        <>
          {profile.profilePhotoUrl && (
            <img
              src={profile.profilePhotoUrl}
              alt="Perfil"
              className="profile-photo"
            />
          )}

          <input
            className="input"
            placeholder="Nombre"
            value={profileName}
            onChange={(event) =>
              setProfileName(event.target.value)
            }
          />

          <input
            className="input"
            placeholder="Dirección principal"
            value={profileAddress}
            onChange={(event) =>
              setProfileAddress(event.target.value)
            }
          />

          <button
            onClick={guardarPerfil}
            className="button button-success"
          >
            Guardar perfil
          </button>

          <h3>Foto de perfil</h3>

          <input
            type="file"
            className="input"
            onChange={(event) =>
              setProfilePhotoFile(
                event.target.files?.[0] || null
              )
            }
          />

          <button
            onClick={subirFotoPerfil}
            className="button button-primary"
          >
            Subir foto
          </button>
        </>
      )}
    </div>
  );
}

export default ClientProfile;