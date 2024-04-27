from django.contrib import admin

from .models import Category, Wishlist, WishlistListing, Listing, ListingImage, User, Rating, Request, Stay

# Register your models here.
admin.site.register(Wishlist)
admin.site.register(WishlistListing)
admin.site.register(Category)
admin.site.register(Listing)
admin.site.register(ListingImage)
admin.site.register(Rating)
admin.site.register(Request)
admin.site.register(Stay)
admin.site.register(User)