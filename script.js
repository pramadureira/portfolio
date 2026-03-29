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
        const projectElement = createProjectElement(projects[i], i)
        if (i >= visibleProjects) projectElement.classList.add('hidden')
        projectsSection.insertBefore(projectElement, showButton)
    }

    updateShowMoreVisibility()
}

function createProjectElement(project, index) {
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
    gallery.id = getProjectGalleryId(project, index)

    const mediaItems = normalizeProjectMedia(project)
    mediaItems.forEach(item => {
        const mediaAnchor = document.createElement('a')
        mediaAnchor.className = 'project-media-item'
        mediaAnchor.style.cursor = 'pointer'

        if (item.type === 'video') {
            if (isExternalVideo(item.src)) {
                mediaAnchor.href = item.src
                mediaAnchor.dataset.iframe = 'true'
            } else {
                mediaAnchor.dataset.video = JSON.stringify({
                    source: [{
                        src: item.src,
                        type: item.mimeType || 'video/mp4'
                    }],
                    attributes: {
                        preload: false,
                        controls: true,
                        autoplay: true,
                        muted: true
                    }
                })
            }

            if (item.poster) {
                mediaAnchor.dataset.poster = item.poster
            }
            
            mediaAnchor.dataset.thumb = item.poster || item.thumb || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%23222%22%20stroke%3D%22%23fff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%3E%3C%2Fcircle%3E%3Cpolygon%20points%3D%2210%208%2016%2012%2010%2016%2010%208%22%3E%3C%2Fpolygon%3E%3C%2Fsvg%3E'

            if (!item.poster && !item.thumb && !isExternalVideo(item.src)) {
                generateVideoThumbnail(item.src, mediaAnchor);
            }
        } else {
            mediaAnchor.href = item.src
            mediaAnchor.dataset.thumb = item.thumb || item.src 
        }

        const previewElement = createMediaPreviewElement(item, project.name, mediaAnchor)
        mediaAnchor.appendChild(previewElement)
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

function getProjectGalleryId(project, index) {
    if (typeof project.id === 'string' && project.id.trim().length > 0) {
        return project.id.trim()
    }

    if (typeof project.images === 'string' && project.images.trim().length > 0) {
        return `${project.images.trim()}-${index + 1}`
    }

    return `project-${index + 1}`
}

function normalizeProjectMedia(project) {
    if (Array.isArray(project.assets) && project.assets.length > 0) {
        return project.assets.map(item => normalizeMediaItem(item)).filter(Boolean)
    }

    if (Array.isArray(project.media) && project.media.length > 0) {
        return project.media.map(item => normalizeMediaItem(item)).filter(Boolean)
    }

    const media = []

    if (Array.isArray(project.images)) {
        project.images.forEach(item => {
            const normalized = normalizeMediaItem(item, 'image')
            if (normalized) media.push(normalized)
        })
    }

    if (Array.isArray(project.videos)) {
        project.videos.forEach(item => {
            const normalized = normalizeMediaItem(item, 'video')
            if (normalized) media.push(normalized)
        })
    }

    if (media.length > 0) {
        return media
    }

    const fallbackMedia = []
    const configuredExt = getConfiguredImageExtension(project)
    for (let i = 1; i <= project.numImages; i++) {
        const basePath = `images/projects/${project.images}/${i}`
        const candidateExtensions = configuredExt ? [configuredExt] : ['jpg', 'jpeg', 'png', 'webp']
        const srcCandidates = candidateExtensions.map(ext => `${basePath}.${ext}`)

        fallbackMedia.push({
            type: 'image',
            src: srcCandidates[0],
            thumb: srcCandidates[0],
            srcCandidates
        })
    }

    return fallbackMedia
}

function getConfiguredImageExtension(project) {
    if (typeof project.imageExtension !== 'string') return ''
    return project.imageExtension.replace('.', '').trim().toLowerCase()
}

function normalizeMediaItem(item, forcedType) {
    if (typeof item === 'string') {
        const type = forcedType || inferMediaType(item)
        return {
            type,
            src: item,
            thumb: type === 'image' ? item : undefined,
            mimeType: type === 'video' ? inferVideoMimeType(item) : undefined
        }
    }

    if (!item || typeof item !== 'object' || typeof item.src !== 'string') {
        return null
    }

    const type = forcedType || item.type || inferMediaType(item.src)
    return {
        type,
        src: item.src,
        thumb: item.thumb,
        poster: item.poster,
        mimeType: item.mimeType || (type === 'video' ? inferVideoMimeType(item.src) : undefined)
    }
}

function inferMediaType(src) {
    return /\.(mp4|webm|ogg)(\?.*)?$/i.test(src) ? 'video' : 'image'
}

function inferVideoMimeType(src) {
    if (/\.webm(\?.*)?$/i.test(src)) return 'video/webm'
    if (/\.ogg(\?.*)?$/i.test(src)) return 'video/ogg'
    return 'video/mp4'
}

function createMediaPreviewElement(item, projectName, mediaAnchor) {
    if (item.type === 'video' && !item.poster && !item.thumb && !isExternalVideo(item.src)) {
        const previewVideo = document.createElement('video')
        previewVideo.src = item.src
        previewVideo.muted = true
        previewVideo.loop = true
        previewVideo.autoplay = true
        previewVideo.playsInline = true
        previewVideo.preload = 'metadata'
        previewVideo.setAttribute('aria-label', `${projectName} video preview`)
        return previewVideo
    }

    const previewImage = document.createElement('img')
    previewImage.src = item.thumb || item.poster || item.src
    previewImage.alt = `${projectName} preview`

    if (Array.isArray(item.srcCandidates) && item.srcCandidates.length > 1) {
        let candidateIndex = 0
        previewImage.addEventListener('error', () => {
            candidateIndex++
            if (candidateIndex >= item.srcCandidates.length) return

            const nextSrc = item.srcCandidates[candidateIndex]
            previewImage.src = nextSrc
            mediaAnchor.href = nextSrc
        })
    }

    return previewImage
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
        plugins: [lgThumbnail, lgZoom, lgVideo],
        exThumbImage: 'data-thumb'
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

function generateVideoThumbnail(videoSrc, mediaAnchor) {
    const video = document.createElement('video');
    video.muted = true;
    video.src = videoSrc;
    video.crossOrigin = 'anonymous'; 

    video.addEventListener('loadeddata', () => {
        video.currentTime = 0.5; 
    });

    video.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const thumbUrl = canvas.toDataURL('image/jpeg');
        
        mediaAnchor.dataset.thumb = thumbUrl;
    });
}