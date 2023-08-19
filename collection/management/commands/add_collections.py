import concurrent.futures
import csv
import functools
from decimal import Decimal

import requests

from django.conf import settings
from django.core.management import BaseCommand
from django.db import transaction

from accounts.models import Account
from collection.models import NFT, Collection, NFTAttribute, NFTStatus


class Command(BaseCommand):
    help = 'Populate the database with initial collections and NFTs from OnXRP'  # noqa: A003

    nfts_per_page = 800
    min_collections_threshold = 500
    onxrp_base_url = 'https://marketplace-api.onxrp.com/api'

    def handle(self, *args, **options):  # noqa: ARG002
        self.stdout.write('Starting data population process...')
        self.load_collections()
        self.stdout.write('Collections loaded successfully!')
        self.load_nfts()
        self.stdout.write('NFTs loaded successfully!')
        self.stdout.write('Data population process completed.')

    def load_collections(self):
        self.stdout.write('Loading collections from CSV...')
        if Collection.objects.count() > self.min_collections_threshold:
            self.stdout.write('Collection model contains > 500 entries. Not populating...')
            return

        collection_objs = []
        for row in self.collections_from_csv:
            issuer, _ = Account.objects.get_or_create(address=row['Issuer'], defaults={'address': row['Issuer']})
            collection_objs.append(
                Collection(
                    name=row['Name'],
                    issuer=issuer,
                    taxon=int(row['Taxon']),
                    description=row['Description'],
                    floor_price=Decimal(row['FloorPrice']),
                    daily_volume=Decimal(row['DailyVolume']),
                    weekly_volume=Decimal(row['WeeklyVolume']),
                    monthly_volume=Decimal(row['MonthlyVolume']),
                    total_volume=Decimal(row['TotalVolume']),
                    image_url=row['ImageUrl'],
                    banner_url=row['BannerUrl'],
                    discord_link=row['DiscordLink'],
                    instagram_link=row['InstagramLink'],
                    twitter_link=row['TwitterLink'],
                ),
            )
        Collection.objects.bulk_create(collection_objs, batch_size=50, ignore_conflicts=True)

    @transaction.atomic
    def load_nfts(self):
        self.stdout.write('Fetching NFTs for collections...')
        for row in self.collections_from_csv:
            collection = Collection.objects.get(issuer__address=row['Issuer'], taxon=int(row['Taxon']))
            nfts = self.fetch_nfts_for_collection_from_onxrp(
                nfts_count=int(row['NftsCount']) + 1,
                onxrp_id=row['OnXrpID'],
            )
            self.add_nfts_to_database(collection, nfts)

    def add_nfts_to_database(self, collection: Collection, nfts_response: list) -> None:
        self.stdout.write(f'Adding NFTs for collection {collection.id} to the database...')
        nft_objs = []
        nfts_to_attributes = {}
        for entry in nfts_response:
            owner, _ = Account.objects.get_or_create(
                address=entry['owner']['wallet_id'],
                defaults={'address': entry['owner']['wallet_id']},
            )
            nft_objs.append(
                NFT(
                    owner=owner,
                    name=entry['name'],
                    uri=entry['ipfs_url'],
                    collection=collection,
                    status=NFTStatus.UNLISTED,
                    flags=8,
                    sequence=int(entry['serial']),
                    image_url=entry['picture_url'],
                    token_identifier=entry['token_id'],
                    price=Decimal(entry['fixed_price']),
                ),
            )
            nfts_to_attributes[entry['token_id']] = [
                {'key': i['key'], 'value': i['value']} for i in entry['nftAttributes']
            ]

        NFT.objects.bulk_create(objs=nft_objs, batch_size=500, ignore_conflicts=True)
        self.stdout.write(f'NFTs for collection {collection.id} added to the database.')

        self.stdout.write('Adding NFT attributes to the database...')
        for key, value in nfts_to_attributes.items():
            nft = NFT.objects.get(token_identifier=key)
            NFTAttribute.objects.bulk_create(
                objs=[
                    NFTAttribute(
                        collection=collection,
                        nft=nft,
                        key=i['key'],
                        value=i['value'],
                    )
                    for i in value
                ],
                ignore_conflicts=True,
                batch_size=500,
            )
        self.stdout.write('NFT attributes added to the database.')

    def fetch_nfts_for_collection_from_onxrp(self, nfts_count: int, onxrp_id: str):
        total_pages = (nfts_count + self.nfts_per_page - 1) // self.nfts_per_page
        all_nfts = []
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = [executor.submit(self._fetch_nfts_page, onxrp_id, page) for page in range(1, total_pages + 1)]

            self.stdout.write(f'Waiting for {len(futures)} futures to complete...')
            for future in concurrent.futures.as_completed(futures):
                all_nfts.extend(future.result())

        return all_nfts

    def _fetch_nfts_page(self, onxrp_id: str, page: int) -> list:
        self.stdout.write(f'Fetching page {page} of nfts for collection: {onxrp_id}...')
        response = requests.get(
            f'{self.onxrp_base_url}/nfts',
            params={
                'page': page,
                'per_page': self.nfts_per_page,
                'include': 'nftAttributes,owner',
                'filters[collections]': onxrp_id,
            },
            timeout=30,
        )

        if response.ok:
            self.stdout.write(f'Fetched {len(response.json()["data"])} nfts from page {page}')
            return response.json()['data']

        self.stdout.write(f'Could not retrieve the nfts for collection: {onxrp_id}')
        return []

    @functools.cached_property
    def collections_from_csv(self):
        self.stdout.write('Loading collections metadata from CSV...')
        collections_csv_path = settings.BASE_DIR / 'data' / 'collections_metadata.csv'
        with collections_csv_path.open('r') as f:
            return list(csv.DictReader(f))
