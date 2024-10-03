let reserveForm = document.getElementById('reserve-form') || document;
const checkInInput = reserveForm.querySelector('#check-in');
const checkOutInput = reserveForm.querySelector('#check-out');
const guestsForm = reserveForm.querySelector('#guests');
const maxGuests = parseInt(reserveForm.querySelector('input[name="max-guests"]').value)

const guestsDropdownForm = reserveForm.querySelector('#guests-dropdown-form');
const reserveButton = reserveForm.querySelector('#reserve-button');
const stripeButton = reserveForm.querySelector('#stripe-button');

const addGuests = Array.from(reserveForm.querySelectorAll('.add-guests'));
const removeGuests = Array.from(reserveForm.querySelectorAll('.remove-guests'));
const guestsText = reserveForm.querySelector('#guests-text');
let totalGuests = 1;
const guests = {
    adults: {
        quantity: reserveForm.querySelector('input[name="adults"]').value || 1,
        input: reserveForm.querySelector('input[name="adults"]')
    },
    children: {
        quantity: reserveForm.querySelector('input[name="children"]').value || 0,
        input: reserveForm.querySelector('input[name="children"]')
    },
    infants: {
        quantity: reserveForm.querySelector('input[name="infants"]').value || 0,
        input: reserveForm.querySelector('input[name="infants"]')
    }
};


const updateGuestText = () => {
    let text = ''

    if (guests.adults.quantity) {
        text += `${guests.adults.quantity} adults`;
    }
    if (guests.children.quantity) {
        text += `, ${guests.children.quantity} children`;
    }
    if (guests.infants.quantity) {
        text += `, ${guests.infants.quantity} infants`;
    }
    
    guestsText.textContent = text;
};


const limitTotalGuests = () => {
    if (totalGuests > maxGuests) {
        return false;
    }
    return true;
}

const addGuest = (event) => {
    const guestsType = event.target.dataset.guestsType;
    const guestsNumber = reserveForm.querySelector(`#${guestsType}-number`);
    if (totalGuests + 1 > maxGuests) {
        return;
    }

    const quantity = Number(guestsNumber.textContent) + 1;
    guests[`${guestsType}`].quantity = quantity;
    totalGuests++;

    guestsNumber.textContent = guests[`${guestsType}`].quantity;
    guests[`${guestsType}`].input.value = guests[`${guestsType}`].quantity;

    updateGuestText();
};


const removeGuest = (event) => {
    const guestsType = event.target.dataset.guestsType;
    const guestsNumber = reserveForm.querySelector(`#${guestsType}-number`);
    guests[`${guestsType}`].quantity = Number(guestsNumber.textContent) - 1;
    if (guestsType === 'adults') {
        if (guests[`${guestsType}`].quantity === 0) {
            guests[`${guestsType}`].quantity = 1;
            return;
        };
    }
    if (guests[`${guestsType}`].quantity < 0) {
        return;
    };
    totalGuests--;

    guestsNumber.textContent = guests[`${guestsType}`].quantity;
    guests[`${guestsType}`].input.value = guests[`${guestsType}`].quantity;

    updateGuestText();
};


const showGuestsDropdownForm = () => {
    if (guestsDropdownForm.style.display !== 'block') {
        guestsDropdownForm.style.display = 'block';
    } else {
        guestsDropdownForm.style.display = 'none';
    }
}

const validateReserveForm = async (event) => {
    if (!reserveForm.checkValidity()) {
        reserveForm.reportValidity();
        return;
    };
    
    const checkIn = new Date(checkInInput.value);
    const checkOut = new Date(checkOutInput.value);
    const currentDate = new Date();

    // Avoid checking in after or at the same time of checkout
    console.log(checkIn)
    console.log(checkOut)
    if (checkIn == checkOut) {
        loadMessage("<b>Invalid stay</b> check in date can't be on the same day of check out.", 'danger');
        return false;
    }

    if (checkIn > checkOut) {
        loadMessage("<b>Invalid stay</b> check in date can't be later than check out.", 'danger');
        return false;
    }

    // Avoid checking in or checking out before today
    if (checkIn <= currentDate || checkOut <= currentDate) {
        console.log(checkIn, currentDate)
        console.log(checkIn <= currentDate)
        console.log(checkOut <= currentDate)
        loadMessage("<b>Invalid stay</b> check in can't be in the past nor the present neither check out.", 'danger')
        return false;
    }

    reserveForm.submit();
};


const submitReserveForm = async (event) => {
    event.preventDefault();
    alert('hey')
    if (!validateReserveForm()) {
        return;
    };

    const formData = new FormData(reserveForm);
    const response = await fetch(`/reserve/${reserveForm.dataset.listing}`, { method: 'POST', body: formData});

    if (response.status !== 204) {
        loadMessage("<b>Failed Payment</b> there was an issue with the payment, please try again.", 'danger');
    }
};


updateGuestText();
if (reserveButton) {
    reserveButton.addEventListener('click', (event) => validateReserveForm(event));
};

let tomorrow = new Date();

// Add one day
tomorrow.setDate((new Date()).getDate() + 1);

// Convert the date to YYYY-MM-DD format
tomorrow = tomorrow.toISOString().split('T')[0];

let afterTomorrow = new Date();

// Add one day
afterTomorrow.setDate((new Date()).getDate() + 2);

// Convert the date to YYYY-MM-DD format
afterTomorrow = afterTomorrow.toISOString().split('T')[0];

if (!checkInInput.value) {
    checkInInput.min = tomorrow;
}
if (!checkOutInput.value) {
    checkOutInput.min = afterTomorrow;
}
guestsForm.onclick = showGuestsDropdownForm;
addGuests.forEach(button => button.addEventListener('click', (event) => addGuest(event)));
removeGuests.forEach(button => button.addEventListener('click', (event) => removeGuest(event)));