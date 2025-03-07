// import React, { useEffect, useState } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Platform } from "react-native";
// import Svg, { Path, Circle } from "react-native-svg";
// import Animated, {
//   useSharedValue,
//   useAnimatedProps,
//   withTiming,
// } from "react-native-reanimated";

// // Import BluetoothSerial conditionally to avoid errors on platforms where it's not available
// let BluetoothSerial;
// if (Platform.OS !== 'web') {
//   // Only import on non-web platforms
//   try {
//     BluetoothSerial = require('react-native-bluetooth-serial-next').default;
//   } catch (err) {
//     console.warn("Failed to load BluetoothSerial module:", err);
//   }
// }

// const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// const AQIDial = () => {
//   const [pm25, setPm25] = useState(0); // PM2.5 value
//   const [isConnected, setIsConnected] = useState(false);
//   const [devices, setDevices] = useState([]);
//   const [connecting, setConnecting] = useState(false);
//   const [bluetoothAvailable, setBluetoothAvailable] = useState(false);
//   const progress = useSharedValue(0.5); // Default position on arc

//   // Function to check if Bluetooth is available
//   const checkBluetoothAvailability = async () => {
//     if (!BluetoothSerial) {
//       setBluetoothAvailable(false);
//       console.log("BluetoothSerial module not available");
//       return false;
//     }
    
//     try {
//       const enabled = await BluetoothSerial.isEnabled();
//       setBluetoothAvailable(enabled);
//       return enabled;
//     } catch (error) {
//       console.error("Error checking Bluetooth availability:", error);
//       setBluetoothAvailable(false);
//       return false;
//     }
//   };

//   // Function to request Bluetooth permissions
//   const requestBluetoothPermission = async () => {
//     if (!BluetoothSerial) {
//       Alert.alert(
//         "Not Available", 
//         "Bluetooth functionality is not available on this device or platform."
//       );
//       return;
//     }
    
//     try {
//       const granted = await BluetoothSerial.requestEnable();
//       if (granted) {
//         console.log("Bluetooth enabled");
//         setBluetoothAvailable(true);
//         scanDevices();
//       } else {
//         console.log("Bluetooth permission denied");
//         Alert.alert("Permission Required", "Bluetooth permission is required to connect to the sensor.");
//       }
//     } catch (error) {
//       console.error("Error requesting Bluetooth permission:", error);
//       Alert.alert("Error", "Failed to request Bluetooth permission.");
//     }
//   };

//   // Scan for available Bluetooth devices
//   const scanDevices = async () => {
//     if (!BluetoothSerial || !bluetoothAvailable) {
//       Alert.alert("Bluetooth Not Available", "Please enable Bluetooth to scan for devices.");
//       return;
//     }
    
//     try {
//       const availableDevices = await BluetoothSerial.list();
//       setDevices(availableDevices || []);
//       console.log("Available devices:", availableDevices);
//     } catch (error) {
//       console.error("Error scanning devices:", error);
//       Alert.alert("Scan Failed", "Failed to scan for Bluetooth devices.");
//     }
//   };

//   // Connect to the ESP32 device
//   const connectToDevice = async (device) => {
//     if (!BluetoothSerial) return;
    
//     try {
//       setConnecting(true);
//       // Disconnect from any existing connection
//       if (isConnected) {
//         await BluetoothSerial.disconnect();
//         setIsConnected(false);
//       }
      
//       console.log(`Connecting to device: ${device.name}`);
//       await BluetoothSerial.connect(device.id);
//       setIsConnected(true);
//       setConnecting(false);
      
//       // Start listening for data
//       startListening();
      
//       Alert.alert("Connected", `Connected to ${device.name}`);
//     } catch (error) {
//       setConnecting(false);
//       console.error(`Error connecting to device: ${error}`);
//       Alert.alert("Connection Failed", `Failed to connect to ${device.name}`);
//     }
//   };

//   // Start listening for data from ESP32
//   const startListening = () => {
//     if (!BluetoothSerial) return;
    
//     // Remove any existing listeners to avoid duplicates
//     BluetoothSerial.removeAllListeners('read');
    
//     BluetoothSerial.on('read', (data) => {
//       try {
//         // Parse the data string from ESP32
//         console.log("Received data:", data);
//         if (data && data.includes("PM2.5:")) {
//           const pm25Part = data.split("PM2.5:")[1].split(" ")[0];
//           const pm25Value = parseFloat(pm25Part);
          
//           if (!isNaN(pm25Value)) {
//             setPm25(pm25Value);
            
//             // Update the dial position based on PM2.5 value
//             // Assuming PM2.5 range of 0-300 for the dial
//             const normalizedValue = Math.min(pm25Value / 300, 1);
//             progress.value = withTiming(normalizedValue, { duration: 500 });
//           }
//         }
//       } catch (error) {
//         console.error("Error parsing data:", error);
//       }
//     });
//   };
  
//   // Handle disconnection
//   const disconnectDevice = async () => {
//     if (!BluetoothSerial || !isConnected) return;
    
//     try {
//       await BluetoothSerial.disconnect();
//       setIsConnected(false);
//       Alert.alert("Disconnected", "Successfully disconnected from the device.");
//     } catch (error) {
//       console.error("Error disconnecting:", error);
//       Alert.alert("Error", "Failed to disconnect from the device.");
//     }
//   };

//   // Initialize Bluetooth when component mounts
//   useEffect(() => {
//     const initBluetooth = async () => {
//       const available = await checkBluetoothAvailability();
//       if (available) {
//         scanDevices();
//       }
//     };
    
//     initBluetooth();
    
//     // Clean up Bluetooth connection when component unmounts
//     return () => {
//       if (BluetoothSerial && isConnected) {
//         BluetoothSerial.disconnect().catch(err => 
//           console.error("Error disconnecting on unmount:", err)
//         );
//         BluetoothSerial.removeAllListeners();
//       }
//     };
//   }, []);

//   // PM2.5 color and text based on value
//   const getPM25Color = (value) => {
//     if (value <= 12) return "#00e400"; // Good
//     if (value <= 35.4) return "#ffff00"; // Moderate
//     if (value <= 55.4) return "#ff7e00"; // Unhealthy for Sensitive Groups
//     if (value <= 150.4) return "#ff0000"; // Unhealthy
//     if (value <= 250.4) return "#99004c"; // Very Unhealthy
//     return "#7e0023"; // Hazardous
//   };

//   const getPM25Text = (value) => {
//     if (value <= 12) return "Good";
//     if (value <= 35.4) return "Moderate";
//     if (value <= 55.4) return "Unhealthy for Sensitive Groups";
//     if (value <= 150.4) return "Unhealthy";
//     if (value <= 250.4) return "Very Unhealthy";
//     return "Hazardous";
//   };

//   const radius = 100;
//   const strokeWidth = 10;
//   const cx = 150;
//   const cy = 150;
//   const startAngle = -Math.PI;
//   const endAngle = 0;

//   const path = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

//   const animatedProps = useAnimatedProps(() => {
//     const angle = startAngle + progress.value * (endAngle - startAngle);
//     const ballX = cx + radius * Math.cos(angle);
//     const ballY = cy + radius * Math.sin(angle);
//     return { cx: ballX, cy: ballY };
//   });

//   // Render device item for the list
//   const renderDeviceItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.deviceItem}
//       onPress={() => connectToDevice(item)}
//       disabled={connecting}
//     >
//       <Text style={styles.deviceName}>{item.name || "Unknown Device"}</Text>
//       <Text style={styles.deviceAddress}>{item.id}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>PM2.5 Monitor</Text>
      
//       <Svg width={300} height={200}>
//         <Path d={path} stroke="#ddd" strokeWidth={strokeWidth} fill="none" />
//         <AnimatedCircle
//           animatedProps={animatedProps}
//           r={15}
//           fill={getPM25Color(pm25)}
//         />
//       </Svg>
      
//       <Text style={[styles.pm25Text, {color: getPM25Color(pm25)}]}>
//         PM2.5: {pm25.toFixed(1)} μg/m³
//       </Text>
      
//       <Text style={styles.pm25Status}>
//         {getPM25Text(pm25)}
//       </Text>
      
//       {!bluetoothAvailable ? (
//         <TouchableOpacity 
//           style={styles.scanButton} 
//           onPress={requestBluetoothPermission}
//         >
//           <Text style={styles.scanButtonText}>Enable Bluetooth</Text>
//         </TouchableOpacity>
//       ) : (
//         <TouchableOpacity 
//           style={styles.scanButton} 
//           onPress={scanDevices}
//           disabled={connecting}
//         >
//           <Text style={styles.scanButtonText}>Scan for Devices</Text>
//         </TouchableOpacity>
//       )}
      
//       <View style={styles.deviceList}>
//         <Text style={styles.deviceListTitle}>Available Devices:</Text>
//         {devices.length > 0 ? (
//           <FlatList
//             data={devices}
//             renderItem={renderDeviceItem}
//             keyExtractor={item => item.id}
//           />
//         ) : (
//           <Text style={styles.noDevicesText}>No devices found</Text>
//         )}
//       </View>
      
//       {isConnected && (
//         <TouchableOpacity 
//           style={styles.disconnectButton} 
//           onPress={disconnectDevice}
//         >
//           <Text style={styles.disconnectButtonText}>Disconnect</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#f5f5f5",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   pm25Text: {
//     fontSize: 36,
//     fontWeight: "bold",
//     marginTop: 10,
//   },
//   pm25Status: {
//     fontSize: 18,
//     marginTop: 5,
//     marginBottom: 20,
//   },
//   scanButton: {
//     backgroundColor: "#2196F3",
//     padding: 10,
//     borderRadius: 5,
//     marginBottom: 20,
//     width: 200,
//     alignItems: "center",
//   },
//   scanButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   deviceList: {
//     width: "100%",
//     maxHeight: 200,
//     marginTop: 10,
//   },
//   deviceListTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   deviceItem: {
//     backgroundColor: "white",
//     padding: 15,
//     borderRadius: 5,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   deviceName: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   deviceAddress: {
//     fontSize: 14,
//     color: "#666",
//   },
//   noDevicesText: {
//     textAlign: "center",
//     color: "#999",
//     marginTop: 10,
//   },
//   disconnectButton: {
//     backgroundColor: "#f44336",
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 20,
//     width: 200,
//     alignItems: "center",
//   },
//   disconnectButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });

// // Export as default to fix the navigation issue
// export default AQIDial;