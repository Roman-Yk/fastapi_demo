import redis


REDIS_CLIENT = redis.StrictRedis(host='redis', port=6379, db=0)
