const detailButtons = Array.from(document.querySelectorAll('.details'));
const closeDetailButtons = Array.from(document.querySelectorAll('.close-details'));
const acceptReservationButtons = Array.from(document.querySelectorAll('.accept-reservation'));
const declineReservationButtons = Array.from(document.querySelectorAll('.decline-reservation'));

const ratingStars = Array.from(document.querySelectorAll('.rating-star'));
const rating = parseFloat(document.getElementById('rating').textContent);

const searchRequestsInput = document.getElementById('search-requests');
const orderRequestsSelect = document.querySelector('select[name="select-requests-order"]');

const requestLinks = Array.from(document.querySelectorAll('.request-link'));
const sections = {
    '#pending': document.getElementById('pending'),
    '#accepted': document.getElementById('accepted'),
    '#declined': document.getElementById('declined'),
};
let currentSection = 'pending';
let page = 1;
const sectionsKeys = Object.keys(sections);


const showSection = (event) => {
    const section = event.target.href.split('#')[1];
    currentSection = section;

    sectionsKeys.forEach(key => sections[key].classList.add('d-none'));

    sections[`#${section}`].classList.toggle('d-none');
    event.target.classList.toggle('active');

    requestLinks.forEach(link => link.classList.remove('active'));
};


const renderRatingStars = () => {
    let sub = rating;
    for (const star of ratingStars) {
        if (sub > 0.5) {
            star.classList = 'fa-solid fa-star mx-1 fs-6';
        } else {
            star.classList = 'fa-solid fa-star-half-stroke mx-1 fs-6';
            return;
        };
        sub -= 1;
    };
};


const openDetails = (event) => {
    const details =  document.getElementById(`request-${event.target.dataset.request}-details`);
    details.showModal();
};


const closeDetails = (event) => {
    const details =  document.getElementById(`request-${event.target.dataset.request}-details`);
    details.close();
};


const acceptReservation = async (event) => {
    const response = await fetch(`/accept-reservation/${event.target.dataset.reservation}`);

    if (response.status === 204) {
        loadMessage('<b>Accepted Reservation</b> the reservation has been succesfully accepted.', 'success');
    } else {
        loadMessage('<b>Reservation Error</b> an error ocurred.', 'danger');
    };
};


const declineReservation = async (event) => {
    const response = await fetch(`/decline-reservation/${event.target.dataset.reservation}`);

    if (response.status === 204) {
        loadMessage('<b>Declined Reservation</b> the reservation has been succesfully declined.', 'success');
    } else {
        loadMessage('<b>Reservation Error</b> an error ocurred.', 'danger');
    };
};


const searchRequests = async () => {
    const response = await fetch(`
        /search-requests?order_by=stay__listing__${orderRequestsSelect.value}&q=${searchRequestsInput.value || ''}&status=${currentSection}&page=${page}
        `
    );
    if (response.status === 404) {
        return;
    }
    const requests = await response.json();

    const section = sections[`#${currentSection}`]
    section.innerHTML = '';
    for (const request of requests) {
        section.insertAdjacentHTML('beforeend', request);
    };
}

const loadMoreRequests = () => {
    if (Math.round(window.innerHeight + window.scrollY)  >= document.body.offsetHeight) {
        // Load more items when scrolled to the bottom
        page += 1
        searchRequests();
    }
}


acceptReservationButtons.forEach(button => button.addEventListener('click', (event) => acceptReservation(event)));
detailButtons.forEach(button => button.addEventListener('click', (event) => openDetails(event)));
closeDetailButtons.forEach(button => button.addEventListener('click', (event) => closeDetails(event)));
declineReservationButtons.forEach(button => button.addEventListener('click', (event) => declineReservation(event)));
requestLinks.forEach(link => link.addEventListener('click', (event) => showSection(event)));
orderRequestsSelect.onchange = searchRequests;
searchRequestsInput.onkeyup = searchRequests;
window.onscroll = loadMoreRequests;
renderRatingStars();