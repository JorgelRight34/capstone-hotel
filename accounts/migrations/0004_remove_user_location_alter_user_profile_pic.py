# Generated by Django 5.0.3 on 2024-10-01 20:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_commentnotification_requesttobooknotification'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='location',
        ),
        migrations.AlterField(
            model_name='user',
            name='profile_pic',
            field=models.ImageField(default='profile_pics/default_profile_pic.jpg', upload_to='profile_pics/'),
        ),
    ]
