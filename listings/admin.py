from django.contrib import admin

from .models import Category, Listing, ListingImage, Rating

# Register your models here.
admin.site.register(Category)
admin.site.register(Listing)
admin.site.register(ListingImage)
admin.site.register(Rating)