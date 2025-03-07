/*
 * ESP32 with GP2Y1010AU0F Dust Sensor and BLE
 * 
 * This code reads PM2.5 levels from a Sharp GP2Y1010AU0F dust sensor
 * and sends readings via BLE to smartphone apps (e.g., nRF Connect).
 * 
 * Connections:
 * - ESP32 3.3V -> Sensor VCC
 * - ESP32 GND -> Sensor GND
 * - ESP32 D13 -> 150Ω resistor -> Sensor V-LED
 * - ESP32 D12 -> Sensor LED-GND
 * - ESP32 D14 -> Sensor S-GND
 * - ESP32 A0 (VP, GPIO36) -> Sensor VO
 * - 220µF capacitor connected between V-LED and GND
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLEAdvertising.h>
#include <BLE2902.h>

// Use custom 128-bit UUIDs to avoid conflicts
#define SERVICE_UUID        "d752c5fb-5b19-4c2e-a7f4-57b39f65c8ab"
#define CHARACTERISTIC_UUID "dee5f614-9527-11ec-b909-0242ac120002"

// Sensor pin definitions
const int LED_POWER = 13;   // Controls sensor LED (V-LED)
const int LED_GND   = 12;   // Sensor LED ground
const int SENSOR_GND= 14;   // Sensor S-GND
const int MEASURE_PIN = 36; // Analog input for sensor VO (VP)

// Timing parameters (in microseconds)
const int SAMPLING_TIME = 280;
const int DELTA_TIME    = 40;
const int SLEEP_TIME    = 9680;

// Variables to hold sensor values
float voMeasured  = 0;
float voltage     = 0;
float dustDensity = 0;

// BLE objects
BLEServer* pServer = nullptr;
BLECharacteristic* pDataCharacteristic = nullptr;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// BLE Server callback class to handle connection events
class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("Device connected");
  }
  
  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("Device disconnected");
    // Restart advertising after a disconnect
    BLEDevice::getAdvertising()->start();
  }
};

void setup() {
  Serial.begin(115200);
  Serial.println("Initializing GP2Y1010AU0F Dust Sensor with BLE...");
  
  // Configure sensor pins
  pinMode(LED_POWER, OUTPUT);
  pinMode(LED_GND,   OUTPUT);
  pinMode(SENSOR_GND, OUTPUT);
  
  // Initialize sensor pin states
  digitalWrite(LED_POWER, LOW);
  digitalWrite(LED_GND, LOW);
  digitalWrite(SENSOR_GND, LOW);
  
  // Initialize BLE with a custom device name
  BLEDevice::init("ESP32-Dust-Sensor");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  
  // Create BLE Service with custom UUID
  BLEService* pService = pServer->createService(SERVICE_UUID);
  
  // Create BLE Characteristic with READ and NOTIFY properties
  pDataCharacteristic = pService->createCharacteristic(
                          CHARACTERISTIC_UUID,
                          BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
                        );
  // Add descriptor to enable notifications
  pDataCharacteristic->addDescriptor(new BLE2902());
  
  // Start the service
  pService->start();
  
  // Start advertising
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  
  Serial.println("BLE Server started and advertising");
}

void loop() {
  // Read sensor data
  takeDustReading();
  
  // Calculate estimated PM2.5 from dust density using an empirical conversion factor
  float pm25 = dustDensity * 0.8;  // Adjust the factor as needed
  
  // Create a formatted string: "Dust:XX.Xug/m3,PM2.5:XX.Xug/m3"
  char dataString[64];
  snprintf(dataString, sizeof(dataString), "Dust:%.1fug/m3,PM2.5:%.1fug/m3", dustDensity, pm25);
  
  // If a device is connected, update characteristic and notify
  if (deviceConnected) {
    pDataCharacteristic->setValue(dataString);
    pDataCharacteristic->notify();
    Serial.println("Data sent via BLE: " + String(dataString));
  }
  
  // Handle connection changes (optional, since callbacks take care of advertising)
  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    BLEDevice::getAdvertising()->start();
    Serial.println("Advertising restarted");
    oldDeviceConnected = deviceConnected;
  }
  
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }
  
  delay(1000); // Update every 10 seconds
}

// Function to take a single dust sensor reading
void takeDustReading() {
  // Power on sensor LED (active low)
  digitalWrite(LED_POWER, LOW);
  delayMicroseconds(SAMPLING_TIME);
  
  // Read sensor's analog output
  voMeasured = analogRead(MEASURE_PIN);
  
  delayMicroseconds(DELTA_TIME);
  // Turn off the sensor LED
  digitalWrite(LED_POWER, HIGH);
  delayMicroseconds(SLEEP_TIME);
  
  // Convert ADC reading (0-4095) to voltage (assuming 3.3V reference)
  voltage = voMeasured * (3.3 / 4095.0);
  
  // Convert voltage to dust density (ug/m³) using the sensor's datasheet formula
  dustDensity = (voltage - 0.6) * 170;
  if (dustDensity < 0) {
    dustDensity = 0;
  }
  
  // Debug print on Serial Monitor
  Serial.print("Raw: ");
  Serial.print(voMeasured);
  Serial.print(", Voltage: ");
  Serial.print(voltage, 2);
  Serial.print(", Dust Density: ");
  Serial.print(dustDensity, 1);
  Serial.println(" ug/m3");
}
