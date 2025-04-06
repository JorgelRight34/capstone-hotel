# Capstone

## Video Demo

[Video Demo URL](https://youtu.be/2nFv07CAkkk)

#### Key Features

---

- **Backend with Django:** Uses multiple apps to manage different areas of the system: _listings_, _reservations_, and _accounts_. Each of these apps has various views that allow operations to be managed independently.
- **Advanced Search:** Implements an advanced search system to filter property listings based on various parameters such as price, location, number of rooms, category, and more.
- **Integration with Stripe:** Allows simulated payments through Stripe to complete reservations.
- **Image Upload:** Users can upload images related to the properties they are hosting.
- **Notifications:** Users receive notifications when someone comments on their posts or when there is a pending reservation request.
- **Hybrid Application:** Combines features of a SPA (Single Page Application) and MPA (Multiple Page Application), improving the user experience by eliminating unnecessary page reloads.

#### Features

---

###### User Management

![edit profile](https://jorgelorenzom.vercel.app/projects/capstone/edit-profile.jpg)

Users can register, log in, and edit their profile.

- Comment and reservation request notifications are efficiently managed and displayed to the user via JSON responses.

###### Listing Management

![register property](https://jorgelorenzom.vercel.app/projects/capstone/new-listing.jpg)

Hosts can create and manage their listings, which include information about the property, amenities, category, images, and prices.

![comments](https://jorgelorenzom.vercel.app/projects/capstone/comment.jpeg)

Users can add properties to their wishlist and comment on listings.

- Each property has a star rating, and users can rate properties after their stay.
- The advanced search for listings allows filters such as price, number of beds, availability, and more.

###### Reservation Management

![accept reservation](https://jorgelorenzom.vercel.app/projects/capstone/accept-request.jpg)

Users can request to book properties, which hosts can accept or reject.

- The system manages reservations, showing details about check-in and check-out dates, number of people, and other aspects of the stay.
  ![book](https://jorgelorenzom.vercel.app/projects/capstone/pay.png)

  The system calculates the total price of the stay and manages payments through Stripe.

#### Skill Summary

---

This project demonstrates my web development skills using Django for the backend and JavaScript for the frontend, integrating various advanced features such as:

- Creation and management of apps within Django.
- Implementation of an API with JSON responses to facilitate interaction with the frontend.
- Integration of payment services like Stripe.
- Development of advanced search and data filtering.
- Image management and file uploads in the system.
- Design of an interactive and responsive interface that combines features of single-page applications (SPA) and multi-page applications (MPA).
- Implementation of real-time notifications to enhance the user experience.

This project reflects my ability to develop full applications, from user and property management to integration with payments and creating dynamic views that allow smooth and optimized interaction.

## Distinctiveness and Complexity

This project is distinctive from all the other previous projects on CS50w because the Django backend is using multiple apps, which are
listings, reservations and accounts, it also is integrated with a test version of stripe for payment.

It's complex because of the multiple apps it has, and all the multiple views each app has, in which between of all those views there are two views that handle advanced search for listings and for requests to book accepting mutliple GET parameters, a lot of the views return JSON responses
and behave as an API for the frontend, they accept GET parameters for a more tailored response, it's also complex because of the integration with stripe, it also allows for image uploads, and the web app is responsive and it's a hybrid app, it has features of a SPA and MPA, and it's also complex because of the advanced search feature, and notifications features it has.

## Purpouse and Introduction

The purpouse of this project is to bring the oportunity to property owners to rent their spaces for other people to stay there,
and also the purpouse of this project is for people to find places to stay, supporting their search experiencie with advanced filters.

This project is a property hosting and renting web application, where hosts can rent their spaces, and people can find places to stay,
it's integrated with test stripe, the frontend is served by the Django server, but with javascript the pages are interactive removing unnecesary pages reloads in a lot of occasions.

## Most Relevant Files

### /accounts

- models.py
  Inside the models.py file you can find the User, CommentNotification, RequestToBookNotification, Wishlist, WishlistListing models.

  - User: models represent the users, wether they are hosts or people looking for a place to stay.
  - CommentNotification: represents a notification especifically coming from a comment,
    it will be shown to the owner of the post in which the user is commenting to.
  - RequestToBookNotification: represents a notification especifically coming from a request to book a place, it will be shown to the owner of the post in which the user is commenting to.
  - Wishlist: represents a list of the places a user wishes to stay
  - WishlistListing: represents an individual listing of the user's wishlist

- views.py
  Inside the views.py file you can find multiple views, the login_view, logout_view, register_view, edit_profile, profile and notifications view.
  - login_view: it's the view responsible for logging in users.
  - logout_view: it's responsible for logging out users.
  - register_view: it's responsible for signing up users.
  - edit_profile: it's responsible for editing the current user profile.
  - profile: it's responsible for the profile view of any user, it takes as argument the username of a user.
  - notifications: returns a JSON response containing all the notifications for the current user.

### /listings

- models.py
  Inside the models.py file you can find the Amenitie, Category, Comment, Listing, Rating, ListingImage models.

  - Amenitie: represents a desirable or useful feature or facility of a building or place, for example bath, AC, TV, etc...
  - Category: represents the categories in which the listings are divided into, for example: mansions, houses, tropical, etc...
  - Comment: represents a comment to a listing.
  - Listing: represents a place being hosted by a host for people to rent
  - Rating: represents a classification for a listing, it can go from 0 to 5, representing stars, being 5 the best rating.
  - ListingImage: represents an image for a listing.

- views.py
  Inside the views.py file multiple views can be found, index, amenities, add_to_wishlist, wishlist_json, wishlist, categories, comment, clear_wishlist, delete_post, delete_comment, new_post, post_details, remove_wishlist_listing, rate, search_listings, update_post, user_comments views.

  - index: returns the main page with a paginated page containing multiple listings.
  - amenities: returns a serialized list of JSON objects representing amenities.
  - add_to_wishlist: handles adding a listing to the current's user wishlist, it takes as argument the id of the listing to add.
  - wishlist_json: returns a JSON representing the current user wishlist
  - categories: returns a JSON representing the categories for listings.
  - comment: handles commenting on listings functionality.
  - clear_wishlist: handles clearing the current user wishlist.
  - delete_post: handles deleting a listing.
  - delete_comment: handles deleting a comment.
  - new_post: handles the creation of listings, supporting images uploads and creates a product on stripe.
  - post_details: returns a page with the details of a listing.
  - remove_wishlist_listing: handles removing a listing from the wishlist.
  - rate: handles the creation rating that a user made to a listing.
  - search_listings: returns a list of listings given all the GET parameteres received, it can be: q (query), order, wishlist, min_price, max_price, beds, bedrooms, bathrooms, check_in, check_out and page.
  - update_post: handles the edit of a listing.
  - user_comments: returns a JSON list of a page of comments made by a user, that means it's paginated.

### /reservations

- models.py
  Inside the models.py file the Stay model can be found.
  - Stay: represents a reservation made by a user to a host, it contains all the details about the stay, such as listing, check_in, check_out, date, adults, children, infants, pets, nights, price and status.
- views.py
  Inside the views.py file the accept_request, decline_request, reserve, requests_to_book, request_to_book, sent_requests_to_book, search_requests views can be found.
  - accept_request: handles the acception of a host to a request for booking, and processes the payment with stripe.
  - decline_request: handles the decline of a host to a request for booking.
  - reserve: handles the creation of a request to book.
  - request_to_book: loads all the pending, accepted and declined requests received by the current user.
  - request_to_book: returns a page representing the details of a request to book.
  - sent_requests_to_book: returns a page representing all the sent requests to book of the current user.
  - search_requests: handles searching requests with GET parameters, including: q (query), order, status and page (for pagination).

## How To Run

1. Create a virtual enviroment with python
   ```
   python -m venv <name of the virtual enviroment>
   ```
2. Install requirements
   ```
   pip install -r requirements.txt
   ```
3. Make migrations
   ```
   python manage.py makemigrations
   ```
4. Apply migrations
   ```
   python manage.py migrate
   ```
5. Run server
   ```
   python manage.py runserver
   ```
