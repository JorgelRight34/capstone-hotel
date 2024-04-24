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
const selectOrderOption = document.querySelector('select[name="select-order"]');

const searchPostInput = document.getElementById('search-post');
let posts = Array.from(postsContainer.querySelectorAll('.post-widget'));

let posts_page = 1;
let comments_page = 1;


// Get username
const currentURL = window.location.href;
const url = new URL(currentURL);
const username = url.pathname.split('/')[2];


const searchPosts = () => {
    const query = searchPostInput.value.toUpperCase();
    const results = posts.filter(post => {
        let postTitle = post.querySelector('.title').innerText.toUpperCase();
        let postDescription = post.querySelector('.description').innerText.toUpperCase();


        if (postTitle.includes(query) || postDescription.includes(query)) {
            return true;
        };
    });

    reloadPosts(results);
}


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
    reloadPosts(posts);
}


const loadPosts = async () => {
    const currentURL = window.location.href;
    const url = new URL(currentURL);
    const username = url.pathname.split('/')[1];

    const response = await fetch(`user-posts/${username}`)
    posts = response.json();

    posts.forEach(post => postsContainer.innerHTML += loadPost(post));
}


const loadPost = (post) => {
    return `
        <div class="bg-white rounded border shadow-sm mb-3 p-0 post-widget">
            <div class="col p-0 post-image-col">
                <div class="cart-buttons">
                    <div class="white-circle shadow-sm">
                        {% if post.is_in_cart %}
                            <i class="fa-regular fa-heart add-to-cart" data-item="{{ post.id }}" style="display: none;"></i>
                            <i class="fa-solid fa-heart remove-cart-item" data-item="{{ post.id }}"></i>
                        {% else %}
                            <i class="fa-regular fa-heart add-to-cart" data-item="{{ post.id }}"></i>
                            <i class="fa-solid fa-heart remove-cart-item" data-item="{{ post.id }}" style="display: none;"></i>
                        {% endif %}
                    </div>
                </div>
                {% if post.images.all|length > 1 %}
                    <div id="post-{{ post.id }}-images-carousel" class="carousel slide">
                        <div class="carousel-indicators">
                            <button type="button" data-bs-target="#post-{{ post.id }}-images-carousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
                            {% for image in post.images.all|slice:"1:" %}
                                <button type="button" data-bs-target="#post-{{ post.id }}-images-carousel" data-bs-slide-to="{{ forloop.counter }}" aria-label="Slide {{ forloop.counter|add:1 }}"></button>
                            {% endfor %}
                            </div>
                        <div class="carousel-inner">
                            <div class="carousel-item active bg-dark">
                                <div>
                                    <img src="{{ post.images.all.0.image.url }}" class="d-block img-fluid post-widget-image" alt="{{ post.title }}">
                                </div> 
                            </div>
                            {% for image in post.images.all|slice:"1:" %}
                                <div class="carousel-item bg-dark">
                                    <div>
                                        <img src="{{ image.image.url }}" class="d-block img-fluid" alt="{{ post.title }}">
                                    </div>
                                </div>
                            {% endfor %}
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#post-{{ post.id }}-images-carousel" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#post-{{ post.id }}-images-carousel" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>
                {% else %}
                    <div class="d-flex justify-content-center bg-dark">
                        <img src="{{ post.images.all.0.image.url }}" class="d-block img-fluid"  alt="{{ post.title }}">
                    </div>
                {% endif %}
            </div>
            <div class="col-9 p-3">
                <div class="mb-3">
                    <span class="category text-muted">{{ post.category }}</span>
                </div>
                <div class="mb-3">
                    <a href="{% url 'post_details' post.id %}" class="text-decoration-none text-dark title">
                        <h6>
                            {% if post.title|length >= 60 %}
                                {{ post.title|slice:":60" }}...
                            {% else %}
                                {{ post.title }}
                            {% endif %}
                        </h6>
                    </a>
                </div>
                <div class="mb-3">
                    <h6><b>U$</b> <b class="price">{{ post.price }}</b></h6>
                </div>
                <div class="mb-3 description">
                    {% if post.description|length >= 63 %}
                        {{ post.description|slice:":60" }}...
                    {% else %}
                        {{ post.description }}
                    {% endif %}
                </div>
                <div class="date d-none">
                    {{ post.date|date:"Y-m-d"}}
                </div>
            </div>
    </div>
    `
}


const reloadPosts = (posts) => {
    postsContainer.innerHTML = ''
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


const loadMoreUserPosts = async () => {
    if (Math.round(window.innerHeight + window.scrollY)  >= document.body.offsetHeight) {
        // Check if user is in #posts section
        if (window.location.href !== '#posts') {
            return;
        }

        // Load more items when scrolled to the bottom
        posts_page += 1;
        const response = await fetch(`/user-posts/${username}?page=${posts_page}`);

        if (response.status === 404) {
            return;
        }
        
        const posts = await response.json();

        for (const post in posts) {
            postsContainer.insertAdjacentHTML('beforeend', posts[post]);
        }

        loadPostEventListeners();
    }
}


const loadMoreUserComments = async () => {
   if (Math.round(window.innerHeight + window.scrollY)  >= document.body.offsetHeight) {
        if (window.location.hash !== '#comments') {
            return;
        }

        const response = await fetch(`/user-comments/${username}?page=${comments_page}`)
        const comments = await response.json();

        for (const comment in comments) {
            sections['#comments'].insertAdjacentHTML('beforeend', comments[comment]);
        }
    }
}


window.onscroll = loadMoreUserPosts
window.onscroll = loadMoreUserComments

if (selectOrderOption) {
    selectOrderOption.addEventListener('change', () => orderPosts(selectOrderOption.value));
}
if (searchPostInput) {
    searchPostInput.addEventListener('keyup', searchPosts);
}

links.forEach(link => {
    if (link) {
        link.addEventListener('click', () => {
            resetLinks();
            changeSection();
        })
    }
})
