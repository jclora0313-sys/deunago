function NotificationsPanel({
  notifications,
  showNotificationsPanel,
  setShowNotificationsPanel,
  cargarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
}) {
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <>
      <div
        className="notification-counter"
        onClick={() => {
          setShowNotificationsPanel(!showNotificationsPanel);
          cargarNotificaciones();
        }}
      >
        🔔 {unreadCount}
      </div>

      {showNotificationsPanel && (
        <div className="notifications-panel">
          <h3>🔔 Notificaciones</h3>

          <button
            onClick={marcarTodasNotificacionesLeidas}
            className="button button-primary"
          >
            ✓ Marcar todas como leídas
          </button>

          {notifications.length === 0 && (
            <p className="empty">
              No tienes notificaciones.
            </p>
          )}

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="notification-item"
            >
              <p>{notification.message}</p>

              <span>
                {notification.read ? "Leída" : "Nueva"}
              </span>

              {!notification.read && (
                <button
                  onClick={() =>
                    marcarNotificacionLeida(
                      notification.id
                    )
                  }
                  className="button button-blue"
                >
                  Marcar leída
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default NotificationsPanel;