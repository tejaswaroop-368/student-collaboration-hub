from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from typing import Optional
import certifi


class Database:
    """Database connection manager for MongoDB Atlas"""
    
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db = None
    
    async def connect(self, mongo_uri: str) -> None:
        """
        Connect to MongoDB Atlas
        
        Args:
            mongo_uri: MongoDB Atlas SRV connection URL
        """
        try:
            self.client = MongoClient(
                mongo_uri,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=5000,
            )
            # Verify connection
            self.client.admin.command('ping')
            self.db = self.client.get_database()
            print("✓ Connected to MongoDB Atlas successfully")
        except (ServerSelectionTimeoutError, ConnectionFailure) as e:
            print(f"✗ Failed to connect to MongoDB Atlas: {e}")
            raise
    
    async def disconnect(self) -> None:
        """Close MongoDB connection"""
        if self.client is not None:
            self.client.close()
            self.db = None
            print("✓ MongoDB connection closed")
    
    def get_database(self):
        """Get the database instance"""
        if self.db is None:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self.db
    
    def get_collection(self, collection_name: str):
        """
        Get a collection instance
        
        Args:
            collection_name: Name of the collection
            
        Returns:
            MongoDB collection instance
        """
        if self.db is None:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self.db[collection_name]


# Global database instance
database = Database()
