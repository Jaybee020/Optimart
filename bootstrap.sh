#!/usr/bin/env sh

echo "Starting Gunicorn server..."
gunicorn optimart.wsgi --capture-output --log-level info --workers 3  --daemon

echo "Starting Huey task queue..."
python manage.py run_huey
