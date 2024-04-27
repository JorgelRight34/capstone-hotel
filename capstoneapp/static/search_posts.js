const postsSearchBar = document.getElementById('posts-search-bar');
const postsSearchForm = document.getElementById('posts-search-form');
let page = 1;


const searchAllPosts = async (event) => {
    event.preventDefault();

    const category = window.location.hash.replace('#', '')
    const query = postsSearchBar.value;
    const response = await fetch(`/search-posts?q=${query}&category=${category}`)
    const posts = await response.json();

    if (Object.keys(posts).length === 0) {
        loadMessage("<strong>No matches</strong> can't find what you are looking for.", 'danger');
        return;
    };

    postsContainer.innerHTML = '';
    for (const post in posts) {
        postsContainer.innerHTML += posts[post];
    };

    loadPostEventListeners();
};

const loadMorePosts = async () => {
    if (Math.round(window.innerHeight + window.scrollY)  >= document.body.offsetHeight) {
        // Load more items when scrolled to the bottom
        page += 1;
        let category = document.getElementById('current-category') || ''
        if (category) {
            category = category.value;
        };

        let user = document.getElementById('profile-user') || ''
        if (user) {
            user = user.value;
        };

        const response = await fetch(`/search-posts?order_by=${order}&category=${category}&author=${user}&page=${page}&q=${getQuery()}`);

        if (response.status === 404) {
            page -= 1;
            return;
        }
        
        const posts = await response.json();

        for (const post in posts) {
            postsContainer.insertAdjacentHTML('beforeend', posts[post]);
        }

        loadPostEventListeners();
    }
};


window.onscroll = loadMorePosts
postsSearchForm.addEventListener('submit', (event) => searchAllPosts(event));
