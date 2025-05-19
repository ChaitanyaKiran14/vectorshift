# main.py

from fastapi import FastAPI, Form, Request
from fastapi.middleware.cors import CORSMiddleware
import logging

from integrations.airtable import authorize_airtable, get_items_airtable, oauth2callback_airtable, get_airtable_credentials
from integrations.notion import authorize_notion, get_items_notion, oauth2callback_notion, get_notion_credentials
from integrations.hubspot import authorize_hubspot, get_hubspot_credentials, get_items_hubspot, oauth2callback_hubspot

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

origins = [
    "http://localhost:3000",  # React app address
    "http://localhost:8000",  # Backend itself (for testing)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
def read_root():
    logger.info("Root endpoint accessed")
    return {'Ping': 'Pong'}

# Airtable
@app.post('/integrations/airtable/authorize')
async def authorize_airtable_integration(user_id: str = Form(...), org_id: str = Form(...)):
    logger.info(f"Authorizing Airtable for user_id: {user_id}, org_id: {org_id}")
    return await authorize_airtable(user_id, org_id)

@app.get('/integrations/airtable/oauth2callback')
async def oauth2callback_airtable_integration(request: Request):
    logger.info("Airtable OAuth2 callback received")
    return await oauth2callback_airtable(request)

@app.post('/integrations/airtable/credentials')
async def get_airtable_credentials_integration(user_id: str = Form(...), org_id: str = Form(...)):
    logger.info(f"Fetching Airtable credentials for user_id: {user_id}, org_id: {org_id}")
    return await get_airtable_credentials(user_id, org_id)

@app.post('/integrations/airtable/load')
async def get_airtable_items(credentials: str = Form(...)):
    logger.info("Loading Airtable items")
    return await get_items_airtable(credentials)

# Notion
@app.post('/integrations/notion/authorize')
async def authorize_notion_integration(user_id: str = Form(...), org_id: str = Form(...)):
    logger.info(f"Authorizing Notion for user_id: {user_id}, org_id: {org_id}")
    return await authorize_notion(user_id, org_id)

@app.get('/integrations/notion/oauth2callback')
async def oauth2callback_notion_integration(request: Request):
    logger.info("Notion OAuth2 callback received")
    return await oauth2callback_notion(request)

@app.post('/integrations/notion/credentials')
async def get_notion_credentials_integration(user_id: str = Form(...), org_id: str = Form(...)):
    logger.info(f"Fetching Notion credentials for user_id: {user_id}, org_id: {org_id}")
    return await get_notion_credentials(user_id, org_id)

@app.post('/integrations/notion/load')
async def get_notion_items(credentials: str = Form(...)):
    logger.info("Loading Notion items")
    return await get_items_notion(credentials)

# HubSpot
@app.post('/integrations/hubspot/authorize')
async def authorize_hubspot_integration(user_id: str = Form(...), org_id: str = Form(...)):
    logger.info(f"Authorizing HubSpot for user_id: {user_id}, org_id: {org_id}")
    return await authorize_hubspot(user_id, org_id)

@app.get('/integrations/hubspot/oauth2callback')
async def oauth2callback_hubspot_integration(request: Request):
    logger.info("HubSpot OAuth2 callback received")
    return await oauth2callback_hubspot(request)

@app.post('/integrations/hubspot/credentials')
async def get_hubspot_credentials_integration(user_id: str = Form(...), org_id: str = Form(...)):
    logger.info(f"Fetching HubSpot credentials for user_id: {user_id}, org_id: {org_id}")
    return await get_hubspot_credentials(user_id, org_id)

@app.post('/integrations/hubspot/load')  # Updated endpoint name
async def get_hubspot_items(credentials: str = Form(...)):
    logger.info("Loading HubSpot items")
    return await get_items_hubspot(credentials)