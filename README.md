Team : Firewall-Warriors

AQI Monitoring and Drone-Based Pollution Control System

Overview:

This project aims to develop a smart Air Quality Monitoring and Response System using a PM2.5 sensor integrated into a phone case. The system collects real-time air quality data along with GPS coordinates, maps the data, identifies pollution hotspots, and triggers an autonomous drone to spray water over the affected area. The drone simulation is implemented using Blender.

Key Features:

Real-Time Air Quality Monitoring: The phone case is equipped with a PM2.5 sensor that continuously measures air quality.

GPS Data Collection: The system retrieves latitude and longitude from the user's phone to map pollution levels.

Server-Based Data Processing: The collected data is sent to a server, which aggregates AQI readings and identifies pollution hotspots.

Automated Drone Deployment: When an area with a high AQI is detected, a signal is sent to trigger a drone simulation in Blender, which will sprinkle water to reduce pollution.

Heatmap Visualization: The system generates a heatmap of AQI levels across different regions.

Project Workflow:

Data Collection

The PM2.5 sensor embedded in the phone case captures air quality data.

The phone retrieves its current location (latitude and longitude).

This data is sent to a central server.

Data Processing & Visualization

The server aggregates AQI data from multiple devices.

A heatmap is generated to visualize pollution levels.

The area with the highest AQI is identified.

Drone Activation

The server sends a trigger signal to a drone simulation (built in Blender).

The drone autonomously moves to the identified high-AQI region.

The drone performs water sprinkling to mitigate pollution.

Technologies Used

Hardware:

PM2.5 Sensor (Air Quality Sensor)

Custom Phone Case with Sensor Integration

GPS Module (via Mobile Device)

Software & Cloud:

Backend Server: Flask/Django (Python) to collect and process AQI data

Database:  PostgreSQL for storing AQI records

Frontend Visualization: React.js / D3.js for real-time AQI heatmap

Drone Simulation: Blender (Python scripting for automation)

APIs & Communication Protocols:

Google Maps API (for location mapping)

MQTT / WebSockets (for real-time communication between devices and server)

RESTful APIs (for data retrieval and visualization)


How It Works:

The mobile device, equipped with the sensor, continuously collects PM2.5 data and GPS coordinates.

The data is sent to a central server.

The server processes the data, generates a heatmap, and identifies the most polluted area.

A signal is sent to the Blender drone simulation, instructing the drone to fly to the affected location.

The drone sprinkles water in the simulated environment to visualize pollution control.

Future Enhancements

Deploying a physical drone for real-world implementation.

Adding multiple sensors to collect additional pollutants (CO2, NOx, SO2, etc.).

Enhancing real-time AI-based analysis to predict pollution trends.

Mobile App Development for user-friendly monitoring and alerts.


