#!/bin/bash
echo "Setting up Django backend..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
echo ""
echo "Backend setup complete!"
echo ""
echo "To start the server, run:"
echo "  source venv/bin/activate"
echo "  python manage.py runserver"
echo ""
echo "To create a superuser, run:"
echo "  python manage.py createsuperuser"

