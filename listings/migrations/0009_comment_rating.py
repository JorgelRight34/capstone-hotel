# Generated by Django 5.0.3 on 2024-08-30 21:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('listings', '0008_rename_post_comment_listing'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='rating',
            field=models.FloatField(default=0),
        ),
    ]
