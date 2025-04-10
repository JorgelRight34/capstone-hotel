import stripe
from django.conf import settings
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import Http404, HttpResponse, JsonResponse
from django.core.paginator import EmptyPage, Paginator, PageNotAnInteger
from datetime import datetime
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt

from .models import Stay
from accounts.models import AcceptedRequestNotification, DeclinedRequestNotification, RequestToBookNotification
from listings.models import Listing

ITEMS_PER_PAGE = 5


# Create your views here.
@login_required
def accept_request(request, reservation):
    request_to_book = get_object_or_404(Stay, pk=reservation)

    if request_to_book.buyer == request.user:
        return HttpResponse(status=405)
    
    # Accept reservation
    request_to_book.status = 'accepted'
    request_to_book.save()

    AcceptedRequestNotification(
        notificator=request.user, 
        notificated=request_to_book.buyer, 
        notification=request_to_book
    ).save()

    return HttpResponse(status=204)


@login_required
def decline_request(request, reservation):
    request_to_book = get_object_or_404(Stay, pk=reservation)

    if request_to_book.notificator != request.user:
        return HttpResponse(status=405)
    
    # Accept reservation
    request_to_book.status = 'declined'
    request_to_book.save()

    DeclinedRequestNotification(
        notificator=request.user, 
        notificated=request_to_book.buyer, 
        notification=request_to_book
    ).save()

    return HttpResponse(status=204)


def paginate(paginator, page):
    """Return right page for paginator"""
    try:
        paginator = paginator.page(page)
    except PageNotAnInteger:
        paginator = paginator.page(1)
    except EmptyPage:
        paginator = paginator.page(paginator.num_pages)

    return paginator


@login_required
def reserve(request, listing):
    listing = get_object_or_404(Listing, pk=listing)

    # Get check in and check out
    check_in =  datetime.strptime(request.GET.get('check-in') or request.POST['check-in'], '%Y-%m-%d').date()
    check_out = datetime.strptime(request.GET.get('check-out') or request.POST['check-out'], '%Y-%m-%d').date()

    # Avoid having a stay at the same time of an accepted stay request
    if (listing.check_conflicts(check_in, check_out)):
        return HttpResponse(status=405)

    # Get guests
    adults = request.GET.get('adults') or 1
    children = request.GET.get('children') or 0
    infants = request.GET.get('infants') or 0
    pets = request.GET.get('pets') or 0

    nights = (check_out - check_in).days

    if request.method == 'POST':
        try:
            amount = listing.price * nights
            if key := settings.SECRET_STRIPE_TEST_KEY:            
                stripe.api_key = key
                # Create a charge
                stripe.Charge.create(
                    amount= round(amount * 100), # amount must be in cents
                    currency='usd',
                    description=listing.description,
                    source=request.POST['stripeToken'],
                )

            # Create a request for stay
            stay = Stay(
                buyer=request.user, 
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
            stay.save()
            # Create notification
            RequestToBookNotification(notificator=request.user, notificated=listing.author, notification=stay).save()
            return redirect('sent_requests')
        except:
            return HttpResponse(status=500)
        
    # Get starting check in
    starting_check_in = ''
    if listing.last_stay:
        if listing.last_stay.check_out < datetime.now().date():
            starting_check_in = datetime.now().strftime('%Y-%m-%d')
        else:
            starting_check_in = listing.last_stay.check_out.strftime('%Y-%m-%d')
    else:
        starting_check_in = datetime.now().strftime('%Y-%m-%d')

    details = {
        'adults': adults, 
        'children': children, 
        'infants': infants, 
        'pets': pets, 
        'nights': nights, 
        'total': listing.price * nights,
        'check_in': request.GET['check-in'],
        'check_out': request.GET['check-out'],
        'starting_check_in': starting_check_in
    }

    return render(request, 'reservations/reserve.html', {
        'listing': listing,
        'stripe_price': listing.price * 100,
        'stripe_key': settings.STRIPE_TEST_PUBLISHABLE_KEY,
        'details': details,
    })


def requests_to_book(request):
    """Load pending, accepted and declined requests received by user"""
    # Get page for pending requests
    pending_page = request.GET.get('pending_page')

    # Paginator
    pending_requests = Paginator(Stay.objects.filter(listing__author=request.user, status='pending'), ITEMS_PER_PAGE)
    pending_requests = paginate(pending_requests, pending_page)

    # Get page for accepted requests
    accepted_page = request.GET.get('accepted_page')

    # Paginator
    accepted_requests = Paginator(Stay.objects.filter(listing__author=request.user, status='accepted'), ITEMS_PER_PAGE)
    accepted_requests = paginate(accepted_requests, accepted_page)

    # Get page for declined requests
    declined_page = request.GET.get('declined_page')

    # Paginator
    declined_requests = Paginator(Stay.objects.filter(listing__author=request.user, status='declined'), ITEMS_PER_PAGE)
    declined_requests = paginate(declined_requests, declined_page)

    return render(request, 'reservations/requests.html', {
        'pending_requests': pending_requests,
        'accepted_requests': accepted_requests,
        'declined_requests': declined_requests
    })


def request_to_book(request, id):
    request_to_book = get_object_or_404(Stay, pk=id)
    return render(request, 'reservations/request_view.html', {'request_to_book': request_to_book})


def sent_requests_to_book(request):
    """Load pending, accepted and declined requests sent by user"""
    # Get page for pending requests
    pending_page = request.GET.get('pending_page')

    # Paginator
    pending_requests = Paginator(request.user.stays.filter(buyer=request.user, status='pending'), ITEMS_PER_PAGE)
    pending_requests = paginate(pending_requests, pending_page)

    # Get page for accepted requests
    accepted_page = request.GET.get('accepted_page')

    # Paginator
    accepted_requests = Paginator(request.user.stays.filter(buyer=request.user, status='accepted'), ITEMS_PER_PAGE)
    accepted_requests = paginate(accepted_requests, accepted_page)

    # Get page for declined requests
    declined_page = request.GET.get('declined_page')

    # Paginator
    declined_requests = Paginator(request.user.stays.filter(buyer=request.user, status='declined'), ITEMS_PER_PAGE)
    declined_requests = paginate(declined_requests, declined_page)

    return render(request, 'reservations/requests.html', {
        'pending_requests': pending_requests,
        'accepted_requests': accepted_requests,
        'declined_requests': declined_requests
    })


def search_requests(request):
    # Get all parameters
    q = request.GET.get('q') or ''
    order = request.GET.get('order_by') or 'stay__date'
    status = request.GET.get('status') or 'pending'

    # Get requests
    requests = Stay.objects.filter(
        Q(listing__title__icontains=q) |
        Q(listing__description__icontains=q) |
        Q(listing__category__category__icontains=q) |
        Q(listing__price__icontains=q),
        status=status
    ).order_by(f'listing__{order}')

    # Return 404 if not matches
    if not requests:
        return HttpResponse(status=404)

    # Get page
    page = request.GET.get('page') or 1

    # Paginator
    requests = Paginator(requests, ITEMS_PER_PAGE)

    try:
        requests = requests.page(page)
    except EmptyPage:
        return HttpResponse(status=404)
    
    return JsonResponse(Stay.render_requests_json(requests), safe=False)