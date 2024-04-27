from django.urls import path

from . import views


urlpatterns = [
    path('edit-profile/', views.edit_profile, name='edit_profile'),
    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),
    path('register', views.register_view, name='register'),
    path('profile/<str:username>', views.profile, name='profile'),
]