import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export default function useNotifications(showToast) {
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);

  const cargarNotificaciones = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/notifications`,
        getAuthHeaders()
      );

      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);

      showToast(
        error.response?.data?.message ||
          "No se pudieron cargar las notificaciones",
        "error"
      );
    }
  };

  const marcarNotificacionLeida = async (notificationId) => {
    try {
      await axios.patch(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        getAuthHeaders()
      );

      await cargarNotificaciones();
    } catch (error) {
      console.error("Error marcando notificación:", error);

      showToast(
        error.response?.data?.message ||
          "No se pudo marcar la notificación",
        "error"
      );
    }
  };

  const marcarTodasNotificacionesLeidas = async () => {
    try {
      await axios.patch(
        `${API_URL}/notifications/read-all`,
        {},
        getAuthHeaders()
      );

      await cargarNotificaciones();

      showToast(
        "Todas las notificaciones fueron marcadas como leídas",
        "success"
      );
    } catch (error) {
      console.error("Error marcando notificaciones:", error);

      showToast(
        error.response?.data?.message ||
          "No se pudieron marcar las notificaciones",
        "error"
      );
    }
  };

  return {
    notifications,
    setNotifications,
    showNotificationsPanel,
    setShowNotificationsPanel,
    cargarNotificaciones,
    marcarNotificacionLeida,
    marcarTodasNotificacionesLeidas,
  };
}