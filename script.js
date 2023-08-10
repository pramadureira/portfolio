/* Gallery image Section */
(function() {
    Galleria.loadTheme('https://cdnjs.cloudflare.com/ajax/libs/galleria/1.6.1/themes/azur/galleria.azur.min.js')
    for (i = 1; i <= 5; i++) {
        Galleria.run('#proj'+i)
    }
}())

setGalleriaContainerHeight()

function setGalleriaContainerHeight() {
    const containers = document.querySelectorAll('.project-images')

    containers.forEach(container => {
        const containerWidth = container.clientWidth
        const desiredRatio = 16 / 9 // 16 / 9, 4 / 3, 3 / 2
    
        const desiredHeight = containerWidth / desiredRatio
    
        container.style.height = `${desiredHeight}px`
    })
}


/* Projects Section */
const showButton = document.querySelector('#projects button')
let visibleProjects = 5
let showMoreNr = 2

loadProjects()

function loadProjects() {
    fetch('projects.json')
        .then(response => response.json())
        .then(data => displayProjects(data.projects))
        .catch(error => console.error('Error loading projects:', error))
}

function displayProjects(projects) {
    const projectsSection = document.getElementById('projects')
    const showButton = document.querySelector('#projects button')
    const hiddenProjects = document.querySelectorAll('article.hidden')

    for (let i = 0; i < projects.length; i++) {
        const projectElement = createProjectElement(projects[i])
        if (i >= visibleProjects) projectElement.classList.add('hidden')
        projectsSection.insertBefore(projectElement, showButton)
    }

    showButton.style.display = hiddenProjects.length === 0 ? "none" : "initial"
}

function createProjectElement(project) {
    const article = document.createElement('article')
    article.className = 'project'

    const name = document.createElement('h3')
    name.textContent = project.name
    article.appendChild(name)

    const description = document.createElement('p')
    description.textContent = project.description
    article.appendChild(description)

    const tags = document.createElement('ul')
    tags.className = 'project-tags'
    project.tags.forEach(tag => {
        const tagElement = document.createElement('li')
        tagElement.textContent = tag
        tags.appendChild(tagElement)
    })
    article.appendChild(tags);

    const imageList = document.createElement('ul')
    imageList.classList.add('project-images')
    imageList.setAttribute('id', project.images);

    for (let i = 1; i <= project.numImages; i++) {
        const imgPath = `images/projects/${project.images}/${i}.jpg`
        const li = document.createElement('li')
        const img = document.createElement('img')
        img.src = imgPath
        li.appendChild(img)
        imageList.appendChild(li)
    }

    article.appendChild(imageList)

    const link = document.createElement('a')
    link.href = project.url
    link.target = '_blank'
    link.innerHTML = '<i class="fa-brands fa-github fa-xl" style="color: #dedede;"></i>'
    article.appendChild(link)


    return article
}

function showMore() {
    show = showMoreNr
    const projectsSection = document.querySelectorAll('article.hidden')
    
    for (let i = 0; i < projectsSection.length; i++) {
        if (projectsSection[i].classList.contains('hidden')) {
            show--
            projectsSection[i].classList.remove('hidden')
        }

        if (show === 0) break
    }

    showButton.style.display = projectsSection.length - show <= 0 ? "none" : "initial"
}


/* Responsive Navbar */
const navButton = document.getElementById('nav-toggle')
const dropdownMenu = document.getElementById('nav-menu')
const toggleButtonIcon = document.querySelector('#nav-toggle i')


function toggleDropdown() {
    const isOpen = dropdownMenu.classList.contains('open')
    dropdownMenu.classList.toggle('open')
    toggleButtonIcon.classList = isOpen ? 'fa-solid fa-bars fa-xl' : 'fa fa-times fa-2xl'
}

function closeDropdown() {
    toggleButtonIcon.classList = 'fa-solid fa-bars fa-xl'
    dropdownMenu.classList.remove('open')
}


/* Event Listeners */
document.addEventListener('click', function(event) {
    switch (event.target) {
        case navButton:
        case toggleButtonIcon:
            toggleDropdown()
            break
        case showButton:
            showMore()            
        default:
            closeDropdown()
            break
    }
})

window.addEventListener('resize', setGalleriaContainerHeight);
