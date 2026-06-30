import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function AdminLiveMap({ defaultCity, liveRunners = [], activeTasks = [] }) {
  return (
    <div className="card">
      <h2>🗺️ Mapa en vivo</h2>
      <p>Vista operativa de {defaultCity.name}.</p>

      <div className="admin-live-map">
        <MapContainer
          center={[defaultCity.lat, defaultCity.lng]}
          zoom={defaultCity.zoom}
          scrollWheelZoom={false}
          style={{ height: "360px", width: "100%", borderRadius: "22px" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[defaultCity.lat, defaultCity.lng]}>
            <Popup>📍 Centro operativo DeUnaGo - {defaultCity.name}</Popup>
          </Marker>
          {liveRunners
  .filter((runner) => runner.lastLat && runner.lastLng)
  .map((runner) => (
    <Marker
      key={`runner-${runner.id}`}
      position={[runner.lastLat, runner.lastLng]}
    >
      <Popup>
        🛵 {runner.name}
        <br />
        {runner.phone}
        <br />
        Disponible
      </Popup>
    </Marker>
  ))}

  {activeTasks
  .filter((task) => task.pickupLat && task.pickupLng)
  .map((task) => (
    <Marker
      key={`pickup-${task.id}`}
      position={[task.pickupLat, task.pickupLng]}
    >
      <Popup>
        📦 Recogida
        <br />
        Mandado #{task.id}
      </Popup>
    </Marker>
  ))}

  {activeTasks
  .filter((task) => task.dropoffLat && task.dropoffLng)
  .map((task) => (
    <Marker
      key={`dropoff-${task.id}`}
      position={[task.dropoffLat, task.dropoffLng]}
    >
      <Popup>
        🏁 Entrega
        <br />
        Mandado #{task.id}
      </Popup>
    </Marker>
  ))}

  {activeTasks
  .filter(
    (task) =>
      task.pickupLat &&
      task.pickupLng &&
      task.dropoffLat &&
      task.dropoffLng
  )
  .map((task) => (
    <Polyline
      key={`route-${task.id}`}
      positions={[
        [task.pickupLat, task.pickupLng],
        [task.dropoffLat, task.dropoffLng],
      ]}
    />
  ))}

  {activeTasks
  .filter((task) => task.runnerLat && task.runnerLng)
  .map((task) => (
    <Marker
      key={`runner-task-${task.id}`}
      position={[task.runnerLat, task.runnerLng]}
    >
      <Popup>
        🛵 Runner asignado
        <br />
        Mandado #{task.id}
        <br />
        Estado: {task.status}
      </Popup>
    </Marker>
  ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default AdminLiveMap;