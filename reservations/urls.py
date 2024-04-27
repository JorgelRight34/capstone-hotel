from django.urls import path

from . import views


urlpatterns = [
    path('accept-reservation/<int:reservation>', views.accept_reservation, name='accept_reservation'),
    path('decline-reservation/<int:reservation>', views.decline_reservation, name='decline_reservation'),
    path('notifications', views.notifications, name='notifications'),
    path('reserve/<int:listing>', views.reserve, name='reserve'),
    path('requests-to-book', views.requests_to_book, name='requests'),
    path('request-to-book/<int:id>', views.request_to_book, name='request_to_book'),
    path('search-requests', views.search_requests, name='search_requests'),
]