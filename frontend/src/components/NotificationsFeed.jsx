function NotificationsFeed({
  notifications,
  cargarNotificaciones,
  marcarNotificacionLeida,
}) {
  return (
    <div id="dashboard-section" className="card">
      <div id="notifications-section"></div>

      <h2>🔔 Notificaciones en tiempo real</h2>

      <button
        onClick={cargarNotificaciones}
        className="button button-primary"
      >
        Cargar notificaciones
      </button>

      {notifications.length === 0 && (
        <p className="empty">
          No tienes notificaciones.
        </p>
      )}

      {notifications.map((notification) => (
        <div key={notification.id} className="task-card">
          <p>{notification.message}</p>

          <p>
            {notification.read ? "Leída" : "Nueva"}
          </p>

          {!notification.read && (
            <button
              onClick={() =>
                marcarNotificacionLeida(notification.id)
              }
              className="button button-blue"
            >
              Marcar como leída
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default NotificationsFeed;