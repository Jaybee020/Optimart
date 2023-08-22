from django.db import models


class ListingType(models.TextChoices):
    AUCTION = 'auction'
    REGULAR = 'regular'


class ListingStatus(models.TextChoices):
    ONGOING = 'ongoing'
    CANCELLED = 'cancelled'
    COMPLETED = 'completed'


class OfferStatus(models.TextChoices):
    PENDING = 'pending'
    CANCELLED = 'cancelled'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'
