const commentForm = document.getElementById('comment-form');
const commentTextArea = document.getElementById('comment-textarea');
const commentsContainer = document.getElementById('comments-container');


const submitCommentForm = async (event) => {
    event.preventDefault()

    comment = await fetch(`/comment/${commentForm.dataset.post}`, {
        method: 'POST',
        body: new FormData(commentForm)
    })
    
    comment = await comment.json();
    commentTextArea.value = ''

    const newComment = `
        <div class="container border p-3 rounded bg-white mb-3 sm-shadow">
            <div> 
                <img src="${comment["author"]["profile_pic"]}" class="profile-pic">
                <a class="text-decoration-none mx-3" href="/profile/${comment["author"]["username"]}">${comment["author"]["username"]}</a>
                <span class="text-muted mx-3">${comment["full-date"]}</span>
            </div>
            <hr>
            <div class="mb-3">
                <p>${comment["comment"]}</p>
            </div>
        </div>
    `
    commentsContainer.insertAdjacentHTML('afterbegin', newComment);
}


commentForm.addEventListener('submit', (event) => submitCommentForm(event));