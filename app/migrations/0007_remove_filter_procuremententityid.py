# Generated by Django 2.0.13 on 2019-07-08 09:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0006_auto_20190707_0413'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='filter',
            name='procurementEntityId',
        ),
    ]
