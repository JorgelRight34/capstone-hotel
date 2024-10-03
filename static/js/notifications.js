const notificationsDropdown = document.getElementById('notifications-dropdown');
const notificationsNumber = document.getElementById('notifications-number');
let notificationsLength = 0;


const deleteNotification = async (event, type, notification) => {
    event.stopPropagation();
    const response = await fetch(`/delete-notification/${type}/${notification}`);
    const notificationLi = notificationsDropdown.querySelector(`li[data-notification="${notification}"]`);
    notificationsLength--;
    notificationsNumber.innerText = notificationsLength;
    notificationLi.remove()
};


const loadNotifications = async () => {
    const response = await fetch(`/notifications`);
    const notifications = await response.json();
    
    if (notifications.length === 0) {
        return
    }

    notificationsNumber.style.display = 'block'
    notificationsLength = notifications.length;
    notificationsNumber.innerText = notificationsLength;

    for (const notification of notifications) {
        notificationsDropdown.insertAdjacentHTML('beforeend', renderNotification(notification));
    };
};


const renderNotification = (notification) => {
    let msg = '';
    switch (notification.type) {
        case 'accepted_request':
            msg = `${notification.notificator.username} has accepted your request for ${notification.notification.listing.title}`
            break 
        case 'request_to_book':
            msg = `Has requested to book ${notification.notification.listing.title}`
            break
        case 'comment':
            msg = `Has commented about ${notification.notification.listing.title}`
            break
    }

    return `
        <li class="dropdown-item" data-notification="${notification.id}">
            <a class="text-decoration-none text-dark" href="/post/${notification.notification.listing.id}">
                <img class="profile-pic" src="${notification.notificator.profile_pic}">
                ${msg}
                <button 
                    type="button" 
                    class="btn-close delete-notification" 
                    data-bs-dismiss="alert"
                    aria-label="Close" 
                    onclick="deleteNotification(event, '${notification.type}', '${notification.id}')"
                >
                </button>
            </a>
        </li>
    `; 
};


loadNotifications();