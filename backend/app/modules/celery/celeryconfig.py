import os
from app.core.settings import settings
from kombu import Exchange, Queue


# Celery configuration
# http://docs.celeryproject.org/en/latest/configuration.html

    

task_create_missing_queues = False
task_queues = {
    'cpu': {
        'exchange': 'cpu',
        'routing_key': 'cpu',
    },
}

_default_task_queue = "cpu"
task_default_queue = _default_task_queue
task_default_exchange = _default_task_queue
task_default_routing_key = _default_task_queue

imports = {
    "app.api.order_documents.tasks",
}

broker_url = settings.REDIS_URL
result_backend = settings.REDIS_URL
