from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from groq import Groq
import uvicorn
import asyncpg
import pickle
import os
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from datetime import datetime

GROQ_API_KEY = "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"
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:admin@localhost:5432/hackathon")

loc_map = {
    (12.95686, 77.53930): "bapujinagar",
    (13.03529, 77.59937): "hebbal",
    (12.91439, 77.64589): "hsr_layout",
    (12.93182, 77.58060): "jayanagar",
    (12.89948, 77.48245): "kengeri",
    (12.93966, 77.59436): "nimhans",
    (13.03379, 77.53768): "peenya",
}

class ChatRequest(BaseModel):
    request: str

class AQIRequest(BaseModel):
    latitude: float
    longitude: float
    pm: float

async def get_db_connection():
    conn = await asyncpg.connect(DATABASE_URL)
    # Configure connection to return floats instead of decimals
    await conn.set_type_codec(
        'numeric', schema='pg_catalog',
        encoder=lambda x: str(x),
        decoder=lambda x: float(x),
        format='text'
    )
    return conn

@app.get("/api/markers")
async def get_markers():
    conn = await get_db_connection()
    try:
        query = "SELECT latitude, longitude, aqi, timestamp FROM aqi_data"
        rows = await conn.fetch(query)
        markers = [
            {"latitude": row["latitude"], "longitude": row["longitude"], "aqi": row["aqi"], "timestamp": row["timestamp"]}
            for row in rows
        ]
        return markers
    finally:
        await conn.close()

@app.get("/api/hotspots")
async def get_hotspots(days: int = 1, min_aqi: float = 0):
    """
    Get air quality hotspots using K-means clustering.
    
    Parameters:
    - days: Number of days of data to consider (default: 1 day)
    - min_aqi: Minimum AQI threshold to consider (default: 0, i.e., all data)
    
    Returns:
    - List of hotspots with their locations and AQI characteristics
    """
    conn = await get_db_connection()
    try:
        # Get data from the specified period with AQI above threshold
        query = """
        SELECT latitude, longitude, aqi, timestamp 
        FROM aqi_data 
        WHERE timestamp >= CURRENT_DATE - INTERVAL '$1 days'
        AND aqi >= $2
        ORDER BY timestamp DESC
        """
        rows = await conn.fetch(query, days, min_aqi)
        
        # Check if we have enough data points
        if len(rows) < 2:
            return {
                "hotspots": [],
                "analysis_timestamp": datetime.now(),
                "total_points_analyzed": 0,
                "message": "Not enough data points for clustering"
            }
        
        # Extract coordinates and AQI values
        coordinates = np.array([(row["latitude"], row["longitude"]) for row in rows])
        aqi_values = np.array([row["aqi"] for row in rows])
        
        # Find optimal number of clusters
        n_clusters = find_optimal_clusters(coordinates)
        
        # Perform K-means clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(coordinates)
        
        # Generate hotspot information
        hotspots = []
        for i in range(n_clusters):
            # Find all points in this cluster
            mask = cluster_labels == i
            cluster_points = coordinates[mask]
            cluster_aqi = aqi_values[mask]
            
            # Calculate average coordinates and AQI
            avg_lat = float(np.mean(cluster_points[:, 0]))
            avg_lon = float(np.mean(cluster_points[:, 1]))
            avg_aqi = float(np.mean(cluster_aqi))
            
            # Find nearest known location
            nearest_location = find_nearest_location(avg_lat, avg_lon)
            
            # Create hotspot object
            hotspot = {
                "cluster_id": i + 1,
                "latitude": round(avg_lat, 6),
                "longitude": round(avg_lon, 6),
                "average_aqi": round(avg_aqi, 2),
                "data_points": len(cluster_points),
                "severity": classify_aqi_severity(avg_aqi),
                "nearest_location": nearest_location
            }
            hotspots.append(hotspot)
        
        # Return response
        return {
            "hotspots": hotspots,
            "analysis_timestamp": datetime.now(),
            "total_points_analyzed": len(rows)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing hotspot analysis: {str(e)}")
    finally:
        await conn.close()

def classify_aqi_severity(aqi: float) -> str:
    """Classify AQI based on standard categories"""
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"

def find_optimal_clusters(coordinates: np.ndarray, max_clusters: int = 6) -> int:
    """Find optimal number of clusters using silhouette score"""
    if len(coordinates) <= 2:  # Not enough data for meaningful clustering
        return min(len(coordinates), 2)
        
    silhouette_scores = []
    # Test from 2 clusters up to max_clusters (or n-1 data points)
    for n_clusters in range(2, min(max_clusters + 1, len(coordinates))):
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(coordinates)
        
        # Only calculate score if we have more than one cluster
        if len(set(cluster_labels)) > 1:
            try:
                score = silhouette_score(coordinates, cluster_labels)
                silhouette_scores.append((n_clusters, score))
            except:
                pass  # Skip if silhouette score fails
    
    # Return optimal cluster count or default to 2
    if not silhouette_scores:
        return 2
    
    return max(silhouette_scores, key=lambda x: x[1])[0]
    

@app.get("/api/markers/today")
async def get_todays_markers():
    conn = await get_db_connection()
    try:
        query = """
        SELECT latitude, longitude, aqi, timestamp 
        FROM aqi_data 
        WHERE DATE(timestamp) = CURRENT_DATE
        """
        rows = await conn.fetch(query)
        markers = [
            {"aqi": row["aqi"], "timestamp": row["timestamp"]}
            for row in rows
        ]
        return markers
    finally:
        await conn.close()

@app.post("/api/chat")
async def chat_with_llm(chat_request: ChatRequest):
    request = chat_request.request
    client = Groq(api_key=GROQ_API_KEY)
    
    # Get current AQI data
    conn = await get_db_connection()
    try:
        # Get latest AQI reading
        current_aqi_query = """
        SELECT latitude, longitude, aqi, timestamp 
        FROM aqi_data 
        ORDER BY timestamp DESC 
        LIMIT 1
        """
        current_aqi = await conn.fetchrow(current_aqi_query)
        
        # Get historical AQI data (last 7 days)
        historical_query = """
        SELECT AVG(aqi) as avg_aqi, DATE(timestamp) as date
        FROM aqi_data
        WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY DATE(timestamp)
        ORDER BY date
        """
        historical_data = await conn.fetch(historical_query)
        
        # Format the historical data
        historical_aqi_text = "\n".join([
            f"- {row['date']}: Average AQI of {round(row['avg_aqi'], 2)}"
            for row in historical_data
        ])
        
        # Get location based on the current reading
        nearest_location = find_nearest_location(
            current_aqi["latitude"], 
            current_aqi["longitude"]
        )
        
        # Prepare context with all relevant AQI data
        context = f"""
Current AQI Information:
- Location: {nearest_location}
- Current AQI: {current_aqi['aqi']}
- Timestamp: {current_aqi['timestamp']}

Historical AQI Data (Last 7 days):
{historical_aqi_text}

AQI Scale:
- 0-50: Good - Air quality is satisfactory, poses little or no risk
- 51-100: Moderate - Acceptable, but may cause mild concern for sensitive individuals
- 101-150: Unhealthy for Sensitive Groups - May affect sensitive groups
- 151-200: Unhealthy - Everyone may begin to experience health effects
- 201-300: Very Unhealthy - Health alert; everyone may experience more serious health effects
- 301-500: Hazardous - Health warning of emergency conditions
"""
        
        # Combine context with user message
        prompt = f"""You are an air quality assistant helping a user in Bangalore, India.
Use the following AQI information to provide helpful advice, answer questions, or make recommendations.

{context}

User question: {request}

Provide relevant advice based on the current AQI levels, including:
1. Health precautions if needed
2. Suitable outdoor activities considering air quality
3. Best times to go outdoors based on recent trends
4. Personalized recommendations for the user's specific query
"""
        
        # Call the Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama3-70b-8192",
            temperature=0.5,
            max_tokens=800,
        )
        
        return {
            "response": chat_completion.choices[0].message.content,
            "current_aqi": current_aqi["aqi"],
            "location": nearest_location,
            "timestamp": current_aqi["timestamp"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with Groq API: {str(e)}")
    finally:
        await conn.close()

@app.get("/api/markers/curr_aqi")
async def get_current_aqi():
    conn = await get_db_connection()
    try:
        query = """
        SELECT latitude, longitude, aqi, timestamp 
        FROM aqi_data 
        ORDER BY timestamp DESC 
        LIMIT 1
        """
        row = await conn.fetchrow(query)
        if row:
            return {
                "latitude": row["latitude"],
                "longitude": row["longitude"],
                "aqi": row["aqi"],
                "timestamp": row["timestamp"]
            }
        return {"error": "No AQI data available."}
    finally:
        await conn.close()

def find_nearest_location(lat, lon):
    min_distance = float('inf')
    nearest_location = None

    for (loc_lat, loc_lon), name in loc_map.items():
        distance = np.sqrt((lat - loc_lat) ** 2 + (lon - loc_lon) ** 2)
        if distance < min_distance:
            min_distance = distance
            nearest_location = name

    return nearest_location

@app.post("/predict_aqi")
def predict_aqi(data: AQIRequest):
    nearest_place = find_nearest_location(data.latitude, data.longitude)
    
    if not nearest_place:
        return {"error": "No nearby location found."}
    
    try:
        with open(f"models/{nearest_place}.pkl", "rb") as file:
            loaded_model = pickle.load(file)

        predicted_aqi = loaded_model.predict(np.array([[data.pm]]))  # Reshape to 2D
        return {
            "location": nearest_place,
            "PM2.5": data.pm,
            "Predicted AQI": round(predicted_aqi[0], 2)
        }
    except FileNotFoundError:
        return {"error": f"Model for {nearest_place} not found."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
