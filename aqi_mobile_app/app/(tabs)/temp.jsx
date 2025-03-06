import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";
import axios from 'axios';


const AnimatedCircle = Animated.createAnimatedComponent(Circle);


const LOCAL_IP = '192.168.19.18';
const CURR_API_URL = `http://${LOCAL_IP}:8000/api/markers/curr_aqi`;

const AQIDial = () => {
  const [aqi, setAqi] = useState(0); // Default AQI
  const progress = useSharedValue(0.5); // Default position on arc

  const recent_aqi = async () => {
    try {
      const response = await axios.get(CURR_API_URL);
      if (response.data.aqi !== undefined) {
        setAqi(response.data.aqi);  // Extract only the AQI value
      } else {
        console.error("Invalid API response:", response.data);
      }
    } catch (error) {
      console.error('Error fetching markers:', error);
    }
  };
  
  useEffect(() => {
    recent_aqi()
  }, []);

  const radius = 100;
  const strokeWidth = 10;
  const cx = 150;
  const cy = 150;
  const startAngle = -Math.PI;
  const endAngle = 0;

  const path = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  const animatedProps = useAnimatedProps(() => {
    const angle = startAngle + progress.value * (endAngle - startAngle);
    const ballX = cx + radius * Math.cos(angle);
    const ballY = cy + radius * Math.sin(angle);
    return { cx: ballX, cy: ballY };
  });

  return (
    <View style={styles.container}>
      <Svg width={300} height={200}>
        <Path d={path} stroke="#ddd" strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          animatedProps={animatedProps}
          r={10}
          fill="#ff5733"
        />
      </Svg>
      <Text style={styles.aqiText}>AQI: {aqi}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  aqiText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#999",
  },
});

export default AQIDial;
