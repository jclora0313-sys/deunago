import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./App.css";
import MapView from "./components/MapView";
import SelectLocationMap from "./components/SelectLocationMap";

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

function App() {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CLIENT");

  const user = JSON.parse(localStorage.getItem("user"));

  const [users, setUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [clientTasks, setClientTasks] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [clientFilter, setClientFilter] = useState("ALL");
  const [runnerFilter, setRunnerFilter] = useState("ALL");

  const [description, setDescription] = useState("");
  const [pickupLat, setPickupLat] = useState("");
  const [pickupLng, setPickupLng] = useState("");
  const [dropoffLat, setDropoffLat] = useState("");
  const [dropoffLng, setDropoffLng] = useState("");

  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const [trackingTaskId, setTrackingTaskId] = useState(null);
  const trackingIntervalRef = useRef(null);

  const [activeChatTaskId, setActiveChatTaskId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const updateTaskInState = (updatedTask) => {
    setClientTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );

    setMyTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );

    setTasks((prev) => prev.filter((task) => task.id !== updatedTask.id));
  };

  useEffect(() => {
    if (user?.id) {
      socket.emit("join", user.id);

      socket.on("notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        alert(notification.message);
      });

      socket.on("runnerLocationUpdated", (updatedTask) => {
        updateTaskInState(updatedTask);
      });

      socket.on("taskUpdated", (updatedTask) => {
        updateTaskInState(updatedTask);
      });

      socket.on("newMessage", (message) => {
        if (message.taskId === activeChatTaskId) {
          setMessages((prev) => [...prev, message]);
        }
      });
    }

    return () => {
      socket.off("notification");
      socket.off("runnerLocationUpdated");
      socket.off("taskUpdated");
      socket.off("newMessage");
    };
  }, [user?.id, activeChatTaskId]);

  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, []);

  const calcularDistanciaKm = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 0;

    const R = 6371;
    const dLat = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
    const dLng = ((Number(lng2) - Number(lng1)) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((Number(lat1) * Math.PI) / 180) *
        Math.cos((Number(lat2) * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const distanciaKm = calcularDistanciaKm(
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng
  );

  const precioEstimado =
    distanciaKm > 0 ? Math.round(50 + distanciaKm * 35) : 0;

  const obtenerUbicacion = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickupLat(position.coords.latitude);
        setPickupLng(position.coords.longitude);
        alert("Ubicación obtenida");
      },
      () => {
        alert("No se pudo obtener ubicación");
      }
    );
  };

  const seleccionarDestino = (lat, lng) => {
    setDropoffLat(lat);
    setDropoffLng(lng);
  };

  const abrirChat = async (taskId) => {
    const res = await axios.get(
      `${API_URL}/tasks/${taskId}/messages`,
      getAuthHeaders()
    );

    setActiveChatTaskId(taskId);
    setMessages(res.data);
  };

  const enviarMensaje = async () => {
    if (!messageText.trim()) {
      alert("Escribe un mensaje");
      return;
    }

    await axios.post(
      `${API_URL}/tasks/${activeChatTaskId}/messages`,
      { text: messageText },
      getAuthHeaders()
    );

    setMessageText("");
  };

  const cerrarChat = () => {
    setActiveChatTaskId(null);
    setMessages([]);
    setMessageText("");
  };

  const enviarUbicacionRunner = async (taskId, mostrarAlerta = true) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await axios.patch(
          `${API_URL}/tasks/${taskId}/runner-location`,
          {
            runnerLat: position.coords.latitude,
            runnerLng: position.coords.longitude,
          },
          getAuthHeaders()
        );

        if (mostrarAlerta) {
          alert("Ubicación enviada");
        }

        cargarMisMandados();
      },
      () => {
        alert("No se pudo obtener la ubicación del mandadero");
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

    alert("Tracking iniciado");
  };

  const detenerTrackingRunner = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    setTrackingTaskId(null);
    alert("Tracking detenido");
  };

  const register = async () => {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        name,
        phone,
        password,
        role,
      });

      alert("Cuenta creada");
      setMode("login");
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        phone,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  const logout = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const cargarNotificaciones = async () => {
    const res = await axios.get(`${API_URL}/notifications`, getAuthHeaders());
    setNotifications(res.data);
  };

  const marcarNotificacionLeida = async (notificationId) => {
    await axios.patch(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      getAuthHeaders()
    );

    cargarNotificaciones();
  };

  const crearMandado = async () => {
    try {
      if (!description) {
        alert("Escribe una descripción");
        return;
      }

      if (!pickupLat || !pickupLng) {
        alert("Primero usa tu ubicación");
        return;
      }

      if (!dropoffLat || !dropoffLng) {
        alert("Selecciona el destino tocando el mapa");
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

      alert(`Mandado creado. Precio estimado: RD$${precioEstimado}`);

      setDescription("");
      setPickupLat("");
      setPickupLng("");
      setDropoffLat("");
      setDropoffLng("");

      cargarMisMandadosCliente();
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  const cargarMisMandadosCliente = async () => {
    const res = await axios.get(`${API_URL}/tasks/client/my`, getAuthHeaders());
    setClientTasks(res.data);
  };

  const cancelarMandado = async (taskId) => {
    try {
      await axios.patch(
        `${API_URL}/tasks/${taskId}/cancel`,
        {},
        getAuthHeaders()
      );

      alert("Mandado cancelado");
      cargarMisMandadosCliente();
    } catch (error) {
      alert(error.response?.data?.message || "Error cancelando mandado");
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

      alert("Mandado calificado");
      setRating(5);
      setReview("");
      cargarMisMandadosCliente();
      cargarNotificaciones();
    } catch (error) {
      alert(error.response?.data?.message || "Error calificando mandado");
    }
  };

  const cargarMandados = async () => {
    const res = await axios.get(`${API_URL}/tasks/available`, getAuthHeaders());
    setTasks(res.data);
  };

  const cargarMisMandados = async () => {
    const res = await axios.get(`${API_URL}/tasks/my`, getAuthHeaders());
    setMyTasks(res.data);
  };

  const cargarGanancias = async () => {
    const res = await axios.get(`${API_URL}/runners/earnings`, getAuthHeaders());
    setEarnings(res.data);
  };

  const aceptarMandado = async (taskId) => {
    await axios.patch(
      `${API_URL}/tasks/${taskId}/accept`,
      {},
      getAuthHeaders()
    );

    cargarMandados();
    cargarMisMandados();
    cargarNotificaciones();
  };

  const marcarRecogido = async (taskId) => {
    await axios.patch(`${API_URL}/tasks/${taskId}/pickup`, {}, getAuthHeaders());
    cargarMisMandados();
  };

  const marcarEnCamino = async (taskId) => {
    await axios.patch(
      `${API_URL}/tasks/${taskId}/on-the-way`,
      {},
      getAuthHeaders()
    );
    cargarMisMandados();
  };

  const marcarEntregado = async (taskId) => {
    await axios.patch(
      `${API_URL}/tasks/${taskId}/deliver`,
      {},
      getAuthHeaders()
    );

    if (trackingTaskId === taskId) {
      detenerTrackingRunner();
    }

    cargarMisMandados();
    cargarGanancias();
    cargarNotificaciones();
  };

  const cargarUsuarios = async () => {
    const res = await axios.get(`${API_URL}/admin/users`, getAuthHeaders());
    setUsers(res.data);
  };

  const cargarEstadisticasAdmin = async () => {
    const res = await axios.get(`${API_URL}/admin/stats`, getAuthHeaders());
    setAdminStats(res.data);
  };

  const aprobarRunner = async (userId) => {
    await axios.patch(
      `${API_URL}/admin/users/${userId}/approve`,
      {},
      getAuthHeaders()
    );

    cargarUsuarios();
    cargarEstadisticasAdmin();
    cargarNotificaciones();
  };

  const getBadgeClass = (status) => {
    if (status === "OPEN") return "badge badge-open";
    if (status === "ACCEPTED") return "badge badge-accepted";
    if (status === "PICKED_UP") return "badge badge-accepted";
    if (status === "ON_THE_WAY") return "badge badge-accepted";
    if (status === "DELIVERED") return "badge badge-completed";
    if (status === "CANCELLED") return "badge badge-completed";
    return "badge badge-completed";
  };

  const getStatusText = (status) => {
    if (status === "OPEN") return "Abierto";
    if (status === "ACCEPTED") return "Aceptado";
    if (status === "PICKED_UP") return "Recogido";
    if (status === "ON_THE_WAY") return "En camino";
    if (status === "DELIVERED") return "Entregado";
    if (status === "CANCELLED") return "Cancelado";
    if (status === "COMPLETED") return "Completado";
    return status;
  };

  const isActiveRunnerTask = (status) => {
    return (
      status === "ACCEPTED" ||
      status === "PICKED_UP" ||
      status === "ON_THE_WAY"
    );
  };

  const canChat = (task) => {
    return (
      task.status === "ACCEPTED" ||
      task.status === "PICKED_UP" ||
      task.status === "ON_THE_WAY" ||
      task.status === "DELIVERED"
    );
  };

  const filteredClientTasks =
    clientFilter === "ALL"
      ? clientTasks
      : clientTasks.filter((task) => task.status === clientFilter);

  const filteredRunnerTasks =
    runnerFilter === "ALL"
      ? myTasks
      : myTasks.filter((task) => task.status === runnerFilter);

  const ChatBox = () => {
    if (!activeChatTaskId) return null;

    return (
      <div className="card">
        <h2>💬 Chat del mandado #{activeChatTaskId}</h2>

        <button onClick={cerrarChat} className="button button-danger">
          Cerrar chat
        </button>

        <div className="task-card">
          {messages.length === 0 && <p className="empty">No hay mensajes.</p>}

          {messages.map((msg) => (
            <div key={msg.id} className="task-card">
              <p>
                <strong>{msg.senderId === user.id ? "Tú" : "Otro"}:</strong>{" "}
                {msg.text}
              </p>
            </div>
          ))}
        </div>

        <input
          className="input"
          placeholder="Escribe un mensaje"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />

        <button onClick={enviarMensaje} className="button button-success">
          Enviar mensaje
        </button>
      </div>
    );
  };

  return (
    <div className="page">
      <div className="navbar">
        <div>
          <div className="logo">DeUnaGo</div>

          {user && (
            <div className="user-info">
              {user.name} • {user.role}
            </div>
          )}
        </div>

        {user && (
          <button onClick={logout} className="button button-danger">
            Logout
          </button>
        )}
      </div>

      <div className="container">
        {!user && (
          <div className="auth-shell">
            <div className="auth-brand">
              <div className="auth-logo"></div>
              <h1>Tu mandado en minutos</h1>
              <p>
                Pide lo que necesitas y conecta con mandaderos disponibles cerca de ti.
              </p>
            </div>

            <div className="auth-card">
              <div className="auth-tabs">
                <button
                  onClick={() => setMode("login")}
                  className={mode === "login" ? "auth-tab active" : "auth-tab"}
                >
                  Login
                </button>

                <button
                  onClick={() => setMode("register")}
                  className={mode === "register" ? "auth-tab active" : "auth-tab"}
                >
                  Registro
                </button>
              </div>

              {mode === "login" && (
                <>
                  <h2>Bienvenido</h2>
                  <p className="auth-subtitle">Inicia sesión para continuar</p>

                  <input
                    className="input"
                    placeholder="Teléfono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />

                  <input
                    className="input"
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button onClick={login} className="button button-primary auth-main-btn">
                    Iniciar sesión
                  </button>
                </>
              )}

              {mode === "register" && (
                <>
                  <h2>Crear cuenta</h2>
                  <p className="auth-subtitle">Empieza a usar DeUnaGo hoy</p>

                  <input
                    className="input"
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <input
                    className="input"
                    placeholder="Teléfono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />

                  <input
                    className="input"
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <select
                    className="input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="CLIENT">Cliente</option>
                    <option value="RUNNER">Mandadero</option>
                  </select>

                  <button onClick={register} className="button button-primary auth-main-btn">
                    Crear cuenta
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {user && (
          <>
            <div className="card">
              <h2>🔔 Notificaciones en tiempo real</h2>

              <button
                onClick={cargarNotificaciones}
                className="button button-primary"
              >
                Cargar notificaciones
              </button>

              {notifications.length === 0 && (
                <p className="empty">No tienes notificaciones.</p>
              )}

              {notifications.map((notification) => (
                <div key={notification.id} className="task-card">
                  <p>{notification.message}</p>
                  <p>{notification.read ? "Leída" : "Nueva"}</p>

                  {!notification.read && (
                    <button
                      onClick={() => marcarNotificacionLeida(notification.id)}
                      className="button button-blue"
                    >
                      Marcar como leída
                    </button>
                  )}
                </div>
              ))}
            </div>

            <ChatBox />
          </>
        )}

        {user?.role === "CLIENT" && (
          <>
            <div className="card">
              <h2 className="card-title">📝 Crear mandado</h2>

              <input
                className="input"
                placeholder="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <button onClick={obtenerUbicacion} className="button button-blue">
                📍 Usar mi ubicación
              </button>

              <p>Recogida Lat: {pickupLat || "No detectada"}</p>
              <p>Recogida Lng: {pickupLng || "No detectada"}</p>

              <h3>Selecciona el destino tocando el mapa</h3>

              <SelectLocationMap
                pickupLat={pickupLat}
                pickupLng={pickupLng}
                dropoffLat={dropoffLat}
                dropoffLng={dropoffLng}
                onSelectDropoff={seleccionarDestino}
              />

              <p>Destino Lat: {dropoffLat || "No seleccionado"}</p>
              <p>Destino Lng: {dropoffLng || "No seleccionado"}</p>

              {distanciaKm > 0 && (
                <div className="task-card">
                  <h3>Resumen del mandado</h3>
                  <p>Distancia aproximada: {distanciaKm.toFixed(2)} km</p>
                  <p>Precio estimado: RD${precioEstimado}</p>
                </div>
              )}

              <button onClick={crearMandado} className="button button-primary">
                Crear mandado
              </button>
            </div>

            <div className="card">
              <h2>📋 Mis mandados creados</h2>

              <button
                onClick={cargarMisMandadosCliente}
                className="button button-primary"
              >
                Cargar mis mandados
              </button>

              <div className="filters-bar">
                <button
                  onClick={() => setClientFilter("ALL")}
                  className={clientFilter === "ALL" ? "filter-btn active" : "filter-btn"}
                >
                  Todos
                </button>

                <button
                  onClick={() => setClientFilter("OPEN")}
                  className={clientFilter === "OPEN" ? "filter-btn active" : "filter-btn"}
                >
                  Abiertos
                </button>

                <button
                  onClick={() => setClientFilter("ACCEPTED")}
                  className={clientFilter === "ACCEPTED" ? "filter-btn active" : "filter-btn"}
                >
                  Aceptados
                </button>

                <button
                  onClick={() => setClientFilter("PICKED_UP")}
                  className={clientFilter === "PICKED_UP" ? "filter-btn active" : "filter-btn"}
                >
                  Recogidos
                </button>

                <button
                  onClick={() => setClientFilter("ON_THE_WAY")}
                  className={clientFilter === "ON_THE_WAY" ? "filter-btn active" : "filter-btn"}
                >
                  En camino
                </button>

                <button
                  onClick={() => setClientFilter("DELIVERED")}
                  className={clientFilter === "DELIVERED" ? "filter-btn active" : "filter-btn"}
                >
                  Entregados
                </button>

                <button
                  onClick={() => setClientFilter("CANCELLED")}
                  className={clientFilter === "CANCELLED" ? "filter-btn active" : "filter-btn"}
                >
                  Cancelados
                </button>
              </div>

              {filteredClientTasks.length === 0 && (
                <p className="empty">No hay mandados con este filtro.</p>
              )}

              {filteredClientTasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className={getBadgeClass(task.status)}>
                    {getStatusText(task.status)}
                  </div>

                  <h3>{task.description}</h3>

                  <p>Distancia: {task.distanceKm} km</p>
                  <p>Precio estimado: RD${task.estimatedPrice}</p>

                  <MapView
                    pickupLat={task.pickupLat}
                    pickupLng={task.pickupLng}
                    dropoffLat={task.dropoffLat}
                    dropoffLng={task.dropoffLng}
                    runnerLat={task.runnerLat}
                    runnerLng={task.runnerLng}
                  />

                  {canChat(task) && (
                    <button
                      onClick={() => abrirChat(task.id)}
                      className="button button-primary"
                    >
                      💬 Abrir chat
                    </button>
                  )}

                  {task.status === "OPEN" && (
                    <button
                      onClick={() => cancelarMandado(task.id)}
                      className="button button-danger"
                    >
                      Cancelar mandado
                    </button>
                  )}

                  {(task.status === "DELIVERED" ||
                    task.status === "COMPLETED") &&
                    !task.rating && (
                      <div className="task-card">
                        <h3>Calificar mandadero</h3>

                        <select
                          className="input"
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                        >
                          <option value="5">5 estrellas</option>
                          <option value="4">4 estrellas</option>
                          <option value="3">3 estrellas</option>
                          <option value="2">2 estrellas</option>
                          <option value="1">1 estrella</option>
                        </select>

                        <input
                          className="input"
                          placeholder="Comentario"
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                        />

                        <button
                          onClick={() => calificarMandado(task.id)}
                          className="button button-success"
                        >
                          Enviar calificación
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </>
        )}

 {user?.role === "RUNNER" && (
  <div className="card">
    <div className="runner-profile-card">
      <h2>🛵 Perfil del mandadero</h2>

      <div className="runner-status-grid">
        <div className="status-box">
          <span>Estado:</span>

          <strong
            style={{
              color: user.isAvailable ? "#22c55e" : "#ef4444",
            }}
          >
            {user.isAvailable ? "Disponible" : "No disponible"}
          </strong>
        </div>

        <div className="status-box">
          <span>Identificación:</span>

          <strong
            style={{
              color: user.idVerified ? "#22c55e" : "#f59e0b",
            }}
          >
            {user.idVerified ? "Verificada" : "Pendiente"}
          </strong>
        </div>

        <div className="status-box">
          <span>Licencia:</span>

          <strong
            style={{
              color: user.licenseVerified ? "#22c55e" : "#f59e0b",
            }}
          >
            {user.licenseVerified ? "Verificada" : "Pendiente"}
          </strong>
        </div>
      </div>

      <button
        className={
          user.isAvailable
            ? "button button-danger"
            : "button button-success"
        }
        onClick={async () => {
          try {
            await axios.patch(
              `${API_URL}/runners/toggle-availability`,
              {},
              getAuthHeaders()
            );

            alert("Disponibilidad actualizada");

            const updatedUser = {
              ...user,
              isAvailable: !user.isAvailable,
            };

            localStorage.setItem(
              "user",
              JSON.stringify(updatedUser)
            );

            window.location.reload();
          } catch (error) {
            alert("Error actualizando disponibilidad");
          }
        }}
      >
        {user.isAvailable
          ? "🔴 Ponerse no disponible"
          : "🟢 Ponerse disponible"}
      </button>
    </div>

    {user.status !== "APPROVED" && (
      <div className="pending-box">
        ⏳ Esperando aprobación del administrador.
      </div>
    )}

    {user.status === "APPROVED" && (
      <>
        <div className="button-group">
          <button
            onClick={cargarMandados}
            className="button button-primary"
          >
            Disponibles
          </button>

          <button
            onClick={cargarMisMandados}
            className="button button-primary"
          >
            Mis mandados
          </button>

          <button
            onClick={cargarGanancias}
            className="button button-success"
          >
            Ganancias
          </button>
        </div>

        {trackingTaskId && (
          <div className="task-card">
            <h3>📡 Tracking activo</h3>

            <p>Mandado #{trackingTaskId}</p>

            <button
              onClick={detenerTrackingRunner}
              className="button button-danger"
            >
              Detener tracking
            </button>
          </div>
        )}

        {earnings && (
          <div className="task-card">
            <h2>💰 Ganancias</h2>

            <p>Total ganado: RD${earnings.totalEarnings}</p>

            <p>
              Mandados completados: {earnings.completedCount}
            </p>
          </div>
        )}

        <h2>📦 Disponibles</h2>

        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <div className={getBadgeClass(task.status)}>
              {getStatusText(task.status)}
            </div>

            <h3>{task.description}</h3>

            <p>Distancia: {task.distanceKm} km</p>

            <p>
              Precio estimado: RD${task.estimatedPrice}
            </p>

            <MapView
              pickupLat={task.pickupLat}
              pickupLng={task.pickupLng}
              dropoffLat={task.dropoffLat}
              dropoffLng={task.dropoffLng}
              runnerLat={task.runnerLat}
              runnerLng={task.runnerLng}
            />

            <button
              onClick={() => aceptarMandado(task.id)}
              className="button button-success"
            >
              Aceptar
            </button>
          </div>
        ))}

        <h2>🛵 Mis mandados</h2>

        {myTasks.map((task) => (
          <div key={task.id} className="task-card">
            <div className={getBadgeClass(task.status)}>
              {getStatusText(task.status)}
            </div>

            <h3>{task.description}</h3>

            <p>Distancia: {task.distanceKm} km</p>

            <p>
              Precio estimado: RD${task.estimatedPrice}
            </p>

            <MapView
              pickupLat={task.pickupLat}
              pickupLng={task.pickupLng}
              dropoffLat={task.dropoffLat}
              dropoffLng={task.dropoffLng}
              runnerLat={task.runnerLat}
              runnerLng={task.runnerLng}
            />

            {canChat(task) && (
              <button
                onClick={() => abrirChat(task.id)}
                className="button button-primary"
              >
                💬 Abrir chat
              </button>
            )}

            {isActiveRunnerTask(task.status) && (
              <>
                {task.status === "ACCEPTED" && (
                  <button
                    onClick={() => marcarRecogido(task.id)}
                    className="button button-blue"
                  >
                    📦 Marcar recogido
                  </button>
                )}

                {task.status === "PICKED_UP" && (
                  <button
                    onClick={() => marcarEnCamino(task.id)}
                    className="button button-blue"
                  >
                    🛵 Marcar en camino
                  </button>
                )}

                {task.status === "ON_THE_WAY" && (
                  <button
                    onClick={() => marcarEntregado(task.id)}
                    className="button button-blue"
                  >
                    ✅ Marcar entregado
                  </button>
                )}

                <button
                  onClick={() => enviarUbicacionRunner(task.id)}
                  className="button button-success"
                >
                  📍 Enviar mi ubicación
                </button>

                {trackingTaskId === task.id ? (
                  <button
                    onClick={detenerTrackingRunner}
                    className="button button-danger"
                  >
                    Detener tracking
                  </button>
                ) : (
                  <button
                    onClick={() => iniciarTrackingRunner(task.id)}
                    className="button button-success"
                  >
                    📡 Iniciar tracking automático
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </>
    )}
  </div>
)}

        {user?.role === "ADMIN" && (
          <div className="admin-dashboard">
            <div className="admin-hero">
              <h2>👑 Panel Administrativo</h2>

              <p>
                Administra usuarios, runners, mandados y estadísticas en tiempo
                real desde DeUnaGo.
              </p>

              <div className="admin-actions">
                <button onClick={cargarUsuarios} className="button button-primary">
                  👥 Cargar usuarios
                </button>

                <button
                  onClick={cargarEstadisticasAdmin}
                  className="button button-success"
                >
                  📊 Ver estadísticas
                </button>
              </div>
            </div>

            {adminStats && (
              <div className="card">
                <h2 className="admin-section-title">📊 Estadísticas generales</h2>

                <div className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <p className="admin-stat-label">Usuarios totales</p>
                    <p className="admin-stat-value">
                      {adminStats.users.totalUsers}
                    </p>
                  </div>

                  <div className="admin-stat-card">
                    <p className="admin-stat-label">Clientes</p>
                    <p className="admin-stat-value">
                      {adminStats.users.totalClients}
                    </p>
                  </div>

                  <div className="admin-stat-card">
                    <p className="admin-stat-label">Mandaderos</p>
                    <p className="admin-stat-value">
                      {adminStats.users.totalRunners}
                    </p>
                  </div>

                  <div className="admin-stat-card">
                    <p className="admin-stat-label">Admins</p>
                    <p className="admin-stat-value">
                      {adminStats.users.totalAdmins}
                    </p>
                  </div>

                  <div className="admin-stat-card">
                    <p className="admin-stat-label">Runners pendientes</p>
                    <p className="admin-stat-value">
                      {adminStats.users.pendingRunners}
                    </p>
                  </div>

                  <div className="admin-stat-card">
                    <p className="admin-stat-label">Runners aprobados</p>
                    <p className="admin-stat-value">
                      {adminStats.users.approvedRunners}
                    </p>
                  </div>

                  <div className="admin-stat-card">
                    <p className="admin-stat-label">Mandados totales</p>
                    <p className="admin-stat-value">
                      {adminStats.tasks.totalTasks}
                    </p>
                  </div>

                  <div className="admin-stat-card">
                    <p className="admin-stat-label">Abiertos</p>
                    <p className="admin-stat-value">
                      {adminStats.tasks.openTasks}
                    </p>
                  </div>

                  <div className="admin-stat-card">
                    <p className="admin-stat-label">Aceptados</p>
                    <p className="admin-stat-value">
                      {adminStats.tasks.acceptedTasks}
                    </p>
                  </div>

                  <div className="admin-stat-card">
                    <p className="admin-stat-label">Recogidos</p>
                    <p className="admin-stat-value">
                      {adminStats.tasks.pickedUpTasks}
                    </p>
                  </div>

                  <div className="admin-stat-card">
                    <p className="admin-stat-label">En camino</p>
                    <p className="admin-stat-value">
                      {adminStats.tasks.onTheWayTasks}
                    </p>
                  </div>

                  <div className="admin-stat-card">
                    <p className="admin-stat-label">Entregados</p>
                    <p className="admin-stat-value">
                      {adminStats.tasks.deliveredTasks}
                    </p>
                  </div>

                  <div className="admin-stat-card">
                    <p className="admin-stat-label">Cancelados</p>
                    <p className="admin-stat-value">
                      {adminStats.tasks.cancelledTasks}
                    </p>
                  </div>

                  <div className="admin-stat-card">
                    <p className="admin-stat-label">Ingresos estimados</p>
                    <p className="admin-stat-value">
                      RD${adminStats.money.estimatedRevenue}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <h2 className="admin-section-title">👥 Usuarios</h2>

              {users.length === 0 && (
                <p className="empty">No hay usuarios cargados.</p>
              )}

              {users.map((u) => (
                <div key={u.id} className="admin-user-card">
                  <div className="admin-pill">{u.role}</div>

                  <h3>{u.name}</h3>

                  <p className="admin-user-meta">{u.phone}</p>

                  <p className="admin-user-meta">Estado: {u.status}</p>

                  {u.role === "RUNNER" && u.status === "PENDING" && (
                    <button
                      onClick={() => aprobarRunner(u.id)}
                      className="button button-success"
                    >
                      ✅ Aprobar runner
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;