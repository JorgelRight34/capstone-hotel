from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

# Create your models here.
class User(AbstractUser):
    profile_pic = models.ImageField(upload_to="profile_pics/", default="profile_pics/default.jpg")
    wallpaper = models.ImageField(upload_to="wallpapers/", blank=True, null=True)
    location = models.CharField(max_length=255)


    def __str__(self):
        return self.username
    

    @property
    def user_cart(self):
        return self.cart.all()[0]
    

class Cart(models.Model):
    user = models.ForeignKey(User, related_name='cart', on_delete=models.CASCADE, blank=False, null=False)


    def __str__(self):
        return f"{self.user}'s cart"
    

    def append(self, item):
        if (CartItem.objects.filter(cart=self, item=item)):
            return
        
        CartItem(cart=self, item=item).save()


    def remove_from_cart(self, item):
        cart_item = CartItem.objects.filter(cart=self, item=item)

        if cart_item:
            cart_item.delete()
        else:
            raise ValueError('Item is not in cart')
        

    def is_in_cart(self, item):
        if CartItem.objects.filter(cart=self, item=item):
            return True  
        return False

    
    def clear_cart(self):
        for item in self.items.all():
            item.delete()


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE, blank=False, null=False)
    item = models.ForeignKey('Post', related_name='items', on_delete=models.CASCADE, blank=False, null=False)

    
    def __str__(self):
        return self.item


class Category(models.Model):
    category = models.CharField(max_length=255, blank=False, null=False)


    def __str__(self):
        return self.category
    
    
    def serialize(self):
        return {
            "id": self.id,
            "category": self.category
        }
    

    @staticmethod
    def serialize_categories():
        print([category.serialize() for category in Category.objects.all()])
        return [category.serialize() for category in Category.objects.all()]
    

class Post(models.Model):
    author = models.ForeignKey(User, related_name='posts', on_delete=models.CASCADE, blank=False, null=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.FloatField()
    attributes = models.JSONField(blank=True, null=True)
    category = models.ForeignKey(Category, related_name="posts", on_delete=models.CASCADE, blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"Title: {self.title}, Description: {self.description}, Date: {self.date}"
    

    def serialize(self):
        return {
            "id": f"{self.id}",
            "author": self.author.username,
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "attributes": self.attributes,
            "images": [image.image.url for image in self.images.all()],
            "date": {
                "day": self.date.day,
                "month": self.date.month,
                "year": self.date.year
            },
            "attributes": self.attributes
        }
    

class PostImage(models.Model):
    post = models.ForeignKey(Post, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="posts/")


    def __str__(self):
        return f"{self.post} image"
    

class Comment(models.Model):
    author = models.ForeignKey(User, related_name='comments', on_delete=models.CASCADE, blank=False, null=False)
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE, blank=False, null=False)
    comment = models.TextField()
    date = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.comment
    
    def serialize(self):
        return {
                "author": {
                    "username": self.author.username, 
                    "profile_pic": self.author.profile_pic.url 
                }, 
                "post": str(self.post), 
                "comment": self.comment, 
                "date": {
                    "day": self.date.day,
                    "month": self.date.month,
                    "year": self.date.year, 
                },
                "full-date": self.date.strftime("%B %d, %Y, %I:%M %p")
        }
    