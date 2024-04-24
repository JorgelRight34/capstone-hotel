const reserveForm = document.getElementById('reserve-form');
const checkInInput = reserveForm.querySelector('#check-in');
const checkOutInput = reserveForm.querySelector('#check-out');
const guestsForm = reserveForm.querySelector('#guests');

const guestsDropdownForm = reserveForm.querySelector('#guests-dropdown-form');
const reserveButton = reserveForm.querySelector('#reserve-button');
const stripeButton = reserveForm.querySelector('#stripe-button');

const addGuests = Array.from(reserveForm.querySelectorAll('.add-guests'));
const removeGuests = Array.from(reserveForm.querySelectorAll('.remove-guests'));
const guestsText = reserveForm.querySelector('#guests-text');
const guests = {
    adults: {
        quantity: 1,
        input: reserveForm.querySelector('input[name="adults"]')
    },
    children: {
        quantity: 0,
        input: reserveForm.querySelector('input[name="children"]')
    },
    infants: {
        quantity: 0,
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


const addGuest = (event) => {
    const guestsType = event.target.dataset.guestsType;
    const guestsNumber = reserveForm.querySelector(`#${guestsType}-number`);
    guests[`${guestsType}`].quantity = Number(guestsNumber.textContent) + 1;

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

    // Avoid checking in after checkout
    if (checkIn >= checkOut) {
        loadMessage("<b>Invalid stay</b> check in date can't be later than check out.", 'danger');
        return false;
    }

    // Avoid checking in or checking out before today
    if (checkIn <= currentDate || checkOut <= currentDate) {
        loadMessage("<b>Invalid stay</b> check in can't be in the past nor check out.", 'danger')
        return false;
    }

    reserveForm.submit();
};


const submitReserveForm = async (event) => {
    event.preventDefault();

    if (!validateReserveForm()) {
        return;
    };

    const formData = new FormData(reserveForm);
    const response = await fetch(`/reserve/${reserveForm.dataset.listing}`, { method: 'POST', body: formData});

    if (response.status !== 204) {
        loadMessage("<b>Failed Payment</b> there was an issue with the payment, please try again.", 'danger');
    }
};


const setMinAndMaxDates = () => {
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate() + 1).padStart(2, '0');
    const formatedDate = `${year}-${month}-${day}`;

    checkInInput.min = formatedDate
    checkOutInput.min = formatedDate
};


setMinAndMaxDates();
reserveButton.addEventListener('click', (event) => validateReserveForm(event));
guestsForm.onclick = showGuestsDropdownForm;
addGuests.forEach(button => button.addEventListener('click', (event) => addGuest(event)));
removeGuests.forEach(button => button.addEventListener('click', (event) => removeGuest(event)));