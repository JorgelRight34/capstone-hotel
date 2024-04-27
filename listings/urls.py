from django.urls import path

from . import views
"abcdfeghijklmnnopqrstuv"
urlpatterns = [
    path('', views.index, name='index'),
    path('add-to-wishlist/<int:listing>', views.add_to_wishlist, name='add_to_wishlist'),
    path('categories', views.categories, name='categories'),
    path('wishlist', views.wishlist, name='wishlist'),
    path('wishlist-json', views.wishlist_json, name='wishlist_json'),
    path('clear-wishlist', views.clear_wishlist, name='clear_wishlist'),
    path('comment/<int:post>', views.comment, name='comment'),
    path('delete-post/<int:post>', views.delete_post, name='delete_post'),
    path('delete-comment/<int:comment>', views.delete_comment, name='delete_comment'),
    path('new-post', views.new_post, name='new_post'),
    path('post/<int:post>', views.post_details, name='post_details'),
    path('rate/<int:listing>', views.rate, name='rate'),
    path('remove-wishlist-listing/<int:listing>', views.remove_wishlist_listing, name='remove_wishlist_listing'),
    path('search-posts', views.search_posts, name='search_posts'),
    path('update-post', views.update_post, name='update_post'),
    path('user-comments/<str:username>', views.user_comments, name='user_comments')
]