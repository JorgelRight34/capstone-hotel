const wallpaper = document.getElementById('wallpaper');
const profileWallpaper = document.querySelector('input[name="wallpaper"]');

const sections = {
    "#about": document.getElementById('about'),
    "#posts" : document.getElementById('posts'),
    "#comments" : document.getElementById('comments')
};

const aboutLink = document.getElementById('about-link');
const postsLink = document.getElementById('posts-link');
const commentsLink = document.getElementById('comments-link');

const links = [aboutLink, postsLink, commentsLink];
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


const loadPosts = () => {
    while (postsContainer.firstChild) {
        postsContainer.firstChild.remove();
    }
    posts.forEach(post => postsContainer.appendChild(post));
}


const resetLinks = () => {
    links.forEach(link => {
        link.classList.remove('active');
        const section = link.id.replace(/-link/, "");
        sections[`#${section}`].classList.add('d-none');
    })

}


const changeSection = () => {
    const link = event.target;
    link.classList.toggle('active');
    const section = link.id.replace(/-link/, "");

    sections[`#${section}`].classList.toggle('d-none');
}


links.forEach(link => link.addEventListener("click", () => {
    resetLinks();
    changeSection();
}));

selectOrderOption.addEventListener('change', () => orderPosts(selectOrderOption.value));
wallpaper.style.backgroundImage = `url(${profileWallpaper.value})`;