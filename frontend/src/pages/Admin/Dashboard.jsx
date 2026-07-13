import AdminHero from "../../components/AdminHero";
import AdminReviewPanel from "../../components/AdminReviewPanel";
import AdminLiveMap from "../../components/AdminLiveMap";

import FinanceSummary from "./FinanceSummary";
import ActiveTasksList from "./components/ActiveTasksList";
import PaymentsTable from "./components/PaymentsTable";
import RevenueChart from "./components/RevenueChart";
import StatisticsCards from "./components/StatisticsCards";
import UsersTable from "./components/UsersTable";

function AdminDashboard({
  users,
  adminStats,
  adminTasks,
  filteredAdminTasks,
  adminPaymentFilter,
  setAdminPaymentFilter,

  activeTasks,
  liveRunners,
  defaultCity,

  paidAdminTasks,
  maxPaidAmount,

  showOnlyPendingUsers,
  setShowOnlyPendingUsers,

  cargarUsuarios,
  cargarEstadisticasAdmin,
  cargarMandadosAdmin,
  cargarMandadosActivos,

  validarIdentificacionRunner,
  validarLicenciaRunner,
  aprobarRunner,
  validarPagoMandado,
  marcarRunnerPagado,

  getBadgeClass,
  getStatusText,
}) {
  return (
    <div className="admin-dashboard">
      <AdminHero
        cargarUsuarios={cargarUsuarios}
        cargarEstadisticasAdmin={cargarEstadisticasAdmin}
      />

      <button
        onClick={cargarMandadosAdmin}
        className="button button-primary"
      >
        🧾 Ver pagos
      </button>

      <AdminReviewPanel
        users={users}
        cargarMandadosAdmin={cargarMandadosAdmin}
        showOnlyPendingUsers={showOnlyPendingUsers}
        setShowOnlyPendingUsers={setShowOnlyPendingUsers}
      />

      <ActiveTasksList
        activeTasks={activeTasks}
        getBadgeClass={getBadgeClass}
        getStatusText={getStatusText}
        cargarMandadosActivos={cargarMandadosActivos}
      />

      <div id="admin-map-section">
        <AdminLiveMap
          defaultCity={defaultCity}
          liveRunners={liveRunners}
          activeTasks={activeTasks}
        />
      </div>

      <FinanceSummary adminStats={adminStats} />

      <RevenueChart
        paidAdminTasks={paidAdminTasks}
        maxPaidAmount={maxPaidAmount}
      />

      <StatisticsCards adminStats={adminStats} />

      <PaymentsTable
        adminTasks={adminTasks}
        filteredAdminTasks={filteredAdminTasks}
        adminPaymentFilter={adminPaymentFilter}
        setAdminPaymentFilter={setAdminPaymentFilter}
        getStatusText={getStatusText}
        validarPagoMandado={validarPagoMandado}
        marcarRunnerPagado={marcarRunnerPagado}
      />

      <UsersTable
        users={users}
        showOnlyPendingUsers={showOnlyPendingUsers}
        validarIdentificacionRunner={validarIdentificacionRunner}
        validarLicenciaRunner={validarLicenciaRunner}
        aprobarRunner={aprobarRunner}
      />
    </div>
  );
}

export default AdminDashboard;