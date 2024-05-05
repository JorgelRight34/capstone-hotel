const ratingStarsContainer = document.getElementById('rating-stars');
let stars;
if (ratingStarsContainer) {
    stars = Array.from(ratingStarsContainer.querySelectorAll('.fa-regular.fa-star'));
};
const ratingForm = document.getElementById('rating-form');
const ratingText = document.querySelector('#rating') ? parseFloat(document.querySelector('#rating').textContent) : false;
let rating = 0;


const renderRatingStars = () => {
    const listings = Array.from(document.querySelectorAll('.listing'));

    listings.forEach(listing => {
        const ratingStars = Array.from(listing.querySelectorAll('.rating-star'));
        const rating = parseFloat(listing.querySelector('#rating').textContent || listing.querySelector('#rating').value);

        let sub = rating;
        for (const star of ratingStars) {
            console.log(sub);
            if (sub == 0) {
                return;
            }
            else if (sub > 0.5) {
                star.classList = 'fa-solid fa-star mx-1 fs-6 rating-star';
            } else {
                star.classList = 'fa-solid fa-star-half-stroke mx-1 fs-6 rating-star';
                return;
            };
            sub -= 1;
        };
    });
};


const showCurrentRating = () => {
    const ratingStars = Array.from(document.querySelectorAll('.rating-star'));
    const rating = parseFloat(document.querySelector('#rating').textContent);

    let sub = rating;
    for (const star of ratingStars) {
        if (sub === 0) {
            return;
        }
        else if (sub > 0.5) {
            star.classList = 'fa-solid fa-star mx-1 fs-2';
        } else {
            star.classList = 'fa-solid fa-star-half-stroke mx-1 fs-2';
            return;
        };
        sub -= 1;
    };
};


const fillStar = (event) => {
    const star = event.target;
    rating = 0;

    for (const child of stars) {
        child.classList = 'fa-regular fa-star mx-1 fs-6';
    }

    for (const child of ratingStarsContainer.children) {
        if (child !== star) {
            child.classList = 'fa-solid fa-star mx-1 fs-6';
            rating++;
        } else {
            break;
        }
    }

    let starRect = star.getBoundingClientRect();
    let starMiddle = starRect.left + starRect.width / 2;
    let mouseX = event.clientX;


    if (mouseX <= starMiddle) {
        star.classList = 'fa-solid fa-star-half-stroke mx-1 fs-6';
        rating += 0.5;
    } else {
        star.classList = 'fa-solid fa-star mx-1 fs-6';
        rating++;
    };
}


const unfillStars = (event) => {
    const ratingStarsContainerRect = ratingStarsContainer.getBoundingClientRect();
    const mouseX = event.clientX;

    if (mouseX - 2.5 <= ratingStarsContainerRect.left) {
        for (const star of stars) {
            star.classList = 'fa-regular fa-star mx-1 fs-6';
        };
    };
};


const rate = async () => {
    ratingInput = ratingForm.querySelector('input[name="rating"]');
    ratingInput.value = rating;

    const formData = new FormData(ratingForm);
    const response = await fetch(`/rate/${ratingStarsContainer.dataset.item}`, {method: 'POST', body: formData});
    loadMessage(`<b>Rated Listing</b> You have rated this listing a ${rating}/5.0!`, 'success');
};


if (ratingStarsContainer) {
    ratingStarsContainer.addEventListener('mousemove', (event) => unfillStars(event));
    stars.forEach(star => star.addEventListener('mousemove', (event) => fillStar(event)));
    stars.forEach(star => star.addEventListener('click', rate))
};
if (ratingText) {
    showCurrentRating();
}

renderRatingStars();
