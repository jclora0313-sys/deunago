import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./App.css";
import MapView from "./components/MapView";
import SelectLocationMap from "./components/SelectLocationMap";

import Sidebar from "./components/Sidebar";
import SplashScreen from "./components/SplashScreen";
import AdminDashboard from "./pages/Admin/Dashboard";
import RunnerDashboard from "./pages/Runner/Dashboard";
import RunnerProfile from "./pages/Runner/components/RunnerProfile";
import RunnerStatusCard from "./pages/Runner/components/RunnerStatusCard";
import RunnerDocuments from "./pages/Runner/components/RunnerDocuments";
import useAdmin from "./hooks/useAdmin";
import useChat from "./hooks/useChat";
import useNotifications from "./hooks/useNotifications";
import ChatBox from "./components/ChatBox";
import useProfile from "./hooks/useProfile";
import useAuth from "./hooks/useAuth";
import useClient from "./hooks/useClient";
import useRunner from "./hooks/useRunner";


import logoFull from "./assets/logo-full.png";
import logoIcon from "./assets/logo-icon.png";


const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

const DEFAULT_CITY = {
  name: "Santiago de los Caballeros",
  lat: 19.4517,
  lng: -70.6970,
  zoom: 13,
};

const SERVICE_RADIUS_KM = 18;


function App() {
  const [showSplash, setShowSplash] = useState(true);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const trackingIntervalRef = useRef(null);

  const {
    user,
    mode,
    setMode,
    name,
    setName,
    phone,
    setPhone,
    password,
    setPassword,
    role,
    setRole,
    register,
    login,
    logout,
  } = useAuth(showToast, trackingIntervalRef);

  const {
    users,
    setUsers,
    adminStats,
    setAdminStats,
    adminTasks,
    setAdminTasks,
    filteredAdminTasks,
    paidAdminTasks,
    maxPaidAmount,
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
  } = useAdmin(showToast);

  const {
    activeChatTaskId,
    setActiveChatTaskId,
    messages,
    setMessages,
    messageText,
    setMessageText,
    abrirChat,
    enviarMensaje,
    cerrarChat,
  } = useChat(showToast);

  const {
    notifications,
    setNotifications,
    showNotificationsPanel,
    setShowNotificationsPanel,
    cargarNotificaciones,
    marcarNotificacionLeida,
    marcarTodasNotificacionesLeidas,
  } = useNotifications(showToast);

  const {
    profile,
    setProfile,
    profileName,
    setProfileName,
    profileAddress,
    setProfileAddress,
    profilePhotoFile,
    setProfilePhotoFile,
    vehicleType,
    setVehicleType,
    vehiclePlate,
    setVehiclePlate,
    bio,
    setBio,
    cargarPerfil,
    guardarPerfil,
    subirFotoPerfil,
  } = useProfile(showToast);

  const {
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
} = useClient({
  showToast,
  cargarNotificaciones,
  defaultCity: DEFAULT_CITY,
  serviceRadiusKm: SERVICE_RADIUS_KM,
});

const {
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
} = useRunner({
  user,
  showToast,
  cargarNotificaciones,
  trackingIntervalRef,
});  
  
const messageInputRef = useRef(null);

const [activeSection, setActiveSection] = useState("dashboard");

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
  if (user?.role !== "RUNNER") return;

  actualizarUbicacionRunnerEnVivo();

  const interval = setInterval(() => {
    actualizarUbicacionRunnerEnVivo();
  }, 15000);

  return () => clearInterval(interval);
}, [user?.role]);

useEffect(() => {
  if (user?.role !== "ADMIN") return;

  cargarRunnersEnVivo();
  cargarMandadosActivos();

  const interval = setInterval(() => {
    cargarRunnersEnVivo();
    cargarMandadosActivos();
  }, 15000);

  return () => clearInterval(interval);
}, [user?.role]);

useEffect(() => {
  const timer = setTimeout(() => {
    setShowSplash(false);
  }, 2500);

  return () => clearTimeout(timer);
}, []);

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

  const canChat = (task) => {
    return (
      task.status === "ACCEPTED" ||
      task.status === "PICKED_UP" ||
      task.status === "ON_THE_WAY" ||
      task.status === "DELIVERED"
    );
  };

if (showSplash) {
  return (
    <SplashScreen
      logoIcon={logoIcon}
      logoFull={logoFull}
    />
  );
}

  return (
  <div className="page">
    {toast && (
      <div className={`toast toast-${toast.type}`}>
        {toast.message}
      </div>
    )}

    <div className="navbar">
      <div>
        <div className="logo">DeUnaGo</div>

        {user && (
  <div className="user-info">
    {profile?.profilePhotoUrl && (
      <img
        src={profile.profilePhotoUrl}
        alt="Perfil"
        className="navbar-avatar"
      />
    )}

    <span>
      {user.name} • {user.role}
    </span>
  </div>
)}
      </div>

      {user && (
        <div className="navbar-actions">
          <div
  className="notification-counter"
  onClick={() => {
  setShowNotificationsPanel(!showNotificationsPanel);
  cargarNotificaciones();
}}
>
  🔔 {notifications.filter((n) => !n.read).length}
</div>

          <button onClick={logout} className="button button-danger">
            Logout
          </button>
        </div>
      )}
    </div>
{showNotificationsPanel && (
  <div className="notifications-panel">
    <h3>🔔 Notificaciones</h3>

<button
  onClick={marcarTodasNotificacionesLeidas}
  className="button button-primary"
>
  ✓ Marcar todas como leídas
</button>
    {notifications.length === 0 && (
      <p className="empty">No tienes notificaciones.</p>
    )}

    {notifications.map((notification) => (
      <div key={notification.id} className="notification-item">
        <p>{notification.message}</p>
        <span>{notification.read ? "Leída" : "Nueva"}</span>

        {!notification.read && (
          <button
            onClick={() => marcarNotificacionLeida(notification.id)}
            className="button button-blue"
          >
            Marcar leída
          </button>
        )}
      </div>
    ))}
  </div>
)}
<div className="landing-logo-wrap">
  <img src={logoFull} alt="DeUnaGo" className="landing-logo-img" />

</div>

<div className="landing-rating">
  ⭐⭐⭐⭐⭐
  <span>4.9/5 • Cientos de mandados completados</span>
</div>


      <div className="container">
 {!user && (
  <div className="landing-shell landing-modern">
    <div className="landing-orbits">
  <span></span>
  <span></span>
  <span></span>
</div>
    <section className="landing-hero">
  <div className="landing-badge">
  🇩🇴 Disponible actualmente en Santiago de los Caballeros
</div>

      <h1 className="landing-title">
  El mandadero que necesitas,
  <span> cuando lo necesitas.</span>
</h1>

<p className="landing-description">
  Solicita mandados en Santiago de los Caballeros en pocos segundos.
  Sigue el recorrido en tiempo real, conversa con tu mandadero y
  recibe todo con seguridad y rapidez.
</p>

<div className="landing-stats">

  <div className="landing-stat">
    <strong>⚡</strong>
    <span>Entrega rápida</span>
  </div>

  <div className="landing-stat">
    <strong>🛵</strong>
    <span>Runners verificados</span>
  </div>

  <div className="landing-stat">
    <strong>📍</strong>
    <span>Tracking en vivo</span>
  </div>

</div>

<div className="landing-benefits">

  <div>✅ Seguimiento en tiempo real</div>

  <div>🛵 Mandaderos previamente verificados</div>

  <div>🔒 Pagos seguros y comprobantes digitales</div>

  <div>⚡ Servicio disponible en Santiago</div>

</div>

      <div className="landing-actions">
        <button
          onClick={() => setMode("register")}
          className="button button-primary"
        >
          Crear cuenta
        </button>

        <button
          onClick={() => setMode("login")}
          className="button button-blue"
        >
          Iniciar sesión
        </button>
      </div>

      <div className="landing-features">
        <div>
          <strong>📍 Tracking</strong>
          <span>Ubicación en tiempo real</span>
        </div>

        <div>
          <strong>💳 Pago digital</strong>
          <span>Control de pagos y comisión</span>
        </div>

        <div>
          <strong>🛵 Mandaderos</strong>
          <span>Validación de documentos</span>
        </div>
      </div>
    </section>

    <section className="auth-card landing-auth-card">
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

          <button
            onClick={login}
            className="button button-primary auth-main-btn"
          >
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

          <button
            onClick={register}
            className="button button-primary auth-main-btn"
          >
            Crear cuenta
          </button>
        </>
      )}
    </section>
  </div>
)}

        {user && (
          <>

<div className="app-layout">
  <Sidebar
  user={user}
  logoIcon={logoIcon}
  logout={logout}
  activeSection={activeSection}
  setActiveSection={setActiveSection}
/>

  <main className="app-content">

            <div id="dashboard-section" className="card">
              <div id="notifications-section"></div>
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


<div id="chat-section"></div>
            <ChatBox
  activeChatTaskId={activeChatTaskId}
  messages={messages}
  user={user}
  profile={profile}
  messageInputRef={messageInputRef}
  messageText={messageText}
  setMessageText={setMessageText}
  cerrarChat={cerrarChat}
  enviarMensaje={enviarMensaje}
/>
            </main>
</div>
          </>
        )}
  
        {user?.role === "CLIENT" && (
          <>
          <div id="profile-section" className="card">
  <h2>👤 Mi perfil</h2>

  <button onClick={cargarPerfil} className="button button-primary">
    Cargar perfil
  </button>
<div className="profile-stats-grid">
  <div className="profile-stat-card">
    <span>Mandados creados</span>
    <strong>{clientTasks.length}</strong>
  </div>

  <div className="profile-stat-card">
    <span>Completados</span>
    <strong>{clientCompletedTasks.length}</strong>
  </div>

  <div className="profile-stat-card">
    <span>Cancelados</span>
    <strong>{clientCancelledTasks.length}</strong>
  </div>

  <div className="profile-stat-card">
    <span>Total gastado</span>
    <strong>RD${clientTotalSpent}</strong>
  </div>
</div>

  {profile && (
    <>
      {profile.profilePhotoUrl && (
        <img
          src={profile.profilePhotoUrl}
          alt="Perfil"
          className="profile-photo"
        />
      )}

      <input
        className="input"
        placeholder="Nombre"
        value={profileName}
        onChange={(e) => setProfileName(e.target.value)}
      />

      <input
        className="input"
        placeholder="Dirección principal"
        value={profileAddress}
        onChange={(e) => setProfileAddress(e.target.value)}
      />

      <button onClick={guardarPerfil} className="button button-success">
        Guardar perfil
      </button>

      <h3>Foto de perfil</h3>

      <input
        type="file"
        className="input"
        onChange={(e) => setProfilePhotoFile(e.target.files[0])}
      />

      <button onClick={subirFotoPerfil} className="button button-primary">
        Subir foto
      </button>
    </>
  )}
</div>
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

            <div id="tasks-section" className="card">
  <h2>📋 Mis mandados creados</h2>

              <button
                onClick={cargarMisMandadosCliente}
                className="button button-primary"
              >
                Cargar mis mandados
              </button>

              <div className="filters-bar">
                {[
                  "ALL",
                  "OPEN",
                  "ACCEPTED",
                  "PICKED_UP",
                  "ON_THE_WAY",
                  "DELIVERED",
                  "CANCELLED",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => setClientFilter(status)}
                    className={
                      clientFilter === status ? "filter-btn active" : "filter-btn"
                    }
                  >
                    {status === "ALL" ? "Todos" : getStatusText(status)}
                  </button>
                ))}
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
                  <p>Comisión DeUnaGo: RD${task.platformFee}</p>
<p>Ganancia runner: RD${task.runnerEarnings}</p>

                  <p>
  Estado del pago:{" "}
  <strong>
    {task.paymentStatus === "PAID"
      ? "Pagado"
      : task.paymentStatus === "PENDING_REVIEW"
      ? "En revisión"
      : "Pendiente"}
  </strong>
</p>

{task.paymentProofUrl && (
  <a
    href={task.paymentProofUrl}
    target="_blank"
    rel="noreferrer"
    className="document-link"
  >
    🧾 Ver comprobante de pago
  </a>
)}

{task.paymentStatus !== "PAID" && (
  <div className="upload-card">
    <h3>🧾 Subir comprobante de pago</h3>

    <input
      type="file"
      className="input"
      onChange={(e) => setPaymentProofFile(e.target.files[0])}
    />

    <button
      onClick={() => subirComprobantePago(task.id)}
      className="button button-primary"
    >
      Subir comprobante
    </button>
  </div>
)}

                  <MapView
                    pickupLat={task.pickupLat}
                    pickupLng={task.pickupLng}
                    dropoffLat={task.dropoffLat}
                    dropoffLng={task.dropoffLng}
                    runnerLat={task.runnerLat}
                    runnerLng={task.runnerLng}
                  />

{task.deliveryProofUrl && (
  <a
    href={task.deliveryProofUrl}
    target="_blank"
    rel="noreferrer"
    className="document-link"
  >
    📸 Ver comprobante de entrega
  </a>
)}

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
        <RunnerDashboard>
        <RunnerProfile
  profile={profile}
  profileName={profileName}
  setProfileName={setProfileName}
  profileAddress={profileAddress}
  setProfileAddress={setProfileAddress}
  vehicleType={vehicleType}
  setVehicleType={setVehicleType}
  vehiclePlate={vehiclePlate}
  setVehiclePlate={setVehiclePlate}
  bio={bio}
  setBio={setBio}
  setProfilePhotoFile={setProfilePhotoFile}
  cargarPerfil={cargarPerfil}
  guardarPerfil={guardarPerfil}
  subirFotoPerfil={subirFotoPerfil}
/>
            
<RunnerStatusCard
  user={user}
  actualizarDisponibilidadRunner={actualizarDisponibilidadRunner}
/>

<RunnerDocuments
  user={user}
  setIdentificationFile={setIdentificationFile}
  setLicenseFile={setLicenseFile}
  subirIdentificacion={subirIdentificacion}
  subirLicencia={subirLicencia}
/>


            {user.status !== "APPROVED" && (
              <div className="pending-box">
                ⏳ Esperando aprobación del administrador.
              </div>
            )}

            {user.status === "APPROVED" && (
              <>
                <div className="runner-actions">
                  <button onClick={cargarMandados} className="button button-primary">
                    📦 Ver disponibles
                  </button>

                  <button
                    onClick={cargarMisMandados}
                    className="button button-primary"
                  >
                    🛵 Mis mandados
                  </button>

                  <button
                    onClick={() => {
  cargarGanancias();
  cargarEstadisticasRunner();
}}
                    className="button button-success"
                  >
                    💰 Ver ganancias
                  </button>
                </div>

                {trackingTaskId && (
                  <div className="runner-highlight">
                    <div className="tracking-live">Tracking activo</div>
                    <h2>📡 Mandado #{trackingTaskId}</h2>

                    <button
                      onClick={detenerTrackingRunner}
                      className="button button-danger"
                    >
                      Detener tracking
                    </button>
                  </div>
                )}

                {earnings && (
                  <div className="runner-highlight">
                    <h2>💰 Ganancias</h2>

                    <div className="runner-stats-grid">
                      <div className="runner-stat-card">
                        <p className="runner-stat-label">Total ganado 70%</p>
                        <p className="runner-stat-value">
                          RD${earnings.totalEarnings}
                        </p>
                      </div>

                      <div className="runner-stat-card">
                        <p className="runner-stat-label">Mandados completados</p>
                        <p className="runner-stat-value">
                          {earnings.completedCount}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {runnerStats && (
  <div className="runner-highlight">
    <h2>⭐ Reputación</h2>

    <p>
      Rating promedio: {runnerStats.averageRating}/5
    </p>

    <p>
      Calificaciones recibidas: {runnerStats.ratingsCount}
    </p>

    <p>
      Mandados completados: {runnerStats.completedCount}
    </p>
  </div>
)}

                <h2 className="runner-section-title">📦 Disponibles</h2>

                {tasks.length === 0 && (
                  <p className="empty">No hay mandados disponibles cargados.</p>
                )}

                {tasks.map((task) => (
                  <div key={task.id} className="runner-task-card">
                    <div className={getBadgeClass(task.status)}>
                      {getStatusText(task.status)}
                    </div>

                    <h3>{task.description}</h3>
                    <p className="runner-distance">
                      Distancia: {task.distanceKm} km
                    </p>
                    <p className="runner-price">RD${task.estimatedPrice}</p>
                    <p className="runner-price">
  Tu ganancia: RD${task.runnerEarnings || 0}
</p>

<h3>📜 Historial de pagos</h3>

{earnings?.tasks?.length === 0 && (
  <p className="empty">Aún no tienes pagos registrados.</p>
)}

{earnings?.tasks?.map((paymentTask) => (
  <div key={paymentTask.id} className="runner-task-card">
    <h3>{paymentTask.description}</h3>

    <p className="runner-price">
      Ganancia: RD${paymentTask.runnerEarnings || 0}
    </p>

    <p className="runner-distance">
      Estado de cobro:{" "}
      {paymentTask.runnerPayoutStatus === "PAID"
        ? "Pagado"
        : "Pendiente"}
    </p>

    <p className="runner-distance">
      Estado del mandado: {getStatusText(paymentTask.status)}
    </p>
  </div>
))}

<p className="runner-distance">
  Pago: {task.paymentStatus === "PAID" ? "Validado" : "Pendiente"}
</p>

                    <MapView
                      pickupLat={task.pickupLat}
                      pickupLng={task.pickupLng}
                      dropoffLat={task.dropoffLat}
                      dropoffLng={task.dropoffLng}
                      runnerLat={task.runnerLat}
                      runnerLng={task.runnerLng}
                    />

{task.deliveryProofUrl && (
  <a
    href={task.deliveryProofUrl}
    target="_blank"
    rel="noreferrer"
    className="document-link"
  >
    📸 Ver comprobante de entrega
  </a>
)}
                    <div className="runner-actions">
                      <button
                        onClick={() => aceptarMandado(task.id)}
                        className="button button-success"
                      >
                        Aceptar mandado
                      </button>
                    </div>
                  </div>
                ))}

                <h2 id="tasks-section" className="runner-section-title">🛵 Mis mandados</h2>

                <div className="filters-bar">
                  {["ALL", "ACCEPTED", "PICKED_UP", "ON_THE_WAY", "DELIVERED"].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => setRunnerFilter(status)}
                        className={
                          runnerFilter === status
                            ? "filter-btn active"
                            : "filter-btn"
                        }
                      >
                        {status === "ALL" ? "Todos" : getStatusText(status)}
                      </button>
                    )
                  )}
                </div>

                {filteredRunnerTasks.length === 0 && (
                  <p className="empty">No hay mandados con este filtro.</p>
                )}

                {filteredRunnerTasks.map((task) => (
                  <div key={task.id} className="runner-task-card">
                    <div className={getBadgeClass(task.status)}>
                      {getStatusText(task.status)}
                    </div>

                    <h3>{task.description}</h3>
                    <p className="runner-distance">
                      Distancia: {task.distanceKm} km
                    </p>
                    <p className="runner-price">RD${task.estimatedPrice}</p>
                    <p className="runner-price">
  Tu ganancia: RD${task.runnerEarnings || 0}
</p>

<p className="runner-distance">
  Pago: {task.paymentStatus === "PAID" ? "Validado" : "Pendiente"}
</p>

                    <MapView
                      pickupLat={task.pickupLat}
                      pickupLng={task.pickupLng}
                      dropoffLat={task.dropoffLat}
                      dropoffLng={task.dropoffLng}
                      runnerLat={task.runnerLat}
                      runnerLng={task.runnerLng}
                    />

{task.deliveryProofUrl && (
  <a
    href={task.deliveryProofUrl}
    target="_blank"
    rel="noreferrer"
    className="document-link"
  >
    📸 Ver comprobante de entrega
  </a>
)}
                    {canChat(task) && (
                      <button
                        onClick={() => abrirChat(task.id)}
                        className="button button-primary"
                      >
                        💬 Abrir chat
                      </button>
                    )}

                    {isActiveRunnerTask(task.status) && (
                      <div className="runner-actions">
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

<input
  type="file"
  className="input"
  onChange={(e) => setDeliveryProofFile(e.target.files[0])}
/>

<button
  onClick={() => subirComprobanteEntrega(task.id)}
  className="button button-primary"
>
  📸 Subir comprobante
</button>
                        <button
                          onClick={() => enviarUbicacionRunner(task.id)}
                          className="button button-success"
                        >
                          📍 Enviar ubicación
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
                            📡 Iniciar tracking
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </RunnerDashboard>
        )}

      {user?.role === "ADMIN" && (
  <AdminDashboard
    users={users}
    adminStats={adminStats}
    adminTasks={adminTasks}
    filteredAdminTasks={filteredAdminTasks}
    adminPaymentFilter={adminPaymentFilter}
    setAdminPaymentFilter={setAdminPaymentFilter}
    activeTasks={activeTasks}
    liveRunners={liveRunners}
    defaultCity={DEFAULT_CITY}
    paidAdminTasks={paidAdminTasks}
    maxPaidAmount={maxPaidAmount}
    showOnlyPendingUsers={showOnlyPendingUsers}
    setShowOnlyPendingUsers={setShowOnlyPendingUsers}
    cargarUsuarios={cargarUsuarios}
    cargarEstadisticasAdmin={cargarEstadisticasAdmin}
    cargarMandadosAdmin={cargarMandadosAdmin}
    cargarMandadosActivos={cargarMandadosActivos}
    validarIdentificacionRunner={validarIdentificacionRunner}
    validarLicenciaRunner={validarLicenciaRunner}
    aprobarRunner={aprobarRunner}
    validarPagoMandado={validarPagoMandado}
    marcarRunnerPagado={marcarRunnerPagado}
    getBadgeClass={getBadgeClass}
    getStatusText={getStatusText}
  />
)}
      </div>
    </div>
  );
}

export default App;