const newPostBtn = document.getElementById('new-post-btn');
const newPostDialog = document.getElementById('new-post-dialog');
const closeNewPostDialog = document.getElementById('close-new-post-dialog');
const newPostForm = document.getElementById('new-post-form');
const imageInput = document.getElementById('image');
const imagesDiv = document.getElementById('file-inputs');

const newPostFormTitle = document.getElementById('new-post-form-title');
const newPostFormDescription = document.getElementById('new-post-form-description');
const newPostFormPrice = document.getElementById('new-post-form-price');

const fieldsTable = document.getElementById('field-inputs');
const fieldsTableBody = document.getElementById('fields-table-body');
const firstFieldInput = document.querySelector('input[name="field"]');
const firstValueInput = document.querySelector('input[name="value"]');
const tableFieldRow = document.querySelector('.table-field-row');

const categorySelect = document.getElementById('category-select');

const editPostButton = document.querySelector('.edit-post');
const infoDiv = document.getElementById('info');
const updatePostForm = document.getElementById('update-post-form');
const cancelUpdatePostFormButton = document.getElementById('cancel-update-post-form');

const amenitiesContainer = newPostDialog.querySelector('#ammenities');
const imageInputs = Array.from(newPostDialog.querySelectorAll('input[name="image"]'));

const addFieldButtons = Array.from(newPostDialog.querySelectorAll('.add-field'));
const removeFieldButtons = Array.from(newPostDialog.querySelectorAll('.remove-field'));

const imageInputsCarousel = newPostDialog.querySelector('#image-inputs');
const imageInputsCarouselInner = imageInputsCarousel.querySelector('.carousel-inner');
const imageInputsCarouselIndicators = imageInputsCarousel.querySelector('.carousel-indicators');

let postTitle = document.getElementById('post-title');
let postPrice = document.getElementById('post-price');
let postDescription = document.getElementById('post-description');


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
            <label class="container border rounded d-flex align-items-center justify-content-center p-3" style="width: 300px; height: 200px;">
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


const renderAmenities = async () => {
    const response = await fetch('/amenities');
    const amenities = await response.json();

    for (const amenitie of amenities) {
        const html = `
            <label class="container border rounded shadow-sm p-3 mx-3 amenitie">
                <input id="${amenitie.id}" name="amenitie" class="d-none" value="${amenitie.id}">
                <i class="${amenitie.icon} mx-3"></i> ${amenitie.amenitie}
            </label>
        `;
        amenitiesContainer.insertAdjacentHTML('beforeend', html);
    };

    const amenitiesInputs = Array.from(document.querySelectorAll('input[name="amenitie"]'));
    amenitiesInputs.forEach(button => button.addEventListener('change', (event) => fillNewPostRadioButton(event)));
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


const loadPostEventListeners = () => {
    const newAddToCartBtns = Array.from(postsContainer.querySelectorAll('.add-to-cart'));
    const newRemoveCartItemBtnsArray = Array.from(postsContainer.querySelectorAll('.remove-cart-item'));

    newAddToCartBtns.forEach(button => {
        button.addEventListener('click', (event) => addToCart(event));
    });

    newRemoveCartItemBtnsArray.forEach(button => {
        button.addEventListener('click', (event) => removeCartItem(event));
    });
};


const cancelUpdatePostForm = () => {
    updatePostForm.style.display = 'none';
    infoDiv.style.display = 'block'
};


const editPostForm = () => {
   updatePostForm.style.display = 'block';
   infoDiv.style.display = 'none';
};


const submitUpdatePostForm = async (event) => {
    event.preventDefault();

    const response = await fetch('/update-post', {
        method: 'POST',
        body: new FormData(updatePostForm)
    });

    if (response.status !== 204) {
        loadMessage(`<b>Error Uploading</b> There's been an error updating your post`, 'danger');
        return;
    }

    const post = await response.json();

    postTitle.innerText = post.title;
    postPrice.innerText = post.price;
    postDescription.innerText = post.description;

    const tableFields = Array.from(document.querySelectorAll('.field'));
    const tableValues = Array.from(document.querySelectorAll('.value'));
    const attributesKeys = Object.keys(post.attributes);

    for (let i = 0; i < attributesKeys.length; i++) {
        tableFields[i].innerText = attributesKeys[i];
    };

    for (let i = 0; i < attributesKeys.length; i++) {
        tableValues[i].innerText = post.attributes[attributesKeys[i]];
    };

    cancelUpdatePostForm();
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


const addTableRow = (event) => {
    const parent = event.target.parentNode.parentNode;
    const fieldInput = parent.querySelector('input[name="field"]');
    const valueInput = parent.querySelector('input[name="value"]');

    const fieldInputs = Array.from(document.querySelectorAll('input[name="field"]'));
    const valueInputs =  Array.from(document.querySelectorAll('input[name="value"]'));

    for (const field of fieldInputs) {
        if (field.value === '') {
            return;
        };
    };

    for (const field of valueInputs) {
        if (field.value === '') {
            return;
        };
    };

    if (fieldInput.value && valueInput.value) {
        const newRow = tableFieldRow.cloneNode(true);
        newRow.querySelector('input[name="field"]').value = '';
        newRow.querySelector('input[name="value"]').value = '';
        newRow.addEventListener('keyup', addTableRow);
        fieldsTableBody.appendChild(newRow);
    };
};


const showNewPostDialog = () => {
    newPostDialog.showModal();
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

    newPostDialog.close();
};


const addFileInput = (event) => {
    const trigger = event.target;

    if (imagesDiv.lastChild.files && !imagesDiv.lastChild.files[0]) {
        return;
    };

    if (trigger.files && !trigger.files[0]) {
        return;
    };

    const newInput = document.createElement('input');
    newInput.type = 'file';
    newInput.className = 'form-control mb-3'
    newInput.accept = 'image/*';
    newInput.name = 'image';
    newInput.onchange = addFileInput;

    imagesDiv.appendChild(newInput);
};


const loadMessage = (msg, type) => {
    messagesContainer.innerHTML =  `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${msg}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
};


addFieldButtons.forEach(button => button.addEventListener('click', (event) => addField(event)));
removeFieldButtons.forEach(button => button.addEventListener('click', (event) => removeField(event)));
newPostBtn.addEventListener('click', showNewPostDialog);
closeNewPostDialog.addEventListener('click', () => newPostDialog.close());
imageInputs.forEach(input => input.addEventListener('change', (event) => uploadListingImage(event)));
// imageInput.addEventListener('change', addFileInput);
newPostForm.addEventListener('submit', (event) => submitNewPostForm(event));
// firstFieldInput.addEventListener('keyup', (event) => addTableRow(event));
//firstValueInput.addEventListener('keyup', (event) => addTableRow(event));
if (editPostButton) {
    editPostButton.addEventListener('click', editPostForm);
};
if (cancelUpdatePostFormButton) {
    cancelUpdatePostFormButton.addEventListener('click', cancelUpdatePostForm);
};
if (updatePostForm) {
    updatePostForm.addEventListener('submit', (event) => {
        event.preventDefault();
        submitUpdatePostForm(event);
    });
};
populateCategoryOptions();
renderAmenities();