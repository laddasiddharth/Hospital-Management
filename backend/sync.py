from database import engine, Base
import models

# Add new tables
Base.metadata.create_all(bind=engine)
print("Sync complete.")
