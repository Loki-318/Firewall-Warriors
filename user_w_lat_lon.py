from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import pickle
import uvicorn

app = FastAPI()

loc_map = {
    (12.95686, 77.53930): "bapujinagar",
    (13.03529, 77.59937): "hebbal",
    (12.91439, 77.64589): "hsr_layout",
    (12.93182, 77.58060): "jayanagar",
    (12.89948, 77.48245): "kengeri",
    (12.93966, 77.59436): "nimhans",
    (13.03379, 77.53768): "peenya",
}

class AQIRequest(BaseModel):
    latitude: float
    longitude: float
    pm: float

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
    uvicorn.run(app, host="localhost", port=8000)
