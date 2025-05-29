from celery import Celery

import app.modules.celery.celeryconfig as celeryconfig

celery_app = Celery("fastapi_demo")
celery_app.config_from_object(celeryconfig)
celery_app.conf.accept_content = ['application/json', 'application/x-python-serialize']


