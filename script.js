const hamburguer = document.querySelector('#nav-toggle')
const navMenu = document.querySelector('#nav-menu')

function closeDropdown() {
    navMenu.style.display = 'none'
    hamburguer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#ffffff}</style><path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/></svg>'
}

function openDropdown() {
    navMenu.style.display = 'flex'
    hamburguer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#ffffff}</style><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>'
}

window.addEventListener('resize', function() {
    if (window.getComputedStyle(navMenu).flexDirection === 'row') openDropdown()
    else closeDropdown()
})

document.addEventListener('click', function(e) {
    if (window.getComputedStyle(navMenu).flexDirection === 'column' && e.target !== hamburguer.childNodes[0]) closeDropdown()
})

hamburguer.addEventListener('click', function(e) {
    if (navMenu.style.display === 'flex') console.log("fefe")
    else openDropdown()
    e.stopPropagation()
})
