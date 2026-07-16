import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";

import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


function MapView({
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  runnerLat,
  runnerLng,
}) {
  if (pickupLat == null || pickupLng == null) {
    return null;
  }

  const hasDropoff = dropoffLat != null && dropoffLng != null;
  const hasRunner = runnerLat != null && runnerLng != null;

  const routePoints = hasDropoff
    ? [
        [Number(pickupLat), Number(pickupLng)],
        [Number(dropoffLat), Number(dropoffLng)],
      ]
    : [];

  return (
    <MapContainer
      center={[Number(pickupLat), Number(pickupLng)]}
      zoom={13}
      style={{
        height: "250px",
        width: "100%",
        borderRadius: "14px",
        marginTop: "15px",
        marginBottom: "15px",
      }}
    >
      <TileLayer
        attribution="OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[Number(pickupLat), Number(pickupLng)]}>
        <Popup>📍 Recogida</Popup>
      </Marker>

      {hasDropoff && (
        <>
          <Marker position={[Number(dropoffLat), Number(dropoffLng)]}>
            <Popup>🏁 Destino</Popup>
          </Marker>

          <Polyline positions={routePoints} />
        </>
      )}

      {hasRunner && (
        <Marker position={[Number(runnerLat), Number(runnerLng)]}>
          <Popup>🛵 Mandadero en vivo</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default MapView;