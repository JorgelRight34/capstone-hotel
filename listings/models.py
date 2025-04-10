from django.db import models
from django.template.loader import render_to_string

from reservations.models import Stay


# Create your models here.
class Amenitie(models.Model):
    amenitie = models.CharField(max_length=100, blank=False, null=False)
    icon = models.CharField(max_length=50, blank=False, null=False)
    listing = models.ManyToManyField('Listing', related_name='amenities', blank=True)

    def __str__(self):
        return self.amenitie
    
    
    def serialize(self):
        return  {'id': self.id, 'amenitie': self.amenitie, 'icon': self.icon} 
    

    @staticmethod
    def serialize_ammenities():
        return [amenitie.serialize() for amenitie in Amenitie.objects.all()]


class Category(models.Model):
    category = models.CharField(max_length=100, blank=False, null=False)
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
    

    @staticmethod
    def paginate_categories():
        categories = Category.objects.all()

        # Categories pages contains lists of categories
        categories_pages = []
        categories_per_page = 4

        start_index = 0
        end_index = categories_per_page

        for _ in range(len(categories)):
            # Get page of categories
            page = categories[start_index:end_index]
            # If page is empty then break
            if len(page) == 0:
                break

            categories_pages.append(page)

            # Update start index and end index
            start_index += categories_per_page
            end_index += categories_per_page

        categories = categories_pages
        return categories
    

class Comment(models.Model):
    author = models.ForeignKey('accounts.User', related_name='comments', on_delete=models.CASCADE, blank=False, null=False)
    listing = models.ForeignKey('Listing', related_name='comments', on_delete=models.CASCADE, blank=False, null=False)
    comment = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    rating = models.FloatField(default=0)


    def __str__(self):
        return self.comment
    

    def serialize(self):
        return {
                'id': self.id,
                'author': {
                    'username': self.author.username, 
                    'profile_pic': self.author.profile_pic.url 
                }, 
                'listing': self.listing.serialize(),
                'comment': self.comment, 
                'date': {
                    'day': self.date.day,
                    'month': self.date.month,
                    'year': self.date.year, 
                },
                'full-date': self.date.strftime('%B %d, %Y, %I:%M %p')
        }
    

    @staticmethod
    def render_comments_json(comments, user):
        comments_json = {}
        for comment in comments: 
            print(comment.author)
            comments_json[f'{comment.id}'] = render_to_string('listings/comment.html', {'comment': comment, 'user': user})
        return comments_json

                
class Listing(models.Model):
    author = models.ForeignKey('accounts.User', related_name='listings', on_delete=models.CASCADE, blank=False, null=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255)
    price = models.FloatField()
    rating = models.FloatField(default=0)
    guests = models.IntegerField(default=1)
    bedrooms = models.IntegerField(default=1)
    beds = models.IntegerField(default=1)
    bathrooms = models.IntegerField(default=1)
    category = models.ForeignKey(Category, related_name='listings', on_delete=models.CASCADE, blank=True, null=True)
    type = models.CharField(max_length=5)
    stripe_id = models.TextField()
    date = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"Title: {self.title}, Description: {self.description}, Date: {self.date}"
    

    @property
    def last_stay(self):
        stay = self.stays.filter(status='accepted').order_by('-date').first()
        return stay


    def serialize(self):
        return {
            "id": f"{self.id}",
            "author": self.author.username,
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "amenities": [amenitie.serialize() for amenitie in self.amenities.all()],
            "images": [image.image.url for image in self.images.all()],
            "date": {
                "day": self.date.day,
                "month": self.date.month,
                "year": self.date.year
            },
            "guests": self.guests,
            "bedrooms": self.bedrooms,
            "bathrooms": self.bathrooms,
            "beds": self.beds,
            "category": self.category.category,
            "type": self.type
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
        self.rating = round((ratingSum / (len(ratings) + 1)), 1)
        self.save()

    
    @staticmethod
    def render_posts_html(posts, user):
        posts_json = []
        for post in posts:
            if user.is_authenticated and user.wishlist.is_in_wishlist(post):
                post.is_in_wishlist = True
            posts_json.append(render_to_string('listings/post.html', {'post': post, 'user': user}))

        return posts_json   


    def check_conflicts(self, check_in, check_out):
        # Avoid having a stay at the same time of an accepted stay request
        if (self.last_stay):
            if self.last_stay.check_out <= check_out and self.last_stay.check_in >= check_in:
                return True
        return False 


class Rating(models.Model):
    user = models.ForeignKey('accounts.User', related_name='ratings', blank=False, null=False, on_delete=models.CASCADE)
    listing = models.ForeignKey(Listing, related_name='ratings', blank=False, null=False, on_delete=models.CASCADE)
    rating = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)

    
    def __str__(self):
        return f'{self.user} rated {self.listing} a {self.rating}/5 at ${self.date}'


class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, related_name='images', blank=False, null=False, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='posts/')


    def __str__(self):
        return f'{self.listing} image'
    