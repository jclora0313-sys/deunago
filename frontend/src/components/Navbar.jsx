import NotificationsPanel from "./NotificationsPanel";

function Navbar({
  user,
  profile,
  logout,
  notifications,
  showNotificationsPanel,
  setShowNotificationsPanel,
  cargarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
}) {
  return (
    <div className="navbar">
      <div>
        <div className="logo">DeUnaGo</div>

        {user && (
          <div className="user-info">
            {profile?.profilePhotoUrl && (
              <img
                src={profile.profilePhotoUrl}
                alt="Perfil"
                className="navbar-avatar"
              />
            )}

            <span>
              {user.name} • {user.role}
            </span>
          </div>
        )}
      </div>

      {user && (
        <div className="navbar-actions">
          <NotificationsPanel
            notifications={notifications}
            showNotificationsPanel={showNotificationsPanel}
            setShowNotificationsPanel={setShowNotificationsPanel}
            cargarNotificaciones={cargarNotificaciones}
            marcarNotificacionLeida={marcarNotificacionLeida}
            marcarTodasNotificacionesLeidas={
              marcarTodasNotificacionesLeidas
            }
          />

          <button
            onClick={logout}
            className="button button-danger"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default Navbar;