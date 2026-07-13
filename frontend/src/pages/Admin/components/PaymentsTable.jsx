function PaymentsTable({
  adminTasks = [],
  filteredAdminTasks = [],
  adminPaymentFilter,
  setAdminPaymentFilter,
  getStatusText,
  validarPagoMandado,
  marcarRunnerPagado,
}) {
  return (
    <div id="payments-section" className="card">
      <h2 className="admin-section-title">🧾 Pagos de mandados</h2>

      {adminTasks.length === 0 && (
        <p className="empty">No hay mandados cargados.</p>
      )}

      <div className="filters-bar">
        {[
          ["ALL", "Todos"],
          ["PAYMENT_PENDING", "Pago pendiente"],
          ["PAYMENT_REVIEW", "En revisión"],
          ["PAYMENT_PAID", "Pago validado"],
          ["RUNNER_PENDING", "Runner pendiente"],
          ["RUNNER_PAID", "Runner pagado"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setAdminPaymentFilter(value)}
            className={
              adminPaymentFilter === value
                ? "filter-btn active"
                : "filter-btn"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {filteredAdminTasks.map((task) => (
        <div key={task.id} className="admin-user-card">
          <div className="admin-pill">
            {task.paymentStatus || "PENDING"}
          </div>

          <h3>{task.description}</h3>

          <p className="admin-user-meta">
            Precio: RD${task.estimatedPrice}
          </p>

          <p className="admin-user-meta">
            Comisión DeUnaGo: RD${task.platformFee}
          </p>

          <p className="admin-user-meta">
            Ganancia runner: RD${task.runnerEarnings}
          </p>

          <p className="admin-user-meta">
            Pago al runner:{" "}
            {task.runnerPayoutStatus === "PAID"
              ? "Pagado"
              : "Pendiente"}
          </p>

          <p className="admin-user-meta">
            Estado del mandado: {getStatusText(task.status)}
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

          {task.paymentProofUrl &&
            task.paymentStatus !== "PAID" && (
              <button
                onClick={() => validarPagoMandado(task.id)}
                className="button button-success"
              >
                ✅ Validar pago
              </button>
            )}

          {task.paymentStatus === "PAID" &&
            task.runnerPayoutStatus !== "PAID" && (
              <button
                onClick={() => marcarRunnerPagado(task.id)}
                className="button button-success"
              >
                💸 Marcar runner pagado
              </button>
            )}
        </div>
      ))}
    </div>
  );
}

export default PaymentsTable;