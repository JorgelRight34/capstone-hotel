const ratingStarsContainer = document.getElementById('rating-stars');
const stars = Array.from(document.querySelectorAll('.fa-regular.fa-star'));


const fillStar = (event) => {
    const star = event.target;

    for (const child of ratingStarsContainer.childNodes) {
        if (child !== star) {
            child.classList = 'fa-solid fa-star mx-1';
        } else {
            break;
        }
    }

    let starRect = star.getBoundingClientRect();
    let starMiddle = starRect.left + starRect.width / 2;
    let mouseX = event.clientX;

    if (mouseX <= starMiddle) {
        star.classList = 'fa-solid fa-star-half-stroke mx-1';
    } else {
        star.classList = 'fa-solid fa-star mx-1';
    }
}

const unfillStar = (event) => {
    const star = event.target;
    star.classList = 'fa-regular fa-star mx-1';

    for (const child of ratingStarsContainer.childNodes) {
        if (child !== star) {
            child.classList = 'fa-regular fa-star mx-1';
        } else {
            return;
        }
    }
}

console.log(stars)

stars.forEach(star => star.addEventListener('mouseover', (event) => fillStar(event)));
stars.forEach(star => star.addEventListener('mouseout', (event) => unfillStar(event)));