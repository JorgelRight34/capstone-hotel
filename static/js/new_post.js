const newPostForm = document.getElementById('new-post-form');
const imageInput = document.getElementById('image');
const imagesDiv = document.getElementById('file-inputs');
const categorySelect = document.getElementById('category-select');

const newPostFormTitle = document.getElementById('new-post-form-title');
const newPostFormDescription = document.getElementById('new-post-form-description');
const newPostFormPrice = document.getElementById('new-post-form-price');

const amenitiesContainer = newPostForm.querySelector('#ammenities');
const imageInputs = Array.from(newPostForm.querySelectorAll('input[name="image"]'));

const imageInputsCarousel = newPostForm.querySelector('#image-inputs');
const imageInputsCarouselInner = imageInputsCarousel.querySelector('.carousel-inner');
const imageInputsCarouselIndicators = imageInputsCarousel.querySelector('.carousel-indicators');

const addFieldButtons = Array.from(newPostForm.querySelectorAll('.add-field'));
const removeFieldButtons = Array.from(newPostForm.querySelectorAll('.remove-field'));


const addField = (event) => {
    const field = event.target.dataset.field;
    const number = document.getElementById(`${field}-number`);
    const numberInput = document.querySelector(`input[name="${field}"]`)
    const sum = parseFloat(number.textContent) + 1;

    number.textContent = sum;
    numberInput.value = sum;
};


const removeField = (event) => {
    const field = event.target.dataset.field;
    const number = document.getElementById(`${field}-number`);
    const numberInput = document.querySelector(`input[name="${field}"]`)
    const sub = parseFloat(number.textContent) - 1;

    if (sub < 0) {
        return;
    }

    number.textContent = sub;
    numberInput.value = sub;
};

const fillNewPostRadioButton = (event) => {
    const button = event.target.parentNode;

    if (button.style.color !== 'black') {
        button.style.color = 'black';
        button.style.backgroundColor = '#ccc';
        button.style.border = '2px solid black';
    } else {
        button.style.color = '#666666'
        button.style.border = '';
        button.style.backgroundColor = '#ffffff';
        button.style.border = '';
    };
};

const uploadListingImage = (event) => {
    const imageInput = event.target;
    const image = imageInput.parentNode.querySelector('.new-listing-image');

    if (imageInput.files && imageInput.files[0]) {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            image.innerHTML = `
                <img src="${event.target.result}" class="img-fluid">
            `;
            loadAnotherImageInput();
        };
        fileReader.readAsDataURL(imageInput.files[0]);
    } else {
        image.innerHTML = `
            <i class="fa-regular fa-image fs-1"></i>
        `;
    };
};

const loadAnotherImageInput = () => {
    const imageInputs = Array.from(imageInputsCarousel.querySelectorAll('input[name="image"]'));
    const lastImageInput = imageInputs[imageInputs.length - 1];

    if (!lastImageInput.files && !lastImageInput.files[0]) {
        return;
    };

    const slideTo = parseFloat(imageInputsCarouselIndicators.lastElementChild.dataset.bsSlideTo) + 1;
    const carouselItem = `
        <div class="carousel-item">
            <label class="container rounded d-flex align-items-center justify-content-center p-3 hover" style="height: 500px; object-fit: contain;">
                <input type="file" name="image" accept="image/*" class="d-none" onchange="uploadListingImage(event)">
                <div class="new-listing-image">
                    <i class="fa-regular fa-image fs-1"></i>
                </div>
            </label>
        </div>
    `;
    const button = `
        <button type="button" data-bs-target="#image-inputs" data-bs-slide-to="${slideTo}" aria-label="Slide ${slideTo + 1}"></button>
    `;
    imageInputsCarouselInner.insertAdjacentHTML('beforeend', carouselItem);
    imageInputsCarouselIndicators.insertAdjacentHTML('beforeend', button);
};


const renderAmenities = async () => {
    const response = await fetch('/amenities');
    const amenities = await response.json();

    for (const amenitie of amenities) {
        const html = `
            <label class="container border rounded shadow-sm p-3 mx-3 mb-3 amenitie w-25">
                <input type="hidden" id="${amenitie.id}" name="amenitie" value="${amenitie.id}">
                <div>
                    <div class="d-flex align-items-center justify-content-center mb-1">
                        <i class="${amenitie.icon}"></i>
                    </div>
                    <div class="text-center text-truncate">
                        ${amenitie.amenitie}
                    </div>
                </div>
            </label>
        `;
        amenitiesContainer.insertAdjacentHTML('beforeend', html);
    };

    const amenitiesInputs = Array.from(document.querySelectorAll('input[name="amenitie"]'));
    amenitiesInputs.forEach(button => button.addEventListener('change', (event) => fillNewPostRadioButton(event)));
};


const populateCategoryOptions = async () => {
    const response = await fetch('/categories');
    const categories = await response.json();

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = `${category.id}`;
        option.innerText = category.category;
        categorySelect.appendChild(option);
    });
};

const submitNewPostForm = async (event) => {
    event.preventDefault();

    const response = await fetch('/new-post', {
        method: 'POST',
        body: new FormData(newPostForm)
    });

    if (response.status !== 204) {
        loadMessage(`<b>Error Uploading</b> There's been an error uploading your post`, 'danger');
        return;
    };
    loadMessage('Post succesfully uploaded', 'success');

    newPostForm.reset();

    newPostForm.close();
};

addFieldButtons.forEach(button => button.addEventListener('click', (event) => addField(event)));
removeFieldButtons.forEach(button => button.addEventListener('click', (event) => removeField(event)));
imageInputs.forEach(input => input.addEventListener('change', (event) => uploadListingImage(event)));
newPostForm.addEventListener('submit', (event) => submitNewPostForm(event));

populateCategoryOptions();
renderAmenities();

