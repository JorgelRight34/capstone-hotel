from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.template.loader import render_to_string


# Create your models here.
class User(AbstractUser):
    profile_pic = models.ImageField(upload_to="profile_pics/", default="profile_pics/default.jpg")
    wallpaper = models.ImageField(upload_to="wallpapers/", blank=True, null=True)
    location = models.CharField(max_length=255)


    def __str__(self):
        return self.username
    

    def has_bought(self, item):
        item = Post.objects.get(pk=item)
        try:
            Purchase.objects.get(item=item, buyer=self)
        except:
            return False
        return True


    @property
    def user_cart(self):
        return self.cart


class Cart(models.Model):
    user = models.OneToOneField(User, related_name='cart', on_delete=models.CASCADE, blank=False, null=False)


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


@receiver(post_save, sender=User)
def create_user_cart(sender, instance, created, **kwargs):
    if created:
        Cart.objects.create(user=instance)
        

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE, blank=False, null=False)
    item = models.ForeignKey('Post', related_name='items', on_delete=models.CASCADE, blank=False, null=False)

    
    def __str__(self):
        return str(self.item)


class Category(models.Model):
    category = models.CharField(max_length=255, blank=False, null=False)
    icon = models.CharField(max_length=20, blank=False, null=False) 


    def __str__(self):
        return self.category
    
    def serialize(self):
        return {
            "id": self.id,
            "category": self.category
        }

    @staticmethod
    def serialize_categories():
        return [category.serialize() for category in Category.objects.all()]
    

class Comment(models.Model):
    author = models.ForeignKey(User, related_name='comments', on_delete=models.CASCADE, blank=False, null=False)
    post = models.ForeignKey('Post', related_name='comments', on_delete=models.CASCADE, blank=False, null=False)
    comment = models.TextField()
    date = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.comment
    
    def serialize(self):
        return {
                "id": self.id,
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
    
    @staticmethod
    def render_comments_json(comments, user):
        comments_json = {}

        for comment in comments:
            comments_json[f'{comment.id}'] = render_to_string('comment.html', {'comment': comment, 'user': user})

        return comments_json
        

class Post(models.Model):
    author = models.ForeignKey(User, related_name='posts', on_delete=models.CASCADE, blank=False, null=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.FloatField()
    rating = models.FloatField(default=0)
    attributes = models.JSONField(blank=True, null=True)
    category = models.ForeignKey(Category, related_name="posts", on_delete=models.CASCADE, blank=True, null=True)
    quantity = models.IntegerField(default=1)
    stripe_id = models.TextField()
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
    

    def set_rating(self, rating):
        # Avoid ratings greater than 5 and lower than 0
        if rating > 5 or rating < 0:
            raise ValueError("Ratings can't be greather than 5 nor lower than 0")
        
        ratingSum = rating
        ratings = self.ratings.all()    # All ratings except the current one

        for rating in self.ratings.all():
            ratingSum += rating.rating

        # Add 1 to len(ratings) because current rating is not being counted
        self.rating = ratingSum / (len(ratings) + 1) 
        self.save()

    
    @staticmethod
    def render_posts_json(posts, user):
        posts_json = {}

        for post in posts:
            if user.cart.is_in_cart(post):
                post.is_in_cart = True
            posts_json[f'{post.id}'] = render_to_string('post.html', {'post': post})

        return posts_json


class Rating(models.Model):
    user = models.ForeignKey(User, related_name='ratings', blank=False, null=False, on_delete=models.CASCADE)
    item = models.ForeignKey(Post, related_name='ratings', blank=False, null=False, on_delete=models.CASCADE)
    rating = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)

    
    def __str__(self):
        return f'{self.user} rated {self.item} a {self.rating}/5 at ${self.date}'


class PostImage(models.Model):
    post = models.ForeignKey(Post, related_name="images", blank=False, null=False, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="posts/")


    def __str__(self):
        return f"{self.post} image"
    

class Purchase(models.Model):
    buyer = models.ForeignKey(User, related_name='purchases', blank=False, null=False, on_delete=models.CASCADE)
    item = models.ForeignKey(Post, related_name='purchases', blank=False, null=False, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    quantity = models.IntegerField()
    price = models.IntegerField()


    def __str__(self):
        return f"{self.buyer} bought {self.quantity} {self.item} at {self.date} for {self.price}."
