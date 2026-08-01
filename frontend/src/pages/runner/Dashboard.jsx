import RunnerProfile from "./components/RunnerProfile";
import RunnerStatusCard from "./components/RunnerStatusCard";
import RunnerDocuments from "./components/RunnerDocuments";
import RunnerActionsPanel from "./components/RunnerActionsPanel";
import RunnerStatsPanel from "./components/RunnerStatsPanel";
import AvailableTasksList from "./components/AvailableTasksList";
import MyTasksList from "./components/MyTasksList";

function RunnerDashboard({
  user,

  profile,
  profileName,
  setProfileName,
  profileAddress,
  setProfileAddress,
  vehicleType,
  setVehicleType,
  vehiclePlate,
  setVehiclePlate,
  bio,
  setBio,
  setProfilePhotoFile,
  cargarPerfil,
  guardarPerfil,
  subirFotoPerfil,

  actualizarDisponibilidadRunner,

  setIdentificationFile,
  setLicenseFile,
  subirIdentificacion,
  subirLicencia,

  trackingTaskId,
  cargarMandados,
  cargarMisMandados,
  cargarGanancias,
  cargarEstadisticasRunner,
  detenerTrackingRunner,

  earnings,
  runnerStats,

  tasks,
  getBadgeClass,
  getStatusText,
  aceptarMandado,

  filteredRunnerTasks,
  runnerFilter,
  setRunnerFilter,
  canChat,
  abrirChat,
  isActiveRunnerTask,
  marcarRecogido,
  marcarEnCamino,
  marcarEntregado,
  setDeliveryProofFile,
  subirComprobanteEntrega,
  enviarUbicacionRunner,
  iniciarTrackingRunner,
}) {
  return (
    <div className="runner-dashboard">
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
          <RunnerActionsPanel
            trackingTaskId={trackingTaskId}
            cargarMandados={cargarMandados}
            cargarMisMandados={cargarMisMandados}
            cargarGanancias={cargarGanancias}
            cargarEstadisticasRunner={cargarEstadisticasRunner}
            detenerTrackingRunner={detenerTrackingRunner}
          />

          <RunnerStatsPanel
            earnings={earnings}
            runnerStats={runnerStats}
          />

          <AvailableTasksList
            tasks={tasks}
            earnings={earnings}
            getBadgeClass={getBadgeClass}
            getStatusText={getStatusText}
            aceptarMandado={aceptarMandado}
          />

          <MyTasksList
            filteredRunnerTasks={filteredRunnerTasks}
            runnerFilter={runnerFilter}
            setRunnerFilter={setRunnerFilter}
            getBadgeClass={getBadgeClass}
            getStatusText={getStatusText}
            canChat={canChat}
            abrirChat={abrirChat}
            isActiveRunnerTask={isActiveRunnerTask}
            marcarRecogido={marcarRecogido}
            marcarEnCamino={marcarEnCamino}
            marcarEntregado={marcarEntregado}
            setDeliveryProofFile={setDeliveryProofFile}
            subirComprobanteEntrega={subirComprobanteEntrega}
            enviarUbicacionRunner={enviarUbicacionRunner}
            trackingTaskId={trackingTaskId}
            detenerTrackingRunner={detenerTrackingRunner}
            iniciarTrackingRunner={iniciarTrackingRunner}
          />
        </>
      )}
    </div>
  );
}

export default RunnerDashboard;