@echo off
echo Setting up Django backend...
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
echo.
echo Backend setup complete!
echo.
echo To start the server, run:
echo   venv\Scripts\activate
echo   python manage.py runserver
echo.
echo To create a superuser, run:
echo   python manage.py createsuperuser
pause

