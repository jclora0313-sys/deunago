import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function AdminLiveMap({ defaultCity }) {
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
        </MapContainer>
      </div>
    </div>
  );
}

export default AdminLiveMap;