const registryUrl = './registry/apps.json';
let appsData = [];

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

async function loadApps() {
    const response = await fetch(registryUrl);
    if (!response.ok) {
        throw new Error(`Registry request failed with status ${response.status}`);
    }

    const registry = await response.json();
    appsData = Array.isArray(registry) ? registry : registry.apps;
    if (!Array.isArray(appsData)) {
        throw new Error('Registry does not contain an apps array');
    }

    renderGrid();
}

function renderGrid() {
    const main = document.getElementById('app-grid');
    main.replaceChildren();

    appsData.forEach(app => {
        const iconHtml = app.icon
            ? `<img src="${escapeHtml(app.icon)}" alt="${escapeHtml(app.name)} icon">`
            : escapeHtml((app.name || 'App').substring(0, 2).toUpperCase());
        const appId = escapeHtml(app.id);
        const name = escapeHtml(app.name || 'Unknown App');
        const category = escapeHtml(app.category || 'Utility');
        const description = escapeHtml(app.description || '');

        const card = document.createElement('div');
        card.className = 'app-card';
        card.onclick = () => showAppDetails(app.id);
        card.innerHTML = `
            <div class="app-header">
                <div class="app-icon">${iconHtml}</div>
                <div class="app-meta">
                    <h2 class="app-title">${name}</h2>
                    <p class="app-category">${category}</p>
                </div>
            </div>
            <p class="app-description">${description}</p>
            <div class="btn-view">View</div>
        `;
        main.appendChild(card);
    });
}

function showAppDetails(appId) {
    const app = appsData.find(a => a.id === appId);
    if (!app) return;

    const homeView = document.getElementById('home-view');
    const detailsView = document.getElementById('app-details-view');

    const artifact = app.artifacts?.find(item => item.type === 'apk') ?? app.artifacts?.[0];
    const screenshots = Array.isArray(app.screenshots) ? app.screenshots : [];
    
    const iconHtml = app.icon
        ? `<img src="${escapeHtml(app.icon)}" alt="${escapeHtml(app.name)} icon">`
        : escapeHtml((app.name || 'App').substring(0, 2).toUpperCase());
    
    const name = escapeHtml(app.name || 'Unknown App');
    const category = escapeHtml(app.category || 'Utility');
    const description = escapeHtml(app.description || '');
    const version = escapeHtml(app.version || 'unknown');

    let galleryHtml = '';
    let lightboxesHtml = '';
    screenshots.forEach((shot, index) => {
        const shotUrl = escapeHtml(shot.url);
        const lightboxId = `lightbox-${appId}-${index}`;
        galleryHtml += `
            <a href="#${lightboxId}" class="screenshot-link">
                <img src="${shotUrl}" alt="Screenshot ${index + 1}" class="screenshot-img">
            </a>`;
        lightboxesHtml += `
            <div id="${lightboxId}" class="lightbox-overlay">
                <a href="#_" class="lightbox-close">X</a>
                <a href="#_">
                    <img src="${shotUrl}" class="lightbox-img" alt="Zoomed screenshot">
                </a>
            </div>`;
    });
    
    if (galleryHtml) {
        galleryHtml = `<div class="screenshots-gallery">${galleryHtml}</div>`;
    }

    detailsView.innerHTML = `
        <button class="btn-back" onclick="showHome()">
            <span class="icon-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </span>
            <span class="back-text">Back to Applications</span>
        </button>
        <div class="modal-header">
            <div class="app-icon" style="width: 96px; height: 96px; font-size: 36px; border-radius: 20px;">${iconHtml}</div>
            <div>
                <h2 style="font-size: 32px; font-weight: 700; margin: 0 0 8px 0">${name}</h2>
                <p style="font-size: 14px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin: 0;">${category}</p>
            </div>
        </div>
        <div class="modal-meta-row">
            ${artifact ? `<a href="${escapeHtml(artifact.url)}" class="btn-primary" style="display:inline-block">Download ${escapeHtml(artifact.type.toUpperCase())}</a>` : ''}
            <span class="app-version">Version ${version}</span>
        </div>
        <p class="modal-desc" style="max-width: 800px;">${description}</p>
        ${galleryHtml}
        ${lightboxesHtml}
    `;

    homeView.style.display = 'none';
    detailsView.style.display = 'block';
    window.scrollTo(0, 0);
}

function showHome() {
    document.getElementById('home-view').style.display = 'block';
    document.getElementById('app-details-view').style.display = 'none';
    window.scrollTo(0, 0);
}

loadApps().catch(error => {
    console.error('Error loading app registry:', error);
    document.getElementById('app-grid').innerHTML =
        '<p style="text-align: center; width: 100%; color: var(--text-muted);">The app registry is temporarily unavailable.</p>';
});
