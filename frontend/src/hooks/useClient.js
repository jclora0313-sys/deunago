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

export default function useClient({
  showToast,
  cargarNotificaciones,
  defaultCity,
  serviceRadiusKm,
}) {
  const [clientTasks, setClientTasks] = useState([]);
  const [clientFilter, setClientFilter] = useState("ALL");

  const [description, setDescription] = useState("");
  const [pickupLat, setPickupLat] = useState("");
  const [pickupLng, setPickupLng] = useState("");
  const [dropoffLat, setDropoffLat] = useState("");
  const [dropoffLng, setDropoffLng] = useState("");

  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState(null);

  const calcularDistanciaKm = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 0;

    const earthRadiusKm = 6371;
    const deltaLat = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
    const deltaLng = ((Number(lng2) - Number(lng1)) * Math.PI) / 180;

    const value =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos((Number(lat1) * Math.PI) / 180) *
        Math.cos((Number(lat2) * Math.PI) / 180) *
        Math.sin(deltaLng / 2) ** 2;

    return (
      earthRadiusKm *
      2 *
      Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
    );
  };

  const distanciaKm = calcularDistanciaKm(
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng
  );

  const precioEstimado =
    distanciaKm > 0 ? Math.round(50 + distanciaKm * 35) : 0;

  const estaDentroDeSantiago = (lat, lng) => {
    const distancia = calcularDistanciaKm(
      defaultCity.lat,
      defaultCity.lng,
      lat,
      lng
    );

    return distancia <= serviceRadiusKm;
  };

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      showToast("Tu dispositivo no permite obtener la ubicación", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickupLat(position.coords.latitude);
        setPickupLng(position.coords.longitude);
        showToast("Ubicación obtenida", "success");
      },
      () => {
        showToast("No se pudo obtener tu ubicación", "error");
      }
    );
  };

  const seleccionarDestino = (lat, lng) => {
    setDropoffLat(lat);
    setDropoffLng(lng);
  };

  const cargarMisMandadosCliente = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/tasks/client/my`,
        getAuthHeaders()
      );

      setClientTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "No se pudieron cargar tus mandados",
        "error"
      );
    }
  };

  const crearMandado = async () => {
    try {
      if (!description.trim()) {
        showToast("Escribe una descripción", "error");
        return;
      }

      if (!pickupLat || !pickupLng) {
        showToast("Primero usa tu ubicación", "error");
        return;
      }

      if (!dropoffLat || !dropoffLng) {
        showToast("Selecciona el destino en el mapa", "error");
        return;
      }

      if (
        !estaDentroDeSantiago(Number(pickupLat), Number(pickupLng)) ||
        !estaDentroDeSantiago(Number(dropoffLat), Number(dropoffLng))
      ) {
        showToast(
          "Por el momento DeUnaGo solo está disponible en Santiago de los Caballeros.",
          "error"
        );
        return;
      }

      await axios.post(
        `${API_URL}/tasks`,
        {
          description,
          pickupLat: Number(pickupLat),
          pickupLng: Number(pickupLng),
          dropoffLat: Number(dropoffLat),
          dropoffLng: Number(dropoffLng),
          distanceKm: Number(distanciaKm.toFixed(2)),
          estimatedPrice: precioEstimado,
        },
        getAuthHeaders()
      );

      showToast(
        `Mandado creado. Precio estimado: RD$${precioEstimado}`,
        "success"
      );

      setDescription("");
      setPickupLat("");
      setPickupLng("");
      setDropoffLat("");
      setDropoffLng("");

      await cargarMisMandadosCliente();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error creando mandado",
        "error"
      );
    }
  };

  const cancelarMandado = async (taskId) => {
    try {
      await axios.patch(
        `${API_URL}/tasks/${taskId}/cancel`,
        {},
        getAuthHeaders()
      );

      showToast("Mandado cancelado", "success");
      await cargarMisMandadosCliente();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error cancelando mandado",
        "error"
      );
    }
  };

  const calificarMandado = async (taskId) => {
    try {
      await axios.patch(
        `${API_URL}/tasks/${taskId}/rate`,
        {
          rating: Number(rating),
          review,
        },
        getAuthHeaders()
      );

      showToast("Mandado calificado", "success");
      setRating(5);
      setReview("");

      await cargarMisMandadosCliente();
      await cargarNotificaciones();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error calificando mandado",
        "error"
      );
    }
  };

  const subirComprobantePago = async (taskId) => {
    try {
      if (!paymentProofFile) {
        showToast("Selecciona un comprobante de pago", "error");
        return;
      }

      const formData = new FormData();
      formData.append("file", paymentProofFile);

      await axios.post(
        `${API_URL}/tasks/${taskId}/payment-proof`,
        formData,
        getUploadHeaders()
      );

      showToast("Comprobante de pago subido correctamente", "success");
      setPaymentProofFile(null);

      await cargarMisMandadosCliente();
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "Error subiendo comprobante de pago",
        "error"
      );
    }
  };

  const filteredClientTasks =
    clientFilter === "ALL"
      ? clientTasks
      : clientTasks.filter((task) => task.status === clientFilter);

  const clientCompletedTasks = clientTasks.filter(
    (task) =>
      task.status === "DELIVERED" ||
      task.status === "COMPLETED"
  );

  const clientCancelledTasks = clientTasks.filter(
    (task) => task.status === "CANCELLED"
  );

  const clientTotalSpent = clientTasks
    .filter((task) => task.paymentStatus === "PAID")
    .reduce(
      (total, task) => total + (task.estimatedPrice || 0),
      0
    );

  return {
    clientTasks,
    setClientTasks,
    clientFilter,
    setClientFilter,

    description,
    setDescription,

    pickupLat,
    setPickupLat,
    pickupLng,
    setPickupLng,

    dropoffLat,
    setDropoffLat,
    dropoffLng,
    setDropoffLng,

    rating,
    setRating,
    review,
    setReview,

    paymentProofFile,
    setPaymentProofFile,

    distanciaKm,
    precioEstimado,

    filteredClientTasks,
    clientCompletedTasks,
    clientCancelledTasks,
    clientTotalSpent,

    obtenerUbicacion,
    seleccionarDestino,
    cargarMisMandadosCliente,
    crearMandado,
    cancelarMandado,
    calificarMandado,
    subirComprobantePago,
  };
}