from django.shortcuts import render, get_object_or_404,  render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import Http404, HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.db import IntegrityError
from django.core.paginator import EmptyPage, Paginator, PageNotAnInteger

from .models import User, RequestToBookNotification, CommentNotification, Wishlist, WishlistListing


# Create your views here.
@login_required
def delete_notification(request, type, notification):
    match (type):
        case 'comment':
            notification = get_object_or_404(CommentNotification, pk=notification)
            notification.delete_notification(request.user)
            return HttpResponse(status=204)
        case 'request_to_book':
            notification = get_object_or_404(RequestToBookNotification, pk=notification)
            notification.delete_notification(request.user)
            return HttpResponse(status=204)
        
    return HttpResponse(status=404)


@login_required
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

    return render(request, 'accounts/edit_profile.html')


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
     
        return render(request, "accounts/login.html")
    else:
        return render(request, "accounts/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('listings:index'))


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
            return render(request, "accounts/register.html", {
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
            return render(request, "accounts/register.html")
        
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "accounts/register.html")
    

def profile(request, username):
    user = get_object_or_404(User, username=username)

    # Get page
    page = request.GET.get('items_page')
    
    posts = Paginator(user.listings.all().order_by('date'), 6)
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

    return render(request, "accounts/profile.html", {
        "profile_user": user,
        "posts": posts,
        "comments": comments
    })


@login_required
def notifications(request):
    return JsonResponse(request.user.notifications, safe=False)