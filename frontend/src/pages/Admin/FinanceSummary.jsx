function FinanceSummary({ adminStats }) {
  if (!adminStats) return null;

  return (
    <div className="finance-highlight">
      <h2>💰 Resumen financiero</h2>

      <p>Total cobrado por mandados pagados</p>

      <div className="finance-big-number">
        RD${adminStats.money.totalCollected || 0}
      </div>

      <div className="finance-mini-grid">
        <div className="finance-mini-card">
          <span>Comisión DeUnaGo 30%</span>
          <strong>RD${adminStats.money.totalPlatformFee || 0}</strong>
        </div>

        <div className="finance-mini-card">
          <span>Ganancias runners 70%</span>
          <strong>RD${adminStats.money.totalRunnerEarnings || 0}</strong>
        </div>

        <div className="finance-mini-card">
          <span>Mandados pagados</span>
          <strong>{adminStats.money.paidTasksCount || 0}</strong>
        </div>

        <div className="finance-mini-card">
          <span>Pagos pendientes</span>
          <strong>{adminStats.money.pendingPaymentTasksCount || 0}</strong>
        </div>
      </div>
    </div>
  );
}

export default FinanceSummary;