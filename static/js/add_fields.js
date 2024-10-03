const addFieldButtons = Array.from(document.querySelectorAll('.add-field'));
const removeFieldButtons = Array.from(document.querySelectorAll('.remove-field'));


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


addFieldButtons.forEach(button => button.addEventListener('click', (event) => addField(event)));
removeFieldButtons.forEach(button => button.addEventListener('click', (event) => removeField(event)));