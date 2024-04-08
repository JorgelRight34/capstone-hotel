const cart = document.getElementById('cart');
const cartItems = cart.querySelector('#cart-items')
const clearCartBtn = cart.querySelector('#clear-cart');
const addToCartBtns = Array.from(document.querySelectorAll('.add-to-cart'));
const messagesContainer = document.getElementById('messages-container')
const removeCartItemBtnsArray = Array.from(document.querySelectorAll('.remove-cart-item'));
const cartDropdown = cart.querySelector('.cart-dropdown')

let emptyCart = false;


const loadEmptyCart = () => {
    emptyCart = true;
    clearCartBtn.style.display = 'none';
    cartItems.innerHTML = `
            <h5 class="text-muted">There's nothing in your cart</h5> 
            It's a good time to start shopping
        `;
}


const addToCart = async (event) => {
    const itemId = event.target.dataset.item;
    const response = await fetch(`/add-to-cart/${itemId}`);
    const cartItem = await response.json();

    if (emptyCart) {
        cartItems.innerHTML = '';
        emptyCart = false;
    };

    cartItems.innerHTML += loadCartItem(cartItem);
    clearCartBtn.style.display = 'inline-block';
    // cartDropdown.style.height = 'auto';
    cartItems.style.display = 'block'; // Change this line

    const removeCartItemBtns = Array.from(document.querySelectorAll(`.remove-cart-item[data-item="${itemId}"]`));
    removeCartItemBtns.forEach(button => button.style.display = 'inline-block');

    event.target.style.display = 'none';

    loadMessage('<strong>Item Added To Cart!</strong> You can check the saved item in your cart.', 'success');
}


const loadCartItem = (item) => {
    return `
        <li id="${item.id}">
                <div class="container row">
                    <div class="col">
                        <img src="${item.images[0]}" alt="cart item ${item.title}" class="img-fluid">
                    </div>
                    <div class="col-9">
                        <div class="mb-3">
                            <a href="/post/${item.id}" class="text-decoration-none text-dark">
                                <h3>${item.title}</h3>
                            </a>
                        </div>
                        <div class="mb-3">
                            <h2>U\$${item.price}</h2>
                        </div>
                        <button class="btn btn-outline-danger remove-cart-item" data-item="${item.id}" onclick="removeCartItem(event)">Remove</button>
                    </div>
                </div>
            </a>
            <hr>
        </li>
    `
}


const removeCartItem = async (event) => {
    const itemId = event.target.dataset.item;

    const response = await fetch(`/remove-cart-item/${itemId}`)
    const item = document.getElementById(`${itemId}`)

    const addToCartBtn = document.querySelector(`.add-to-cart[data-item="${itemId}"`);
    addToCartBtn.style.display = 'inline-block';

    const removeCartItemBtns = Array.from(document.querySelectorAll(`.remove-cart-item[data-item="${itemId}"`));
    removeCartItemBtns.forEach(button => button.style.display = 'none');

    item.remove();

    if (!cartItems.firstElementChild) {
        loadEmptyCart();
    }
}


const loadCart = async () => {
    const response = await fetch(`/cart-json`);
    let cart = await response.json();

    cart.forEach(item => cartItems.innerHTML += loadCartItem(item));
    if (cart.length == 0) {
        loadEmptyCart();
    }
}


const clearCart = async () => {
    const response = await fetch('/clear-cart');
    while (cartItems.firstElementChild) {
        cartItems.firstElementChild.remove();
    }
    // cartDropdown.style.display = 'none';
    loadEmptyCart();

    addToCartBtns.forEach(button => button.style.display = 'inline-block');
    removeCartItemBtnsArray.forEach(button => button.style.display = 'none');
}


clearCartBtn.addEventListener('click', clearCart);
addToCartBtns.forEach(button => {
    button.addEventListener('click', (event) => addToCart(event));
})
removeCartItemBtnsArray.forEach(button => {
    button.addEventListener('click', (event) => removeCartItem(event));
})

loadCart();

/*if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', "[]")
}


const addToCart = async (event) => {
    const item = event.target.dataset.post;
    let items = JSON.parse(localStorage.getItem('cart'))
 
    // Check if item already in cart
    const isInCart = items.find(e => e.id === item)
    if (isInCart) {
        return;
    }

    const response = await fetch(`/post-json/${item}`);
    const itemJSON = await response.json();

    items.push(itemJSON);
    localStorage.setItem('cart', JSON.stringify(items));

    cartItems.innerHTML += loadCartItem(itemJSON);
    clearCartBtn.style.display = 'inline-block';
    loadMessage('<strong>Item Added To Cart!</strong> You can check the saved item in your cart.', 'success')
}

const populateCart = async () => {
    const items = JSON.parse(localStorage.getItem('cart'));

    if (items.length) {
        clearCartBtn.style.display = 'inline-block';
    }

    for (const item of items) {
        cartItems.innerHTML += loadCartItem(item)
    }
}



populateCart();


clearCartBtn.addEventListener('click', () => {
    localStorage.setItem('cart', '[]')
    cartItems.innerHTML = '';
    clearCartBtn.style.display = 'none';
})*/
