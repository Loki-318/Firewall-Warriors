import asyncpg
import os
import asyncio  # Add this import

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

async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)

async def get_markers():
    conn = await get_db_connection()
    try:
        query = "SELECT latitude, longitude, aqi, timestamp FROM aqi_data"
        rows = await conn.fetch(query)
        markers = [
            {"latitude": row["latitude"], "longitude": row["longitude"], "aqi": row["aqi"], "timestamp": row["timestamp"]}
            for row in rows
        ]
        print(markers)
        return markers
    finally:
        await conn.close()

# This is the main function that runs the async code
async def main():
    await get_markers()

if __name__ == "__main__":
    # Run the main function in the event loop
    asyncio.run(main())