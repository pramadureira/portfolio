/* Projects Section */
const showButton = document.querySelector('#projects button')
const projectsSection = document.getElementById('projects')
const initialVisibleProjects = 3
const showMoreNr = 1
const galleryInstances = new Map()

let visibleProjects = initialVisibleProjects

loadProjects()

function loadProjects() {
    fetch('projects.json')
        .then(response => response.json())
        .then(data => {
            displayProjects(data.projects)
            initializeVisibleGalleries()
        })
        .catch(error => console.error('Error loading projects:', error))
}

function displayProjects(projects) {
    for (let i = 0; i < projects.length; i++) {
        const projectElement = createProjectElement(projects[i])
        if (i >= visibleProjects) projectElement.classList.add('hidden')
        projectsSection.insertBefore(projectElement, showButton)
    }

    updateShowMoreVisibility()
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
    article.appendChild(tags)

    const gallery = document.createElement('div')
    gallery.classList.add('project-images', 'js-gallery')
    gallery.id = project.images

    const mediaItems = normalizeProjectMedia(project)
    mediaItems.forEach(item => {
        const mediaAnchor = document.createElement('a')
        mediaAnchor.className = 'project-media-item'
        mediaAnchor.href = item.src

        if (item.type === 'video') {
            if (isExternalVideo(item.src)) {
                mediaAnchor.dataset.iframe = 'true'
            } else {
                mediaAnchor.dataset.video = JSON.stringify({
                    source: [{
                        src: item.src,
                        type: item.mimeType || 'video/mp4'
                    }],
                    attributes: {
                        preload: false,
                        controls: true
                    }
                })
            }

            if (item.poster) {
                mediaAnchor.dataset.poster = item.poster
            }
        }

        const thumb = document.createElement('img')
        thumb.src = item.thumb || item.poster || item.src
        thumb.alt = `${project.name} preview`

        mediaAnchor.appendChild(thumb)

        gallery.appendChild(mediaAnchor)
    })

    article.appendChild(gallery)

    const link = document.createElement('a')
    link.href = project.url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.innerHTML = '<i class="fa-brands fa-github fa-xl" style="color: #dedede;"></i>'
    article.appendChild(link)

    return article
}

function normalizeProjectMedia(project) {
    if (Array.isArray(project.media) && project.media.length > 0) {
        return project.media
    }

    const fallbackMedia = []
    for (let i = 1; i <= project.numImages; i++) {
        const imgPath = `images/projects/${project.images}/${i}.jpg`
        fallbackMedia.push({
            type: 'image',
            src: imgPath,
            thumb: imgPath
        })
    }

    return fallbackMedia
}

function isExternalVideo(src) {
    return src.includes('youtube.com') || src.includes('youtu.be') || src.includes('vimeo.com')
}

function initializeVisibleGalleries() {
    const visibleGalleries = document.querySelectorAll('article.project:not(.hidden) .js-gallery')
    visibleGalleries.forEach(galleryElement => initializeGallery(galleryElement))
}

function initializeGallery(galleryElement) {
    if (galleryInstances.has(galleryElement.id)) return
    if (!window.lightGallery) return

    const instance = lightGallery(galleryElement, {
        selector: '.project-media-item',
        download: false,
        counter: true,
        speed: 350,
        licenseKey: '0000-0000-000-0000',
        plugins: [lgThumbnail, lgZoom, lgVideo]
    })

    galleryInstances.set(galleryElement.id, instance)
}

function showMore() {
    let show = showMoreNr
    const hiddenProjects = document.querySelectorAll('article.hidden')

    for (let i = 0; i < hiddenProjects.length; i++) {
        hiddenProjects[i].classList.remove('hidden')
        visibleProjects++
        show--

        if (show === 0) break
    }

    initializeVisibleGalleries()
    updateShowMoreVisibility()
}

function updateShowMoreVisibility() {
    const hiddenProjects = document.querySelectorAll('article.hidden')
    showButton.style.display = hiddenProjects.length === 0 ? 'none' : 'initial'
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
navButton.addEventListener('click', event => {
    event.stopPropagation()
    toggleDropdown()
})

showButton.addEventListener('click', showMore)

document.addEventListener('click', event => {
    if (!dropdownMenu.contains(event.target) && !navButton.contains(event.target)) {
        closeDropdown()
    }
})
