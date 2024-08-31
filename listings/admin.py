from django.contrib import admin

from .models import Amenitie, Category, Comment, Listing, ListingImage, Rating

# Register your models here.
admin.site.register(Amenitie)
admin.site.register(Category)
admin.site.register(Comment)
admin.site.register(Listing)
admin.site.register(ListingImage)
admin.site.register(Rating)