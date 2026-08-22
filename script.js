fetch('apps.json')
    .then(res => {
        if (!res.ok) throw new Error("apps.json not found yet");
        return res.json();
    })
    .then(appsIndex => {
        const main = document.getElementById('app-grid');
        const modalsContainer = document.getElementById('modals-container');
        main.innerHTML = '';

        appsIndex.forEach(appEntry => {
            fetch(`./apps/${appEntry.id}/app.json`)
                .then(res => res.json())
                .then(appMeta => {

                    const iconHtml = appMeta.icon
                        ? `<img src="./apps/${appEntry.id}/${appMeta.icon}" style="width:100%;height:100%;object-fit:cover;">`
                        : (appMeta.name || "App").substring(0, 2).toUpperCase();

                    const card = document.createElement('a');
                    card.href = `#app-${appEntry.id}`;
                    card.className = 'app-card';
                    card.innerHTML = `
                        <div class="app-header">
                            <div class="app-icon">${iconHtml}</div>
                            <div class="app-meta">
                                <h2 class="app-title">${appMeta.name || 'Unknown App'}</h2>
                                <p class="app-category">${appMeta.category || 'Utility'}</p>
                            </div>
                        </div>
                        <p class="app-description">${appMeta.description || ''}</p>
                    `;
                    main.appendChild(card);

                    let galleryHTML = '';
                    let lightboxesHTML = '';
                    if (appMeta.screenshots && appMeta.screenshots.length > 0) {
                        galleryHTML = '<div class="screenshots-gallery">';
                        appMeta.screenshots.forEach((shot, index) => {
                            const shotUrl = `./apps/${appEntry.id}/${shot}`;
                            const lightboxId = `lightbox-${appEntry.id}-${index}`;
                            galleryHTML += `
                                <a href="#${lightboxId}" class="screenshot-link">
                                    <img src="${shotUrl}" alt="Screenshot ${index + 1}" class="screenshot-img">
                                </a>
                            `;
                            lightboxesHTML += `
                                <div id="${lightboxId}" class="lightbox-overlay">
                                    <a href="#app-${appEntry.id}" class="lightbox-close">X</a>
                                    <a href="#app-${appEntry.id}">
                                        <img src="${shotUrl}" class="lightbox-img" alt="Zoomed Screenshot">
                                    </a>
                                </div>
                            `;
                        });
                        galleryHTML += '</div>';
                    }

                    const modal = document.createElement('div');
                    modal.id = `app-${appEntry.id}`;
                    modal.className = 'modal-overlay';
                    modal.innerHTML = `
                        <div class="modal-content">
                            <a href="#" class="close-btn">X</a>
                            <div class="modal-header">
                                <div class="app-icon">${iconHtml}</div>
                                <div>
                                    <h2 class="app-title">${appMeta.name || 'Unknown App'}</h2>
                                    <p class="app-category">${appMeta.category || 'Utility'}</p>
                                </div>
                            </div>
                            
                            <div class="modal-meta-row">
                                <a href="${appEntry.apkUrl}" class="btn-download">Download APK</a>
                                <span class="app-version">Version ${appEntry.version}</span>
                            </div>
                            
                            <p class="modal-desc">${appMeta.description || ''}</p>
                            ${galleryHTML}
                        </div>
                    `;
                    modalsContainer.appendChild(modal);

                    if (lightboxesHTML) {
                        const lbWrapper = document.createElement('div');
                        lbWrapper.innerHTML = lightboxesHTML;
                        while (lbWrapper.firstChild) {
                            modalsContainer.appendChild(lbWrapper.firstChild);
                        }
                    }
                })
                .catch(err => console.error("Error loading app meta for", appEntry.id, err));
        });
    })
    .catch(err => {
        document.getElementById('app-grid').innerHTML = '<p style="text-align: center; width: 100%; color: var(--text-muted);">Waiting for your first GitHub Action release to finish...</p>';
    });
