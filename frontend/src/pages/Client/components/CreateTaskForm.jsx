import SelectLocationMap from "../../../components/SelectLocationMap";

function CreateTaskForm({
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
}) {
  return (
    <div className="card">
      <h2 className="card-title">📝 Crear mandado</h2>

      <input
        className="input"
        placeholder="Descripción"
        value={description}
        onChange={(event) =>
          setDescription(event.target.value)
        }
      />

      <button
        onClick={obtenerUbicacion}
        className="button button-blue"
      >
        📍 Usar mi ubicación
      </button>

      <p>
        Recogida Lat: {pickupLat || "No detectada"}
      </p>

      <p>
        Recogida Lng: {pickupLng || "No detectada"}
      </p>

      <h3>Selecciona el destino tocando el mapa</h3>

      <SelectLocationMap
        pickupLat={pickupLat}
        pickupLng={pickupLng}
        dropoffLat={dropoffLat}
        dropoffLng={dropoffLng}
        onSelectDropoff={seleccionarDestino}
      />

      <p>
        Destino Lat: {dropoffLat || "No seleccionado"}
      </p>

      <p>
        Destino Lng: {dropoffLng || "No seleccionado"}
      </p>

      {distanciaKm > 0 && (
        <div className="task-card">
          <h3>Resumen del mandado</h3>

          <p>
            Distancia aproximada:{" "}
            {distanciaKm.toFixed(2)} km
          </p>

          <p>
            Precio estimado: RD${precioEstimado}
          </p>
        </div>
      )}

      <button
        onClick={crearMandado}
        className="button button-primary"
      >
        Crear mandado
      </button>
    </div>
  );
}

export default CreateTaskForm;