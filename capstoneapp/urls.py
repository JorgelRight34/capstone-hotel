from django.urls import path

from . import views
"abcdfeghijklmnnopqrstuv"
urlpatterns = [
    path('', views.index, name='index'),
    path('add-to-wishlist/<int:listing>', views.add_to_wishlist, name='add_to_wishlist'),
    path('reserve/<int:listing>', views.reserve, name='reserve'),
    path('categories', views.categories, name='categories'),
    path('category-posts/<int:category>', views.category_posts, name='category_posts'),
    path('wishlist', views.wishlist, name='wishlist'),
    path('wishlist-json', views.wishlist_json, name='wishlist_json'),
    path('clear-wishlist', views.clear_wishlist, name='clear_wishlist'),
    path('comment/<int:post>', views.comment, name='comment'),
    path('delete-post/<int:post>', views.delete_post, name='delete_post'),
    path('delete-comment/<int:comment>', views.delete_comment, name='delete_comment'),
    path('edit-profile/', views.edit_profile, name='edit_profile'),
    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),
    path('new-post', views.new_post, name='new_post'),
    path('profile/<str:username>', views.profile, name='profile'),
    path('post/<int:post>', views.post_details, name='post_details'),
    path('search-posts', views.search_posts, name='search-posts'),
    path('post-json/<int:post>', views.post_json, name='post_json'),
    path('register', views.register_view, name='register'),
    path('rate/<int:listing>', views.rate, name='rate'),
    path('remove-wishlist-listing/<int:listing>', views.remove_wishlist_listing, name='remove_wishlist_listing'),
    path('update-post', views.update_post, name='update_post'),
    path('user-posts/<str:username>', views.user_posts, name='user_posts'),
    path('user-comments/<str:username>', views.user_comments, name='user_comments')
]