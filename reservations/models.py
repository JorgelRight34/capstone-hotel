from django.db import models
from django.template.loader import render_to_string


# Create your models here. 
class Stay(models.Model):
    buyer = models.ForeignKey('accounts.User', related_name='stays', blank=False, null=False, on_delete=models.CASCADE)
    listing = models.ForeignKey('listings.Listing', related_name='stays', blank=False, null=False, on_delete=models.CASCADE)
    check_in = models.DateField()
    check_out = models.DateField()
    date = models.DateTimeField(auto_now_add=True)
    adults = models.IntegerField(default=1)
    children = models.IntegerField(default=0)
    infants = models.IntegerField(default=0)
    pets = models.IntegerField(default=0)
    nights = models.IntegerField(blank=False, null=False)
    price = models.IntegerField(blank=False, null=False)
    status = models.CharField(max_length=10, default='pending')


    def __str__(self):
        return f"Dates: {self.check_in}-{self.check_out} | Guests: 2 | Price Details {self.listing.price} x {self.nights} nights | Total (USD) ${self.price}"
    

    def serialize(self):
        return {
            'id': self.id,
            'buyer': self.buyer.username,
            'buyer_profile_pic': self.buyer.profile_pic.url,
            'listing': self.listing.serialize(),
            'check_in': self.check_in,
            'check_out': self.check_out,
            'date': self.date,
            'adults': self.adults,
            'children': self.children,
            'infants': self.infants,
            'pets': self.pets,
            'nights': self.nights,
            'price': self.price,
        }


    @staticmethod
    def serialize_requests(requests):
        return [request.serialize() for request in requests]
    
    @staticmethod
    def render_requests_json(requests):
        return [render_to_string('request_details.html', {'request_to_book': request}) for request in requests]