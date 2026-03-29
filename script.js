const showButton = document.getElementById('show-more-btn');
const projectsGrid = document.getElementById('projects-grid');
const filterContainer = document.getElementById('filter-container');

const initialVisibleProjects = 3;
const showMoreNr = 3; // Loads 3 at a time now
const galleryInstances = new Map();

let allProjects = [];
let currentFilter = 'All';
let visibleProjects = initialVisibleProjects;

document.addEventListener("DOMContentLoaded", () => {
    startTypingEffect();
    loadProjects();
});

function startTypingEffect() {
    const textToType = "Pedro!";
    const typedTextSpan = document.querySelector(".typed-text");
    let charIndex = 0;

    function type() {
        if (charIndex < textToType.length) {
            typedTextSpan.textContent += textToType.charAt(charIndex);
            charIndex++;
            setTimeout(type, 120); 
        }
    }
    setTimeout(type, 500); 
}

function loadProjects() {
    fetch('projects.json')
        .then(response => response.json())
        .then(data => {
            allProjects = data.projects;
            generateFilters();
            displayFilteredProjects();
        })
        .catch(error => console.error('Error loading projects:', error));
}

function generateFilters() {
    const tags = new Set();
    allProjects.forEach(project => {
        if (project.tags) {
            project.tags.forEach(tag => tags.add(tag));
        }
    });

    createFilterButton('All', true);
    tags.forEach(tag => createFilterButton(tag, false));
}

function createFilterButton(tag, isActive) {
    const btn = document.createElement('button');
    btn.textContent = tag;
    btn.className = `filter-btn ${isActive ? 'active' : ''}`;
    
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentFilter = tag;
        visibleProjects = initialVisibleProjects; 
        displayFilteredProjects();
    });
    
    filterContainer.appendChild(btn);
}

function displayFilteredProjects() {
    projectsGrid.innerHTML = ''; 

    const filtered = currentFilter === 'All' 
        ? allProjects 
        : allProjects.filter(p => p.tags && p.tags.includes(currentFilter));

    filtered.forEach((project, index) => {
        const projectElement = createProjectElement(project, index);
        if (index >= visibleProjects) {
            projectElement.classList.add('hidden');
            projectElement.style.display = 'none'; // Hide physically from grid
        }
        projectsGrid.appendChild(projectElement);
    });

    initializeVisibleGalleries();
    updateShowMoreVisibility(filtered.length);
}

function createProjectElement(project, index) {
    const article = document.createElement('article');
    article.className = 'project';

    const name = document.createElement('h3');
    name.textContent = project.name;
    article.appendChild(name);

    const description = document.createElement('p');
    description.textContent = project.description;
    article.appendChild(description);

    if (project.tags) {
        const tags = document.createElement('ul');
        tags.className = 'project-tags';
        project.tags.forEach(tag => {
            const tagElement = document.createElement('li');
            tagElement.textContent = tag;
            tags.appendChild(tagElement);
        });
        article.appendChild(tags);
    }

    const gallery = document.createElement('div');
    gallery.classList.add('project-images', 'js-gallery');
    gallery.id = getProjectGalleryId(project, index);

    const mediaItems = normalizeProjectMedia(project);
    mediaItems.forEach(item => {
        const mediaAnchor = document.createElement('a');
        mediaAnchor.className = 'project-media-item';
        mediaAnchor.style.cursor = 'pointer';

        if (item.type === 'video') {
            if (isExternalVideo(item.src)) {
                mediaAnchor.href = item.src;
                mediaAnchor.dataset.iframe = 'true';
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
                });
            }

            if (item.poster) mediaAnchor.dataset.poster = item.poster;
            
            mediaAnchor.dataset.thumb = item.poster || item.thumb || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%23222%22%20stroke%3D%22%23fff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%3E%3C%2Fcircle%3E%3Cpolygon%20points%3D%2210%208%2016%2012%2010%2016%2010%208%22%3E%3C%2Fpolygon%3E%3C%2Fsvg%3E';

            // Async Canvas Frame Extraction
            if (!item.poster && !item.thumb && !isExternalVideo(item.src)) {
                generateVideoThumbnail(item.src, mediaAnchor);
            }

        } else {
            mediaAnchor.href = item.src;
            mediaAnchor.dataset.thumb = item.thumb || item.src; 
        }

        const previewElement = createMediaPreviewElement(item, project.name, mediaAnchor);
        mediaAnchor.appendChild(previewElement);
        gallery.appendChild(mediaAnchor);
    });

    article.appendChild(gallery);

    if (project.url) {
        const link = document.createElement('a');
        link.href = project.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = '<i class="fa-brands fa-github fa-xl"></i>';
        article.appendChild(link);
    }

    return article;
}

function getProjectGalleryId(project, index) {
    if (typeof project.id === 'string' && project.id.trim().length > 0) return project.id.trim();
    if (typeof project.images === 'string' && project.images.trim().length > 0) return `${project.images.trim()}-${index + 1}`;
    return `project-${index + 1}`;
}

function normalizeProjectMedia(project) {
    if (Array.isArray(project.assets) && project.assets.length > 0) {
        return project.assets.map(item => normalizeMediaItem(item)).filter(Boolean);
    }
    return [];
}

function normalizeMediaItem(item, forcedType) {
    if (typeof item === 'string') {
        const type = forcedType || inferMediaType(item);
        return {
            type,
            src: item,
            thumb: type === 'image' ? item : undefined,
            mimeType: type === 'video' ? inferVideoMimeType(item) : undefined
        };
    }
    return null;
}

function inferMediaType(src) {
    return /\.(mp4|webm|ogg)(\?.*)?$/i.test(src) ? 'video' : 'image';
}

function inferVideoMimeType(src) {
    if (/\.webm(\?.*)?$/i.test(src)) return 'video/webm';
    if (/\.ogg(\?.*)?$/i.test(src)) return 'video/ogg';
    return 'video/mp4';
}

function createMediaPreviewElement(item, projectName, mediaAnchor) {
    if (item.type === 'video' && !item.poster && !item.thumb && !isExternalVideo(item.src)) {
        const previewVideo = document.createElement('video');
        previewVideo.src = item.src;
        previewVideo.muted = true;
        previewVideo.loop = true;
        previewVideo.autoplay = true;
        previewVideo.playsInline = true;
        previewVideo.preload = 'metadata';
        previewVideo.setAttribute('aria-label', `${projectName} video preview`);
        return previewVideo;
    }

    const previewImage = document.createElement('img');
    previewImage.src = item.thumb || item.poster || item.src;
    previewImage.alt = `${projectName} preview`;
    return previewImage;
}

function isExternalVideo(src) {
    return src.includes('youtube.com') || src.includes('youtu.be') || src.includes('vimeo.com');
}

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
        
        mediaAnchor.dataset.thumb = canvas.toDataURL('image/jpeg');
    });
}

function initializeVisibleGalleries() {
    const visibleGalleries = document.querySelectorAll('article.project:not(.hidden) .js-gallery');
    visibleGalleries.forEach(galleryElement => initializeGallery(galleryElement));
}

function initializeGallery(galleryElement) {
    if (galleryInstances.has(galleryElement.id)) return;
    if (!window.lightGallery) return;

    const instance = lightGallery(galleryElement, {
        selector: '.project-media-item',
        download: false,
        counter: true,
        speed: 350,
        licenseKey: '0000-0000-000-0000',
        plugins: [lgThumbnail, lgZoom, lgVideo],
        exThumbImage: 'data-thumb',
        autoplayVideoOnSlide: true 
    });

    galleryInstances.set(galleryElement.id, instance);
}

function showMore() {
    visibleProjects += showMoreNr;
    displayFilteredProjects();
}

function updateShowMoreVisibility(totalFilteredCount) {
    showButton.style.display = visibleProjects >= totalFilteredCount ? 'none' : 'block';
}

showButton.addEventListener('click', showMore);

const navButton = document.getElementById('nav-toggle');
const dropdownMenu = document.getElementById('nav-menu');
const toggleButtonIcon = document.querySelector('#nav-toggle i');

function toggleDropdown() {
    const isOpen = dropdownMenu.classList.contains('open');
    dropdownMenu.classList.toggle('open');
    toggleButtonIcon.className = isOpen ? 'fa-solid fa-bars fa-xl' : 'fa-solid fa-xmark fa-xl';
}

function closeDropdown() {
    toggleButtonIcon.className = 'fa-solid fa-bars fa-xl';
    dropdownMenu.classList.remove('open');
}

navButton.addEventListener('click', event => {
    event.stopPropagation();
    toggleDropdown();
});

document.addEventListener('click', event => {
    if (!dropdownMenu.contains(event.target) && !navButton.contains(event.target)) {
        closeDropdown();
    }
});