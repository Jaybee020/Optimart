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
    price = models.DecimalField('price', max_digits=20, decimal_places=4, blank=False, null=False)

    # holds the transaction hash for the `sell` NFTokenCreateOffer
    create_tx_hash = models.CharField('create transaction hash', max_length=255, blank=False, null=False)
    # holds the transaction hash for the NFTokenAcceptOffer/NFTokenCancelOffer
    update_tx_hash = models.CharField('update transaction hash', max_length=255, blank=True, null=True)

    created_at = models.DateTimeField('created at', auto_now_add=True)
    updated_at = models.DateTimeField('updated at', auto_now=True)
    status = models.CharField('status', max_length=10, choices=ListingStatus.choices, blank=False, null=False)
    # auctions require an expiration to be set
    end_at = models.DateTimeField('end at', blank=True, null=True)


class Offer(models.Model):
    listing = models.ForeignKey(Listing, related_name='offers', on_delete=models.CASCADE, blank=True, null=True)
    creator = models.ForeignKey(
        'accounts.Account',
        related_name='my_offers',
        on_delete=models.CASCADE,
        blank=False,
        null=False,
    )
    amount = models.DecimalField('amount', max_digits=20, decimal_places=4, blank=False, null=False)

    # holds the transaction hash for the `buy` NFTokenCreateOffer
    create_tx_hash = models.CharField('create transaction hash', max_length=255, blank=False, null=False)
    # holds the transaction hash for the NFTokenAcceptOffer/NFTokenCancelOffer
    update_tx_hash = models.CharField('update transaction hash', max_length=255, blank=True, null=True)

    created_at = models.DateTimeField('created at', auto_now_add=True)
    updated_at = models.DateTimeField('updated at', auto_now=True)
    status = models.CharField('status', max_length=11, choices=OfferStatus.choices, blank=False, null=False)
