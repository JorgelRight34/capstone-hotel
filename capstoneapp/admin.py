from django.contrib import admin

from .models import Category, Cart, CartItem, Post, PostImage, User, Rating

# Register your models here.
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Category)
admin.site.register(Post)
admin.site.register(PostImage)
admin.site.register(Rating)
admin.site.register(User)