import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./App.css";
import MapView from "./components/MapView";
import SelectLocationMap from "./components/SelectLocationMap";


import SplashScreen from "./components/SplashScreen";
import AdminDashboard from "./pages/Admin/Dashboard";
import RunnerDashboard from "./pages/runner/Dashboard";
import ClientDashboard from "./pages/Client/Dashboard";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import AuthenticatedLayout from "./layouts/AuthenticatedLayout";

import useSocketEvents from "./hooks/useSocketEvents";
import useLiveUpdates from "./hooks/useLiveUpdates";
import useAdmin from "./hooks/useAdmin";
import useChat from "./hooks/useChat";
import useNotifications from "./hooks/useNotifications";
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

  useSocketEvents({
  socket,
  user,
  activeChatTaskId,
  setNotifications,
  updateTaskInState,
  setMessages,
});

 useLiveUpdates({
  user,
  actualizarUbicacionRunnerEnVivo,
  cargarRunnersEnVivo,
  cargarMandadosActivos,
});

useEffect(() => {
  const timer = setTimeout(() => {
    setShowSplash(false);
  }, 2500);

  return () => clearTimeout(timer);
}, []);

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

 <Navbar
  user={user}
  profile={profile}
  logout={logout}
  notifications={notifications}
  showNotificationsPanel={showNotificationsPanel}
  setShowNotificationsPanel={setShowNotificationsPanel}
  cargarNotificaciones={cargarNotificaciones}
  marcarNotificacionLeida={marcarNotificacionLeida}
  marcarTodasNotificacionesLeidas={marcarTodasNotificacionesLeidas}
/>

<div className="landing-logo-wrap">
  <img src={logoFull} alt="DeUnaGo" className="landing-logo-img" />

</div>

      <div className="container">
 {!user && (
  <LandingPage
    logoFull={logoFull}
    mode={mode}
    setMode={setMode}
    name={name}
    setName={setName}
    phone={phone}
    setPhone={setPhone}
    password={password}
    setPassword={setPassword}
    role={role}
    setRole={setRole}
    login={login}
    register={register}
  />
)}

        {user && (
          <>

<AuthenticatedLayout
  user={user}
  logoIcon={logoIcon}
  logout={logout}
  activeSection={activeSection}
  setActiveSection={setActiveSection}

  notifications={notifications}
  cargarNotificaciones={cargarNotificaciones}
  marcarNotificacionLeida={marcarNotificacionLeida}

  activeChatTaskId={activeChatTaskId}
  messages={messages}
  profile={profile}
  messageInputRef={messageInputRef}
  messageText={messageText}
  setMessageText={setMessageText}
  cerrarChat={cerrarChat}
  enviarMensaje={enviarMensaje}
/>
          </>
        )}
  
{user?.role === "CLIENT" && (
  <ClientDashboard
    profile={profile}
    profileName={profileName}
    setProfileName={setProfileName}
    profileAddress={profileAddress}
    setProfileAddress={setProfileAddress}
    setProfilePhotoFile={setProfilePhotoFile}
    cargarPerfil={cargarPerfil}
    guardarPerfil={guardarPerfil}
    subirFotoPerfil={subirFotoPerfil}

    clientTasks={clientTasks}
    clientCompletedTasks={clientCompletedTasks}
    clientCancelledTasks={clientCancelledTasks}
    clientTotalSpent={clientTotalSpent}

    description={description}
    setDescription={setDescription}
    obtenerUbicacion={obtenerUbicacion}
    pickupLat={pickupLat}
    pickupLng={pickupLng}
    dropoffLat={dropoffLat}
    dropoffLng={dropoffLng}
    seleccionarDestino={seleccionarDestino}
    distanciaKm={distanciaKm}
    precioEstimado={precioEstimado}
    crearMandado={crearMandado}

    filteredClientTasks={filteredClientTasks}
    clientFilter={clientFilter}
    setClientFilter={setClientFilter}
    cargarMisMandadosCliente={cargarMisMandadosCliente}
    getBadgeClass={getBadgeClass}
    getStatusText={getStatusText}
    canChat={canChat}
    abrirChat={abrirChat}
    cancelarMandado={cancelarMandado}
    rating={rating}
    setRating={setRating}
    review={review}
    setReview={setReview}
    calificarMandado={calificarMandado}
    setPaymentProofFile={setPaymentProofFile}
    subirComprobantePago={subirComprobantePago}
  />
)}

{user?.role === "RUNNER" && (
  <RunnerDashboard
    user={user}

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

    actualizarDisponibilidadRunner={actualizarDisponibilidadRunner}

    setIdentificationFile={setIdentificationFile}
    setLicenseFile={setLicenseFile}
    subirIdentificacion={subirIdentificacion}
    subirLicencia={subirLicencia}

    trackingTaskId={trackingTaskId}
    cargarMandados={cargarMandados}
    cargarMisMandados={cargarMisMandados}
    cargarGanancias={cargarGanancias}
    cargarEstadisticasRunner={cargarEstadisticasRunner}
    detenerTrackingRunner={detenerTrackingRunner}

    earnings={earnings}
    runnerStats={runnerStats}

    tasks={tasks}
    getBadgeClass={getBadgeClass}
    getStatusText={getStatusText}
    aceptarMandado={aceptarMandado}

    filteredRunnerTasks={filteredRunnerTasks}
    runnerFilter={runnerFilter}
    setRunnerFilter={setRunnerFilter}
    canChat={canChat}
    abrirChat={abrirChat}
    isActiveRunnerTask={isActiveRunnerTask}
    marcarRecogido={marcarRecogido}
    marcarEnCamino={marcarEnCamino}
    marcarEntregado={marcarEntregado}
    setDeliveryProofFile={setDeliveryProofFile}
    subirComprobanteEntrega={subirComprobanteEntrega}
    enviarUbicacionRunner={enviarUbicacionRunner}
    iniciarTrackingRunner={iniciarTrackingRunner}
  />
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