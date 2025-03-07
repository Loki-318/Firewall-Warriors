import './styles.css';
import "leaflet/dist/leaflet.css";
import { useRef, useState, useEffect } from 'react';
import axios from 'axios';

import { MapContainer, TileLayer, useMapEvent, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from "react-leaflet-cluster";

import { divIcon, point } from "leaflet";

const customDotIcon = divIcon({
  className: "custom-icon",
  html: '<div style="width: 20px; height: 20px; background-color: red; border-radius: 50%;"></div>',
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

const createClusterCustomIcon = (cluster) => {
  return new divIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true)
  });
};

const MapPage = () => {
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [hoverEnabled, setHoverEnabled] = useState(false);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/markers');
        const formattedMarkers = response.data.map(marker => ({
          id: marker.id,
          geocode: [marker.latitude, marker.longitude],
          aqi: marker.aqi,
          timestamp: marker.timestamp
        }));
        setMarkers(formattedMarkers);
      } catch (error) {
        console.error('Error fetching markers:', error);
      }
    };

    fetchMarkers();
  }, []);

  useEffect(() => {
    if (!hoverEnabled) {
      setCoordinates({ lat: null, lng: null });
    }
  }, [hoverEnabled]);

  return (
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
            <Marker key={marker.id} position={marker.geocode} icon={customDotIcon}>
              <Popup maxWidth={300} minWidth={150}>
                <div className="popup-content">
                  <strong>AQI: {marker.aqi}</strong>
                  <br />
                  <span>Timestamp: {new Date(marker.timestamp).toLocaleString()}</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <div style={{ marginTop: "10px" }}>
        {hoverEnabled ? (
          coordinates.lat !== null && coordinates.lng !== null ? (
          <p>
            Latitude: {coordinates.lat.toFixed(5)}, Longitude: {coordinates.lng.toFixed(5)}
          </p>
          ): (
          <p>Hover over the map to see coordinates</p>
          )
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
  );
};

export default MapPage;
