import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

const EventMap = ({ position, event }) => {
  return (
    <MapContainer center={position} zoom={20} scrollWheelZoom={false} >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>{event.Location.name}</Popup>
      </Marker>
    </MapContainer>
  );
};

export default EventMap;
