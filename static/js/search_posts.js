const postsSearchBar = document.getElementById('posts-search-bar');
const postsSearchForm = document.getElementById('posts-search-form');
const advancedSearchButton = document.getElementById('advanced-search-button');
const advancedSearchDialog = document.getElementById('advanced-search-dialog');
const advancedSearchForm = advancedSearchDialog.querySelector('#advanced-search-form');
const closeAdvancedSearchDialogButton = advancedSearchDialog.querySelector('#close-advanced-search-dialog');
const placeTypesAdvancedSearchFormButtons = Array.from(advancedSearchForm.querySelectorAll('input[name="place-type"]'));
const clearAdvancedSearchFormButton = advancedSearchForm.querySelector('#clear-advanced-search-form');
const roomsAndBedsButtons = Array.from(advancedSearchForm.querySelectorAll('#rooms-and-beds button'));

const categoriesOptions = Array.from(document.querySelectorAll('.category-link'));
const indexPostsContainer = document.querySelector('.posts-container');
const currentCategory = document.getElementById('current-category');

let page = 1;
let place_type = '';
let min_price = 0
let max_price = 2000;
let beds = 1;
let bedrooms = 1;
let bathrooms = 1;
let category;
let wifi = '';
let washer = '';
let air_conditioning = '';
let kitchen = '';
let dryer = '';


const searchPosts = async (event) => {
    event.preventDefault();

    const last_category = category;
    category = window.location.hash.replace('#', '');
   
    if (last_category !== category) {
        page = 0;
    };

    const response = await fetch(
        '/search-posts?' +
        `order_by=${order}&` +
        `category=${category}&` +
        `page=${page + 1}&` +
        `q=${getQuery()}&` +
        `min_price=${min_price}&` +
        `max_price=${max_price}&` +
        `beds=${beds}&` +
        `bedrooms=${bedrooms}&` +
        `bathrooms=${bathrooms}&` +
        `wifi=${wifi}&` +
        `washer=${washer}&` +
        `air_conditioning=${air_conditioning}&` +
        `kitchen=${kitchen}&` +
        `dryer=${dryer}&`
    );

    postsContainer.innerHTML = '';
    if (response.status === 404) {
        loadMessage("<strong>No matches</strong> can't find what you are looking for.", 'danger');
        return;
    };

    page++;
    const posts = await response.json();

    for (const post in posts) {
        console.log(post);
        postsContainer.innerHTML += posts[post];
    };

    loadPostEventListeners();
};


const changeToDarkBackground = (element) => {
    if (element.tagName === 'BUTTON') {
        element.classList.remove('btn-light');
        element.classList.add('btn-dark');
        return;
    }

    element.classList.remove('bg-light');
    element.classList.remove('text-dark');
    element.classList.add('bg-dark');
    element.classList.add('text-light');
};


const changeToLightBackground = (element) => {
    if (element.tagName === 'BUTTON') {
        element.classList.remove('btn-dark');
        element.classList.add('btn-light')
        return;
    };

    element.classList.remove('bg-dark');
    element.classList.remove('text-light');
    element.classList.add('bg-light');
    element.classList.add('text-dark');
};


const changePlaceTypeInputBackground = (event) => {
    placeTypesAdvancedSearchFormButtons.forEach(button => changeToLightBackground(button.parentElement));
    changeToDarkBackground(event.target.parentElement);
};


const changeRoomsAndBedsInput = (event) => {
    const button = event.target;
    const siblingButtons = Array.from(button.parentElement.querySelectorAll('button'));
    const input = button.parentElement.querySelector('input');

    if (parseInt(button.textContent)) {
        input.value = parseInt(button.textContent);
    };

    console.log(input.value);
    siblingButtons.forEach(button => changeToLightBackground(button));
    changeToDarkBackground(button);
};


const loadMorePosts = async () => {
    if (Math.round(window.innerHeight + window.scrollY)  >= document.body.offsetHeight) {
        // Load more items when scrolled to the bottom
        const category = window.location.hash.replace('#', '')

        let user = document.getElementById('profile-user') || '';
        if (user) {
            user = user.value;
        };

        const response = await fetch(
            '/search-posts?' +
            `order_by=${order}&` +
            `&author=${user}&` +
            `category=${category}&` +
            `page=${page + 1}&` +
            `q=${getQuery()}&` +
            `min_price=${min_price}&` +
            `max_price=${max_price}&` +
            `beds=${beds}&` +
            `bedrooms=${bedrooms}&` +
            `bathrooms=${bathrooms}&` +
            `wifi=${wifi}&` +
            `washer=${washer}&` +
            `air_conditioning=${air_conditioning}&` +
            `kitchen=${kitchen}&` +
            `dryer=${dryer}`
        );

        if (response.status === 404) {
            return;
        };

        page++;
        
        const posts = await response.json();

        for (const post in posts) {
            postsContainer.insertAdjacentHTML('beforeend', posts[post]);
        };

        loadPostEventListeners();
    };
};


const advancedSearch = (event) => {
    event.preventDefault();
    advancedSearchDialog.close();

    place_type = advancedSearchForm.querySelector('input[name="place-type"]:checked').value;
    min_price = advancedSearchForm.querySelector('#min-price').value || '';
    max_price = advancedSearchForm.querySelector('#max-price').value || '';
    beds = advancedSearchForm.querySelector('input[name="beds"]').value;
    bedrooms = advancedSearchForm.querySelector('input[name="bedrooms"]').value;
    bathrooms = advancedSearchForm.querySelector('input[name="bathrooms"]').value;
    wifi = advancedSearchForm.querySelector('#wifi').checked? 'true': '';
    washer = advancedSearchForm.querySelector('#washer').checked? 'true': '';
    air_conditioning = advancedSearchForm.querySelector('#air-conditioning').checked? 'true' : '';
    kitchen = advancedSearchForm.querySelector('#kitchen').checked? 'true' : '';
    dryer = advancedSearchForm.querySelector('#dryer').checked? 'true' : ''
    page = 0;

    searchPosts(event);
};


const clearAdvancedSearchForm = () => {
    advancedSearchForm.reset(); 
};


const openAdvancedSearchDialog = () => {
    advancedSearchDialog.showModal();
};


const closeAdvancedSearchDialog = () => {
    advancedSearchDialog.close();
};


const showCategoryPosts = (event) => {
    window.location.hash = event.target.dataset.category;
    searchPosts(event);
    posts = Array.from(postsContainer.querySelectorAll('.post-widget'));
};


clearAdvancedSearchFormButton.onclick = clearAdvancedSearchForm;
categoriesOptions.forEach(option => option.addEventListener('click', (event) => showCategoryPosts(event)));
roomsAndBedsButtons.forEach(button => button.onclick = (event) => changeRoomsAndBedsInput(event));
window.onscroll = loadMorePosts;
postsSearchForm.addEventListener('submit', (event) => searchAllPosts(event));
advancedSearchButton.onclick = openAdvancedSearchDialog;
advancedSearchForm.onsubmit = (event) => advancedSearch(event);
closeAdvancedSearchDialogButton.onclick = closeAdvancedSearchDialog;
placeTypesAdvancedSearchFormButtons.forEach(button => button.onclick = (event) => changePlaceTypeInputBackground(event));