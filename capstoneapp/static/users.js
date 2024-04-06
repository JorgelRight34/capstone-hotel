const profilePicInput = document.getElementById('profile-pic-input');
const profilePic = document.getElementById('profile-pic');
const userNameInput = document.getElementById('username');
const submitButton = document.querySelector('input[type="submit"]')
const wallpaperInput = document.getElementById('wallpaper-input');
const wallpaper = document.getElementById('wallpaper');


const updateProfilePic = () => {
    // If an image has been uploaded then update the profile photo
    if (profilePicInput.files && profilePicInput.files[0]) {
        const reader = new FileReader()

        reader.onload = (event) => {
            profilePic.src = event.target.result;
        }
        
        // Read input file data and convert it to a URL
        reader.readAsDataURL(profilePicInput.files[0]);
    }
}


const updateWallpaper = () => {
    // If an image has been uploaded then update the wallpaper photo
    if (wallpaperInput.files && wallpaperInput.files[0]) {
        const reader = new FileReader();

        reader.onload = (event) => {
            wallpaper.style.backgroundImage = `url(${event.target.result})`;
        }
        
        // Read input file data and convert it to a URL
        reader.readAsDataURL(wallpaperInput.files[0]);
    }
}


const checkUsernameAvailability = () => {
    fetch(`/profile/${userNameInput.value}`)
    .then(response => {
        if (response.status == 200) {
            userNameInput.classList.add('is-invalid');
            submitButton.disabled = true;
        }
        else {
            userNameInput.classList.remove('is-invalid');
            submitButton.disabled = false;
        }
    });
}


userNameInput.addEventListener('keyup', checkUsernameAvailability);
profilePicInput.addEventListener('change', updateProfilePic);
wallpaperInput.addEventListener('change', updateWallpaper);