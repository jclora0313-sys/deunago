import { useState } from "react";
import { activarNotificacionesPush } from "../services/pushNotifications";

function PushNotificationButton({ showToast }) {
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);
    

  const handleActivate = async () => {
    try {
      setLoading(true);

      const token = await activarNotificacionesPush();

      if (!token) {
        throw new Error(
          "Firebase no devolvió un token de notificaciones."
        );
      }

      setActivated(true);

      if (showToast) {
        showToast(
          "Notificaciones activadas correctamente",
          "success"
        );
      } else {
        alert("Notificaciones activadas correctamente");
      }
    } catch (error) {
      const message =
        error?.message ||
        "No se pudieron activar las notificaciones.";

      if (showToast) {
        showToast(message, "error");
      } else {
        alert(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleActivate}
      disabled={loading || activated}
      className={
        activated
          ? "button button-success"
          : "button button-primary"
      }
    >
      {loading
        ? "Activando..."
        : activated
          ? "🔔 Notificaciones activadas"
          : "🔔 Activar notificaciones"}
    </button>
  );
}

export default PushNotificationButton;