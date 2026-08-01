function RunnerProfile({
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
}) {
  return (
    <div id="profile-section" className="runner-profile-card">
      <h2>👤 Perfil del runner</h2>

      <button
        onClick={cargarPerfil}
        className="button button-primary"
      >
        Cargar perfil
      </button>

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
            onChange={(event) =>
              setProfileName(event.target.value)
            }
          />

          <input
            className="input"
            placeholder="Dirección principal"
            value={profileAddress}
            onChange={(event) =>
              setProfileAddress(event.target.value)
            }
          />

          <input
            className="input"
            placeholder="Tipo de vehículo"
            value={vehicleType}
            onChange={(event) =>
              setVehicleType(event.target.value)
            }
          />

          <input
            className="input"
            placeholder="Placa"
            value={vehiclePlate}
            onChange={(event) =>
              setVehiclePlate(event.target.value)
            }
          />

          <input
            className="input"
            placeholder="Bio breve"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
          />

          <button
            onClick={guardarPerfil}
            className="button button-success"
          >
            Guardar perfil
          </button>

          <h3>Foto de perfil</h3>

          <input
            type="file"
            className="input"
            onChange={(event) =>
              setProfilePhotoFile(event.target.files?.[0] || null)
            }
          />

          <button
            onClick={subirFotoPerfil}
            className="button button-primary"
          >
            Subir foto
          </button>
        </>
      )}
    </div>
  );
}

export default RunnerProfile;