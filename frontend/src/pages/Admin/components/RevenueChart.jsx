function RevenueChart({ paidAdminTasks = [], maxPaidAmount = 1 }) {
  if (paidAdminTasks.length === 0) return null;

  return (
    <div className="card">
      <h2 className="admin-section-title">
        📈 Ingresos por mandado
      </h2>

      <div className="simple-chart">
        {paidAdminTasks.map((task) => (
          <div key={task.id} className="chart-row">
            <span>#{task.id}</span>

            <div className="chart-track">
              <div
                className="chart-bar"
                style={{
                  width: `${
                    ((task.estimatedPrice || 0) / maxPaidAmount) * 100
                  }%`,
                }}
              />
            </div>

            <strong>RD${task.estimatedPrice || 0}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RevenueChart;