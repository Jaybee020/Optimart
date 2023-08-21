from typing import ClassVar

from django.db import models


class NFTStatus(models.TextChoices):
    LISTED = 'listed'
    AUCTION = 'auction'
    UNLISTED = 'unlisted'


class Collection(models.Model):
    name = models.CharField('name', max_length=255, blank=False, null=False)
    issuer = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, blank=False, null=False)
    taxon = models.IntegerField('taxon', blank=False, null=False)
    description = models.TextField('description', blank=True, null=True)
    floor_price = models.DecimalField('floor price', max_digits=24, decimal_places=6, blank=False, null=False)
    daily_volume = models.DecimalField('daily volume', max_digits=24, decimal_places=6, blank=False, null=False)
    weekly_volume = models.DecimalField('weekly volume', max_digits=24, decimal_places=6, blank=False, null=False)
    monthly_volume = models.DecimalField('monthly volume', max_digits=24, decimal_places=6, blank=False, null=False)
    total_volume = models.DecimalField('total volume', max_digits=24, decimal_places=6, blank=False, null=False)
    image_url = models.URLField('image url', max_length=1000, blank=True, null=True)
    banner_url = models.URLField('banner url', max_length=1000, blank=True, null=True)
    discord_link = models.URLField('discord link', max_length=1000, blank=True, null=True)
    instagram_link = models.URLField('instagram link', max_length=1000, blank=True, null=True)
    twitter_link = models.URLField('twitter link', max_length=1000, blank=True, null=True)

    class Meta:
        constraints: ClassVar[list] = [models.UniqueConstraint(fields=['issuer', 'taxon'], name='unique_collection')]


class NFT(models.Model):
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, blank=False, null=False)
    name = models.CharField('name', max_length=255, blank=False, null=False)
    token_identifier = models.CharField('token identifier', max_length=255, unique=True, blank=False, null=False)
    sequence = models.IntegerField('sequence', blank=False, null=False)
    owner = models.ForeignKey(
        'accounts.Account',
        on_delete=models.CASCADE,
        related_name='my_nfts',
        blank=True,
        null=True,
    )
    price = models.DecimalField('price', max_digits=24, decimal_places=6, blank=False, null=False)
    uri = models.TextField('uri', blank=True, null=True)
    flags = models.IntegerField('flags', blank=False, null=False)
    image_url = models.URLField('image url', blank=True, null=True)
    status = models.CharField('status', max_length=8, choices=NFTStatus.choices, blank=False, null=False)


class NFTAttribute(models.Model):
    nft = models.ForeignKey(NFT, related_name='attributes', on_delete=models.CASCADE, blank=False, null=False)
    key = models.TextField('key', db_index=True, blank=False, null=False)
    value = models.TextField('value', db_index=True, blank=True, null=True)
