import json
import secrets
import os
from fastapi import Request, HTTPException
import httpx
import base64
from integrations.integration_item import IntegrationItem
from redis_client import add_key_value_redis, get_value_redis
import urllib.parse
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv


load_dotenv()


CLIENT_ID = os.environ.get('HUBSPOT_CLIENT_ID')
CLIENT_SECRET = os.environ.get('HUBSPOT_CLIENT_SECRET')
REDIRECT_URI = os.environ.get('HUBSPOT_REDIRECT_URI')
SCOPES = os.environ.get('HUBSPOT_SCOPES')


if not all([CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SCOPES]):
    raise ValueError("Missing required HubSpot environment variables")

AUTHORIZATION_URL = f'https://app.hubspot.com/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope={SCOPES}&response_type=code'

async def authorize_hubspot(user_id, org_id):
    state_data = {
        'state': secrets.token_urlsafe(32),
        'user_id': user_id,
        'org_id': org_id
    }
    encoded_state = base64.urlsafe_b64encode(json.dumps(state_data).encode('utf-8')).decode('utf-8')
    
    final_url = f'{AUTHORIZATION_URL}&state={encoded_state}'
    print("Authorization URL:", final_url)  
    
    await add_key_value_redis(f'hubspot_state:{org_id}:{user_id}', json.dumps(state_data), expire=600)
    
    return final_url

async def oauth2callback_hubspot(request: Request):
    params = dict(request.query_params)
    code = params.get('code')
    state = params.get('state')
    
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")
    
    try:
        decoded_state = json.loads(base64.urlsafe_b64decode(state.encode('utf-8')))
        stored_state = await get_value_redis(f'hubspot_state:{decoded_state["org_id"]}:{decoded_state["user_id"]}')
        
        if not stored_state:
            raise HTTPException(status_code=400, detail="Invalid state")
            
        stored_state = json.loads(stored_state)
        if stored_state['state'] != decoded_state['state']:
            raise HTTPException(status_code=400, detail="State mismatch")
            
        token_url = 'https://api.hubapi.com/oauth/v1/token'
        data = {
            'grant_type': 'authorization_code',
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'redirect_uri': REDIRECT_URI,
            'code': code
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=data)
            
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get access token")
            
        credentials = response.json()
        
        await add_key_value_redis(
            f'hubspot_credentials:{decoded_state["org_id"]}:{decoded_state["user_id"]}',
            json.dumps(credentials),
            expire=credentials['expires_in']
        )
        
        return HTMLResponse(content="""
            <html>
                <script>
                    window.close();
                </script>
            </html>
        """)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def get_hubspot_credentials(user_id: str, org_id: str):
    credentials = await get_value_redis(f'hubspot_credentials:{org_id}:{user_id}')
    if not credentials:
        return None
    return json.loads(credentials)

def create_integration_item_metadata_object(
    response_json: str, 
    item_type: str, 
    parent_id=None, 
    parent_name=None
) -> IntegrationItem:
    """creates an integration metadata object from the response"""
    first_name = response_json.get('properties', {}).get('firstname', '')
    last_name = response_json.get('properties', {}).get('lastname', '')
    full_name = f"{first_name} {last_name}".strip() or 'Unnamed Contact'

    integration_item_metadata = IntegrationItem(
        id=response_json.get('id', None) + '_' + item_type,
        name=full_name, 
        type=item_type,
        parent_id=parent_id,
        parent_path_or_name=parent_name,

    )

    return integration_item_metadata

async def get_items_hubspot(credentials) -> list[IntegrationItem]:
    credentials = json.loads(credentials)
    access_token = credentials.get('access_token')
    
    if not access_token:
        raise HTTPException(status_code=400, detail="Invalid credentials")
        
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    items = []
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            'https://api.hubapi.com/crm/v3/objects/contacts',
            headers=headers
        )
        if response.status_code == 200:
            response_data = response.json()
            for contact in response_data.get('results', []):
                items.append(
                    create_integration_item_metadata_object(
                        contact,
                        'Contact'
                    )
                )
    
    return items