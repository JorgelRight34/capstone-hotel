from django.db import models
from django.contrib.auth.models import AbstractUser
from django.dispatch import receiver
from django.db.models.signals import post_save

from listings.models import Listing
from reservations.models import Stay, Request


# Create your models here.
class User(AbstractUser):
    profile_pic = models.ImageField(upload_to="profile_pics/", default="profile_pics/default.jpg")
    wallpaper = models.ImageField(upload_to="wallpapers/", blank=True, null=True)
    location = models.CharField(max_length=255)


    def __str__(self):
        return self.username
    

    def has_reserved(self, listing):
        listing = Listing.objects.get(pk=listing)
        stay = Stay.objects.filter(listing=listing, buyer=self).first()
        if Request.objects.filter(notificator=self, request=listing, stay=stay, status='accepted'):
            return True
        return False



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
    listing = models.ForeignKey(Listing, related_name='wishlists', on_delete=models.CASCADE, blank=False, null=False)

    
    def __str__(self):
        return str(self.listing)