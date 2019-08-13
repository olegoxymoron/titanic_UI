from django.conf import settings
from django.db import models
from django.utils import timezone

class Filter(models.Model):
    filtersdb_id = models.CharField(max_length=25, blank=True)
    filterName = models.CharField(max_length=25)
    deliveryRegion = models.CharField(max_length=25)
    valueLowLimit = models.IntegerField()
    valueHighLimit = models.IntegerField()
    cpv = models.CharField(max_length=20)
    user = models.CharField(max_length=25, blank=True)