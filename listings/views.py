import json
import stripe
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import EmptyPage, Paginator, PageNotAnInteger
from django.db import IntegrityError
from django.db.models import Q
from django.http import Http404, HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404,  render, redirect
from django.urls import reverse
from django.template.loader import render_to_string
from datetime import datetime

from .models import Amenitie, Listing, ListingImage, Comment, Category, Rating
from accounts.models import User, CommentNotification

ITEMS_PER_PAGE = 10
POSTS_PER_PAGE = 6


# Create your views here.
def index(request):
    # Get requested page
    page = request.GET.get('page')

    # Paginator
    posts = Paginator(Listing.objects.all(), POSTS_PER_PAGE)

    try:
        posts = posts.page(page)
    except PageNotAnInteger:
        posts = posts.page(1)
    except EmptyPage:
        posts = posts.page(posts.num_pages)

    # Check if posts are in cart only if user is authenticated
    if request.user.is_authenticated:
        for post in posts:
            if request.user.wishlist.is_in_wishlist(post.id):
                post.is_in_wishlist = True
    

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

    return render(request, 'index.html', {
        'posts': posts,
        'categories': categories
    })


def amenities(request):
    return JsonResponse(Amenitie.serialize_ammenities(), safe=False)


@login_required
def add_to_wishlist(request, listing):
    listing = get_object_or_404(Listing, pk=listing)
    request.user.wishlist.append(listing)

    return JsonResponse(listing.serialize())


def wishlist_json(request):
    return JsonResponse([listing.listing.serialize() for listing in request.user.wishlist.listings.all()], safe=False)


@login_required
def wishlist(request):
    wishlist = [listing.listing for listing in request.user.wishlist.listings.all()]
    for listing in wishlist:
        listing.is_in_wishlist = request.user.wishlist.is_in_wishlist(listing)
    return render(request, 'listings/wishlist.html', {'cart': wishlist})


def categories(request):
    return JsonResponse(Category.serialize_categories(), safe=False)


@login_required
def comment(request, post):
    if request.method == 'POST':
        listing = get_object_or_404(Listing, pk=post)

        # Allow only buyers to comment
        if not request.user.has_reserved(listing.id):
            return HttpResponse(status=405)
        
        # Create comment
        comment = Comment(author=request.user, listing=listing, comment=request.POST['comment'])
        comment.save()

        # Create notification
        CommentNotification(notificator=request.user, notificated=listing.author, notification=comment).save()

        return JsonResponse(comment.serialize())
    

@login_required
def clear_wishlist(request):
    request.user.wishlist.clear_wishlist()
    return HttpResponse(status=204)


@login_required
def delete_post(request, post):
    post = get_object_or_404(Listing, pk=post)

    # Avoid others user to delete others users posts
    if request.user == post.author:
        post.delete()
        return redirect(reverse('profile', kwargs={'username': request.user}))
    else:
        return HttpResponse(status=500)


@login_required
def delete_comment(request, comment):
    comment = get_object_or_404(Comment, pk=comment)

    # Avoid others user to delete others users comments
    if request.user == comment.author:
        comment.delete();
        return HttpResponse(status=204)
    else: 
        return HttpResponse(status=500)


@login_required
def new_post(request):
    if request.method == "POST":
        try:
            author, title, location, place_type = request.user, request.POST['title'], request.POST['location'], request.POST['place-type']
            description, price, category = request.POST['description'], request.POST['price'], request.POST['category']
            guests, bedrooms, beds, bathrooms = request.POST['guests'], request.POST['bedrooms'], request.POST['beds'], request.POST['bathrooms']
        except:
            return redirect('/#new_post')
        
        post = Listing()    
        category = get_object_or_404(Category, pk=category)
        post.author, post.title, post.description, post.price, post.category = author, title, description, price, category
        post.location, post.guests, post.bedrooms, post.beds, post.bathrooms, post.type = location, guests, bedrooms, beds, bathrooms, place_type
        post.save()

        # Get amenities
        amenities_list = []
        if amenities := request.POST.getlist('amenitie'):
            for amenitie in amenities:
                amenitie = Amenitie.objects.get(pk=amenitie)
                amenitie.listing.set([post])
                amenitie.save()
                amenities_list.append(str(amenitie))
    
        # Register item in stripe
        stripe.api_key = settings.SECRET_STRIPE_TEST_KEY

        # Create product representing current product
        product = stripe.Product.create(
            name=post.title,
            description=post.description,
            type='good',
            metadata=amenities_list
        )

        # Create price representing current product's price
        product_price = stripe.Price.create(
            unit_amount=post.price,
            currency="usd",
            recurring={"interval": "month"},
            product=product['id'],
        )

        # Link product with item in the database via the stripe's product's id
        post.stripe_id = product['id']
        post.save()

        # Get images
        for image in request.FILES.getlist('image'):
            post_image = ListingImage(listing=post, image=image)
            post_image.save()


        return HttpResponse(status=204)

    return redirect("/#new_post")


def post_details(request, post):
    post = get_object_or_404(Listing, pk=post)

    comments = Paginator(post.comments.all().order_by('-date'), ITEMS_PER_PAGE)
    page = request.GET.get('page')

    try:
        comments = comments.page(page)
    except PageNotAnInteger:
        comments = comments.page(1)
    except EmptyPage:
        comments = comments.page(comments.num_pages)

    if request.user.is_authenticated:
        post.is_in_wishlist = request.user.wishlist.is_in_wishlist(post)

    
    if (request.user.is_authenticated):
        has_reserved = request.user.has_reserved(post.id)
    else:
        has_reserved = False

    amenities = post.amenities.all()
    amenities_pages = []
    AMENITIES_PER_PAGE = 3
    start_index, end_index = 0, AMENITIES_PER_PAGE
    amenities_sliced = amenities[start_index:end_index]

    while amenities_sliced:
        amenities_pages.append(amenities_sliced)
        start_index, end_index = start_index + AMENITIES_PER_PAGE, end_index + AMENITIES_PER_PAGE
        amenities_sliced = amenities[start_index:end_index]

    print(amenities_pages)
    # Get starting check in
    starting_check_in = ''
    if post.last_stay:
        if post.last_stay.check_out < datetime.now():
            starting_check_in = datetime.now().strftime('%Y-%m-%d')
        else:
            starting_check_in = post.last_stay.check_out.strftime('%Y-%m-%d')

    return render(request, 'listings/post_details.html', {
        'post': post,
        'comments': comments,
        'stripe_key': settings.STRIPE_TEST_PUBLISHABLE_KEY,
        'has_reserved': has_reserved,
        'starting_check_in': starting_check_in,
        'amenities': amenities_pages
    })


@login_required
def remove_wishlist_listing(request, listing):
    listing = get_object_or_404(Listing, pk=listing)
    request.user.wishlist.remove_from_wishlist(listing)

    return HttpResponse(status=204)


def rate(request, listing):
    if request.method == 'POST':
        listing = get_object_or_404(Listing, pk=listing)

        # Avoid letting a user who hasn't bought the item to rate
        if not request.user.has_reserved(listing.id):
            return HttpResponse(status=405)
        
        # Create rating
        rating = Rating(user=request.user, listing=listing, rating=request.POST['rating'])
        rating.save()

        # Set new rating for item
        listing.set_rating(float(rating.rating))

        return HttpResponse(status=204)


def search_listings(request):
    # Get all GET parameters
    q = request.GET.get('q')
    order = request.GET.get('order_by', 'date')
    wishlist = request.GET.get('wishlist')    # Contains username of wishlist's user
    min_price = request.GET.get('min_price') or 0
    max_price = request.GET.get('max_price') or 10000

    beds = request.GET.get('beds') or 1
    bedrooms = request.GET.get('bedrooms') or 1
    bathrooms = request.GET.get('bathrooms') or 1

    check_in = datetime.strptime(request.GET.get('check_in'), '%Y-%m-%d').date() if request.GET.get('check_in') else datetime.today().date()
    check_out = datetime.strptime(request.GET.get('check_out'), '%Y-%m-%d').date() if request.GET.get('check_out') else datetime.today().date()

    amenities = {
        'Wifi': request.GET.get('wifi') or False,
        'Washer': request.GET.get('washer') or False,
        'Air Conditioning': request.GET.get('air_conditioning') or False, 
        'Kitchen': request.GET.get('kitchen') or False,
        'Dryer': request.GET.get('dryer') or False
    }

    parameters = {
        'category': request.GET.get('category'),
        'author': request.GET.get('author'),
        'type': request.GET.get('place-type'),
        'guests': request.GET.get('guests'),
    }

    # Populate paginator parameters only the non null ones
    paginator_parameters = {}
    for parameter in parameters.keys():
        if parameters[parameter]:
            paginator_parameters[parameter] = parameters[parameter]

    # Get category if there's been a category
    if parameters['category']:
        paginator_parameters['category'] = Category.objects.get(category=parameters['category'])

    # Get author if author was defined
    if parameters['author']:
        paginator_parameters['author'] = User.objects.get(username=parameters['author'])

    # Get all listings from a query if a query was given
    if q:
        listings = Listing.objects.filter(
            Q(title__icontains=q) | 
            Q(description__icontains=q) | 
            Q(category__category__icontains=q), 
            Q(price__gte=min_price) & Q(price__lte=max_price),
            Q(beds__gte=beds),
            Q(bedrooms__gte=bedrooms),
            Q(bathrooms__gte=bathrooms),
            **paginator_parameters
        ).order_by(order)
    else:
        # Unpack parameters 
        listings = Listing.objects.filter(
            Q(price__gte=min_price) & Q(price__lte=max_price), 
            Q(beds__gte=beds),
            Q(bedrooms__gte=bedrooms),
            Q(bathrooms__gte=bathrooms),
            **paginator_parameters
        ).order_by(order)

    # If amenities only get the listings which have the provided amenities
    filtered_listings = []
    for listing in listings:
        contains_all = True
        for amenitie in amenities.keys():
            if amenities[amenitie]:
                amenitie = Amenitie.objects.get(amenitie=amenitie)
                if listing.title not in [listing.title for listing in amenitie.listing.all()]:
                    contains_all = False
                    break
        if contains_all:
            filtered_listings.append(listing)
    listings = filtered_listings if filtered_listings else listings

    # If check-in and check-out dates were provided but are not in the wishlist
    for listing in listings:
        if listing.check_conflicts(check_in, check_out):
            listings.remove(listing)

    # If wishlist was defined then get all listings from wishlist
    if wishlist:
      wishlist = request.user.wishlist.listings.all()
      for listing in listings:
          # If listing not in wishlist then remove it from posts
          if listing.id not in [wishlist_listing.listing.id for wishlist_listing in wishlist]:
              listings.remove(listing)

    # Paginator
    listings = Paginator(listings, POSTS_PER_PAGE)

    # Get page
    page = request.GET.get('page') or 1

    try:
        listings = listings.page(page)
    except EmptyPage:
        return HttpResponse(status=404)

    # If first page is empty, it won't throw EmptyPage error then return 404
    if not listings:
        return HttpResponse(status=404)
    
    return JsonResponse(Listing.render_posts_json(listings, request.user), safe=False)


@login_required
def update_post(request):
    if request.method == "POST":
        post = get_object_or_404(Listing, pk=request.POST['post'])
        post.title, post.description, post.price = request.POST['title'], request.POST['description'], request.POST['price']

        # Get fields values
        fields = []
        for field in request.POST.getlist('field'):
            if field:
                fields.append(field)

        # Get values values
        values = []
        for value in request.POST.getlist('value'):
            if value:
                values.append(value)

        # Construct json data
        json_dict = {}
        for i in range(len(fields)):
            json_dict[fields[i]] = values[i]

        post.attributes = json_dict
        post.save()

        return JsonResponse(post.serialize())


def user_comments(request, username):
    user = get_object_or_404(User, username=username)
    page = request.GET.get('page')
    
    comments = Paginator(user.comments.all().order_by('-date'), 3)

    try:
       comments = comments.page(page)
    except PageNotAnInteger:
        comments = comments.page(1)
    except EmptyPage:
        return HttpResponse(status=404)


    return JsonResponse(Comment.render_comments_json(comments, request.user))