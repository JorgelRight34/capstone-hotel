from django.contrib import admin

from .models import Category, Cart, CartItem, Post, PostImage, User

# Register your models here.
admin.site.register(Post)
admin.site.register(PostImage)
admin.site.register(User)
admin.site.register(Category)
admin.site.register(Cart)
admin.site.register(CartItem)