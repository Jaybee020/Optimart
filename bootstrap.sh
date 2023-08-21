#!/usr/bin/env sh

echo "Starting Gunicorn server..."
gunicorn optimart.wsgi --capture-output --log-level info --workers 4 --enable-stdio-inheritance  --daemon

echo "Starting Huey task queue..."
python manage.py run_huey
