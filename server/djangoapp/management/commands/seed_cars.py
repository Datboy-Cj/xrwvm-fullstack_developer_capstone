import json
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from djangoapp.models import CarMake, CarModel

class Command(BaseCommand):
    help = 'Idempotently load the sample car catalog'
    def handle(self, *args, **options):
        records=json.loads((Path(settings.BASE_DIR)/'database/data/car_records.json').read_text())['cars']
        for car in records:
            make,_=CarMake.objects.get_or_create(name=car['make'],defaults={'description':car['make']+' vehicles'})
            CarModel.objects.get_or_create(car_make=make,name=car['model'],year=car['year'],defaults={'type':car['bodyType']})
        self.stdout.write(self.style.SUCCESS(f'{CarMake.objects.count()} makes; {CarModel.objects.count()} models'))
