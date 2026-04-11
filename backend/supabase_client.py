import httpx
import os
from dotenv import load_dotenv
load_dotenv()
SUPABASE_URL = "https://nelcuoiygfydfokxvjss.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_1pNxe4keLc7fksoIW87fRg_7pw2xY-6"
class SupabaseClient:
    def __init__(self):
        self.client = httpx.Client(
            base_url=f"{SUPABASE_URL}/rest/v1",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                "Content-Type": "application/json"
            },
            timeout=30.0
        )
    def table(self, name):
        return TableProxy(self.client, name)
class TableProxy:
    def __init__(self, client, table_name):
        self.client = client
        self.table_name = table_name
    def select(self, columns="*"):
        response = self.client.get(f"/{self.table_name}?select={columns}")
        if response.status_code == 200:
            return response.json()
        return []
    def insert(self, data):
        response = self.client.post(f"/{self.table_name}", json=data)
        return response.json()
    def update(self, data):
        response = self.client.patch(f"/{self.table_name}", json=data)
        return response.json()
    def delete(self, eq=None):
        if eq:
            response = self.client.delete(f"/{self.table_name}", params=eq)
        else:
            response = self.client.delete(f"/{self.table_name}")
        return {"status": response.status_code}
# Create global instance
supabase = SupabaseClient()
