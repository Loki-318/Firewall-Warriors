import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score

file_name = 'peenya'

# Load dataset (replace 'your_file.csv' with actual filename)
df = pd.read_excel(f'data/{file_name}.xlsx')

# Rename columns for consistency
df.columns = ["Date", "PM2.5", "AQI"]

# Convert 'Date' to datetime format
df["Date"] = pd.to_datetime(df["Date"], errors='coerce')

# Remove rows with missing, '-', or '*' values
df = df.replace(['-', '*'], pd.NA).dropna()

# Convert numerical columns to float
df["PM2.5"] = pd.to_numeric(df["PM2.5"], errors='coerce')
df["AQI"] = pd.to_numeric(df["AQI"], errors='coerce')

# Drop rows that still have NaN values after conversion
df = df.dropna()

# Define features (X) and target (y)
X = df[["PM2.5"]].values  # Independent variable (PM2.5)
y = df["AQI"].values  # Dependent variable (AQI)

# Split dataset (80% training, 20% testing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"Model Performance:\nMAE: {mae:.2f}, R² Score: {r2:.2f}")

with open(f"models/{file_name}.pkl", "wb") as file:
    pickle.dump(model, file)

print(f"Model saved as 'models/{file_name}.pkl'")

with open(f"models/{file_name}.pkl", "rb") as file:
    loaded_model = pickle.load(file)

print("Model loaded successfully!")
