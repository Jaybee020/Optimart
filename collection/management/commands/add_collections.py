from django.core.management import BaseCommand


class Command(BaseCommand):
    help = 'Populate the database with initial collections and NFTs from OnXRP'  # noqa: A003

    def handle(self, *args, **options):  # noqa: ARG002
        # TODO: Write script to do this
        self.stdout.write('Successful')
        ...
