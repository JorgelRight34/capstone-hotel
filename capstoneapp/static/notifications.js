const notificationsDropdown = document.getElementById('notifications-dropdown');


const loadNotifications = async () => {
    const response = await fetch(`/notifications`);
    const notifications = await response.json();

    for (const notification of notifications) {
        notificationsDropdown.insertAdjacentHTML('beforeend', renderNotification(notification));
    };
};


const renderNotification = (notification) => {
    return `
        <li class="dropdown-item">
            <a class="text-decoration-none text-dark" href="/request-to-book/${notification.id}">
                ${notification.notification}
            </a>
        </li>
    `;
};


loadNotifications();