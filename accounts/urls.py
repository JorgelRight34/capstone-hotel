from django.urls import path

from . import views


urlpatterns = [
    path('delete-notification/<str:type>/<int:notification>', views.delete_notification, name='delete_notification'),
    path('edit-profile/', views.edit_profile, name='edit_profile'),
    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),
    path('notifications', views.notifications, name='notifications'),
    path('register', views.register_view, name='register'),
    path('profile/<str:username>', views.profile, name='profile'),
]