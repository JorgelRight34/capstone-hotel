import json
from django.contrib.auth import authenticate, login, logout
from django.core.paginator import EmptyPage, Paginator, PageNotAnInteger
from django.db import IntegrityError
from django.http import Http404, HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404,  render, redirect
from django.urls import reverse

from .models import User, Post, PostImage, Comment, Category


ITEMS_PER_PAGE = 10


# Create your views here.
def index(request):
    return render(request, "index.html")


def add_to_cart(request, item):
    item = get_object_or_404(Post, pk=item)
    request.user.user_cart.append(item)

    return JsonResponse(item.serialize())


def cart_json(request):
    return JsonResponse([item.item.serialize() for item in request.user.user_cart.items.all()], safe=False)


def cart(request):
    return render(request, 'cart.html', {'cart': request.user.user_cart})


def categories(request):
    return JsonResponse(Category.serialize_categories(), safe=False)


def comment(request, post):
    if request.method == 'POST':
        post = get_object_or_404(Post, pk=post)
        comment = Comment(author=request.user, post=post, comment=request.POST['comment'])
        comment.save()
        print(comment.serialize())
        return JsonResponse(comment.serialize())
    

def clear_cart(request):
    request.user.user_cart.clear_cart()
    return HttpResponse(status=204)


def new_post(request):
    if request.method == "POST":
        try:
            author, title = request.user, request.POST["title"]
            description, price, category = request.POST["description"], request.POST["price"], request.POST["category"]
        except:
            return redirect("/#new_post")
        
        post = Post()
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
    
        post.save()

        # Get images
        for image in request.FILES.getlist('image'):
            post_image = PostImage(post=post, image=image)
            post_image.save()


        return HttpResponse(status=204)

    return redirect("/#new_post")


def profile(request, user):
    user = get_object_or_404(User, username=user)
    posts = Paginator(user.posts.all().order_by('-date'), ITEMS_PER_PAGE)

    # Get page
    page = request.GET.get('page')

    try:
        posts = posts.page(page)
    except PageNotAnInteger:
        posts = posts.page(1)
    except EmptyPage:
        posts = posts.page(posts.num_pages)


    comments = []
    for post in posts:
        post.is_in_cart = request.user.user_cart.is_in_cart(post)
        counter = 0
        for comment in post.comments.all():
            comments.append(comment)
            if counter == 5:
                break
            counter += 1

    return render(request, "profile.html", {
        "profile_user": user,
        "posts": posts,
        "comments": comments
    })


def post_details(request, post):
    post = get_object_or_404(Post, pk=post)
    attributes = post.attributes if post.attributes else {}

    comments = Paginator(post.comments.all().order_by('-date'), ITEMS_PER_PAGE)
    page = request.GET.get('page')

    try:
        comments = comments.page(page)
    except PageNotAnInteger:
        comments = comments.page(1)
    except EmptyPage:
        comments = comments.page(comments.num_pages)

    post.is_in_cart = request.user.user_cart.is_in_cart(post)

    return render(request, 'post_details.html', {
        'post': post,
        'attributes': attributes,
        'comments': comments,
    })


def post_json(request, post):
    post = get_object_or_404(Post, pk=post)
    return JsonResponse(post.serialize())


def remove_cart_item(request, item):
    item = get_object_or_404(Post, pk=item)

    request.user.user_cart.remove_from_cart(item)

    return HttpResponse(status=204)


def update_post(request):
    if request.method == "POST":
        post = get_object_or_404(Post, pk=request.POST['post'])
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

        print(values)
        print(fields)

        # Construct json data
        json_dict = {}
        for i in range(len(fields)):
            json_dict[fields[i]] = values[i]

        print(json_dict)
        post.attributes = json_dict

        post.save()
        return JsonResponse(post.serialize())


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
            user.save()
        except IntegrityError:
            return render(request, "register.html")
        
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "register.html")
