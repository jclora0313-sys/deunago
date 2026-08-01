import MapView from "../../../components/MapView";

function AvailableTasksList({
  tasks,
  earnings,
  getBadgeClass,
  getStatusText,
  aceptarMandado,
}) {
  return (
    <>
      <h2 className="runner-section-title">📦 Disponibles</h2>

      {tasks.length === 0 && (
        <p className="empty">
          No hay mandados disponibles cargados.
        </p>
      )}

      {tasks.map((task) => (
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

          <h3>📜 Historial de pagos</h3>

          {earnings?.tasks?.length === 0 && (
            <p className="empty">
              Aún no tienes pagos registrados.
            </p>
          )}

          {earnings?.tasks?.map((paymentTask) => (
            <div
              key={paymentTask.id}
              className="runner-task-card"
            >
              <h3>{paymentTask.description}</h3>

              <p className="runner-price">
                Ganancia: RD$
                {paymentTask.runnerEarnings || 0}
              </p>

              <p className="runner-distance">
                Estado de cobro:{" "}
                {paymentTask.runnerPayoutStatus === "PAID"
                  ? "Pagado"
                  : "Pendiente"}
              </p>

              <p className="runner-distance">
                Estado del mandado:{" "}
                {getStatusText(paymentTask.status)}
              </p>
            </div>
          ))}

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

          <div className="runner-actions">
            <button
              onClick={() => aceptarMandado(task.id)}
              className="button button-success"
            >
              Aceptar mandado
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

export default AvailableTasksList;