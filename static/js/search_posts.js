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

const appliedFiltersText = document.getElementById('applied-filters');
let appliedFilters = 0;

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
let check_in = '';
let check_out = '';


const searchPosts = async (event) => {
    event.preventDefault();

    const last_category = category;
    category = window.location.hash.replace('#', '');
   
    if (last_category !== category && event.target.tagName === 'FORM') {
        page = 0;
    };

    let user = document.getElementById('profile-user') || '';
    if (user) {
        user = user.value;
    };

    const response = await fetch(
        '/search-listings?' +
        `author=${user}&` +
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
        `dryer=${dryer}&` +
        `check_in=${check_in}&` +
        `check_out=${check_out}`
    );

    if (response.status === 404 && event.target.tagName === 'FORM') {
        loadMessage("<strong>No matches</strong> can't find what you are looking for.", 'danger');
        postsContainer.innerHTML = '';
        return;
    };

    if (event.target.tagName === 'FORM') {
        postsContainer.innerHTML = '';
    }

    if (response.status === 404) {
        return;
    }

    page++;
    const posts = await response.json();

    for (const post in posts) {
        postsContainer.innerHTML += posts[post];
    };

    loadPostEventListeners();
};


const updateAppliedFiltersText = () => {
    appliedFiltersText.textContent = '0';
    const updateAppliedFilters = () => {
        appliedFiltersText.textContent = parseInt(appliedFiltersText.textContent) + 1;
    };

    advancedSearchForm.querySelector('input[name="place-type"]:checked').value !== '' ? updateAppliedFilters() : false;
    advancedSearchForm.querySelector('#min-price').value !== '0' ? updateAppliedFilters() : false;
    advancedSearchForm.querySelector('#max-price').value !== '2000' ? updateAppliedFilters() : false;
    advancedSearchForm.querySelector('input[name="beds"]').value !== '1' ? updateAppliedFilters() : false;
    advancedSearchForm.querySelector('input[name="bedrooms"]').value !== '1' ? updateAppliedFilters() : false;
    advancedSearchForm.querySelector('input[name="bathrooms"]').value !== '1' ? updateAppliedFilters() : false;
    advancedSearchForm.querySelector('#wifi').checked ?  updateAppliedFilters() : false;
    advancedSearchForm.querySelector('#washer').checked ? updateAppliedFilters(): false;
    advancedSearchForm.querySelector('#air-conditioning').checked ? updateAppliedFilters() : false;
    advancedSearchForm.querySelector('#kitchen').checked ? updateAppliedFilters() : false;
    advancedSearchForm.querySelector('#dryer').checked ? updateAppliedFilters() : false;
    advancedSearchForm.querySelector('#check-in').value ? updateAppliedFilters() : false;
    advancedSearchForm.querySelector('#check-out').value ? updateAppliedFilters() : false;

    appliedFiltersText.classList.remove('d-none');
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
    const input = button.parentElement.querySelector('input');
    const siblingButtons = Array.from(button.parentElement.querySelectorAll('button'));

    input.value = parseInt(button.textContent) || 1;

    siblingButtons.forEach(button => changeToLightBackground(button));
    changeToDarkBackground(button);
};


const loadMorePosts = async (event) => {
    if (Math.round(window.innerHeight + window.scrollY)  >= document.body.offsetHeight) {
        // Load more items when scrolled to the bottom
        searchPosts(event);
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
    wifi = advancedSearchForm.querySelector('#wifi').checked ? 'true': '';
    washer = advancedSearchForm.querySelector('#washer').checked ? 'true': '';
    air_conditioning = advancedSearchForm.querySelector('#air-conditioning').checked? 'true' : '';
    kitchen = advancedSearchForm.querySelector('#kitchen').checked ? 'true' : '';
    dryer = advancedSearchForm.querySelector('#dryer').checked ? 'true' : ''
    check_in = advancedSearchForm.querySelector('#check-in').value;
    check_out = advancedSearchForm.querySelector('#check-out').value;
    page = 0;

    searchPosts(event);
    updateAppliedFiltersText();
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