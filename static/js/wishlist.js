const wishlist = document.getElementById('wishlist');
const wishlistItems = wishlist.querySelector('#wishlist-items');
const clearwishlistBtn = document.querySelectorAll('.clear-wishlist');
const addToWishlistBtns = Array.from(document.querySelectorAll('.add-to-wishlist'));
const removeWishlistItemBtnsArray = Array.from(document.querySelectorAll('.remove-wishlist-item'));
const wishlistDropdown = wishlist.querySelector('.wishlist-dropdown');
const wishlistTotalPrice = Array.from(document.querySelectorAll('.wishlist-total-price'));
const wishlistTotalItems = Array.from(document.querySelectorAll('.wishlist-total-items'));
const wishlistListingsContainer = document.getElementById('wishlist-listings-container');

let emptywishlist = false;


const loadEmptywishlist = (empty=false) => {
    emptywishlist = true;

    clearwishlistBtn?.forEach(button => {
        button.style.display = 'inline-block';
    })

    wishlistTotalPrice.forEach(total => total.textContent = '0');
    wishlistTotalItems.forEach(total => total.textContent = '0');

    if (empty) {
        wishlistListingsContainer.innerHTML = ``;
    }

    wishlistItems.innerHTML = `
        <h5 class="text-muted">There's nothing in your wishlist</h5> 
        It's a good time to start shopping
    `;
};


const addTowishlist = async (event) => {
    const itemId = event.target.dataset.item;

    const response = await fetch(`/add-to-wishlist/${itemId}`);
    const wishlistItem = await response.json();


    if (emptywishlist) {
        wishlistItems.innerHTML = '';
        emptywishlist = false;
    };

    wishlistItems.innerHTML += loadwishlistItem(wishlistItem);

    clearwishlistBtn?.forEach(button => {
        button.style.display = 'inline-block';
    })

    wishlistTotalPrice.forEach(total => {
        total.textContent = parseFloat(total.textContent) + parseFloat(wishlistItem.price);
    })
    wishlistTotalItems.forEach(total => total.textContent++);

    wishlistItems.style.display = 'block';

    const addTowishlistBtn = document.querySelector(`.add-to-wishlist[data-item="${itemId}"`);
    addTowishlistBtn.style.display = 'none';

    const removewishlistItemBtns = Array.from(document.querySelectorAll(`.remove-wishlist-item[data-item="${itemId}"]`));
    removewishlistItemBtns.forEach(button => { button.style.display = 'inline-block';});

    loadMessage('<strong>Listing Added To Wishlist!</strong> You can check the saved listing in your wishlist.', 'success');
};


const loadwishlistItem = (item) => {
    return `
        <li id="${item.id}">
            <div class="container row">
                <div class="col">
                    <img src="${item.images[0]}" alt="wishlist item ${item.title}" class="img-fluid">
                </div>
                <div class="col-9">
                    <div class="mb-3">
                        <a href="/post/${item.id}" class="text-decoration-none text-dark">
                            <h6>${item.title}</h6>
                        </a>
                    </div>
                    <div class="row">
                        <div class="col d-flex align-items-center justify-content-center">
                            <h5>U\$${item.price}</h5>
                        </div>
                        <div class="col">
                            <button class="btn btn-outline-danger remove-wishlist-item" data-item="${item.id}" onclick="removeWishlistItem(event)">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </a>
            <hr>
        </li>
    `
}


const removeWishlistItem = async (event) => {
    const itemId = event.target.dataset.item;
    console.log(event.target)

    const response = await fetch(`/remove-wishlist-listing/${itemId}`)
    const item = document.getElementById(`${itemId}`)

    const addTowishlistBtn = document.querySelector(`.add-to-wishlist[data-item="${itemId}"`);
    addTowishlistBtn.style.display = 'inline-block';

    const removewishlistItemBtns = Array.from(document.querySelectorAll(`.remove-wishlist-item[data-item="${itemId}"`));
    removewishlistItemBtns.forEach(button => { console.log(button); button.style.display = 'none'});

    item.remove();

    if (!wishlistItems.firstElementChild) {
        loadEmptywishlist();
    }
}


const loadwishlist = async () => {
    const response = await fetch(`/wishlist-json`);
    let wishlist = await response.json();
    let totalPrice = 0;

    if (wishlist.length == 0) {
        loadEmptywishlist();
        return;
    }

    wishlist.forEach(item => {
        wishlistItems.innerHTML += loadwishlistItem(item);
        totalPrice += parseFloat(item.price);
    });

    wishlistTotalPrice.forEach(total => {
        total.textContent = totalPrice;
    });

    wishlistTotalItems.forEach(total => {
        total.textContent = wishlist.length;
    });

    clearwishlistBtn?.forEach(button => {
        button.style.display = 'inline-block';
    })
}


const clearwishlist = async (empty=false) => {
    const response = await fetch('/clear-wishlist');
    while (wishlistItems.firstElementChild) {
        wishlistItems.firstElementChild.remove();
    }

    loadEmptywishlist(empty);
    loadMessage('<bWishlist cleared</b> You can start adding items to your wishlist!', 'info');

    addToWishlistBtns.forEach(button => button.style.display = 'inline-block');
    removeWishlistItemBtnsArray.forEach(button => button.style.display = 'none');
}


clearwishlistBtn.forEach(button => {
    button.addEventListener('click', () => button.dataset.wishlist ? clearwishlist(true) : clearwishlist());
});
addToWishlistBtns.forEach(button => {
    button.addEventListener('click', (event) => addTowishlist(event));
})
removeWishlistItemBtnsArray.forEach(button => {
    console.log(button);
    button.addEventListener('click', (event) => removeWishlistItem(event));
})

loadwishlist();

/*if (!localStorage.getItem('wishlist')) {
    localStorage.setItem('wishlist', "[]")
}


const addTowishlist = async (event) => {
    const item = event.target.dataset.post;
    let items = JSON.parse(localStorage.getItem('wishlist'))
 
    // Check if item already in wishlist
    const isInwishlist = items.find(e => e.id === item)
    if (isInwishlist) {
        return;
    }

    const response = await fetch(`/post-json/${item}`);
    const itemJSON = await response.json();

    items.push(itemJSON);
    localStorage.setItem('wishlist', JSON.stringify(items));

    wishlistItems.innerHTML += loadwishlistItem(itemJSON);
    clearwishlistBtn.style.display = 'inline-block';
    loadMessage('<strong>Item Added To wishlist!</strong> You can check the saved item in your wishlist.', 'success')
}

const populatewishlist = async () => {
    const items = JSON.parse(localStorage.getItem('wishlist'));

    if (items.length) {
        clearwishlistBtn.style.display = 'inline-block';
    }

    for (const item of items) {
        wishlistItems.innerHTML += loadwishlistItem(item)
    }
}



populatewishlist();


clearwishlistBtn.addEventListener('click', () => {
    localStorage.setItem('wishlist', '[]')
    wishlistItems.innerHTML = '';
    clearwishlistBtn.style.display = 'none';
})*/
