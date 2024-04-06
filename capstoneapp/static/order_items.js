const postsContainer = document.querySelector('.posts-container');
const posts = Array.from(document.querySelectorAll('.post-widget'));
const selectOrderOption = document.querySelector('select[name="select-order"]');


const orderPosts = (value) => {
    switch (value) {
        case 'date':
            posts.sort((a, b) => {
                const aDate = new Date(a.querySelector('.date').innerText);
                const bDate = new Date(b.querySelector('.date').innerText);
            
                return aDate - bDate;
            })
            break;

        case 'price':
            posts.sort((a, b) => {
                const aPrice = parseFloat(a.querySelector(`.price`).innerText);
                const bPrice = parseFloat(b.querySelector('.price').innerText);

                return aPrice - bPrice;
            })
            break;
        case 'category':
            posts.sort((a, b) => {
                const aCategory = a.querySelector('.category').innerText;
                const bCategory = b.querySelector('.category').innerText;

                return aCategory.localeCompare(bCategory);
            });
            break;
    }

    loadPosts();
}