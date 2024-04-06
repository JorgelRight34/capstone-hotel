from django.urls import path

from . import views
"abcdfeghijklmnnopqrstuv"
urlpatterns = [
    path('', views.index, name='index'),
    path('add-to-cart/<int:item>', views.add_to_cart, name='add_to_cart'),
    path('categories', views.categories, name='categories'),
    path('cart', views.cart, name='cart'),
    path('cart-json', views.cart_json, name='cart_json'),
    path('clear-cart', views.clear_cart, name='clear_cart'),
    path('comment/<int:post>', views.comment, name='comment'),
    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),
    path('new-post', views.new_post, name='new_post'),
    path('profile/<str:user>', views.profile, name='profile'),
    path('post/<int:post>', views.post_details, name='post_details'),
    path('post-json/<int:post>', views.post_json, name='post_json'),
    path('register', views.register_view, name='register'),
    path('remove-cart-item/<int:item>', views.remove_cart_item, name='remove_cart_item'),
    path('update-post', views.update_post, name='update_post'),

]