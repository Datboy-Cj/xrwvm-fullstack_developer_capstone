from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class CarMake(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    def __str__(self):
        return self.name

class CarModel(models.Model):
    car_make = models.ForeignKey(CarMake, on_delete=models.CASCADE, related_name="models")
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=[(v,v) for v in ['Sedan','SUV','Wagon','Truck','Coupe','Van']], default='Sedan')
    year = models.PositiveIntegerField(validators=[MinValueValidator(2015), MaxValueValidator(2035)])
    class Meta:
        constraints = [models.UniqueConstraint(fields=['car_make','name','year'], name='unique_car_model')]
    def __str__(self):
        return f'{self.car_make} {self.name} ({self.year})'
