from django.db import models


class Account(models.Model):
    email = models.EmailField('email address', blank=True, null=True)
    address = models.CharField('address', max_length=35, blank=False, null=False)
