# Generated by Django 5.0.3 on 2024-10-01 22:47

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_alter_acceptedrequestnotification_notification_and_more'),
        ('reservations', '0003_delete_request'),
    ]

    operations = [
        migrations.AlterField(
            model_name='acceptedrequestnotification',
            name='notification',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='listing_accepted_request_notifications', to='reservations.stay'),
        ),
        migrations.AlterField(
            model_name='declinedrequestnotification',
            name='notification',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='listing_declined_request_notifications', to='reservations.stay'),
        ),
    ]
