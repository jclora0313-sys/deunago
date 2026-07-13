function StatisticsCards({ adminStats }) {
  if (!adminStats) return null;

  return (
    <div className="card">
      <h2 className="admin-section-title">
        📊 Estadísticas generales
      </h2>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Usuarios totales</p>
          <p className="admin-stat-value">
            {adminStats.users.totalUsers || 0}
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Clientes</p>
          <p className="admin-stat-value">
            {adminStats.users.totalClients || 0}
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Mandaderos</p>
          <p className="admin-stat-value">
            {adminStats.users.totalRunners || 0}
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Runners disponibles</p>
          <p className="admin-stat-value">
            {adminStats.users.availableRunners || 0}
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">ID validadas</p>
          <p className="admin-stat-value">
            {adminStats.users.runnersWithValidId || 0}
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Licencias validadas</p>
          <p className="admin-stat-value">
            {adminStats.users.runnersWithValidLicense || 0}
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Mandados totales</p>
          <p className="admin-stat-value">
            {adminStats.tasks.totalTasks || 0}
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Ingresos estimados</p>
          <p className="admin-stat-value">
            RD${adminStats.money.estimatedRevenue || 0}
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Comisión DeUnaGo</p>
          <p className="admin-stat-value">
            RD${adminStats.money.totalPlatformFee || 0}
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Ganancias runners</p>
          <p className="admin-stat-value">
            RD${adminStats.money.totalRunnerEarnings || 0}
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Mandados pagados</p>
          <p className="admin-stat-value">
            {adminStats.money.paidTasksCount || 0}
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Pagos pendientes</p>
          <p className="admin-stat-value">
            {adminStats.money.pendingPaymentTasksCount || 0}
          </p>
        </div>
      </div>
    </div>
  );
}

export default StatisticsCards;