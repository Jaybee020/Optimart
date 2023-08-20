import contextlib

from django.db.models.signals import post_save
from django.dispatch import receiver

from .enums import ListingType
from .mixins import OfferActionsMixin
from .models import Offer


@receiver(post_save, sender=Offer)
def handle_offer_created(sender, instance, created, **kwargs):  # noqa: ARG001
    if not created:
        return

    if not instance.listing:
        return

    if instance.listing.listing_type != ListingType.REGULAR:
        return

    if instance.amount < instance.listing.price:
        return

    with contextlib.suppress(Exception):
        OfferActionsMixin.accept_offer(offer=instance)
