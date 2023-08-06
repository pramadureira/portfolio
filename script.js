const navButton = document.getElementById('nav-toggle');
const dropdownMenu = document.getElementById('dropdown-menu');
const toggleButtonIcon = document.querySelector('#nav-toggle i');

function toggleDropdown() {
    const isOpen = dropdownMenu.classList.contains('open');
    dropdownMenu.classList.toggle('open');
    toggleButtonIcon.classList = isOpen ? 'fa-solid fa-bars fa-xl' : 'fa fa-times fa-2xl';
}

function closeDropdown() {
    toggleButtonIcon.classList = 'fa-solid fa-bars fa-xl';
    dropdownMenu.classList.remove('open');
}

/* Event Listeners */
document.addEventListener('click', function(event) {
    switch (event.target) {
        case navButton:
        case toggleButtonIcon:
            toggleDropdown();
            break;
        default:
            closeDropdown();
            break;
    }
})
