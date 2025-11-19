# Fashion Store - Full Stack E-commerce Application

A modern, full-stack e-commerce website for clothing built with React (JSX) and Django.

## Features

- **Product Management**: Browse products by category, gender, and search functionality
- **Shopping Cart**: Add, update, and remove items from cart
- **User Authentication**: Register, login, and logout functionality
- **Order Management**: Place orders and track order status
- **Responsive Design**: Mobile-friendly interface
- **Product Details**: View detailed product information with images
- **Featured Products**: Display featured and on-sale products

## Tech Stack

### Backend
- Django 4.2.7
- Django REST Framework
- SQLite (default database)
- Django CORS Headers

### Frontend
- React 18.2.0
- Vite (build tool)
- React Router DOM
- Axios for API calls
- CSS3 for styling

## Project Structure

```
ecommerce/
├── backend/
│   ├── ecommerce_backend/     # Django project settings
│   ├── products/              # Products app
│   ├── orders/                # Orders and Cart app
│   ├── users/                 # User authentication app
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── context/           # React context
│   │   └── App.jsx
│   ├── index.html             # Vite entry HTML
│   ├── vite.config.js         # Vite configuration
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables. Create a `.env` file in `backend/` (or update your environment) with at least:
```
POSTGRES_DB=<your_db>
POSTGRES_USER=<your_user>
POSTGRES_PASSWORD=<your_password>
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
CLOUDINARY_CLOUD_NAME=<cloudinary_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>
```

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create a superuser (optional, for admin access):
```bash
python manage.py createsuperuser
```

7. Run the development server:
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Products
- `GET /api/products/` - List all products
- `GET /api/products/{id}/` - Get product details
- `GET /api/products/categories/` - List all categories
- `GET /api/products/featured/` - Get featured products
- `GET /api/products/on_sale/` - Get products on sale

### Cart
- `GET /api/orders/cart/` - Get user's cart
- `POST /api/orders/cart/add_item/` - Add item to cart
- `POST /api/orders/cart/update_item/` - Update cart item
- `POST /api/orders/cart/remove_item/` - Remove item from cart
- `POST /api/orders/cart/checkout/` - Checkout cart

### Orders
- `GET /api/orders/orders/` - List user's orders
- `GET /api/orders/orders/{id}/` - Get order details
- `POST /api/orders/orders/{id}/cancel/` - Cancel order

### Authentication
- `POST /api/users/register/` - Register new user
- `POST /api/users/login/` - Login user
- `POST /api/users/logout/` - Logout user
- `GET /api/users/me/` - Get current user

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/` using the superuser credentials created during setup.

## Database Models

- **Category**: Product categories
- **Product**: Products with images, prices, sizes, etc.
- **Cart**: User shopping cart
- **CartItem**: Items in cart
- **Order**: User orders
- **OrderItem**: Items in orders

## Adding Sample Data

You can add sample data through the Django admin panel or by creating a management command. To add data via admin:

1. Go to `http://localhost:8000/admin/`
2. Login with superuser credentials
3. Add Categories first
4. Then add Products with images

## Development Notes

- The backend uses PostgreSQL via environment variables. Update `.env` for your setup.
- CORS is configured to allow requests from `http://localhost:3000`
- Product images are stored on Cloudinary via `django-cloudinary-storage`; set `CLOUDINARY_*` variables before uploading products.
- Local media directory is still available for development fallbacks, but uploaded files default to Cloudinary once credentials are provided.

## Production Deployment

For production deployment:

1. Set `DEBUG = False` in `backend/ecommerce_backend/settings.py`
2. Update `ALLOWED_HOSTS` with your domain
3. Change `SECRET_KEY` to a secure random value
4. Use a production database (PostgreSQL recommended)
5. Set up proper static file serving
6. Configure environment variables for sensitive data
7. Build React app: `npm run build` (Vite will create optimized production build)
8. Serve static files appropriately

## License

This project is open source and available for educational purposes.

## Contributing

Feel free to submit issues and enhancement requests!

