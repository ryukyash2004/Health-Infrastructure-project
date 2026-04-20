import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal
from app.models.patient import Patient

async def reset_database():
    print("Connecting to database to reset patients table...")
    async with AsyncSessionLocal() as session:
        try:
            # 1. Wipe existing data
            print("Truncating patients table...")
            await session.execute(text("TRUNCATE TABLE patients"))
            
            # 2. Insert clean mock record
            print("Inserting clean mock record for Jane Doe...")
            mock_patient = Patient(
                patient_name="Jane Doe",
                symptoms="Persistent cough and mild fever for 3 days",
                assessment="Suspected viral upper respiratory infection.",
                severity=2,
                is_red_flag=False
            )
            session.add(mock_patient)
            
            # Commit changes
            await session.commit()
            print("Database successfully reset!")
            print("Inserted: Jane Doe - Severity 2")
            
        except Exception as e:
            print(f"Error resetting database: {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(reset_database())
