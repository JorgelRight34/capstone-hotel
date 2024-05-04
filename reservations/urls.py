from django.urls import path

from . import views


urlpatterns = [
    path('accept-request/<int:reservation>', views.accept_request, name='accept_request'),
    path('decline-request/<int:reservation>', views.decline_request, name='decline_request'),
    path('reserve/<int:listing>', views.reserve, name='reserve'),
    path('requests-to-book', views.requests_to_book, name='requests'),
    path('request-to-book/<int:id>', views.request_to_book, name='request_to_book'),
    path('sent-requests-to-book', views.sent_requests_to_book, name='sent_requests'),
    path('search-requests', views.search_requests, name='search_requests'),
]