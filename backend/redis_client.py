# redis_client.py

import os
import redis.asyncio as redis
from kombu.utils.url import safequote
import logging
import asyncio

# Set up logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

redis_host = safequote(os.environ.get('REDIS_HOST', 'localhost'))
redis_client = redis.Redis(host=redis_host, port=6379, db=0)

async def ensure_connection():
    """Ensure Redis is connected, with retry logic."""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            await redis_client.ping()
            logger.info("Redis connection established")
            return True
        except redis.ConnectionError as e:
            logger.warning(f"Redis connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(1)
            else:
                logger.error("Failed to connect to Redis after retries")
                raise redis.ConnectionError(f"Cannot connect to Redis at {redis_host}:6379")

async def add_key_value_redis(key, value, expire=None):
    try:
        await ensure_connection()
        await redis_client.set(key, value)
        if expire:
            await redis_client.expire(key, expire)
        logger.info(f"Set Redis key: {key}")
    except redis.RedisError as e:
        logger.error(f"Failed to set Redis key {key}: {e}")
        raise

async def get_value_redis(key):
    try:
        await ensure_connection()
        value = await redis_client.get(key)
        logger.info(f"Got Redis key: {key}")
        return value
    except redis.RedisError as e:
        logger.error(f"Failed to get Redis key {key}: {e}")
        raise

async def delete_key_redis(key):
    try:
        await ensure_connection()
        await redis_client.delete(key)
        logger.info(f"Deleted Redis key: {key}")
    except redis.RedisError as e:
        logger.error(f"Failed to delete Redis key {key}: {e}")
        raise