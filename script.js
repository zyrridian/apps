const registryUrl = './registry/apps.json';

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
    const apps = Array.isArray(registry) ? registry : registry.apps;
    if (!Array.isArray(apps)) {
        throw new Error('Registry does not contain an apps array');
    }

    const main = document.getElementById('app-grid');
    const modalsContainer = document.getElementById('modals-container');
    main.replaceChildren();
    modalsContainer.replaceChildren();

    apps.forEach(app => {
        const artifact = app.artifacts?.find(item => item.type === 'apk') ?? app.artifacts?.[0];
        const screenshots = Array.isArray(app.screenshots) ? app.screenshots : [];
        const iconHtml = app.icon
            ? `<img src="${escapeHtml(app.icon)}" alt="${escapeHtml(app.name)} icon">`
            : escapeHtml((app.name || 'App').substring(0, 2).toUpperCase());
        const appId = escapeHtml(app.id);
        const name = escapeHtml(app.name || 'Unknown App');
        const category = escapeHtml(app.category || 'Utility');
        const description = escapeHtml(app.description || '');
        const version = escapeHtml(app.version || 'unknown');

        const card = document.createElement('a');
        card.href = `#app-${appId}`;
        card.className = 'app-card';
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
                    <a href="#app-${appId}" class="lightbox-close">X</a>
                    <a href="#app-${appId}">
                        <img src="${shotUrl}" class="lightbox-img" alt="Zoomed screenshot">
                    </a>
                </div>`;
        });
        if (galleryHtml) {
            galleryHtml = `<div class="screenshots-gallery">${galleryHtml}</div>`;
        }

        const modal = document.createElement('div');
        modal.id = `app-${appId}`;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <a href="#" class="close-btn">X</a>
                <div class="modal-header">
                    <div class="app-icon">${iconHtml}</div>
                    <div>
                        <h2 class="app-title" style="margin:0 0 4px 0">${name}</h2>
                        <p class="app-category" style="margin:0; color:var(--text-muted)">${category}</p>
                    </div>
                </div>
                <div class="modal-meta-row">
                    ${artifact ? `<a href="${escapeHtml(artifact.url)}" class="btn-download">Download ${escapeHtml(artifact.type.toUpperCase())}</a>` : ''}
                    <span class="app-version">Version ${version}</span>
                </div>
                <p class="modal-desc" style="line-height:1.6; color:var(--text-muted)">${description}</p>
                ${galleryHtml}
            </div>`;
        modalsContainer.appendChild(modal);

        if (lightboxesHtml) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = lightboxesHtml;
            while (wrapper.firstChild) {
                modalsContainer.appendChild(wrapper.firstChild);
            }
        }
    });
}

loadApps().catch(error => {
    console.error('Error loading app registry:', error);
    document.getElementById('app-grid').innerHTML =
        '<p style="text-align: center; width: 100%; color: var(--text-muted);">The app registry is temporarily unavailable.</p>';
});
