# Generated by Django 5.0.3 on 2024-04-23 00:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('capstoneapp', '0021_rating'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='rating',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
    ]
