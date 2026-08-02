import MapView from "../../../components/MapView";

function ClientTasksList({
  filteredClientTasks,
  clientFilter,
  setClientFilter,
  cargarMisMandadosCliente,
  getBadgeClass,
  getStatusText,
  canChat,
  abrirChat,
  cancelarMandado,
  rating,
  setRating,
  review,
  setReview,
  calificarMandado,
  setPaymentProofFile,
  subirComprobantePago,
}) {
  const filters = [
    "ALL",
    "OPEN",
    "ACCEPTED",
    "PICKED_UP",
    "ON_THE_WAY",
    "DELIVERED",
    "CANCELLED",
  ];

  return (
    <div id="tasks-section" className="card">
      <h2>📋 Mis mandados creados</h2>

      <button
        onClick={cargarMisMandadosCliente}
        className="button button-primary"
      >
        Cargar mis mandados
      </button>

      <div className="filters-bar">
        {filters.map((status) => (
          <button
            key={status}
            onClick={() => setClientFilter(status)}
            className={
              clientFilter === status
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

      {filteredClientTasks.length === 0 && (
        <p className="empty">
          No hay mandados con este filtro.
        </p>
      )}

      {filteredClientTasks.map((task) => (
        <div key={task.id} className="task-card">
          <div className={getBadgeClass(task.status)}>
            {getStatusText(task.status)}
          </div>

          <h3>{task.description}</h3>

          <p>Distancia: {task.distanceKm} km</p>

          <p>
            Precio estimado: RD$
            {task.estimatedPrice || 0}
          </p>

          <p>
            Comisión DeUnaGo: RD$
            {task.platformFee || 0}
          </p>

          <p>
            Ganancia runner: RD$
            {task.runnerEarnings || 0}
          </p>

          <p>
            Estado del pago:{" "}
            <strong>
              {task.paymentStatus === "PAID"
                ? "Pagado"
                : task.paymentStatus === "PENDING_REVIEW"
                  ? "En revisión"
                  : "Pendiente"}
            </strong>
          </p>

          {task.paymentProofUrl && (
            <a
              href={task.paymentProofUrl}
              target="_blank"
              rel="noreferrer"
              className="document-link"
            >
              🧾 Ver comprobante de pago
            </a>
          )}

          {task.paymentStatus !== "PAID" && (
            <div className="upload-card">
              <h3>🧾 Subir comprobante de pago</h3>

              <input
                type="file"
                className="input"
                onChange={(event) =>
                  setPaymentProofFile(
                    event.target.files?.[0] || null
                  )
                }
              />

              <button
                onClick={() =>
                  subirComprobantePago(task.id)
                }
                className="button button-primary"
              >
                Subir comprobante
              </button>
            </div>
          )}

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

          {task.status === "OPEN" && (
            <button
              onClick={() =>
                cancelarMandado(task.id)
              }
              className="button button-danger"
            >
              Cancelar mandado
            </button>
          )}

          {(task.status === "DELIVERED" ||
            task.status === "COMPLETED") &&
            !task.rating && (
              <div className="task-card">
                <h3>Calificar mandadero</h3>

                <select
                  className="input"
                  value={rating}
                  onChange={(event) =>
                    setRating(event.target.value)
                  }
                >
                  <option value="5">5 estrellas</option>
                  <option value="4">4 estrellas</option>
                  <option value="3">3 estrellas</option>
                  <option value="2">2 estrellas</option>
                  <option value="1">1 estrella</option>
                </select>

                <input
                  className="input"
                  placeholder="Comentario"
                  value={review}
                  onChange={(event) =>
                    setReview(event.target.value)
                  }
                />

                <button
                  onClick={() =>
                    calificarMandado(task.id)
                  }
                  className="button button-success"
                >
                  Enviar calificación
                </button>
              </div>
            )}
        </div>
      ))}
    </div>
  );
}

export default ClientTasksList;