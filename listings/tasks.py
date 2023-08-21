import logging

from huey import crontab
from huey.contrib.djhuey import db_periodic_task, db_task

from django.conf import settings
from django.utils import timezone

from listings.enums import ListingStatus, ListingType
from listings.models import Listing, Offer
from services.resend import ResendMail

logger = logging.getLogger(__name__)
resend_client = ResendMail(
    api_key=settings.RESEND_API_KEY,
)


@db_periodic_task(crontab(minute=1))
def monitor_auctions():
    from listings.mixins import OfferActionsMixin

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


@db_task()
def notify_offer_accepted_and_sold(offer_id: int):
    offer = Offer.objects.get(id=offer_id)
    if offer.creator.email is not None:
        creator_subject = '[Optimart] Your Offer Was Accepted!'
        creator_content = f"""Congratulations!

        Your offer for the item "{offer.nft.name}" with ID {offer.nft.token_identifier} has been accepted.
        The transaction hash of the sale is {offer.update_tx_hash}

        Love,
        Team Optimart.
        """

        resend_client.send_email(
            to=offer.creator.email,
            subject=creator_subject,
            content=creator_content,
        )

    if offer.nft.owner.email is not None:
        owner_subject = '[Optimart] Your Item Was Sold!'
        owner_content = f"""
        Great news!

        Your item "{offer.nft.name}" with ID {offer.nft.token_identifier} has been sold to a buyer.
        The transaction hash of the sale is {offer.update_tx_hash}

        Love,
        Team Optimart.
        """

        resend_client.send_email(
            to=offer.nft.owner.email,
            subject=owner_subject,
            content=owner_content,
        )


@db_task()
def notify_offer_received(offer_id: int):
    offer = Offer.objects.get(id=offer_id)
    if offer.nft.owner.email is None:
        return

    owner_subject = '[Optimart] New Offer Received'
    owner_content = f"""
    Hello!

    You have received a new offer for your item "{offer.nft.name}" with ID {offer.nft.token_identifier}.
    Log in to your account to review and respond to the offer.

    Love,
    Team Optimart.
    """

    resend_client.send_email(
        to=offer.nft.owner.email,
        subject=owner_subject,
        content=owner_content,
    )
