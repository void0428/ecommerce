import csv
import os
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import Product, Category


class Command(BaseCommand):
    help = 'Import men-only products from backend/data/products_men.csv. Skips existing slugs.'

    def add_arguments(self, parser):
        parser.add_argument('--path', type=str, help='Path to CSV file', default='backend/data/products_men.csv')
        parser.add_argument('--dry-run', action='store_true', help='Perform a dry run without saving')

    def handle(self, *args, **options):
        path = options['path']
        dry_run = options['dry_run']

        if not os.path.exists(path):
            self.stderr.write(self.style.ERROR(f'File not found: {path}'))
            return

        created = 0
        skipped = 0
        errors = 0

        with open(path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                try:
                    name = (row.get('name') or '').strip()
                    slug = (row.get('slug') or '').strip()
                    description = (row.get('description') or '').strip()
                    category_name = (row.get('category') or '').strip()
                    price_raw = (row.get('price') or '').strip()
                    discount_raw = (row.get('discount_price') or '').strip()
                    stock_raw = (row.get('stock') or '0').strip()
                    sizes_raw = (row.get('available_sizes') or '').strip()
                    is_featured_raw = (row.get('is_featured') or '').strip()

                    if not name or not category_name or not price_raw:
                        self.stderr.write(self.style.WARNING(f'Skipping incomplete row: {row}'))
                        errors += 1
                        continue

                    if not slug:
                        slug = slugify(name)

                    # Skip if slug exists
                    if Product.objects.filter(slug=slug).exists():
                        skipped += 1
                        continue

                    # Find category
                    category = Category.objects.filter(name__iexact=category_name).first()
                    if not category:
                        self.stderr.write(self.style.WARNING(f'Category not found for product "{name}": {category_name}. Skipping.'))
                        errors += 1
                        continue

                    # Parse numerics
                    try:
                        price = Decimal(price_raw)
                    except Exception:
                        self.stderr.write(self.style.WARNING(f'Invalid price for "{name}": {price_raw}. Skipping.'))
                        errors += 1
                        continue

                    discount_price = None
                    if discount_raw:
                        try:
                            discount_price = Decimal(discount_raw)
                        except Exception:
                            discount_price = None

                    try:
                        stock = int(stock_raw)
                    except Exception:
                        stock = 0

                    available_sizes = sizes_raw if sizes_raw else 'M,L,XL'
                    is_featured = True if is_featured_raw.lower() in ['true', '1', 'yes'] else False

                    if dry_run:
                        created += 1
                    else:
                        Product.objects.create(
                            name=name,
                            slug=slug,
                            description=description,
                            category=category,
                            price=price,
                            discount_price=discount_price if discount_price else None,
                            stock=stock,
                            available_sizes=available_sizes,
                            gender='M',
                            is_featured=is_featured,
                        )
                        created += 1

                except Exception as e:
                    self.stderr.write(self.style.ERROR(f'Error importing row {row}: {e}'))
                    errors += 1

        self.stdout.write(self.style.SUCCESS(f'Import finished. Created: {created}, Skipped (already existed): {skipped}, Errors: {errors}'))
