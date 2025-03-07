import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Svg, { Path, Circle, Text as SvgText, Rect } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";
import axios from 'axios';

// API token for WAQI
const API_TOKEN = "432a72d714feb45067e8ab94a21cf93462bc480b";

// Bengaluru area stations with coordinates
const LOCATION_MAP = {
  "(12.95686, 77.53930)": "bapujinagar",
  "(13.03529, 77.59937)": "hebbal",
  "(12.91439, 77.64589)": "hsr_layout",
  "(12.93182, 77.58060)": "jayanagar",
  "(12.89948, 77.48245)": "kengeri",
  "(12.93966, 77.59436)": "nimhans",
  "(13.03379, 77.53768)": "peenya",
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width } = Dimensions.get('window');

const AQIDial = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aqi, setAqi] = useState(0); // City average AQI
  const [regionData, setRegionData] = useState([]); // Station-specific data
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const progress = useSharedValue(0.5); // Default position on arc

  // Function to fetch AQI data from the WAQI API
  const fetchAQIData = async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedData = [];

      // Fetch data for each location
      for (const [coordStr, locationName] of Object.entries(LOCATION_MAP)) {
        const coords = coordStr.replace('(', '').replace(')', '').split(', ');
        const lat = parseFloat(coords[0]);
        const lon = parseFloat(coords[1]);

        const response = await axios.get(https://api.waqi.info/feed/geo:${lat};${lon}/?token=${API_TOKEN});

        if (response.data.status === "ok") {
          const data = response.data.data;

          fetchedData.push({
            id: locationName,
            location: locationName,
            aqi: data.aqi,
            dominantPollutant: data.dominentpol || "N/A",
            pollutants: {
              pm25: data.iaqi.pm25?.v || "N/A",
              pm10: data.iaqi.pm10?.v || "N/A",
              no2: data.iaqi.no2?.v || "N/A",
              so2: data.iaqi.so2?.v || "N/A"
            },
            // We'll calculate x and y positions for visualization
            lat,
            lon
          });
        } else {
          console.warn(Failed to fetch data for ${locationName});
        }
      }

      if (fetchedData.length === 0) {
        throw new Error("Could not fetch data for any location");
      }

      // Calculate average AQI
      const totalAqi = fetchedData.reduce((sum, station) => sum + station.aqi, 0);
      const averageAqi = Math.round(totalAqi / fetchedData.length);

      setAqi(averageAqi);

      // Update progress for the dial
      const normalizedProgress = Math.min(averageAqi / 500, 1);
      progress.value = withTiming(normalizedProgress, { duration: 1000 });

      // Position the locations in a circular layout
      const positionedData = fetchedData.map((station, index) => {
        const angle = (2 * Math.PI * index) / fetchedData.length;
        const radius = 90; // Distance from center

        return {
          ...station,
          x: 150 + radius * Math.cos(angle), // Center x + offset
          y: 150 + radius * Math.sin(angle), // Center y + offset
          radius: 15 + Math.min(parseInt(station.aqi) / 15, 10) // Size based on AQI
        };
      });

      setRegionData(positionedData);
      setLastUpdated(new Date().toLocaleString());

    } catch (error) {
      console.error('Error fetching AQI data:', error);
      setError("Failed to fetch AQI data. Please try again later.");
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  // Use mock data if API fails
  const useMockData = () => {
    // Mock AQI data for Bengaluru locations
    const mockData = [
      {
        id: "bapujinagar", location: "bapujinagar", aqi: 152, dominantPollutant: "pm25",
        pollutants: { pm25: 73, pm10: 92, no2: 24, so2: 6 }
      },
      {
        id: "hebbal", location: "hebbal", aqi: 138, dominantPollutant: "pm25",
        pollutants: { pm25: 62, pm10: 88, no2: 18, so2: 7 }
      },
      {
        id: "hsr_layout", location: "hsr_layout", aqi: 145, dominantPollutant: "pm25",
        pollutants: { pm25: 68, pm10: 94, no2: 21, so2: 8 }
      },
      {
        id: "jayanagar", location: "jayanagar", aqi: 120, dominantPollutant: "pm25",
        pollutants: { pm25: 53, pm10: 85, no2: 16, so2: 5 }
      },
      {
        id: "kengeri", location: "kengeri", aqi: 110, dominantPollutant: "pm25",
        pollutants: { pm25: 48, pm10: 76, no2: 15, so2: 4 }
      },
      {
        id: "nimhans", location: "nimhans", aqi: 135, dominantPollutant: "pm25",
        pollutants: { pm25: 61, pm10: 89, no2: 19, so2: 6 }
      },
      {
        id: "peenya", location: "peenya", aqi: 160, dominantPollutant: "pm25",
        pollutants: { pm25: 76, pm10: 105, no2: 28, so2: 9 }
      },
    ];

    // Position the locations in a circular layout
    const positionedData = mockData.map((station, index) => {
      const angle = (2 * Math.PI * index) / mockData.length;
      const radius = 90; // Distance from center

      return {
        ...station,
        x: 150 + radius * Math.cos(angle), // Center x + offset
        y: 150 + radius * Math.sin(angle), // Center y + offset
        radius: 15 + Math.min(parseInt(station.aqi) / 15, 10) // Size based on AQI
      };
    });

    // Calculate average AQI
    const totalAqi = mockData.reduce((sum, station) => sum + station.aqi, 0);
    const averageAqi = Math.round(totalAqi / mockData.length);

    setAqi(averageAqi);
    setRegionData(positionedData);
    setLastUpdated(new Date().toLocaleString() + " (Mock Data)");

    // Update progress for the dial
    const normalizedProgress = Math.min(averageAqi / 500, 1);
    progress.value = withTiming(normalizedProgress, { duration: 1000 });
  };

  useEffect(() => {
    fetchAQIData();

    // Set up interval to refresh data every 30 minutes
    const refreshInterval = setInterval(fetchAQIData, 30 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Get color based on AQI value
  const getAqiColor = (value) => {
    if (value <= 50) return "#00e400"; // Good
    if (value <= 100) return "#ffff00"; // Satisfactory
    if (value <= 200) return "#ff7e00"; // Moderate
    if (value <= 300) return "#ff0000"; // Poor
    if (value <= 400) return "#99004c"; // Very Poor
    return "#7e0023"; // Severe
  };

  // Get text description based on AQI value (using Indian AQI standards)
  const getAqiDescription = (value) => {
    if (value <= 50) return "Good";
    if (value <= 100) return "Satisfactory";
    if (value <= 200) return "Moderate";
    if (value <= 300) return "Poor";
    if (value <= 400) return "Very Poor";
    return "Severe";
  };

  // Get health recommendations based on AQI
  const getHealthRecommendation = (value) => {
    if (value <= 50) return "Air quality is good - ideal for outdoor activities";
    if (value <= 100) return "Air quality is acceptable - but some pollutants may affect sensitive individuals";
    if (value <= 200) return "May cause breathing discomfort to people with lung disease, children and older adults";
    if (value <= 300) return "May cause breathing discomfort to people on prolonged exposure - avoid outdoor activities";
    if (value <= 400) return "May cause respiratory illness to the people on prolonged exposure - avoid outdoor activities";
    return "May cause serious respiratory effects even on healthy people - avoid all outdoor physical activities";
  };

  const radius = 100;
  const strokeWidth = 10;
  const cx = 150;
  const cy = 150;
  const startAngle = -Math.PI;
  const endAngle = 0;

  const path = M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy};

  const animatedProps = useAnimatedProps(() => {
    const angle = startAngle + progress.value * (endAngle - startAngle);
    const ballX = cx + radius * Math.cos(angle);
    const ballY = cy + radius * Math.sin(angle);
    return { cx: ballX, cy: ballY };
  });

  // Handle region selection for detailed view
  const handleRegionSelect = (location) => {
    setSelectedLocation(location === selectedLocation ? null : location);
  };

  if (loading && !regionData.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Loading Bengaluru AQI data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Bengaluru AQI Monitor</Text>
        <Text style={styles.headerSubtitle}>Real-time Air Quality Index</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.lastUpdatedContainer}>
          <Text style={styles.lastUpdatedText}>
            Last updated: {lastUpdated || 'Loading...'}
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchAQIData}
            disabled={loading}
          >
            <Text style={styles.refreshButtonText}>
              {loading ? 'Updating...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dialContainer}>
          <Svg width="300" height="300" viewBox="0 0 300 300">
            {/* AQI scale background arc */}
            <Path
              d={path}
              stroke="#e0e0e0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Colored segments for AQI levels */}
            <Path
              d={M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx - radius * 0.866} ${cy - radius * 0.5}}
              stroke="#00e400"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Path
              d={M ${cx - radius * 0.866} ${cy - radius * 0.5} A ${radius} ${radius} 0 0 1 ${cx - radius * 0.5} ${cy - radius * 0.866}}
              stroke="#ffff00"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Path
              d={M ${cx - radius * 0.5} ${cy - radius * 0.866} A ${radius} ${radius} 0 0 1 ${cx} ${cy - radius}}
              stroke="#ff7e00"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Path
              d={M ${cx} ${cy - radius} A ${radius} ${radius} 0 0 1 ${cx + radius * 0.5} ${cy - radius * 0.866}}
              stroke="#ff0000"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Path
              d={M ${cx + radius * 0.5} ${cy - radius * 0.866} A ${radius} ${radius} 0 0 1 ${cx + radius * 0.866} ${cy - radius * 0.5}}
              stroke="#99004c"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Path
              d={M ${cx + radius * 0.866} ${cy - radius * 0.5} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}}
              stroke="#7e0023"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Indicator ball */}
            <AnimatedCircle
              r={strokeWidth + 2}
              fill={getAqiColor(aqi)}
              animatedProps={animatedProps}
              stroke="#fff"
              strokeWidth={2}
            />

            {/* Value labels */}
            <SvgText x="50" y="170" fontSize="12" fill="#888">0</SvgText>
            <SvgText x="140" y="70" fontSize="12" fill="#888">200</SvgText>
            <SvgText x="250" y="170" fontSize="12" fill="#888">400+</SvgText>

            {/* Center AQI value */}
            <SvgText
              x={cx}
              y={cy}
              fontSize="36"
              fontWeight="bold"
              fill={getAqiColor(aqi)}
              textAnchor="middle"
            >
              {aqi}
            </SvgText>

            {/* AQI description */}
            <SvgText
              x={cx}
              y={cy + 30}
              fontSize="14"
              fill="#666"
              textAnchor="middle"
            >
              {getAqiDescription(aqi)}
            </SvgText>
            <SvgText
              x={cx}
              y={cy + 50}
              fontSize="14"
              fill="#666"
              textAnchor="middle"
            >
              {((aqi + (Math.floor(Math.random() * 7) - 3)) / 2.5).toFixed(1)}
            </SvgText>
          </Svg>
        </View>

        {/* Health recommendation based on current AQI */}
        <View style={styles.recommendationContainer}>
          <Text style={styles.recommendationTitle}>Health Advisory:</Text>
          <Text style={styles.recommendationText}>
            {getHealthRecommendation(aqi)}
          </Text>
        </View>

        {/* Regional AQI Heatmap Visualization */}
        <View style={styles.heatmapContainer}>
          <Text style={styles.sectionTitle}>Bengaluru AQI by Location</Text>

          {/* Color legend - Using Indian AQI standards */}
          <View style={styles.colorLegendContainer}>
            <Text style={styles.legendTitle}>AQI Color Scale (Indian Standards):</Text>
            <View style={styles.colorLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: "#00e400" }]} />
                <Text style={styles.legendText}>0-50: Good</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: "#ffff00" }]} />
                <Text style={styles.legendText}>51-100: Satisfactory</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: "#ff7e00" }]} />
                <Text style={styles.legendText}>101-200: Moderate</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: "#ff0000" }]} />
                <Text style={styles.legendText}>201-300: Poor</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: "#99004c" }]} />
                <Text style={styles.legendText}>301-400: Very Poor</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: "#7e0023" }]} />
                <Text style={styles.legendText}>401+: Severe</Text>
              </View>
            </View>
          </View>

          <View style={styles.mapContainer}>
            <Svg width="300" height="300" viewBox="0 0 300 300" style={styles.map}>
              {/* Stylized Bengaluru map outline */}
              <Rect x="20" y="20" width="260" height="260" rx="20" fill="#f5f5f5" />

              {/* Major roads for reference (simplified) */}
              <Path
                d="M 70 150 H 230 M 150 70 V 230 M 70 70 L 230 230 M 70 230 L 230 70"
                stroke="#e0e0e0"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* City center marker */}
              <Circle cx={150} cy={150} r={5} fill="#ccc" />

              {/* AQI locations */}
              {regionData.map((region) => (
                <Circle
                  key={region.id}
                  cx={region.x}
                  cy={region.y}
                  r={region.radius}
                  fill={getAqiColor(region.aqi)}
                  opacity={0.8}
                  onPress={() => handleRegionSelect(region)}
                />
              ))}

              {/* AQI values */}
              {regionData.map((region) => (
                <SvgText
                  key={label-${region.id}}
                  x={region.x}
                  y={region.y + 2}
                  fontSize="10"
                  fill="#fff"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {region.aqi}
                </SvgText>
              ))}

              {/* Station names */}
              {regionData.map((region) => (
                <SvgText
                  key={name-${region.id}}
                  x={region.x}
                  y={region.y - region.radius - 5}
                  fontSize="8"
                  fill="#555"
                  textAnchor="middle"
                >
                  {region.location}
                </SvgText>
              ))}
            </Svg>

            {/* Detailed tooltip for selected location */}
            {selectedLocation && (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipLocation}>{selectedLocation.location}</Text>
                <Text style={[styles.tooltipAqi, { color: getAqiColor(selectedLocation.aqi) }]}>
                  AQI: {selectedLocation.aqi} - {getAqiDescription(selectedLocation.aqi)}
                </Text>
                <Text style={styles.tooltipPollutant}>
                  Dominant Pollutant: {selectedLocation.dominantPollutant}
                </Text>
                <View style={styles.pollutantsContainer}>
                  <Text style={styles.pollutantsTitle}>Pollutants:</Text>
                  <View style={styles.pollutantsGrid}>
                    <Text style={styles.pollutantItem}>PM2.5: {selectedLocation.pollutants.pm25} µg/m³</Text>
                    <Text style={styles.pollutantItem}>PM10: {selectedLocation.pollutants.pm10} µg/m³</Text>
                    <Text style={styles.pollutantItem}>NO₂: {selectedLocation.pollutants.no2} µg/m³</Text>
                    <Text style={styles.pollutantItem}>SO₂: {selectedLocation.pollutants.so2} µg/m³</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Bengaluru Air Quality by Area</Text>

          {regionData.sort((a, b) => b.aqi - a.aqi).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.heatmapItem}
              onPress={() => handleRegionSelect(item)}
            >
              <Text style={[
                styles.locationText,
                selectedLocation?.id === item.id && styles.selectedLocation
              ]}>
                {item.location}
              </Text>
              <View style={styles.aqiBar}>
                <View
                  style={[
                    styles.aqiBarFill,
                    {
                      width: ${Math.min(item.aqi / 5, 100)}%,
                      backgroundColor: getAqiColor(item.aqi)
                    }
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.heatmapAqi,
                  { color: getAqiColor(item.aqi) }
                ]}
              >
                {item.aqi}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional information section about AQI in India */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About WAQI Standards</Text>
          <Text style={styles.infoText}>
            The Air Quality Index (AQI) is based on measurement of particulate matter (PM2.5 and PM10),
            Ozone (O3), Nitrogen Dioxide (NO2), Sulfur Dioxide (SO2) and Carbon Monoxide (CO)
            concentrations. The higher the AQI value, the greater the level of air pollution
            and health risk.
          </Text>
          <Text style={styles.infoSource}>
            Data source: World Air Quality Index Project (aqicn.org)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#888",
    marginBottom: 10,
  },
  errorContainer: {
    backgroundColor: '#fff8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  errorText: {
    color: '#d63031',
    fontSize: 14,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#888',
  },
  refreshButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  refreshButtonText: {
    fontSize: 12,
    color: '#555',
  },
  dialContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  recommendationContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  recommendationText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  heatmapContainer: {
    marginTop: 5,
    marginBottom: 20,
  },
  colorLegendContainer: {
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  colorLegend: {
    flexDirection: 'column',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#555',
  },
  mapContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
  },
  map: {
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltip: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
    width: width * 0.7,
    maxWidth: 250,
  },
  tooltipLocation: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  tooltipAqi: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  tooltipPollutant: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  pollutantsContainer: {
    marginTop: 5,
  },
  pollutantsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pollutantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pollutantItem: {
    width: '50%',
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  listContainer: {
    marginTop: 5,
    marginBottom: 20,
  },
  heatmapItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: '#fafafa',
    borderRadius: 8,
  },
  locationText: {
    width: 100,
    fontSize: 14,
    color: "#444",
  },
  selectedLocation: {
    fontWeight: 'bold',
    color: '#000',
  },
  aqiBar: {
    flex: 1,
    height: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  aqiBarFill: {
    height: "100%",
    borderRadius: 8,
  },
  heatmapAqi: {
    width: 40,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
    marginLeft: 10,
  },
  infoContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  infoSource: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  }
});

export default AQIDial;