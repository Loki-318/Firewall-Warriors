from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from groq import Groq
import uvicorn
import asyncpg
import pickle
import os

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
