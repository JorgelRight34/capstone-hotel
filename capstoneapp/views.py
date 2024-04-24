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


from .models import User, Listing, ListingImage, Stay, Comment, Category, Rating


ITEMS_PER_PAGE = 10
POSTS_PER_PAGE = 6
stripe.api_key = settings.SECRET_STRIPE_TEST_KEY


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


@login_required
def add_to_wishlist(request, listing):
    listing = get_object_or_404(Listing, pk=listing)
    request.user.wishlist.append(listing)

    return JsonResponse(listing.serialize())


def reserve(request, listing):
    listing = get_object_or_404(Listing, pk=listing)
    # Get guests
    adults = request.GET.get('adults') or 1
    children = request.GET.get('children') or 0
    infants = request.GET.get('infants') or 0
    pets = request.GET.get('pets') or 0

    # Get check in and check out
    check_in =  datetime.strptime(request.GET['check-in'], '%Y-%m-%d').date()
    check_out = datetime.strptime(request.GET['check-out'], '%Y-%m-%d').date()
    nights = (check_out - check_in).days

    details = {'adults': adults, 
               'children': children, 
               'infants': infants, 
               'pets': pets, 
               'nights': nights, 
               'total': listing.price * nights,
               'check_in': request.GET['check-in'],
               'check_out': request.GET['check_out']
            }

    if request.method == 'POST':
        # Get guests
        adults = request.POST.get('adults') or 1
        children = request.POST.get('children') or 0
        infants = request.POST.get('infants') or 0
        pets = request.POST.get('pets') or 0

        check_in =  datetime.strptime(request.POST['check-in'], '%Y-%m-%d').date()
        check_out = datetime.strptime(request.POST['check-out'], '%Y-%m-%d').date()
        print("check_in", check_in)
        print("check_out", check_out)
        nights = (check_out - check_in).days
        print("nights: ", nights)
        try:
            amount = listing.price * nights
            # Create a charge
            charge = stripe.Charge.create(
                amount= round(amount * 100), # amount must be in cents
                currency='usd',
                description=listing.description,
                source=request.POST['stripeToken'],
            )

            # Create a stay
            stay = Stay(buyer=request.user, 
                        listing=listing, 
                        adults=adults,
                        children=children,
                        infants=infants,
                        pets=pets,
                        nights=nights, 
                        price=amount, 
                        check_in=check_in, 
                        check_out=check_out,

                    )
            print(stay)
            stay.save()

            return JsonResponse({"Worked": "True"})
        except:
            return JsonResponse({"Worked": "False"})

    return render(request, 'reserve.html', {
        'listing': listing,
        'stripe_key': settings.STRIPE_TEST_PUBLISHABLE_KEY,
        'details': details
    })


def category_posts(request, category):
    category = get_object_or_404(Category, pk=category)
    posts = {}
    for post in category.listings.all():
        if request.user.wishlist.is_in_wishlist(post.id):
            post.is_in_wishlist = True
        posts[f'{post.id}'] = render_to_string('post.html', {'post': post})

    return JsonResponse(posts)


def wishlist_json(request):
    return JsonResponse([listing.listing.serialize() for listing in request.user.wishlist.listings.all()], safe=False)


@login_required
def wishlist(request):
    wishlist = [listing.listing for listing in request.user.wishlist.listings.all()]
    for listing in wishlist:
        listing.is_in_wishlist = request.user.wishlist.is_in_wishlist(listing)
    return render(request, 'cart.html', {'cart': wishlist})


def categories(request):
    return JsonResponse(Category.serialize_categories(), safe=False)


@login_required
def comment(request, post):
    if request.method == 'POST':
        post = get_object_or_404(Listing, pk=post)

        # Allow only buyers to comment
        if not request.user.has_reserved(post.id):
            return HttpResponse(status=405)
        
        # Create comment
        comment = Comment(author=request.user, post=post, comment=request.POST['comment'])
        comment.save()

        return JsonResponse(comment.serialize())
    

@login_required
def clear_wishlist(request):
    request.user.wishlist.clear_cart()
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


def edit_profile(request):
    if request.method == 'POST':
        user = request.user
        username, first_name, last_name = request.POST['username'], request.POST['first_name'], request.POST['last_name']
        user.username, user.first_name, user.last_name = username, first_name, last_name

        # Check if profile pic has been uploaded
        if profile_pic := request.FILES.get('profile_pic'):
            user.profile_pic = profile_pic

        # Check if wallpaper has been uploaded
        if wallpaper := request.FILES.get('wallpaper'):
            user.wallpaper = wallpaper
        
        user.save()

        return HttpResponseRedirect(reverse('profile', args=[request.user.username]))

    return render(request, 'edit_profile.html')


@login_required
def new_post(request):
    if request.method == "POST":
        try:
            author, title, location = request.user, request.POST['title'], request.POST['location']
            description, price, category = request.POST['description'], request.POST['price'], request.POST['category']
        except:
            return redirect('/#new_post')
        
        post = Listing()    
        category = get_object_or_404(Category, pk=category)
        post.author, post.title, post.description, post.price, post.category = author, title, description, price, category

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

        # Register item in stripe
        stripe.api_key = settings.SECRET_STRIPE_TEST_KEY

        # Create product representing current product
        product = stripe.Product.create(
            name=post.title,
            description=post.description,
            type='good',
            metadata=json_dict
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


def profile(request, username):
    user = get_object_or_404(User, username=username)

    # Get page
    page = request.GET.get('items_page')
    
    posts = Paginator(user.listings.all().order_by('-date'), 6)
    try:
        posts = posts.page(page)
    except PageNotAnInteger:
        posts = posts.page(1)
    except EmptyPage:
        posts = posts.page(posts.num_pages)


    comments = Paginator(user.comments.all(), 3)
    try:
        comments = comments.page(page)
    except PageNotAnInteger:
        comments = comments.page(1)
    except EmptyPage:
        posts = comments.page(comments.num_pages)

    # Check if post is in cart
    for post in posts:
        post.is_in_wishlist = request.user.wishlist.is_in_wishlist(post)

    return render(request, "profile.html", {
        "profile_user": user,
        "posts": posts,
        "comments": comments
    })


def post_details(request, post):
    post = get_object_or_404(Listing, pk=post)
    attributes = post.attributes if post.attributes else {}

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

    return render(request, 'post_details.html', {
        'post': post,
        'attributes': attributes,
        'comments': comments,
        'stripe_key': settings.STRIPE_TEST_PUBLISHABLE_KEY,
        'has_reserved': has_reserved
    })


def post_json(request, post):
    post = get_object_or_404(Listing, pk=post)
    return JsonResponse(post.serialize())


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


def user_posts(request, username):
    user = get_object_or_404(User, username=username)
    page = request.GET.get('page')
    
    posts = Paginator(user.posts.all().order_by('-date'), 6)

    try:
        posts = posts.page(page)
    except PageNotAnInteger:
        posts = posts.page(1)
    except EmptyPage:
        return HttpResponse(status=404)

    return JsonResponse(Listing.render_posts_json(posts, request.user))


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


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
     
        return render(request, "login.html")
    else:
        return render(request, "login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('index'))


def register_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        first_name = request.POST["first_name"]
        last_name = request.POST["last_name"]
        profile_pic = request.FILES.get("profile_pic")
        wallpaper = request.FILES.get("wallpaper")

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password, first_name=first_name, last_name=last_name)
            if profile_pic:
                user.profile_pic = profile_pic
            if wallpaper:
                user.wallpaper = wallpaper
            user.save()
        except IntegrityError:
            return render(request, "register.html")
        
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "register.html")


def search_posts(request):
    query = request.GET.get('q')
    category = request.GET.get('category')
    posts = Listing.objects.all()

    if category:
        category = Category.objects.get(category=category)

    if (query):
        posts = Listing.objects.filter(Q(title__icontains=query) | Q(description__icontains=query), category=category)

    # Paginator
    posts = Paginator(posts, POSTS_PER_PAGE)

    # Get page
    page = request.GET.get('page')

    try:
        posts = posts.page(page)
    except PageNotAnInteger:
        posts = posts.page(1)
    except EmptyPage:
        return HttpResponse(status=404)


    return JsonResponse(Listing.render_posts_json(posts, request.user))
