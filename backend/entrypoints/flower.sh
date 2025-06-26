#!/bin/sh

celery -A app.modules.celery.celery_app flower --host=0.0.0.0 --port=5555