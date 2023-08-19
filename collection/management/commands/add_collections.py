import csv
from decimal import Decimal

from django.conf import settings
from django.core.management import BaseCommand
from django.db import transaction

from accounts.models import Account
from collection.models import Collection


class Command(BaseCommand):
    help = 'Populate the database with initial collections and NFTs from OnXRP'  # noqa: A003

    def handle(self, *args, **options):  # noqa: ARG002
        # TODO: Write script to do this
        collections_csv_path = settings.BASE_DIR / 'data' / 'collections_metadata.csv'
        objs = []
        with collections_csv_path.open('r') as f:
            reader = csv.DictReader(f)
            for row in list(reader)[:10]:
                issuer, _ = Account.objects.get_or_create(address=row['Issuer'], defaults={'address': row['Issuer']})
                objs.append(
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

        with transaction.atomic():
            Collection.objects.bulk_create(objs, ignore_conflicts=True)

        nfts_objs = []
        for collection in Collection.objects.all():
            nfts = self.get_nfts_for_collection(
                issuer=collection.issuer.address,
                taxon=collection.taxon,
            )

        self.stdout.write('Successful')

    def get_nfts_for_collection(self, issuer: str, taxon: int):
        return []
