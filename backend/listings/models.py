from django.db import models

from .enums import ListingStatus, ListingType, OfferStatus


class Listing(models.Model):
    nft = models.ForeignKey(
        'collection.NFT',
        related_name='listings',
        on_delete=models.CASCADE,
        blank=False,
        null=False,
    )
    creator = models.ForeignKey(
        'accounts.Account',
        related_name='my_listings',
        on_delete=models.CASCADE,
        blank=False,
        null=False,
    )
    listing_type = models.CharField(
        'listing type',
        max_length=7,
        choices=ListingType.choices,
        db_index=True,
        blank=False,
        null=False,
    )
    price = models.DecimalField('price', max_digits=24, decimal_places=6, blank=False, null=False)

    # holds the transaction hash for the `sell` NFTokenCreateOffer
    create_tx_hash = models.CharField('create transaction hash', max_length=255, blank=False, null=False)
    # holds the transaction hash for the NFTokenAcceptOffer/NFTokenCancelOffer
    update_tx_hash = models.CharField('update transaction hash', max_length=255, blank=True, null=True)

    # The N/A is to make django migrations happy. See `nft` comment below.
    sell_offer_id = models.CharField('sell offer id', max_length=300, blank=False, null=False, default='N/A')

    created_at = models.DateTimeField('created at', blank=False, null=False)
    updated_at = models.DateTimeField('updated at', auto_now=True)
    status = models.CharField('status', max_length=10, choices=ListingStatus.choices, blank=False, null=False)
    # auctions require an expiration to be set
    end_at = models.DateTimeField('end at', blank=True, null=True)


class Offer(models.Model):
    # NOTE: Ensure offers are not made without the nft.
    # This is because I can't afford to re-run the data dump from onxrp
    nft = models.ForeignKey(
        'collection.NFT',
        related_name='nft_offers',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    listing = models.ForeignKey(Listing, related_name='offers', on_delete=models.CASCADE, blank=True, null=True)
    creator = models.ForeignKey(
        'accounts.Account',
        related_name='my_offers',
        on_delete=models.CASCADE,
        blank=False,
        null=False,
    )
    amount = models.DecimalField('amount', max_digits=24, decimal_places=6, blank=False, null=False)

    # holds the transaction hash for the `buy` NFTokenCreateOffer
    create_tx_hash = models.CharField('create transaction hash', max_length=255, blank=False, null=False)
    # holds the transaction hash for the NFTokenAcceptOffer/NFTokenCancelOffer
    update_tx_hash = models.CharField('update transaction hash', max_length=255, blank=True, null=True)

    # The N/A is to make django migrations happy. See `nft` comment.
    buy_offer_id = models.CharField('buy offer id', max_length=300, blank=False, null=False, default='N/A')

    created_at = models.DateTimeField('created at', auto_now_add=True)
    updated_at = models.DateTimeField('updated at', auto_now=True)
    status = models.CharField('status', max_length=11, choices=OfferStatus.choices, blank=False, null=False)
