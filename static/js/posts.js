const messagesContainer = document.getElementById('messages-container');

const fieldsTable = document.getElementById('field-inputs');
const fieldsTableBody = document.getElementById('fields-table-body');
const firstFieldInput = document.querySelector('input[name="field"]');
const firstValueInput = document.querySelector('input[name="value"]');
const tableFieldRow = document.querySelector('.table-field-row');

const editPostButton = document.querySelector('.edit-post');
const infoDiv = document.getElementById('info');
const updatePostForm = document.getElementById('update-post-form');
const updatePostAmmenitiesForm = document.getElementById('update-post-ammenities-form')
const updatePostAmmenities = document.getElementById('update-post-ammenities');
const cancelUpdatePostFormButton = document.getElementById('cancel-update-post-form');
const categorySelect = document.getElementById('category-select');


let postTitle = document.getElementById('post-title');
let postPrice = document.getElementById('post-price');
let postDescription = document.getElementById('post-description');
let postGuests = document.getElementById('post-guests');
let postBedrooms = document.getElementById('post-bedrooms');
let postBeds = document.getElementById('post-beds');
let postBathrooms = document.getElementById('post-bathrooms');
const postAmmenities = document.getElementById('post-amenities');


const loadPostEventListeners = () => {
    const newAddTowishlistBtns = Array.from(postsContainer.querySelectorAll('.add-to-wishlist'));
    const newRemoveWishlistItemBtnsArray = Array.from(postsContainer.querySelectorAll('.remove-wishlist-item'));

    newAddTowishlistBtns.forEach(button => {
        button.addEventListener('click', (event) => addTowishlist(event));
    });

    newRemoveWishlistItemBtnsArray.forEach(button => {
        button.addEventListener('click', (event) => removeWishlistItem(event));
    });
};


const fillNewPostRadioButton = (event, id) => {
    const button = event.target.parentNode;

    if (button.style.color !== 'black') {
        button.style.color = 'black';
        button.style.backgroundColor = '#ccc';
        button.style.border = '2px solid black';
        updatePostForm.insertAdjacentHTML('beforeend', `<input type="hidden" name="amenitie" value="${id}">`)
    } else {
        button.style.color = '#666666'
        button.style.border = '';
        button.style.backgroundColor = '#ffffff';
        button.style.border = '';
        updatePostForm.querySelector(`input[name="amenitie"][value="${id}"]`).remove();
    };

};

const renderAmenities = async () => {
    const response = await fetch('/amenities');
    const amenities = await response.json();

    let selectedAmenities = Array.from(document.querySelectorAll('input[name="post-amenitie"]'));
    selectedAmenities = selectedAmenities.map(amenitie => {
        updatePostForm.insertAdjacentHTML('beforeend', `<input type="hidden" name="amenitie" value="${amenitie.value}">`);
        return amenitie.value;
    });

    for (const amenitie of amenities) {
        const html = `
            <label 
                class="container border rounded shadow-sm p-3 mx-3 mb-3 amenitie w-25"
                 ${selectedAmenities.filter(a => a == amenitie.id).length > 0 ? 'style="color: black; background-color: #ccc; border: 2px solid black"' : ''}
            >
                <input 
                    type="checkbox" 
                    class="d-none" 
                    id="${amenitie.id}" 
                    name="amenitie" 
                    value="${amenitie.id}" 
                >
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
        updatePostAmmenities.insertAdjacentHTML('beforeend', html);
    };

    const amenitiesInputs = Array.from(document.querySelectorAll('input[name="amenitie"]'));
    amenitiesInputs.forEach(button => button.addEventListener('change', (event) => fillNewPostRadioButton(event, button.value)));
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

const cancelUpdatePostForm = () => {
    updatePostForm.style.display = 'none';
    infoDiv.style.display = 'block'
};


const editPostForm = () => {
   updatePostForm.style.display = 'block';
   updatePostAmmenitiesForm.style.display = 'block'
   postAmmenities.style.display = 'none';
   renderAmenities();
   populateCategoryOptions();
   infoDiv.style.display = 'none';
};


const submitUpdatePostForm = async (event) => {
    event.preventDefault();

    const response = await fetch('/update-post', {
        method: 'POST',
        body: new FormData(updatePostForm)
    });

    if (response.status !== 200) {
        loadMessage(`<b>Error Uploading</b> There's been an error updating your post`, 'danger');
        return;
    }

    const post = await response.json();

    console.log(post)

    postTitle.innerText = post.title;
    postPrice.innerText = post.price;
    postDescription.innerText = post.description;
    postGuests.innerText = post.guests;
    postBedrooms.innerText = post.bedrooms;
    postBeds.innerText = post.beds;
    postBathrooms.innerText = post.bathrooms;

    cancelUpdatePostForm();
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


// imageInput.addEventListener('change', addFileInput);
// firstFieldInput.addEventListener('keyup', (event) => addTableRow(event));
//firstValueInput.addEventListener('keyup', (event) => addTableRow(event));
if (editPostButton) {
    editPostButton.addEventListener('click', editPostForm);
};
if (cancelUpdatePostFormButton) {
    cancelUpdatePostFormButton.addEventListener('click', cancelUpdatePostForm);
};
/*
if (updatePostForm) {
    updatePostForm.addEventListener('submit', (event) => {
        event.preventDefault();
        submitUpdatePostForm(event);
    });
};
*/