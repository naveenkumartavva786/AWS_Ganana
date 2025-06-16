from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aws_ganana.settings')

# Create a Celery instance.
app = Celery('aws_ganana')
app.conf.enable_utc = False
app.conf.update(timezone='Asia/Kolakata')

# Load Celery configuration from Django settings.
app.config_from_object(settings, namespace='CELERY')

# Discover tasks in all installed Django apps.
app.autodiscover_tasks()




@app.task(bind=True)
def debug_task(self):
    print(f'Request:{self.request!r}')

