import { useState } from "react";

import {
  getAdminUsers,
  getAdminStats,
  getAdminTasks,
  validateRunnerIdentification,
  validateRunnerLicense,
   approveRunner,
   validateTaskPayment,
    payRunner,
} from "../services/adminService";

function getAuthHeaders() {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };
}

export default function useAdmin(showToast) {
  const [users, setUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [adminTasks, setAdminTasks] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [liveRunners, setLiveRunners] = useState([]);
  const [adminPaymentFilter, setAdminPaymentFilter] = useState("ALL");
  const [showOnlyPendingUsers, setShowOnlyPendingUsers] = useState(false);

  const cargarUsuarios = async () => {
    const data = await getAdminUsers(getAuthHeaders());
    setUsers(data);
  };

  const cargarEstadisticasAdmin = async () => {
    const data = await getAdminStats(getAuthHeaders());
    setAdminStats(data);
  };

  const cargarMandadosAdmin = async () => {
    const data = await getAdminTasks(getAuthHeaders());
    setAdminTasks(data);
  };

  const cargarMandadosActivos = async () => {
  const data = await getAdminTasks(getAuthHeaders());

  const activos = data.filter(
    (task) =>
      task.status === "ACCEPTED" ||
      task.status === "PICKED_UP" ||
      task.status === "ON_THE_WAY"
  );

  setActiveTasks(activos);
};

const cargarRunnersEnVivo = async () => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/admin/runners/live`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Error cargando runners en vivo");
  }

  const data = await res.json();
  setLiveRunners(data);
};

const validarIdentificacionRunner = async (userId) => {
  try {
    await validateRunnerIdentification(userId, getAuthHeaders());

    showToast("Identificación validada", "success");

    await cargarUsuarios();
    await cargarEstadisticasAdmin();
    await cargarMandadosActivos();
  } catch (error) {
    showToast(
      error.response?.data?.message ||
        error.message ||
        "Error validando identificación",
      "error"
    );
  }
};
const validarLicenciaRunner = async (userId) => {
  try {
    await validateRunnerLicense(userId, getAuthHeaders());

    showToast("Licencia validada", "success");

    await cargarUsuarios();
    await cargarEstadisticasAdmin();
  } catch (error) {
    showToast(
      error.response?.data?.message ||
        error.message ||
        "Error validando licencia",
      "error"
    );
  }
};

const aprobarRunner = async (userId) => {
  try {
    await approveRunner(userId, getAuthHeaders());

    showToast("Runner aprobado correctamente", "success");

    await cargarUsuarios();
    await cargarEstadisticasAdmin();
  } catch (error) {
    showToast(
      error.response?.data?.message ||
        error.message ||
        "Error aprobando runner",
      "error"
    );
  }
};
const validarPagoMandado = async (taskId) => {
  try {
    await validateTaskPayment(taskId, getAuthHeaders());

    showToast("Pago validado", "success");

    await cargarMandadosAdmin();
    await cargarEstadisticasAdmin();
  } catch (error) {
    showToast(
      error.response?.data?.message ||
        error.message ||
        "Error validando pago",
      "error"
    );
  }
};
const marcarRunnerPagado = async (taskId) => {
  try {
    await payRunner(taskId, getAuthHeaders());

    showToast("Runner marcado como pagado", "success");

    await cargarMandadosAdmin();
    await cargarEstadisticasAdmin();
  } catch (error) {
    showToast(
      error.response?.data?.message ||
        error.message ||
        "Error marcando pago del runner",
      "error"
    );
  }
};

const filteredAdminTasks =
  adminPaymentFilter === "ALL"
    ? adminTasks
    : adminPaymentFilter === "PAYMENT_PENDING"
    ? adminTasks.filter(
        (task) =>
          !task.paymentStatus ||
          task.paymentStatus === "PENDING"
      )
    : adminPaymentFilter === "PAYMENT_REVIEW"
    ? adminTasks.filter(
        (task) => task.paymentStatus === "PENDING_REVIEW"
      )
    : adminPaymentFilter === "PAYMENT_PAID"
    ? adminTasks.filter(
        (task) => task.paymentStatus === "PAID"
      )
    : adminPaymentFilter === "RUNNER_PENDING"
    ? adminTasks.filter(
        (task) => task.runnerPayoutStatus !== "PAID"
      )
    : adminTasks.filter(
        (task) => task.runnerPayoutStatus === "PAID"
      );

const paidAdminTasks = adminTasks.filter(
  (task) => task.paymentStatus === "PAID"
);

const maxPaidAmount = Math.max(
  1,
  ...paidAdminTasks.map(
    (task) => task.estimatedPrice || 0
  )
);

  return {
    users,
    setUsers,

    adminStats,
    setAdminStats,

    adminTasks,
    setAdminTasks,

    adminPaymentFilter,
    setAdminPaymentFilter,

    showOnlyPendingUsers,
    setShowOnlyPendingUsers,

    cargarUsuarios,
    cargarEstadisticasAdmin,
    cargarMandadosAdmin,
    activeTasks,
setActiveTasks,
cargarMandadosActivos,
liveRunners,
setLiveRunners,
cargarRunnersEnVivo,
validarIdentificacionRunner,
validarLicenciaRunner,
aprobarRunner,
validarPagoMandado,
marcarRunnerPagado,
filteredAdminTasks,
paidAdminTasks,
maxPaidAmount,
  };
}