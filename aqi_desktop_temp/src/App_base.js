import './styles.css';
import "leaflet/dist/leaflet.css";
import { useRef, useState } from 'react';

import { MapContainer, TileLayer, useMapEvent, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from "react-leaflet-cluster";

import { divIcon, point } from "leaflet";

const customDotIcon = divIcon({
  className: "custom-icon",
  html: '<div style="width: 10px; height: 10px; background-color: red; border-radius: 50%;"></div>',
  iconSize: [15, 15],
});

const HoverCoordinates = ({ hoverEnabled, setCoordinates }) => {
  const hoverRef = useRef(null);

  useMapEvent("mousemove", (event) => {
    if (hoverEnabled) {
      const { lat, lng } = event.latlng;
      
      if (!hoverRef.current || hoverRef.current.lat !== lat || hoverRef.current.lng !== lng) {
        hoverRef.current = { lat, lng };
        setCoordinates({ lat, lng });
      }
    }
  });

  return null;
};


const createClusterCustomIcon = function (cluster) {
  return new divIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true)
  });
};


function App() {

  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [hoverEnabled, setHoverEnabled] = useState(false);

  const markers = [
    {
      geocode: [13.04407, 77.55694],
      name: "Bel Biggie",
      dateAdded: "2025-01-25",
      size: "L",
      threat: "High",
    },
    {
      geocode: [13.06640, 77.56009],
      name: "Vidya Vengeance",
      dateAdded: "2025-01-25",
      size: "S",
      threat: "Low",
    },
  ];

  return (
    <div>
      <div className='parent-leaflet-container'>
        <MapContainer center={[12.9716, 77.5945]} zoom={13}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          <HoverCoordinates hoverEnabled={hoverEnabled} setCoordinates={setCoordinates} />

          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
          >
            {markers.map((marker) => (
              <Marker position={marker.geocode} icon={customDotIcon}>
                <Popup maxWidth={300} minWidth={150}>
                  <div className="popup-content">
                    <strong>{marker.name}</strong>
                    <br />
                    <span>Date Created: {marker.dateAdded}</span>
                    <br />
                    <span>Size: {marker.size}</span>
                    <br />
                    <span>Threat: {marker.threat}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        <div style={{ marginTop: "10px" }}>
          {coordinates.lat !== null && coordinates.lng !== null ? (
            <p>
              Latitude: {coordinates.lat.toFixed(5)}, Longitude: {coordinates.lng.toFixed(5)}
            </p>
          ) : (
            <p>Hover over the map to see coordinates (enable hover first)</p>
          )}
        </div>
        <div>
          <button onClick={() => setHoverEnabled(!hoverEnabled)}>
            {hoverEnabled ? "Disable Hover Mode" : "Enable Hover Mode"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
