# Quick Start Guide

## Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

## Quick Setup (Windows)

### Backend
```bash
cd backend
setup.bat
venv\Scripts\activate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend (in a new terminal)
```bash
cd frontend
setup.bat
npm start
```

## Quick Setup (Linux/Mac)

### Backend
```bash
cd backend
chmod +x setup.sh
./setup.sh
source venv/bin/activate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend (in a new terminal)
```bash
cd frontend
chmod +x setup.sh
./setup.sh
npm start
```

## Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

## First Steps

1. Create a superuser account (for admin access)
2. Login to admin panel and add some categories
3. Add products with images
4. Register a user account on the frontend
5. Start shopping!

## Troubleshooting

### Backend Issues
- Make sure virtual environment is activated
- Check that all migrations are applied: `python manage.py migrate`
- Ensure port 8000 is not in use

### Frontend Issues
- Delete `node_modules` and run `npm install` again
- Check that backend is running on port 8000
- Clear browser cache if you see CORS errors

### Database Issues
- Delete `db.sqlite3` and run migrations again
- Make sure you're in the backend directory when running migrations

