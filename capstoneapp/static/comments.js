const commentForm = document.getElementById('comment-form');
const commentTextArea = document.getElementById('comment-textarea');
const commentsContainer = document.getElementById('comments-container');
const deleteCommentButtons = Array.from(document.querySelectorAll('.delete-comment'));


const deleteComment = async (event) => {
    const result = confirm('Are you sure you want to delete this comment?')
    console.log(event.target)
    if (result) {
        const commentId = event.target.dataset.comment;
        const comment = document.querySelector(`#comment-${commentId}`);
        const response = await fetch(`/delete-comment/${commentId}`);
        comment.remove();
        loadMessage('<b>Deleted comment</b> Your comment has been deleted!', 'danger');
    }
}


const submitCommentForm = async (event) => {
    event.preventDefault()

    comment = await fetch(`/comment/${commentForm.dataset.post}`, {
        method: 'POST',
        body: new FormData(commentForm)
    })
    
    comment = await comment.json();
    commentTextArea.value = ''

    const newComment = `
        <div class="container border p-3 rounded bg-white mb-3 sm-shadow" id="comment-${comment.id}">
            <div> 
                <img src="${comment["author"]["profile_pic"]}" class="profile-pic">
                <a class="text-decoration-none mx-3" href="/profile/${comment["author"]["username"]}">${comment["author"]["username"]}</a>
                <span class="text-muted mx-3">${comment["full-date"]}</span>
            </div>
            <hr>
            <div class="mb-3">
                <p>${comment["comment"]}</p>
            </div>
            <div class="d-flex justify-content-end">
                <button class="btn btn-danger delete-comment" data-comment="${comment.id}" onclick="deleteComment()">Delete</button>
            </div>
        </div>
    `
    commentsContainer.insertAdjacentHTML('afterbegin', newComment);
}


if (commentForm) {
    commentForm.addEventListener('submit', (event) => submitCommentForm(event));
};
deleteCommentButtons.forEach(button => button.addEventListener('click', (event) => deleteComment(event)));