from django.core.management.base import BaseCommand
import csv
import os
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import Category


class Command(BaseCommand):
    help = 'Idempotently import categories from a CSV file (name, slug, description). Skips existing category names.'

    def add_arguments(self, parser):
        parser.add_argument('--path', type=str, help='Path to CSV file', default='backend/data/categories.csv')
        parser.add_argument('--dry-run', action='store_true', help='Perform a dry run without saving')

    def handle(self, *args, **options):
        path = options['path']
        dry_run = options['dry_run']

        if not os.path.exists(path):
            self.stderr.write(self.style.ERROR(f'File not found: {path}'))
            return

        created = 0
        skipped = 0
        updated = 0

        with open(path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                name = (row.get('name') or '').strip()
                slug = (row.get('slug') or '').strip()
                description = (row.get('description') or '').strip()

                if not name:
                    self.stderr.write(self.style.WARNING('Skipping row with empty name'))
                    continue

                if not slug:
                    slug = slugify(name)

                existing = Category.objects.filter(name__iexact=name).first()
                if existing:
                    # If exists, skip (you could update fields here if desired)
                    skipped += 1
                    continue

                if dry_run:
                    created += 1
                else:
                    Category.objects.create(name=name, slug=slug, description=description)
                    created += 1

        self.stdout.write(self.style.SUCCESS(f'Import complete. Created: {created}, Skipped (already existed): {skipped}, Updated: {updated}'))
