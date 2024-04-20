const postsSearchBar = document.getElementById('posts-search-bar');
const postsSearchForm = document.getElementById('posts-search-form');
let page = 1;


const loadPostEventListeners = () => {
    const newAddToCartBtns = Array.from(postsContainer.querySelectorAll('.add-to-cart'));
    const newRemoveCartItemBtnsArray = Array.from(postsContainer.querySelectorAll('.remove-cart-item'));

    newAddToCartBtns.forEach(button => {
        button.addEventListener('click', (event) => addToCart(event));
    });

    newRemoveCartItemBtnsArray.forEach(button => {
        button.addEventListener('click', (event) => removeCartItem(event));
    });
};


const searchAllPosts = async (event) => {
    event.preventDefault();

    const query = postsSearchBar.value;
    const response = await fetch(`/search-posts?q=${query}`)
    const posts = await response.json();

    postsContainer.innerHTML = '';
    for (const post in posts) {
        postsContainer.innerHTML += posts[post];
    };

    loadPostEventListeners();
};

window.onscroll = async () => {
    if (window.innerHeight + window.scrollY  >= document.body.offsetHeight - 1) {
        // Load more items when scrolled to the bottom
        page += 1;
        const response = await fetch(`/search-posts?page=${page}`);
        const posts = await response.json();

        for (const post in posts) {
            postsContainer.insertAdjacentHTML('beforeend', posts[post]);
        }

        loadPostEventListeners();
    }
};

postsSearchForm.addEventListener('submit', (event) => searchAllPosts(event));
