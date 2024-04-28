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

let postTitle = document.getElementById('post-title');
let postPrice = document.getElementById('post-price');
let postDescription = document.getElementById('post-description');


const renderAmenities = async () => {
    const response = await fetch('/amenities');
    const amenities = await response.json();

    for (const amenitie of amenities) {
        const html = `
            <label class="container border rounded shadow-sm p-3 mx-3 amenitie">
                <input type="radio" id="${amenitie.id}" name="amenitie" class="d-none" value="${amenitie.amenitie}">
                <i class="${amenitie.icon} mx-3"></i> ${amenitie.amenitie}
            </label>
        `;
        amenitiesContainer.insertAdjacentHTML('beforeend', html);
    };

    const amenitiesRadioButtons = Array.from(document.querySelectorAll('input[name="amenitie"]'));
    amenitiesRadioButtons.forEach(button => button.addEventListener('click', (event) => fillNewPostRadioButton(event)));

}

const fillNewPostRadioButton = (event) => {
    const button = event.target.parentNode
    console.log("Color: ", button.style.color);
    console.log(button)

    if (button.style.color !== 'black') {
        button.style.color = 'black';
        button.style.backgroundColor = '#ccc';
        button.style.border = '2px solid black';
    } else {
        button.style.color = '#666666'
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
    }

    newPostFormTitle.value = '';
    newPostFormDescription.value = '';
    newPostFormPrice.value = '';
    imageInput.value = '';
    /*firstFieldInput.value = '';
    firstValueInput.value = '';

    const fileInputs = Array.from(document.querySelectorAll('input[name="image"]'));
    const fieldInputs = Array.from(document.querySelectorAll('input[name="field"]'));
    const valueInputs = Array.from(document.querySelectorAll('input[name="value"]'));


    for (let i = 1; i < fileInputs.length; i++) {
        fileInputs[i].remove();
    };

    for (let i = 1; i < fieldInputs.length; i++) {
        fieldInputs[i].parentNode.remove();
        fieldInputs[i].remove();
    };

    for (let i = 1; i < valueInputs.length; i++) {
        valueInputs[i].parentNode.remove();
        valueInputs[i].remove();
    };*/

    loadMessage('Post succesfully uploaded', 'success');

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


newPostBtn.addEventListener("click", showNewPostDialog);
closeNewPostDialog.addEventListener("click", () => newPostDialog.close());
imageInput.addEventListener('change', addFileInput);
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