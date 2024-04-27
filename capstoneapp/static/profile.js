const sections = {
    "#about": document.getElementById('about'),
    "#posts" : document.getElementById('posts'),
    "#comments" : document.getElementById('comments')
};

const aboutLink = document.getElementById('about-link');
const postsLink = document.getElementById('posts-link');
const commentsLink = document.getElementById('comments-link');

const links = [aboutLink, postsLink, commentsLink];
const postsContainer = document.querySelector('.posts-container');
const selectOrderOption = document.querySelector('select[name="select-order"]');

const searchUserPostsInput = document.getElementById('search-user-posts');
const searchWishlistListingsInput = document.getElementById('search-wishlist-listings');
let posts = Array.from(postsContainer.querySelectorAll('.post-widget'));

let posts_page = 1;
let comments_page = 1;
let order = 'date';


// Get username
const currentURL = window.location.href;
const url = new URL(currentURL);
const username = url.pathname.split('/')[2];

const wishlist = searchWishlistListingsInput ? 'true' : ''


const getQuery = () => {
    try {
        return searchUserPostsInput.value;
    } catch {
        try {
            return postsSearchBar.value;
        }
        catch {
            try {
                return searchWishlistListingsInput.value;
            } catch {
                return '';
            };
        };
    };
}


const searchUserPosts = async () => {
    const response = await fetch(`/search-posts?order_by=${order}&author=${username}&q=${getQuery()}`);
    let posts = await response.json();

    reloadPosts(posts);
};


const searchWishlistListings = async () => {
    const response = await fetch(`/search-posts?order_by=${order}&q=${getQuery()}&wishlist=True`);
    let posts = await response.json();

    reloadPosts(posts);
};


const orderPosts = async (order_value) => { 
    let category = document.getElementById('current-category') || ''
    if (category) {
        category = category.value;
    };

    order = order_value;

    const response = await fetch(`/search-posts?order_by=${order_value}&category=${category}&author=${username || ''}&q=${getQuery()}&wishlist=${wishlist}`);
    let posts = await response.json();

    reloadPosts(posts);
}


const loadPosts = async () => {
    const currentURL = window.location.href;
    const url = new URL(currentURL);
    const username = url.pathname.split('/')[1];

    const response = await fetch(`user-posts/${username}`)
    posts = response.json();

    posts.forEach(post => postsContainer.innerHTML += loadPost(post));
};


const reloadPosts = (posts) => {
    postsContainer.innerHTML = ''
    posts.forEach(post => postsContainer.insertAdjacentHTML('beforeend', post));
    loadPostEventListeners();
};


const resetLinks = () => {
    links.forEach(link => {
        link.classList.remove('active');
        const section = link.id.replace(/-link/, "");
        sections[`#${section}`].classList.add('d-none');
    })

};


const changeSection = () => {
    const link = event.target;
    link.classList.toggle('active');
    const section = link.id.replace(/-link/, "");

    sections[`#${section}`].classList.toggle('d-none');
};


const loadMoreUserPosts = async () => {
    if (Math.round(window.innerHeight + window.scrollY)  >= document.body.offsetHeight) {
        // Check if user is in #posts section
        if (window.location.href !== '#posts') {
            return;
        }

        // Load more items when scrolled to the bottom
        posts_page += 1;
        const response = await fetch(`/search-posts?author=${username}?page=${posts_page}`);

        if (response.status === 404) {
            return;
        }
        
        const posts = await response.json();

        for (const post in posts) {
            postsContainer.insertAdjacentHTML('beforeend', posts[post]);
        }

        loadPostEventListeners();
    }
}


const loadMoreUserComments = async () => {
   if (Math.round(window.innerHeight + window.scrollY)  >= document.body.offsetHeight) {
        if (window.location.hash !== '#comments') {
            return;
        }

        const response = await fetch(`/user-comments/${username}?page=${comments_page}`)
        const comments = await response.json();

        for (const comment in comments) {
            sections['#comments'].insertAdjacentHTML('beforeend', comments[comment]);
        }
    }
}


window.onscroll = loadMoreUserPosts;
window.onscroll = loadMoreUserComments;

if (selectOrderOption) {
    selectOrderOption.addEventListener('change', () => orderPosts(selectOrderOption.value));
};
if (searchUserPostsInput) {
    searchUserPostsInput.addEventListener('keyup', searchUserPosts);
};
if (searchWishlistListingsInput) {
    searchWishlistListingsInput.addEventListener('keyup', searchWishlistListings);
};

links.forEach(link => {
    if (link) {
        link.addEventListener('click', () => {
            resetLinks();
            changeSection();
        });
    };
});
