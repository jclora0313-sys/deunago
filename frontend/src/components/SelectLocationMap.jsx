import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

function SelectLocationMap({
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  onSelectDropoff,
}) {
  const hasPickup = pickupLat && pickupLng;
  const hasDropoff = dropoffLat && dropoffLng;

  const center = hasPickup
    ? [Number(pickupLat), Number(pickupLng)]
    : [19.4517, -70.697]; // Santiago, RD

  const routePoints =
    hasPickup && hasDropoff
      ? [
          [Number(pickupLat), Number(pickupLng)],
          [Number(dropoffLat), Number(dropoffLng)],
        ]
      : [];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{
        height: "300px",
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

      <MapClickHandler onSelect={onSelectDropoff} />

      {hasPickup && (
        <Marker position={[Number(pickupLat), Number(pickupLng)]}>
          <Popup>📍 Recogida</Popup>
        </Marker>
      )}

      {hasDropoff && (
        <>
          <Marker position={[Number(dropoffLat), Number(dropoffLng)]}>
            <Popup>🏁 Destino</Popup>
          </Marker>

          <Polyline positions={routePoints} />
        </>
      )}
    </MapContainer>
  );
}

export default SelectLocationMap;