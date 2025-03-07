import { useEffect, useState } from "react";
import axios from "axios";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
    BarChart, Bar, ResponsiveContainer, Legend
} from "recharts";
import './styles.css';

const Insights = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/markers");
                const formattedData = response.data.map(marker => {
                    const fullTimestamp = new Date(marker.timestamp).toLocaleString();
                    const shortTimestamp = fullTimestamp.slice(-11); // Extracts last 8 characters (HH:MM:SS)

                    return {
                        timestamp: shortTimestamp,
                        aqi: marker.aqi,
                    };
                });
                setData(formattedData);
            } catch (error) {
                console.error("Error fetching insights data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="insights-container">
            <h2>Air Quality Insights</h2>

            {/* Line Chart */}
            <div className="chart-container">
                <h3>AQI Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" angle={-45} textAnchor="end" interval={Math.ceil(data.length / 10)} label={{ value: "Timestamp", position: "bottom", offset: 20 }} />
                        <YAxis label={{ value: "AQI Level", angle: -90, position: "insideLeft" }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="aqi" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="chart-container">
                <h3>Distribution of AQI Levels</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" angle={-45} textAnchor="end" interval={Math.ceil(data.length / 10)} label={{ value: "Timestamp", position: "bottom", offset: 20 }} />
                        <YAxis label={{ value: "AQI Level", angle: -90, position: "insideLeft" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="aqi" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Insights;
