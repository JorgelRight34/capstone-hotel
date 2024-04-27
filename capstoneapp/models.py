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
    

    def has_reserved(self, listing):
        listing = Listing.objects.get(pk=listing)
        try:
            Stay.objects.filter(listing=listing, buyer=self).first()
        except:
            return False
        return True


    @property
    def user_wishlist(self):
        return self.wishlist


class Wishlist(models.Model):
    user = models.OneToOneField(User, related_name='wishlist', on_delete=models.CASCADE, blank=False, null=False)


    def __str__(self):
        return f"{self.user}'s cart"
    

    def append(self, listing):
        if (WishlistListing.objects.filter(wishlist=self, listing=listing)):
            return
        
        WishlistListing(wishlist=self, listing=listing).save()


    def remove_from_wishlist(self, listing):
        listing = WishlistListing.objects.filter(wishlist=self, listing=listing)

        if listing:
            listing.delete()
        else:
            raise ValueError('Listing is not in wishlist')
        

    def is_in_wishlist(self, listing):
        if WishlistListing.objects.filter(wishlist=self, listing=listing):
            return True  
        return False

    
    def clear_wishlist(self):
        for listing in self.listings.all():
            listing.delete()


@receiver(post_save, sender=User)
def create_user_wishlist(sender, instance, created, **kwargs):
    if created:
        Wishlist.objects.create(user=instance)
        

class WishlistListing(models.Model):
    wishlist = models.ForeignKey(Wishlist, related_name='listings', on_delete=models.CASCADE, blank=False, null=False)
    listing = models.ForeignKey('Listing', related_name='wishlists', on_delete=models.CASCADE, blank=False, null=False)

    
    def __str__(self):
        return str(self.listing)


class Category(models.Model):
    category = models.CharField(max_length=255, blank=False, null=False)
    icon = models.CharField(max_length=50, blank=False, null=False) 


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
    post = models.ForeignKey('Listing', related_name='comments', on_delete=models.CASCADE, blank=False, null=False)
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


class Listing(models.Model):
    author = models.ForeignKey(User, related_name='listings', on_delete=models.CASCADE, blank=False, null=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255)
    price = models.FloatField()
    rating = models.FloatField(default=0)
    attributes = models.JSONField(blank=True, null=True)
    category = models.ForeignKey(Category, related_name='listings', on_delete=models.CASCADE, blank=True, null=True)
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
        posts_json = []

        for post in posts:
            if user.wishlist.is_in_wishlist(post):
                post.is_in_wishlist = True
            posts_json.append(render_to_string('post.html', {'post': post}))

        return posts_json     


class Rating(models.Model):
    user = models.ForeignKey(User, related_name='ratings', blank=False, null=False, on_delete=models.CASCADE)
    listing = models.ForeignKey(Listing, related_name='ratings', blank=False, null=False, on_delete=models.CASCADE)
    rating = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)

    
    def __str__(self):
        return f'{self.user} rated {self.listing} a {self.rating}/5 at ${self.date}'


class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, related_name="images", blank=False, null=False, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="posts/")


    def __str__(self):
        return f"{self.post} image"
    

class Stay(models.Model):
    buyer = models.ForeignKey(User, related_name='stays', blank=False, null=False, on_delete=models.CASCADE)
    listing = models.ForeignKey(Listing, related_name='stays', blank=False, null=False, on_delete=models.CASCADE)
    check_in = models.DateField()
    check_out = models.DateField()
    date = models.DateTimeField(auto_now_add=True)
    adults = models.IntegerField(default=1)
    children = models.IntegerField(default=0)
    infants = models.IntegerField(default=0)
    pets = models.IntegerField(default=0)
    nights = models.IntegerField(blank=False, null=False)
    price = models.IntegerField(blank=False, null=False)


    def __str__(self):
        return f"Dates: {self.check_in}-{self.check_out} | Guests: 2 | Price Details {self.listing.price} x {self.nights} nights | Total (USD) ${self.price}"
    

    def serialize(self):
        return {
            'id': self.id,
            'buyer': self.buyer.username,
            'listing': self.listing.serialize(),
            'check_in': self.check_in,
            'check_out': self.check_out,
            'date': self.date,
            'adults': self.adults,
            'children': self.children,
            'infants': self.infants,
            'pets': self.pets,
            'nights': self.nights,
            'price': self.price
        }


class Request(models.Model):
    notificator = models.ForeignKey(User, related_name='made_requests', blank=False, null=False, on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='requests', blank=False, null=False, on_delete=models.CASCADE)
    request = models.ForeignKey(Listing, related_name='requests', blank=False, null=False, on_delete=models.CASCADE)
    stay = models.OneToOneField(Stay, related_name='request', blank=False, null=False, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, default='pending')


    def __str__(self):
        return f"{self.notificator}'s request for {self.request.title} ({self.request.category})"
    

    def serialize(self):
        return {
            "id": self.id,
            "notificator": self.notificator.username,
            "receiver": self.receiver.username,
            "stay": self.stay.serialize(),
            "notification": str(self)
        }


    @staticmethod
    def serialize_requests(requests):
        return [request.serialize() for request in requests]
    
    @staticmethod
    def render_requests_json(requests):
        return [render_to_string('request_details.html', {'request_to_book': request}) for request in requests]