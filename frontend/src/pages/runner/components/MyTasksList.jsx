import MapView from "../../../components/MapView";

function MyTasksList({
  filteredRunnerTasks,
  runnerFilter,
  setRunnerFilter,
  getBadgeClass,
  getStatusText,
  canChat,
  abrirChat,
  isActiveRunnerTask,
  marcarRecogido,
  marcarEnCamino,
  marcarEntregado,
  setDeliveryProofFile,
  subirComprobanteEntrega,
  enviarUbicacionRunner,
  trackingTaskId,
  detenerTrackingRunner,
  iniciarTrackingRunner,
}) {
  const filters = [
    "ALL",
    "ACCEPTED",
    "PICKED_UP",
    "ON_THE_WAY",
    "DELIVERED",
  ];

  return (
    <>
      <h2 id="tasks-section" className="runner-section-title">
        🛵 Mis mandados
      </h2>

      <div className="filters-bar">
        {filters.map((status) => (
          <button
            key={status}
            onClick={() => setRunnerFilter(status)}
            className={
              runnerFilter === status
                ? "filter-btn active"
                : "filter-btn"
            }
          >
            {status === "ALL"
              ? "Todos"
              : getStatusText(status)}
          </button>
        ))}
      </div>

      {filteredRunnerTasks.length === 0 && (
        <p className="empty">
          No hay mandados con este filtro.
        </p>
      )}

      {filteredRunnerTasks.map((task) => (
        <div key={task.id} className="runner-task-card">
          <div className={getBadgeClass(task.status)}>
            {getStatusText(task.status)}
          </div>

          <h3>{task.description}</h3>

          <p className="runner-distance">
            Distancia: {task.distanceKm} km
          </p>

          <p className="runner-price">
            RD${task.estimatedPrice}
          </p>

          <p className="runner-price">
            Tu ganancia: RD${task.runnerEarnings || 0}
          </p>

          <p className="runner-distance">
            Pago:{" "}
            {task.paymentStatus === "PAID"
              ? "Validado"
              : "Pendiente"}
          </p>

          <MapView
            pickupLat={task.pickupLat}
            pickupLng={task.pickupLng}
            dropoffLat={task.dropoffLat}
            dropoffLng={task.dropoffLng}
            runnerLat={task.runnerLat}
            runnerLng={task.runnerLng}
          />

          {task.deliveryProofUrl && (
            <a
              href={task.deliveryProofUrl}
              target="_blank"
              rel="noreferrer"
              className="document-link"
            >
              📸 Ver comprobante de entrega
            </a>
          )}

          {canChat(task) && (
            <button
              onClick={() => abrirChat(task.id)}
              className="button button-primary"
            >
              💬 Abrir chat
            </button>
          )}

          {isActiveRunnerTask(task.status) && (
            <div className="runner-actions">
              {task.status === "ACCEPTED" && (
                <button
                  onClick={() => marcarRecogido(task.id)}
                  className="button button-blue"
                >
                  📦 Marcar recogido
                </button>
              )}

              {task.status === "PICKED_UP" && (
                <button
                  onClick={() => marcarEnCamino(task.id)}
                  className="button button-blue"
                >
                  🛵 Marcar en camino
                </button>
              )}

              {task.status === "ON_THE_WAY" && (
                <button
                  onClick={() => marcarEntregado(task.id)}
                  className="button button-blue"
                >
                  ✅ Marcar entregado
                </button>
              )}

              <input
                type="file"
                className="input"
                onChange={(event) =>
                  setDeliveryProofFile(
                    event.target.files?.[0] || null
                  )
                }
              />

              <button
                onClick={() =>
                  subirComprobanteEntrega(task.id)
                }
                className="button button-primary"
              >
                📸 Subir comprobante
              </button>

              <button
                onClick={() =>
                  enviarUbicacionRunner(task.id)
                }
                className="button button-success"
              >
                📍 Enviar ubicación
              </button>

              {trackingTaskId === task.id ? (
                <button
                  onClick={detenerTrackingRunner}
                  className="button button-danger"
                >
                  Detener tracking
                </button>
              ) : (
                <button
                  onClick={() =>
                    iniciarTrackingRunner(task.id)
                  }
                  className="button button-success"
                >
                  📡 Iniciar tracking
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export default MyTasksList;