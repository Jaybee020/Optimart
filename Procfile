web: gunicorn optimart.wsgi --capture-output --log-level info --workers 3
release: python manage.py migrate && python manage.py collectstatic --noinput
