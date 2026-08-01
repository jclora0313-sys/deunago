import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const getUploadHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "multipart/form-data",
  },
});

export default function useRunner({
  user,
  showToast,
  cargarNotificaciones,
  trackingIntervalRef,
}) {
  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [runnerFilter, setRunnerFilter] = useState("ALL");
  const [runnerStats, setRunnerStats] = useState(null);

  const [trackingTaskId, setTrackingTaskId] = useState(null);

  const [identificationFile, setIdentificationFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [deliveryProofFile, setDeliveryProofFile] = useState(null);

  const cargarMandados = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/tasks/available`,
        getAuthHeaders()
      );

      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "No puedes ver los mandados disponibles todavía",
        "error"
      );
    }
  };

  const cargarMisMandados = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/tasks/my`,
        getAuthHeaders()
      );

      setMyTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "No se pudieron cargar tus mandados",
        "error"
      );
    }
  };

  const cargarGanancias = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/runners/earnings`,
        getAuthHeaders()
      );

      setEarnings(response.data);
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "No se pudieron cargar las ganancias",
        "error"
      );
    }
  };

  const cargarEstadisticasRunner = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/runners/me/stats`,
        getAuthHeaders()
      );

      setRunnerStats(response.data);
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "No se pudieron cargar las estadísticas",
        "error"
      );
    }
  };

  const aceptarMandado = async (taskId) => {
  try {
    await axios.patch(
      `${API_URL}/tasks/${taskId}/accept`,
      {},
      getAuthHeaders()
    );

    await cargarMandados();
    await cargarMisMandados();
    await cargarNotificaciones();

    showToast("Mandado aceptado correctamente", "success");
  } catch (error) {
    showToast(
      error.response?.data?.message ||
        "No puedes aceptar este mandado",
      "error"
    );
  }
};
const actualizarDisponibilidadRunner = async (isAvailable) => {
  try {
    const response = await axios.patch(
      `${API_URL}/runners/availability`,
      { isAvailable },
      getAuthHeaders()
    );

    const updatedUser = {
      ...user,
      ...response.data,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    showToast(
      isAvailable
        ? "Ahora estás disponible"
        : "Ahora no estás disponible",
      "success"
    );

    window.location.reload();
  } catch (error) {
    showToast(
      error.response?.data?.message ||
        "Error actualizando disponibilidad",
      "error"
    );
  }
};

const subirIdentificacion = async () => {
  try {
    if (!identificationFile) {
      showToast("Selecciona un archivo de identificación", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", identificationFile);

    const response = await axios.post(
      `${API_URL}/runners/upload-identification`,
      formData,
      getUploadHeaders()
    );

    const updatedUser = {
      ...user,
      ...response.data.user,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    showToast(
      "Identificación subida correctamente. Espera validación del administrador.",
      "success"
    );

    window.location.reload();
  } catch (error) {
    showToast(
      error.response?.data?.message ||
        "Error subiendo identificación",
      "error"
    );
  }
};

const subirLicencia = async () => {
  try {
    if (!licenseFile) {
      showToast("Selecciona un archivo de licencia", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", licenseFile);

    const response = await axios.post(
      `${API_URL}/runners/upload-license`,
      formData,
      getUploadHeaders()
    );

    const updatedUser = {
      ...user,
      ...response.data.user,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    showToast(
      "Licencia subida correctamente. Espera validación del administrador.",
      "success"
    );

    window.location.reload();
  } catch (error) {
    showToast(
      error.response?.data?.message ||
        "Error subiendo licencia",
      "error"
    );
  }
};

const subirComprobanteEntrega = async (taskId) => {
  try {
    if (!deliveryProofFile) {
      showToast("Selecciona una foto del comprobante", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", deliveryProofFile);

    await axios.post(
      `${API_URL}/tasks/${taskId}/delivery-proof`,
      formData,
      getUploadHeaders()
    );

    showToast("Comprobante subido correctamente", "success");
    setDeliveryProofFile(null);

    await cargarMisMandados();
  } catch (error) {
    showToast(
      error.response?.data?.message ||
        "Error subiendo comprobante",
      "error"
    );
  }
};

const enviarUbicacionRunner = async (
  taskId,
  mostrarAlerta = true
) => {
  if (!navigator.geolocation) {
    showToast(
      "Tu dispositivo no permite obtener la ubicación",
      "error"
    );
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        await axios.patch(
          `${API_URL}/tasks/${taskId}/runner-location`,
          {
            runnerLat: position.coords.latitude,
            runnerLng: position.coords.longitude,
          },
          getAuthHeaders()
        );

        if (mostrarAlerta) {
          showToast("Ubicación enviada", "success");
        }

        await cargarMisMandados();
      } catch (error) {
        showToast(
          error.response?.data?.message ||
            "Error enviando ubicación",
          "error"
        );
      }
    },
    () => {
      showToast(
        "No se pudo obtener la ubicación del mandadero",
        "error"
      );
    }
  );
};

const iniciarTrackingRunner = async (taskId) => {
  if (trackingIntervalRef.current) {
    clearInterval(trackingIntervalRef.current);
  }

  setTrackingTaskId(taskId);

  await enviarUbicacionRunner(taskId, false);

  trackingIntervalRef.current = setInterval(() => {
    enviarUbicacionRunner(taskId, false);
  }, 10000);

  showToast("Tracking iniciado", "info");
};

const detenerTrackingRunner = () => {
  if (trackingIntervalRef.current) {
    clearInterval(trackingIntervalRef.current);
    trackingIntervalRef.current = null;
  }

  setTrackingTaskId(null);
  showToast("Tracking detenido", "info");
};

const marcarRecogido = async (taskId) => {
  try {
    await axios.patch(
      `${API_URL}/tasks/${taskId}/pickup`,
      {},
      getAuthHeaders()
    );

    showToast("Mandado marcado como recogido", "success");
    await cargarMisMandados();
  } catch (error) {
    showToast(
      error.response?.data?.message ||
        "No se pudo marcar el mandado como recogido",
      "error"
    );
  }
};

const marcarEnCamino = async (taskId) => {
  try {
    await axios.patch(
      `${API_URL}/tasks/${taskId}/on-the-way`,
      {},
      getAuthHeaders()
    );

    showToast("Mandado marcado en camino", "success");
    await cargarMisMandados();
  } catch (error) {
    showToast(
      error.response?.data?.message ||
        "No se pudo marcar el mandado en camino",
      "error"
    );
  }
};

const marcarEntregado = async (taskId) => {
  try {
    await axios.patch(
      `${API_URL}/tasks/${taskId}/deliver`,
      {},
      getAuthHeaders()
    );

    if (trackingTaskId === taskId) {
      detenerTrackingRunner();
    }

    showToast("Mandado marcado como entregado", "success");

    await cargarMisMandados();
    await cargarGanancias();
    await cargarNotificaciones();
  } catch (error) {
    showToast(
      error.response?.data?.message ||
        "No se pudo marcar el mandado como entregado",
      "error"
    );
  }
};

const actualizarUbicacionRunnerEnVivo = async () => {
  if (!navigator.geolocation) {
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        await axios.patch(
          `${API_URL}/runners/location`,
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          getAuthHeaders()
        );
      } catch (error) {
        console.error(
          "Error actualizando ubicación del runner:",
          error.response?.data || error.message
        );
      }
    },
    (error) => {
      console.error(
        "No se pudo obtener la ubicación del runner:",
        error.message
      );
    }
  );
};

const filteredRunnerTasks =
  runnerFilter === "ALL"
    ? myTasks
    : myTasks.filter((task) => task.status === runnerFilter);

const isActiveRunnerTask = (status) => {
  return (
    status === "ACCEPTED" ||
    status === "PICKED_UP" ||
    status === "ON_THE_WAY"
  );
};

  return {
    tasks,
    setTasks,
    myTasks,
    setMyTasks,
    earnings,
    setEarnings,
    runnerFilter,
    setRunnerFilter,
    runnerStats,
    setRunnerStats,

    trackingTaskId,
    setTrackingTaskId,

    identificationFile,
    setIdentificationFile,
    licenseFile,
    setLicenseFile,
    deliveryProofFile,
    setDeliveryProofFile,

    cargarMandados,
    cargarMisMandados,
    cargarGanancias,
    cargarEstadisticasRunner,
    aceptarMandado,
    actualizarDisponibilidadRunner,
    subirIdentificacion,
subirLicencia,
subirComprobanteEntrega,
enviarUbicacionRunner,
iniciarTrackingRunner,
detenerTrackingRunner,
marcarRecogido,
marcarEnCamino,
marcarEntregado,
actualizarUbicacionRunnerEnVivo,

filteredRunnerTasks,
isActiveRunnerTask,
  };
}