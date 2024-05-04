const notificationsDropdown = document.getElementById('notifications-dropdown');


const deleteNotification = async (event, type, notification) => {
    const response = await fetch(`/delete-notification/${type}/${notification}`);
    const notificationLi = notificationsDropdown.querySelector(`li[data-notification="${notification}"]`);
    notificationLi.remove()
};


const loadNotifications = async () => {
    const response = await fetch(`/notifications`);
    const notifications = await response.json();

    for (const notification of notifications) {
        notificationsDropdown.insertAdjacentHTML('beforeend', renderNotification(notification));
    };
};


const renderNotification = (notification) => {
    console.log(notification.type)
    console.log(notification.notification);
    switch (notification.type) {
        case 'request_to_book':
            return `
            <li class="dropdown-item" data-notification="${notification.id}">
                <a class="text-decoration-none text-dark" href="/request-to-book/${notification.notification.id}">
                    <img class="profile-pic" src="${notification.notificator.profile_pic}">
                    Has requested to book ${notification.notification.listing.title}
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
        case 'comment':
            return `
            <li class="dropdown-item" data-notification="${notification.id}">
                <a class="text-decoration-none text-dark" href="/post/${notification.notification.listing.id}">
                    <img class="profile-pic" src="${notification.notificator.profile_pic}">
                    Has commented about ${notification.notification.listing.title}
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
    }
};


loadNotifications();