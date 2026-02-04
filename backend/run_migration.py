"""
Database Migration Script - Run this to add quiz settings columns
"""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run_migration():
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not found in .env file")
        return
    
    print("🔄 Connecting to database...")
    
    try:
        # Connect to database
        conn = await asyncpg.connect(database_url)
        
        print("✅ Connected successfully!")
        print("\n📝 Running migration...")
        
        # Run each ALTER TABLE statement
        migrations = [
            "ALTER TABLE assessments ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER;",
            "ALTER TABLE assessments ADD COLUMN IF NOT EXISTS passing_score INTEGER DEFAULT 70;",
            "ALTER TABLE assessments ADD COLUMN IF NOT EXISTS shuffle_questions INTEGER DEFAULT 0;",
            "ALTER TABLE assessments ADD COLUMN IF NOT EXISTS show_results_immediately INTEGER DEFAULT 1;",
            "ALTER TABLE assessments ADD COLUMN IF NOT EXISTS assigned_to TEXT DEFAULT 'entire_batch';",
            "ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS response_data TEXT;"
        ]
        
        for migration in migrations:
            print(f"  Running: {migration[:70]}...")
            await conn.execute(migration)
            print(f"  ✅ Done")
        
        print("\n✅ Migration completed successfully!")
        print("\nNew columns added:")
        print("  - assessments.time_limit_minutes")
        print("  - assessments.passing_score")
        print("  - assessments.shuffle_questions")
        print("  - assessments.show_results_immediately")
        print("  - assessments.assigned_to")
        print("  - assessment_submissions.response_data")
        
        await conn.close()
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        return

if __name__ == "__main__":
    asyncio.run(run_migration())
