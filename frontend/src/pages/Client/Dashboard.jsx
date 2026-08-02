import ClientProfile from "./components/ClientProfile";
import CreateTaskForm from "./components/CreateTaskForm";
import ClientTasksList from "./components/ClientTasksList";

function ClientDashboard({
  profile,
  profileName,
  setProfileName,
  profileAddress,
  setProfileAddress,
  setProfilePhotoFile,
  cargarPerfil,
  guardarPerfil,
  subirFotoPerfil,

  clientTasks,
  clientCompletedTasks,
  clientCancelledTasks,
  clientTotalSpent,

  description,
  setDescription,
  obtenerUbicacion,
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  seleccionarDestino,
  distanciaKm,
  precioEstimado,
  crearMandado,

  filteredClientTasks,
  clientFilter,
  setClientFilter,
  cargarMisMandadosCliente,
  getBadgeClass,
  getStatusText,
  canChat,
  abrirChat,
  cancelarMandado,
  rating,
  setRating,
  review,
  setReview,
  calificarMandado,
  setPaymentProofFile,
  subirComprobantePago,
}) {
  return (
    <div className="client-dashboard">
      <ClientProfile
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
      />

      <CreateTaskForm
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
      />

      <ClientTasksList
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
    </div>
  );
}

export default ClientDashboard;