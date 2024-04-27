const categoriesOptions = Array.from(document.querySelectorAll('.category-link'));
const indexPostsContainer = document.querySelector('.posts-container');
const currentCategory = document.getElementById('current-category')


const showCategoryPosts = async (event) => {
    const category = event.target;
    currentCategory.value = category.dataset.category;

    const response = await fetch(`/search-posts?category=${category.dataset.category}`);
    let posts = await response.json();

    postsContainer.innerHTML = '';

    for (const post in posts) {
        postsContainer.innerHTML += posts[post];
    };

    const newAddToCartBtns = Array.from(postsContainer.querySelectorAll('.add-to-cart'));
    const newRemoveCartItemBtnsArray = Array.from(postsContainer.querySelectorAll('.remove-cart-item'));

    newAddToCartBtns.forEach(button => {
        button.addEventListener('click', (event) => addToCart(event));
    });

    newRemoveCartItemBtnsArray.forEach(button => {
        button.addEventListener('click', (event) => removeCartItem(event));
    });

    posts = Array.from(postsContainer.querySelectorAll('.post-widget'));
};


categoriesOptions.forEach(option => option.addEventListener('click', (event) => showCategoryPosts(event)));