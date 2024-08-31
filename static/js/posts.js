const messagesContainer = document.getElementById('messages-container');

const fieldsTable = document.getElementById('field-inputs');
const fieldsTableBody = document.getElementById('fields-table-body');
const firstFieldInput = document.querySelector('input[name="field"]');
const firstValueInput = document.querySelector('input[name="value"]');
const tableFieldRow = document.querySelector('.table-field-row');

const editPostButton = document.querySelector('.edit-post');
const infoDiv = document.getElementById('info');
const updatePostForm = document.getElementById('update-post-form');
const cancelUpdatePostFormButton = document.getElementById('cancel-update-post-form');


let postTitle = document.getElementById('post-title');
let postPrice = document.getElementById('post-price');
let postDescription = document.getElementById('post-description');


const loadPostEventListeners = () => {
    const newAddTowishlistBtns = Array.from(postsContainer.querySelectorAll('.add-to-wishlist'));
    const newRemoveWishlistItemBtnsArray = Array.from(postsContainer.querySelectorAll('.remove-wishlist-item'));

    newAddTowishlistBtns.forEach(button => {
        button.addEventListener('click', (event) => addTowishlist(event));
    });

    newRemoveWishlistItemBtnsArray.forEach(button => {
        button.addEventListener('click', (event) => removewishlistItem(event));
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

    if (response.status !== 200) {
        loadMessage(`<b>Error Uploading</b> There's been an error updating your post`, 'danger');
        return;
    }

    const post = await response.json();

    postTitle.innerText = post.title;
    postPrice.innerText = post.price;
    postDescription.innerText = post.description;

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
if (updatePostForm) {
    updatePostForm.addEventListener('submit', (event) => {
        event.preventDefault();
        submitUpdatePostForm(event);
    });
};