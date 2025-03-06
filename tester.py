import pickle
import numpy as np

# Load the trained model
file_name = 'peenya'
with open(f"models/{file_name}.pkl", "rb") as file:
    loaded_model = pickle.load(file)

# Example test data: PM2.5 values (replace with real test values)
example_pm25_values = np.array([[35.0], [70.0], [120.0]])  # Example PM2.5 readings

# Predict AQI for the given PM2.5 values
predicted_aqi = loaded_model.predict(example_pm25_values)

# Display the results
for i, pm in enumerate(example_pm25_values.flatten()):
    print(f"PM2.5: {pm} → Predicted AQI: {predicted_aqi[i]:.2f}")
