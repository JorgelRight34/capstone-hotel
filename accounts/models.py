from django.db import models
from django.contrib.auth.models import AbstractUser
from django.dispatch import receiver
from django.db.models.signals import post_save

from listings.models import Listing
from reservations.models import Stay


# Create your models here.
class User(AbstractUser):
    profile_pic = models.ImageField(upload_to="profile_pics/", default="profile_pics/default_profile_pic.jpg")
    wallpaper = models.ImageField(upload_to="wallpapers/", blank=True, null=True)

    def __str__(self):
        return self.username
    

    def has_reserved(self, listing):
        listing = Listing.objects.get(pk=listing)
        if Stay.objects.filter(buyer=self, listing=listing, status='accepted'):
            return True
        return False


    @property
    def user_wishlist(self):
        return self.wishlist
    

    @property
    def notifications(self):
        print([n.serialize() for n in self.accepted_request_sent_notifications.all()])
        return (
            [n.serialize() for n in self.request_to_book_received_notifications.all()] + 
            [n.serialize() for n in self.comment_received_notifications.all()] +
            [n.serialize() for n in self.accepted_request_sent_notifications.all()] +
            [n.serialize() for n in self.declined_request_sent_notifications.all()]
        )


class AcceptedRequestNotification(models.Model):
    notificator = models.ForeignKey(User, related_name='accepted_request_notifications', blank=False, null=False, on_delete=models.CASCADE)
    notificated = models.ForeignKey(User, related_name='accepted_request_sent_notifications', blank=False, null=False, on_delete=models.CASCADE)
    notification = models.ForeignKey('reservations.Stay', related_name='listing_accepted_request_notifications', blank=False, null=False, on_delete=models.CASCADE)

    def delete_notification(self, user):
        if self.notificator == user:
            self.delete()


    def serialize(self):
        return {
            'id': self.id,
            'notificator': {
                'username': self.notificator.username, 'profile_pic': self.notificator.profile_pic.url
            },
            'notificated': {
                'username': self.notificated.username, 'profile_pic': self.notificated.profile_pic.url
            },
            'type': 'accepted_request',
            'notification': self.notification.serialize()
        }
    
        
class DeclinedRequestNotification(models.Model):
    notificator = models.ForeignKey(User, related_name='declined_request_notifications', blank=False, null=False, on_delete=models.CASCADE)
    notificated = models.ForeignKey(User, related_name='declined_request_sent_notifications', blank=False, null=False, on_delete=models.CASCADE)
    notification = models.ForeignKey('reservations.Stay', related_name='listing_declined_request_notifications', blank=False, null=False, on_delete=models.CASCADE)

    def delete_notification(self, user):
        if self.notificated == user:
            self.delete()


    def serialize(self):
        return {
            'id': self.id,
            'notificator': {
                'username': self.notificator.username, 'profile_pic': self.notificator.profile_pic.url
            },
            'notificated': {
                'username': self.notificated.username, 'profile_pic': self.notificated.profile_pic.url
            },
            'type': 'declined_request',
            'notification': self.notification.serialize()
        }
    

class CommentNotification(models.Model):
    notificator = models.ForeignKey(User, related_name='comment_notifications', blank=False, null=False, on_delete=models.CASCADE)
    notificated = models.ForeignKey(User, related_name='comment_received_notifications', blank=False, null=False, on_delete=models.CASCADE)
    notification = models.ForeignKey('listings.Comment', related_name='listing_notifications', blank=False, null=False, on_delete=models.CASCADE)


    def delete_notification(self, user):
        if self.notificated == user:
            self.delete()


    def serialize(self):
        return {
            'id': self.id,
            'notificator': {
                'username': self.notificator.username, 'profile_pic': self.notificator.profile_pic.url
            },
            'notificated': {
                'username': self.notificated.username, 'profile_pic': self.notificated.profile_pic.url
            },
            'type': 'comment',
            'notification': self.notification.serialize()
        }
    

class RequestToBookNotification(models.Model):
    notificator = models.ForeignKey(User, related_name='request_to_book_notifications', blank=False, null=False, on_delete=models.CASCADE)
    notificated = models.ForeignKey(User, related_name='request_to_book_received_notifications', blank=False, null=False, on_delete=models.CASCADE)
    notification = models.ForeignKey('reservations.Stay', related_name='request_to_book_notifications', blank=False, null=False, on_delete=models.CASCADE)


    def delete_notification(self, user):
        if self.notificated == user:
            self.delete()



    def serialize(self):
        return {
            'id': self.id,
            'notificator': {
                'username': self.notificator.username, 'profile_pic': self.notificator.profile_pic.url
            },
            'notificated': {
                'username': self.notificated.username, 'profile_pic': self.notificated.profile_pic.url
            },
            'type': 'request_to_book',
            'notification': self.notification.serialize()
        }
    

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
        

class WishlistListing(models.Model):
    wishlist = models.ForeignKey(Wishlist, related_name='listings', on_delete=models.CASCADE, blank=False, null=False)
    listing = models.ForeignKey(Listing, related_name='wishlists', on_delete=models.CASCADE, blank=False, null=False)

    
    def __str__(self):
        return str(self.listing)
    

@receiver(post_save, sender=User)
def create_user_wishlist(sender, instance, created, **kwargs):
    if created:
        Wishlist.objects.create(user=instance)