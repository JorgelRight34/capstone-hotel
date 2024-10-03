const currentWallpapers = document.querySelectorAll('.wallpaper');
const currentWallpaperInput = document.querySelector('input[name="wallpaper"]');
currentWallpapers.forEach(wallpaper => {
    wallpaper.style.backgroundImage = `url(${currentWallpaperInput.value})`;
});