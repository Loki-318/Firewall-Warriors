import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from "react-native";
import Svg, { Path, Circle, Text as SvgText, Rect } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";
import axios from 'axios';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width } = Dimensions.get('window');

const AQIDial = () => {
  const [aqi, setAqi] = useState(0); // Default AQI
  const [regionData, setRegionData] = useState([]); // Data for regional heatmap
  const [selectedLocation, setSelectedLocation] = useState(null);
  const progress = useSharedValue(0.5); // Default position on arc

  const recent_aqi = async () => {
    // In a real app, you'd fetch this from an API
    const AQI = 400;
    setAqi(AQI);
    
    // Update the progress based on AQI (0-500 scale)
    // AQI 0 = 0, AQI 500 = 1
    const normalizedProgress = Math.min(AQI / 500, 1);
    progress.value = withTiming(normalizedProgress, { duration: 1000 });
    
    // Fetch mock regional data
    // In a real app, you'd get this from an API based on user location
    fetchRegionalData();
  };
  
  const fetchRegionalData = () => {
    // Enhanced mock data for regional heatmap (in real app, get from API)
    const mockRegionalData = [
      { id: 1, location: "Downtown", aqi: 95, x: 150, y: 150, radius: 25 },
      { id: 2, location: "North Side", aqi: 88, x: 150, y: 70, radius: 20 },
      { id: 3, location: "East End", aqi: 102, x: 230, y: 150, radius: 22 },
      { id: 4, location: "West Hills", aqi: 76, x: 70, y: 150, radius: 18 },
      { id: 5, location: "South Bay", aqi: 85, x: 150, y: 230, radius: 20 },
      { id: 6, location: "Northwest", aqi: 63, x: 90, y: 90, radius: 15 },
      { id: 7, location: "Northeast", aqi: 110, x: 210, y: 90, radius: 17 },
      { id: 8, location: "Southeast", aqi: 92, x: 210, y: 210, radius: 16 },
      { id: 9, location: "Southwest", aqi: 81, x: 90, y: 210, radius: 15 },
    ];
    setRegionData(mockRegionalData);
  };
  
  useEffect(() => {
    recent_aqi();
  }, []);

  // Get color based on AQI value
  const getAqiColor = (value) => {
    if (value <= 50) return "#00e400"; // Good
    if (value <= 100) return "#ffff00"; // Moderate
    if (value <= 150) return "#ff7e00"; // Unhealthy for Sensitive Groups
    if (value <= 200) return "#ff0000"; // Unhealthy
    if (value <= 300) return "#99004c"; // Very Unhealthy
    return "#7e0023"; // Hazardous
  };
  
  // Get text description based on AQI value
  const getAqiDescription = (value) => {
    if (value <= 50) return "Good";
    if (value <= 100) return "Moderate";
    if (value <= 150) return "Unhealthy for Sensitive Groups";
    if (value <= 200) return "Unhealthy";
    if (value <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  const radius = 100;
  const strokeWidth = 10;
  const cx = 150;
  const cy = 150;
  const startAngle = -Math.PI;
  const endAngle = 0;

  const path = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  const animatedProps = useAnimatedProps(() => {
    const angle = startAngle + progress.value * (endAngle - startAngle);  // Calculate angle
    const ballX = cx + radius * Math.cos(angle);  // Calculate X position
    const ballY = cy + radius * Math.sin(angle);  // Calculate Y position
    return { cx: ballX, cy: ballY };  // Return animated properties for the ball's position
  });
  
  // Handle region selection for detailed view
  const handleRegionSelect = (location) => {
    setSelectedLocation(location === selectedLocation ? null : location);
  };
  
  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>AQI Sentinel</Text>
        <Text style={styles.headerSubtitle}>Real-time Air Quality Monitoring</Text>
        
        <View style={styles.dialContainer}>
          <Svg width="300" height="300" viewBox="0 0 300 300">
            {/* Background neutral arc - changed to neutral gray */}
            <Path
              d={path}
              stroke="#cccccc"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            
            {/* Removed the colored AQI arc, keeping only neutral background */}
            
            {/* Indicator ball - still colored based on AQI */}
            <AnimatedCircle
              r={strokeWidth + 2}
              fill={getAqiColor(aqi)}
              animatedProps={animatedProps}
            />
            
            {/* Value labels */}
            <SvgText x="50" y="170" fontSize="12" fill="#888">0</SvgText>
            <SvgText x="250" y="170" fontSize="12" fill="#888">500</SvgText>
            
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
          </Svg>
        </View>
        
        {/* Regional AQI Heatmap Visualization */}
        <View style={styles.heatmapContainer}>
          <Text style={styles.sectionTitle}>Regional AQI Heatmap</Text>
          
          {/* Added heatmap color description */}
          <View style={styles.colorLegendContainer}>
            <Text style={styles.legendTitle}>AQI Color Scale:</Text>
            <View style={styles.colorLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, {backgroundColor: "#00e400"}]} />
                <Text style={styles.legendText}>0-50: Good</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, {backgroundColor: "#ffff00"}]} />
                <Text style={styles.legendText}>51-100: Moderate</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, {backgroundColor: "#ff7e00"}]} />
                <Text style={styles.legendText}>101-150: Unhealthy for Sensitive Groups</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, {backgroundColor: "#ff0000"}]} />
                <Text style={styles.legendText}>151-200: Unhealthy</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, {backgroundColor: "#99004c"}]} />
                <Text style={styles.legendText}>201-300: Very Unhealthy</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, {backgroundColor: "#7e0023"}]} />
                <Text style={styles.legendText}>301+: Hazardous</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.mapContainer}>
            <Svg width="300" height="300" viewBox="0 0 300 300" style={styles.map}>
              {/* City outline or background */}
              <Rect x="20" y="20" width="260" height="260" rx="20" fill="#f0f0f0" />
              
              {/* Major roads/rivers for reference */}
              <Path 
                d="M 20 150 H 280 M 150 20 V 280" 
                stroke="#ddd" 
                strokeWidth="4" 
                strokeLinecap="round"
              />
              
              {/* Regional AQI bubbles */}
              {regionData.map((region) => (
                <Circle
                  key={region.id}
                  cx={region.x}
                  cy={region.y}
                  r={region.radius}
                  fill={getAqiColor(region.aqi)}
                  opacity={0.7}
                  onPress={() => handleRegionSelect(region)}
                />
              ))}
              
              {/* Location labels */}
              {regionData.map((region) => (
                <SvgText
                  key={`label-${region.id}`}
                  x={region.x}
                  y={region.y + 2}
                  fontSize="10"
                  fill="#333"
                  fontWeight={selectedLocation?.id === region.id ? "bold" : "normal"}
                  textAnchor="middle"
                >
                  {region.aqi}
                </SvgText>
              ))}
              
              {/* Map legend */}
              <Rect x="30" y="240" width="240" height="30" rx="5" fill="rgba(255,255,255,0.7)" />
              {[0, 50, 100, 150, 200, 300].map((value, index) => (
                <Circle
                  key={`legend-${index}`}
                  cx={50 + index * 40}
                  cy={255}
                  r={8}
                  fill={getAqiColor(value)}
                />
              ))}
            </Svg>
            
            {/* Tooltip for selected location */}
            {selectedLocation && (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipLocation}>{selectedLocation.location}</Text>
                <Text style={[styles.tooltipAqi, {color: getAqiColor(selectedLocation.aqi)}]}>
                  AQI: {selectedLocation.aqi} - {getAqiDescription(selectedLocation.aqi)}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Regional Air Quality</Text>
          
          {regionData.map((item) => (
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
                      width: `${Math.min(item.aqi / 5, 100)}%`,
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
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
    marginBottom: 20,
  },
  dialContainer: {
    alignItems: "center",
    marginBottom: 5, // Reduced margin
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10, // Reduced margin
    color: "#333",
  },
  heatmapContainer: {
    marginTop: 0, // Reduced margin
    marginBottom: 10, // Reduced margin
  },
  colorLegendContainer: {
    marginBottom: 10,
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
    marginBottom: 10, // Reduced margin
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
    padding: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  tooltipLocation: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  tooltipAqi: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContainer: {
    marginTop: 5, // Reduced margin
  },
  heatmapItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8, // Reduced margin
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
  }
});

export default AQIDial;

/*import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Circle, Text as SvgText } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";
import axios from 'axios';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AQIDial = () => {
  const [aqi, setAqi] = useState(0); // Default AQI
  const [regionData, setRegionData] = useState([]); // Data for regional heatmap
  const progress = useSharedValue(0.5); // Default position on arc

  const recent_aqi = async () => {
    // In a real app, you'd fetch this from an API
    const AQI = 91;
    setAqi(AQI);
    
    // Update the progress based on AQI (0-500 scale)
    // AQI 0 = 0, AQI 500 = 1
    const normalizedProgress = Math.min(AQI / 500, 1);
    progress.value = withTiming(normalizedProgress, { duration: 1000 });
    
    // Fetch mock regional data
    // In a real app, you'd get this from an API based on user location
    fetchRegionalData();
  };
  
  const fetchRegionalData = () => {
    // Mock data for regional heatmap (in real app, get from API)
    const mockRegionalData = [
      { id: 1, location: "Downtown", aqi: 95 },
      { id: 2, location: "North Side", aqi: 88 },
      { id: 3, location: "East End", aqi: 102 },
      { id: 4, location: "West Hills", aqi: 76 },
      { id: 5, location: "South Bay", aqi: 85 },
    ];
    setRegionData(mockRegionalData);
  };
  
  useEffect(() => {
    recent_aqi();
  }, []);

  // Get color based on AQI value
  const getAqiColor = (value) => {
    if (value <= 50) return "#00e400"; // Good
    if (value <= 100) return "#ffff00"; // Moderate
    if (value <= 150) return "#ff7e00"; // Unhealthy for Sensitive Groups
    if (value <= 200) return "#ff0000"; // Unhealthy
    if (value <= 300) return "#99004c"; // Very Unhealthy
    return "#7e0023"; // Hazardous
  };
  
  // Get text description based on AQI value
  const getAqiDescription = (value) => {
    if (value <= 50) return "Good";
    if (value <= 100) return "Moderate";
    if (value <= 150) return "Unhealthy for Sensitive Groups";
    if (value <= 200) return "Unhealthy";
    if (value <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  const radius = 100;
  const strokeWidth = 10;
  const cx = 150;
  const cy = 150;
  const startAngle = -Math.PI;
  const endAngle = 0;

  const path = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  

  const animatedProps = useAnimatedProps(() => {
    const angle = startAngle + progress.value * (endAngle - startAngle);  // Calculate angle
    const ballX = cx + radius * Math.cos(angle);  // Calculate X position
    const ballY = cy + radius * Math.sin(angle);  // Calculate Y position
    return { cx: ballX, cy: ballY };  // Return animated properties for the ball's position
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>AQI Sentinel</Text>
      <Text style={styles.headerSubtitle}>Real-time Air Quality Monitoring</Text>
      
      <View style={styles.dialContainer}>
        <Svg width="300" height="300" viewBox="0 0 300 300">
          {/* Background gradient arc 
          <Path
            d={path}
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
         
          <Path
            d={path}
            stroke={getAqiColor(aqi)}
            strokeWidth={strokeWidth}
            strokeDasharray={Math.PI * radius}
            strokeDashoffset={Math.PI * radius * (1 - progress.value)}
            fill="transparent"
          />
          
      
          <AnimatedCircle
            r={strokeWidth + 2}
            fill={getAqiColor(aqi)}
            animatedProps={animatedProps}
          />
          
          
          <SvgText x="50" y="170" fontSize="12" fill="#888">0</SvgText>
          <SvgText x="250" y="170" fontSize="12" fill="#888">500</SvgText>
          

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
          
          
          <SvgText
            x={cx}
            y={cy + 30}
            fontSize="14"
            fill="#666"
            textAnchor="middle"
          >
            {getAqiDescription(aqi)}
          </SvgText>
        </Svg>
      </View>
      
      <View style={styles.heatmapContainer}>
        <Text style={styles.sectionTitle}>Regional Air Quality</Text>
        
        {regionData.map((item) => (
          <View key={item.id} style={styles.heatmapItem}>
            <Text style={styles.locationText}>{item.location}</Text>
            <View style={styles.aqiBar}>
              <View 
                style={[
                  styles.aqiBarFill, 
                  { 
                    width: `${Math.min(item.aqi / 5, 100)}%`,
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
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
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
    marginBottom: 20,
  },
  dialContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  heatmapContainer: {
    marginTop: 10,
  },
  heatmapItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    width: 100,
    fontSize: 14,
    color: "#444",
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
  }
});

export default AQIDial;*/