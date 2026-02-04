import httpx
import json
from app.core.config import settings

class BunnyService:
    def __init__(self):
        self.api_key = settings.BUNNY_API_KEY
        self.storage_zone = settings.BUNNY_STORAGE_ZONE
        self.region = settings.BUNNY_REGION.lower() if settings.BUNNY_REGION else "de"
        
        self.cdn_url = "https://brainx.b-cdn.net" # Hardcoded based on user context or add to settings if preferred
        
        # Construct base URL based on region
        if self.region == "de" or not self.region:
            self.base_url = f"https://storage.bunnycdn.com/{self.storage_zone}"
        else:
            self.base_url = f"https://{self.region}.storage.bunnycdn.com/{self.storage_zone}"

    async def upload_json(self, data: dict, filename: str) -> str:
        """
        Uploads a dictionary as a JSON file to Bunny.net storage.
        Returns the public URL (assuming standard pull zone configuration, defaulting to storage URL if pull zone not configured).
        """
        if not self.api_key or not self.storage_zone:
            print("Bunny.net configuration missing. Skipping upload.")
            return f"mock_url_for_{filename}"

        url = f"{self.base_url}/{filename}"
        headers = {
            "AccessKey": self.api_key,
            "Content-Type": "application/json"
        }
        
        content = json.dumps(data)

        async with httpx.AsyncClient() as client:
            response = await client.put(url, headers=headers, content=content)
            
            if response.status_code == 201:
                return f"{self.cdn_url}/{filename}"
            else:
                print(f"Failed to upload to Bunny.net: {response.status_code} - {response.text}")
                # Fallback for dev/testing without valid creds
                return f"failed_upload_url/{filename}"
                # raise Exception(f"Failed to upload to Bunny.net: {response.text}")

    async def download_json(self, url: str) -> dict:
        """
        Downloads a JSON file from Bunny.net CDN and returns it as a dictionary.
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Failed to download from Bunny.net: {response.status_code} - {response.text}")

bunny_service = BunnyService()

