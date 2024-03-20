from django.db import models

class PlanetEntry(models.Model):
    image = models.ImageField(upload_to='images/')
    descriptor = models.CharField(max_length=200)



