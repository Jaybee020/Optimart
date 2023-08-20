import logging

from huey import crontab
from huey.contrib.djhuey import db_periodic_task

from django.utils import timezone

from listings.enums import ListingStatus, ListingType
from listings.mixins import OfferActionsMixin
from listings.models import Listing

logger = logging.getLogger(__name__)


@db_periodic_task(crontab(minute=1))
def monitor_auctions():
    logger.info('Monitoring auctions...')
    ongoing_auctions = Listing.objects.filter(
        status=ListingStatus.ONGOING,
        listing_type=ListingType.AUCTION,
        end_at__gte=timezone.now(),
    )
    logger.info(f'Found {ongoing_auctions.count()} ongoing auctions.')

    for auction in ongoing_auctions:
        logger.info(f'Checking auction #{auction.id}')
        highest_offer = auction.offers.order_by('-amount').first()
        if highest_offer:
            logger.info(f'Highest offer for auction #{auction.id}: {highest_offer.amount}')

            try:
                OfferActionsMixin.accept_offer(highest_offer)
                logger.info(f'Accepted highest offer for auction #{auction.id}.')
            except Exception as e:
                logger.exception(f'Failed to accept offer for auction #{auction.id}', exc_info=e)
        else:
            logger.info(f'No offers found for auction #{auction.id}.')
