import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';

// API configuration
const LOCAL_IP = '192.168.19.18';
const API_URL = http://${LOCAL_IP}:8000/api/hotspots;

// Bangalore coordinates range (approximate)
const BANGALORE_LAT_RANGE = [12.85, 13.10];
const BANGALORE_LNG_RANGE = [77.45, 77.75];

const DroneMonitoringScreen = () => {
  const [drones, setDrones] = useState([
    { 
      id: 'drone1', 
      name: 'Drone 1', 
      status: 'Active', 
      expanded: false, 
      batteryLevel: 78,
      hotspot: null,
      location: null
    },
    { 
      id: 'drone2', 
      name: 'Drone 2', 
      status: 'Inactive', 
      expanded: false, 
      batteryLevel: 92,
      location: null
    },
    { 
      id: 'drone3', 
      name: 'Drone 3', 
      status: 'Inactive', 
      expanded: false, 
      batteryLevel: 65,
      location: null
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHotspots();
    generateRandomLocations();
  }, []);

  const fetchHotspots = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      const hotspots = response.data.hotspots;
      
      if (hotspots && hotspots.length > 0) {
        // Assign first hotspot to drone1
        updateDroneWithHotspot(hotspots[0]);
      } else {
        // If no hotspots available, use random location
        generateRandomLocations();
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching hotspots:', err);
      setError('Failed to fetch hotspot data');
      // Use random locations as fallback
      generateRandomLocations();
      setLoading(false);
    }
  };

  const updateDroneWithHotspot = (hotspot) => {
    setDrones(prevDrones => {
      const newDrones = [...prevDrones];
      const drone1Index = newDrones.findIndex(drone => drone.id === 'drone1');
      
      if (drone1Index !== -1) {
        newDrones[drone1Index] = {
          ...newDrones[drone1Index],
          hotspot: hotspot,
          location: {
            latitude: hotspot.latitude,
            longitude: hotspot.longitude,
          }
        };
      }
      
      return newDrones;
    });
  };

  const generateRandomLocations = () => {
    setDrones(prevDrones => {
      // Generate a single random location for both drone2 and drone3
      const randomLat = BANGALORE_LAT_RANGE[0] + Math.random() * (BANGALORE_LAT_RANGE[1] - BANGALORE_LAT_RANGE[0]);
      const randomLng = BANGALORE_LNG_RANGE[0] + Math.random() * (BANGALORE_LNG_RANGE[1] - BANGALORE_LNG_RANGE[0]);
      
      // Generate a separate location for drone1 if it doesn't have a hotspot yet
      const drone1Lat = BANGALORE_LAT_RANGE[0] + Math.random() * (BANGALORE_LAT_RANGE[1] - BANGALORE_LAT_RANGE[0]);
      const drone1Lng = BANGALORE_LNG_RANGE[0] + Math.random() * (BANGALORE_LNG_RANGE[1] - BANGALORE_LNG_RANGE[0]);
      
      return prevDrones.map(drone => {
        if (drone.id === 'drone1' && !drone.hotspot) {
          return {
            ...drone,
            location: {
              latitude: drone1Lat,
              longitude: drone1Lng
            }
          };
        } else if (drone.id === 'drone2' || drone.id === 'drone3') {
          // Use the same location for both drone2 and drone3
          return {
            ...drone,
            location: {
              latitude: randomLat,
              longitude: randomLng
            }
          };
        }
        return drone;
      });
    });
  };

  const toggleExpand = (droneId) => {
    setDrones(prevDrones => {
      return prevDrones.map(drone => {
        if (drone.id === droneId) {
          return {...drone, expanded: !drone.expanded};
        }
        return drone;
      });
    });
  };

  const renderStatusIndicator = (status) => {
    const color = status === 'Active' ? '#4CAF50' : '#F44336';
    return (
      <View style={[styles.statusIndicator, { backgroundColor: color }]} />
    );
  };

  const renderBatteryLevel = (level) => {
    let color = '#4CAF50'; // Green for good battery
    if (level < 30) {
      color = '#F44336'; // Red for low battery
    } else if (level < 70) {
      color = '#FFC107'; // Yellow for medium battery
    }
    
    return (
      <View style={styles.batteryContainer}>
        <View style={[styles.batteryLevel, { width: ${level}%, backgroundColor: color }]} />
        <Text style={styles.batteryText}>{level}%</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading drone data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Drone Monitoring</Text>
        <Text style={styles.headerSubtitle}>Air Quality Monitoring System</Text>
      </View>
      
      {drones.map((drone) => (
        <TouchableOpacity 
          key={drone.id} 
          onPress={() => toggleExpand(drone.id)}
          activeOpacity={0.9}
        >
          <Card style={[styles.droneCard, drone.status === 'Inactive' && styles.inactiveDrone]}>
            <View style={styles.droneHeader}>
              <View style={styles.droneInfo}>
                <Text style={styles.droneName}>{drone.name}</Text>
                <View style={styles.statusContainer}>
                  {renderStatusIndicator(drone.status)}
                  <Text style={styles.statusText}>{drone.status}</Text>
                </View>
              </View>
              <View style={styles.batterySection}>
                {renderBatteryLevel(drone.batteryLevel)}
              </View>
            </View>
            
            {drone.expanded && (
              <View style={styles.expandedContent}>
                <View style={styles.mapContainer}>
                  {drone.location && (
                    <MapView
                      style={styles.map}
                      initialRegion={{
                        latitude: drone.location.latitude,
                        longitude: drone.location.longitude,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                      }}
                    >
                      <Marker
                        coordinate={{
                          latitude: drone.location.latitude,
                          longitude: drone.location.longitude,
                        }}
                        title={drone.name}
                        description={drone.status}
                      />
                    </MapView>
                  )}
                </View>
                
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>Location Details</Text>
                  <Text style={styles.detailsText}>
                    Latitude: {drone.location?.latitude.toFixed(6)}
                  </Text>
                  <Text style={styles.detailsText}>
                    Longitude: {drone.location?.longitude.toFixed(6)}
                  </Text>
                  
                  {drone.hotspot && (
                    <View style={styles.hotspotDetails}>
                      <Text style={styles.hotspotTitle}>Air Quality Hotspot</Text>
                      <Text style={styles.detailsText}>
                        AQI: {drone.hotspot.average_aqi} ({drone.hotspot.severity})
                      </Text>
                      <Text style={styles.detailsText}>
                        Location: {drone.hotspot.nearest_location || 'Unknown'}
                      </Text>
                      <Text style={styles.detailsText}>
                        Data Points: {drone.hotspot.data_points}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  droneCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
    padding: 16,
  },
  inactiveDrone: {
    opacity: 0.7,
  },
  droneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  droneInfo: {
    flex: 1,
  },
  droneName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  batterySection: {
    width: 80,
  },
  batteryContainer: {
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  batteryLevel: {
    height: '100%',
    position: 'absolute',
  },
  batteryText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 16,
  },
  expandedContent: {
    marginTop: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  detailsContainer: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  detailsText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  hotspotDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  hotspotTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});

export default DroneMonitoringScreen;