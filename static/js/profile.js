const sections = {
    '#about': document.getElementById('about'),
    '#posts' : document.getElementById('posts'),
    '#comments' : document.getElementById('comments')
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


const searchPosts = async (url) => {
    const response = await fetch(url);

    if (response.status === 404) {
        loadMessage("<strong>No matches</strong> can't find what you are looking for.", 'danger');
        return;
    }
    posts_page += 1;

    let posts = await response.json();
    reloadPosts(posts);
};


const searchUserPosts = () => {
    searchPosts(`/search-listings?order_by=${order}&author=${username}&q=${searchUserPostsInput.value}`);
};


const searchWishlistListings = async () => {
    searchPosts(`/search-listings?order_by=${order}&q=${(searchUserPostsInput || searchWishlistListingsInput).value}&wishlist=true`);
};


const orderPosts = async (order_value) => { 
    let category = document.getElementById('current-category') || ''
    if (category) {
        category = category.value;
    };
    order = order_value;
    searchPosts(`/search-listings?order_by=${order_value}&category=${category}&q=${(searchUserPostsInput || searchWishlistListingsInput).value}&page=${1}&wishlist=${wishlist}`);
};


const reloadPosts = (posts) => {
    postsContainer.innerHTML = ''
    posts.forEach(post => postsContainer.insertAdjacentHTML('beforeend', post));
    loadPostEventListeners();
    renderRatingStars();
};


const resetLinks = () => {
    links.forEach(link => {
        link.classList.remove('active');
        const section = link.id.replace(/-link/, '');
        sections[`#${section}`].classList.add('d-none');
    });
};


const changeSection = () => {
    const link = event.target;
    link.classList.toggle('active');
    const section = link.id.replace(/-link/, "");

    sections[`#${section}`].classList.toggle('d-none');
};


const loadMoreUserPosts = async () => {
    if (Math.round(window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        // Check if user is in #posts section
        if (window.location.hash !== '#posts') {
            return;
        };

        // Load more items when scrolled to the bottom
        const response = await fetch(`/search-listings?author=${username}&q=${searchUserPostsInput.value}&page=${posts_page + 1}`);

        if (response.status === 404) {
            return;
        };
        posts_page += 1;
        
        const posts = await response.json();

        for (const post of posts){
            postsContainer.insertAdjacentHTML('beforeend', post);
        };

        loadPostEventListeners();
        renderRatingStars();
    };
};


const loadMoreUserComments = async () => {
   if (Math.round(window.innerHeight + window.scrollY)  >= document.body.offsetHeight) {
        if (window.location.hash !== '#comments') {
            return;
        };

        const response = await fetch(`/user-comments/${username}?page=${comments_page}`);
        const comments = await response.json();

        for (const comment in comments) {
            sections['#comments'].insertAdjacentHTML('beforeend', comments[comment]);
        };
    };
};


window.onscroll = loadMoreUserPosts;
window.addEventListener('scroll', loadMoreUserComments);

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
