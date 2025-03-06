import React, { useEffect, useState } from 'react';
import { View, Dimensions, PixelRatio, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import EvilIcons from '@expo/vector-icons/EvilIcons';

const LOCAL_IP = '192.168.1.3';
const API_URL = `http://${LOCAL_IP}:5000/api/markers`;

const MapComponent = () => {
  const [markers, setMarkers] = useState([]);
  const pixelRatio = PixelRatio.get();
  const { width, height } = Dimensions.get('window');

  const fetchMarkers = async () => {
    try {
      const response = await axios.get(API_URL);
      setMarkers(response.data);
    } catch (error) {
      console.error('Error fetching markers:', error);
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, []);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=${1 / pixelRatio}, maximum-scale=${1 / pixelRatio}, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        #map {
          width: ${width * pixelRatio}px;
          height: ${height * pixelRatio}px;
          background: #f8f9fa;
        }
        
        .custom-icon {
          width: ${10 * pixelRatio}px;
          height: ${10 * pixelRatio}px;
          background-color: red;
          border-radius: 50%;
          border: ${2 * pixelRatio}px solid white;
        }
        
        .leaflet-popup-content {
          font-size: ${14 * pixelRatio}px;
          line-height: ${20 * pixelRatio}px;
        }
        
        .leaflet-popup-content strong {
          font-size: ${16 * pixelRatio}px;
          line-height: ${24 * pixelRatio}px;
        }
        
        .leaflet-control-attribution {
          font-size: ${12 * pixelRatio}px;
        }
        
        .leaflet-control-zoom {
          transform: scale(${pixelRatio});
          transform-origin: top left;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: true
        }).setView([12.9716, 77.5945], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          tileSize: 512,
          zoomOffset: -1,
          maxZoom: 19
        }).addTo(map);

        var customIcon = L.divIcon({
          className: 'custom-icon',
          iconSize: [${15 * pixelRatio}, ${15 * pixelRatio}]
        });

        const markers = ${JSON.stringify(markers)};
        markers.forEach(marker => {
          L.marker([marker.lat, marker.lng], { icon: customIcon })
            .bindPopup(
              '<div>' +
              '<strong>' + marker.name + '</strong><br>' +
              'Date Added: ' + marker.date_added + '<br>' +
              'Size: ' + marker.size + '<br>' +
              'Threat: ' + marker.threat +
              '</div>',
              {
                closeButton: true,
                className: 'custom-popup'
              }
            )
            .addTo(map);
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        containerStyle={{ flex: 1 }}
      />

      <TouchableOpacity style={styles.refreshButton} onPress={fetchMarkers}>
        <EvilIcons name="refresh" size={32} color='white' />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  refreshButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'black',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  refreshText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default MapComponent;