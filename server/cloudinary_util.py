import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

CLOUD_ENV = os.getenv("CLOUD_ENV", "sample-env")
CLOUD_API_KEY = os.getenv("CLOUD_API_KEY", "sample-env")
CLOUD_API_SECRET = os.getenv("CLOUD_API_SECRET", "sample-env")


cloudinary.config(
    cloud_name=CLOUD_ENV,
    api_key=CLOUD_API_KEY,
    api_secret=CLOUD_API_SECRET
)

def upload_file(file_path: str):
    try:
        response = cloudinary.uploader.upload(file_path)
        return response["secure_url"]
    except Exception as e:
        print(f"Exception occurred while uploading file to cloudinary: {e}")
        return None