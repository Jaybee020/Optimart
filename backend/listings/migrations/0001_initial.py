# Generated by Django 4.2.4 on 2023-08-18 07:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
        ('collection', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Listing',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'listing_type',
                    models.CharField(
                        choices=[('auction', 'Auction'), ('regular', 'Regular')],
                        db_index=True,
                        max_length=7,
                        verbose_name='listing type',
                    ),
                ),
                ('price', models.DecimalField(decimal_places=6, max_digits=24, verbose_name='price')),
                ('create_tx_hash', models.CharField(max_length=255, verbose_name='create transaction hash')),
                (
                    'update_tx_hash',
                    models.CharField(blank=True, max_length=255, null=True, verbose_name='update transaction hash'),
                ),
                ('created_at', models.DateTimeField(verbose_name='created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='updated at')),
                (
                    'status',
                    models.CharField(
                        choices=[('ongoing', 'Ongoing'), ('cancelled', 'Cancelled'), ('completed', 'Completed')],
                        max_length=10,
                        verbose_name='status',
                    ),
                ),
                ('end_at', models.DateTimeField(blank=True, null=True, verbose_name='end at')),
                (
                    'creator',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='my_listings', to='accounts.account'
                    ),
                ),
                (
                    'nft',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='listings', to='collection.nft'
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name='Offer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=6, max_digits=24, verbose_name='amount')),
                ('create_tx_hash', models.CharField(max_length=255, verbose_name='create transaction hash')),
                (
                    'update_tx_hash',
                    models.CharField(blank=True, max_length=255, null=True, verbose_name='update transaction hash'),
                ),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='updated at')),
                (
                    'status',
                    models.CharField(
                        choices=[
                            ('pending', 'Pending'),
                            ('cancelled', 'Cancelled'),
                            ('accepted', 'Accepted'),
                            ('rejected', 'Rejected'),
                        ],
                        max_length=11,
                        verbose_name='status',
                    ),
                ),
                (
                    'creator',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='my_offers', to='accounts.account'
                    ),
                ),
                (
                    'listing',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='offers',
                        to='listings.listing',
                    ),
                ),
            ],
        ),
    ]