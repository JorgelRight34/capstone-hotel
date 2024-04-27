const ratingStarsContainer = document.getElementById('rating-stars');
const stars = Array.from(document.querySelectorAll('.fa-regular.fa-star'));
const ratingForm = document.getElementById('rating-form');
let rating = 0;


const fillStar = (event) => {
    const star = event.target;
    rating = 0;

    for (const child of ratingStarsContainer.children) {
        if (child !== star) {
            child.classList = 'fa-solid fa-star mx-1 fs-2';
            rating++;
        } else {
            break;
        }
    }

    let starRect = star.getBoundingClientRect();
    let starMiddle = starRect.left + starRect.width / 2;
    let mouseX = event.clientX;


    if (mouseX <= starMiddle) {
        star.classList = 'fa-solid fa-star-half-stroke mx-1 fs-2';
        rating += 0.5;
    } else {
        star.classList = 'fa-solid fa-star mx-1 fs-2';
        rating++;
    };
}


const unfillStar = (event) => {
    const star = event.target;
    star.classList = 'fa-regular fa-star mx-1 fs-2';

    for (const child of ratingStarsContainer.childNodes) {
        if (child !== star) {
            child.classList = 'fa-regular fa-star mx-1 fs-2';
            rating--;
        } else {
            return;
        }
    }
}


const rate = async () => {
    ratingInput = ratingForm.querySelector('input[name="rating"]');
    ratingInput.value = rating;

    const formData = new FormData(ratingForm);
    const response = await fetch(`/rate/${ratingStarsContainer.dataset.item}`, {method: 'POST', body: formData});
    loadMessage(`<b>Rated Listing</b> You have rated this listing a ${rating}/5.0!`, 'success');

}


stars.forEach(star => star.addEventListener('mousemove', (event) => fillStar(event)));
stars.forEach(star => star.addEventListener('mouseout', (event) => unfillStar(event)));
stars.forEach(star => star.addEventListener('click', rate))