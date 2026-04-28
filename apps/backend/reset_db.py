import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal, engine, Base
from app.models.patient import Patient

async def reset_database():
    print("⏳ Connecting to PostgreSQL...")
    async with engine.begin() as conn:
        print("🗑️ Dropping old tables...")
        await conn.run_sync(Base.metadata.drop_all)
        
        print("🏗️ Building new tables with updated columns...")
        await conn.run_sync(Base.metadata.create_all)
        
    print("✅ Database reset complete! You are ready to go.")
if __name__ == "__main__":
    asyncio.run(reset_database())
