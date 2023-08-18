# Generated by Django 4.2.4 on 2023-08-17 16:19

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(blank=True, max_length=254, null=True, verbose_name='email address')),
                ('address', models.CharField(max_length=35, verbose_name='address')),
            ],
        ),
    ]
