import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function MapView({ listings }) {
  const defaultPos = [37.7749, -122.4194]; // fallback San Francisco
  return (
    <div className="h-[80vh] w-full rounded-2xl overflow-hidden shadow">
      <MapContainer center={defaultPos} zoom={10} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        />
        {listings.map((p) => (
          <Marker key={p.id} position={p.coords || defaultPos}>
            <Popup>
              <strong>{p.title}</strong><br />
              ${p.price_per_night}/night
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
