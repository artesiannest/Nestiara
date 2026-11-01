(function () {
  'use strict';

  const data = window.PORTFOLIO_DATA;
  if (!data) return;

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const escapeHTML = value =>
    String(value == null ? '' : value).replace(
      /[&<>"']/g,
      character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character])
    );

  function safeUrl(value) {
    const url = String(value || '').trim();

    if (/^https?:\/\//i.test(url)) {
      try {
        const parsed = new URL(url);

        return parsed.username || parsed.password
          ? ''
          : parsed.href;
      } catch (_) {
        return '';
      }
    }

    if (
      /^assets\/[a-zA-Z0-9_./ -]+$/.test(url) &&
      !url.includes('..')
    ) {
      return url;
    }

    return '';
  }

  function fileLink(
    url,
    label,
    className = 'button secondary'
  ) {
    const valid = safeUrl(url);
    if (!valid) return '';

    return `
      <a
        class="${escapeHTML(className)}"
        href="${escapeHTML(valid)}"
        target="_blank"
        rel="noopener noreferrer"
      >${escapeHTML(label)}</a>
    `;
  }

  function thumb(value) {
    const src = safeUrl(value);

    return src.startsWith('assets/')
      ? src.replace(/\.png$/i, '.webp')
      : src;
  }

  function accessUrl(item) {
    if (item.accessStatus !== 'public') return '';

    const url = String(item.publicUrl || '').trim();

    return /^https?:\/\//i.test(url)
      ? safeUrl(url)
      : '';
  }

  function setText(selector, value) {
    const element = $(selector);

    if (element) {
      element.textContent = String(value || '');
    }
  }

  function setHTML(selector, html) {
    const element = $(selector);

    if (element) {
      element.innerHTML = html;
    }
  }

  function addCategories(selector, items) {
    const select = $(selector);
    if (!select) return;

    // Pertahankan pilihan "Semua kategori".
    while (select.options.length > 1) {
      select.remove(1);
    }

    const categories = [
      ...new Set(
        items
          .map(item => item.category)
          .filter(Boolean)
      )
    ];

    categories.forEach(category => {
      const option = document.createElement('option');

      option.value = category;
      option.textContent = category;

      select.appendChild(option);
    });
  }

  const profile = data.profile || {};
  const systems = Array.isArray(data.systems)
    ? data.systems
    : [];

  const games = Array.isArray(data.games)
    ? data.games
    : [];

  const research = Array.isArray(data.research)
    ? data.research
    : [];

  const experience = Array.isArray(data.experience)
    ? data.experience
    : [];

  const education = Array.isArray(data.education)
    ? data.education
    : [];

  const skills = Array.isArray(data.skills)
    ? data.skills
    : [];

  const certificates = Array.isArray(data.certificates)
    ? data.certificates
    : [];

  /* =========================
     PROFIL
  ========================= */

  setText(
    '.hero-copy > .eyebrow',
    String(profile.name || 'Nestiara').toUpperCase()
  );

  setText('.profession', profile.title);
  setText('.hero-description', profile.heroDescription);

  setHTML(
    '.hero-copy h1',
    escapeHTML(profile.headline).replace(
      'lebih membantu',
      '<em>lebih membantu</em>'
    )
  );

  setText(
    '.about-content > p:not(.large-text)',
    profile.aboutDescription
  );

  setText(
    'footer > p',
    [profile.name, profile.location]
      .filter(Boolean)
      .join(' · ')
  );

  setHTML(
    '.education',
    education.map((item, index) => `
      <article>
        <span class="eyebrow">
          ${
            index === 0
              ? 'PENDIDIKAN SARJANA'
              : 'STUDI LANJUTAN'
          }
        </span>

        <h3>${escapeHTML(item.level)}</h3>

        <p>
          ${escapeHTML(item.institution)}
          ${
            item.period
              ? ' · ' + escapeHTML(item.period)
              : ''
          }
        </p>

        ${
          item.gpa
            ? `<strong>IPK ${escapeHTML(item.gpa)}</strong>`
            : ''
        }

        ${
          item.thesis
            ? `
              <p class="small">
                Tugas akhir: ${escapeHTML(item.thesis)}
              </p>
            `
            : ''
        }

        ${
          item.status
            ? `<span class="tag">${escapeHTML(item.status)}</span>`
            : ''
        }
      </article>
    `).join('')
  );

  const resumeUrl = safeUrl(profile.resumeUrl);

  if (resumeUrl) {
    $$('a[href="assets/documents/resume-nestiara.pdf"]')
      .forEach(link => {
        link.href = resumeUrl;
      });
  }

  setHTML(
    '#skills',
    skills.map(item => `
      <article class="skill-group">
        <h3>${escapeHTML(item.title)}</h3>

        <p>
          ${
            (Array.isArray(item.items) ? item.items : [])
              .map(escapeHTML)
              .join(' · ')
          }
        </p>
      </article>
    `).join('')
  );

  setHTML(
    '#experience',
    experience.map(item => `
      <article class="experience-row">
        <p class="experience-date">
          ${escapeHTML(item.period)}
        </p>

        <div class="experience-role">
          <h3>${escapeHTML(item.role)}</h3>
          <p>${escapeHTML(item.company)}</p>
        </div>

        <p class="experience-description">
          ${escapeHTML(item.description)}
        </p>
      </article>
    `).join('')
  );

  setHTML(
    '#certificates',
    certificates.map(item => `
      <article class="cert">
        <h4>${escapeHTML(item.title)}</h4>

        <p>
          ${escapeHTML(item.issuer)}<br>
          ${escapeHTML(item.date)}
        </p>
      </article>
    `).join('')
  );

  /* =========================
     KONTAK
  ========================= */

  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    profile.email || ''
  ) ? profile.email : '';

  const whatsapp = /^\d{8,15}$/.test(
    profile.whatsapp || ''
  ) ? profile.whatsapp : '';

  setHTML(
    '#contact-actions',
    (
      email
        ? `
          <a
            class="button primary"
            href="mailto:${escapeHTML(email)}"
          >${escapeHTML(email)}</a>
        `
        : ''
    ) +
    (
      whatsapp
        ? `
          <a
            class="button secondary"
            href="https://wa.me/${whatsapp}"
            target="_blank"
            rel="noopener noreferrer"
          >WhatsApp</a>
        `
        : ''
    ) +
    fileLink(profile.linkedinUrl, 'LinkedIn') +
    fileLink(profile.githubUrl, 'GitHub')
  );

  /* =========================
     TEMA DAN MENU
  ========================= */

  const themeButton = $('#theme');
  const menuButton = $('#menu');
  const navigation = $('#navigation');

  function updateThemeLabel() {
    if (!themeButton) return;

    const light =
      document.documentElement.dataset.theme === 'light';

    const label =
      `Aktifkan mode ${light ? 'gelap' : 'terang'}`;

    themeButton.setAttribute('aria-label', label);
    themeButton.setAttribute('title', label);
  }

  updateThemeLabel();

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const next =
        document.documentElement.dataset.theme === 'dark'
          ? 'light'
          : 'dark';

      document.documentElement.dataset.theme = next;

      try {
        localStorage.setItem('nest-theme', next);
      } catch (_) {}

      updateThemeLabel();
    });
  }

  function closeMenu() {
    if (navigation) {
      navigation.classList.remove('open');
    }

    if (menuButton) {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Buka menu');
    }
  }

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const open = navigation.classList.toggle('open');

      menuButton.setAttribute(
        'aria-expanded',
        String(open)
      );

      menuButton.setAttribute(
        'aria-label',
        open ? 'Tutup menu' : 'Buka menu'
      );
    });
  }

  $$('#navigation a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', event => {
    if (
      event.key === 'Escape' &&
      navigation &&
      navigation.classList.contains('open')
    ) {
      closeMenu();

      if (menuButton) {
        menuButton.focus();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      closeMenu();
    }
  });

  /* =========================
     PORTFOLIO
  ========================= */

  addCategories('#category', systems);

  function renderProjects() {
    const container = $('#projects');
    if (!container) return;

    const query = String($('#search')?.value || '')
      .trim()
      .toLocaleLowerCase('id');

    const category = $('#category')?.value || '';

    const filtered = systems.filter(item =>
      (!category || item.category === category) &&
      [item.title, item.category, item.summary]
        .join(' ')
        .toLocaleLowerCase('id')
        .includes(query)
    );

    container.innerHTML = filtered.map(item => {
      const url = accessUrl(item);

      const gallery = Array.isArray(item.gallery)
        ? item.gallery
        : [];

      return `
        <article class="project-card">
          <div class="project-body">
            <div class="project-image">
              <span class="project-index">
                ${
                  String(systems.indexOf(item) + 1)
                    .padStart(2, '0')
                }
                /
                ${String(systems.length).padStart(2, '0')}
              </span>

              <img
                src="${escapeHTML(thumb(item.cover))}"
                alt="Tampilan ${escapeHTML(item.title)}"
                loading="lazy"
                decoding="async"
                width="900"
                height="500"
              >
            </div>

            <div class="project-content">
              <div class="project-category">
                ${escapeHTML(item.category)}
              </div>

              <h3>${escapeHTML(item.title)}</h3>

              <p>${escapeHTML(item.summary)}</p>

              <p class="system-access">
                ${
                  url
                    ? 'Public access'
                    : 'Sistem disembunyikan'
                }
              </p>

              ${url ? fileLink(url, 'Buka Sistem ↗') : ''}
            </div>
          </div>

          <div class="project-footer">
            <button
              type="button"
              data-gallery="${escapeHTML(item.id)}"
              ${gallery.length ? '' : 'disabled'}
            >Lihat Screenshot</button>

            <span>${gallery.length} tampilan</span>
          </div>
        </article>
      `;
    }).join('');

    setText(
      '#result-count',
      `${filtered.length} dari ${systems.length} sistem`
    );

    const empty = $('#empty-projects');

    if (empty) {
      empty.hidden = filtered.length > 0;
    }
  }

  $('#search')?.addEventListener(
    'input',
    renderProjects
  );

  $('#category')?.addEventListener(
    'change',
    renderProjects
  );

  renderProjects();

  /* =========================
     GAMES
     STRUKTUR SAMA DENGAN PORTFOLIO
  ========================= */

  addCategories('#game-category', games);

  function gameCoverPlaceholder() {
    return `
      <div class="game-empty-cover">
        <span class="game-empty-icon" aria-hidden="true">
          🎮
        </span>

        <span class="game-empty-text">
          Sampul belum tersedia
        </span>
      </div>
    `;
  }

  function renderGames() {
    const container = $('#game-projects');
    if (!container) return;

    const query = String($('#game-search')?.value || '')
      .trim()
      .toLocaleLowerCase('id');

    const category = $('#game-category')?.value || '';

    const filtered = games.filter(item =>
      (!category || item.category === category) &&
      [item.title, item.category, item.summary]
        .join(' ')
        .toLocaleLowerCase('id')
        .includes(query)
    );

    container.innerHTML = filtered.map(item => {
      const url = accessUrl(item);
      const cover = safeUrl(item.cover);

      const coverHTML = cover
        ? `
          <img
            class="game-cover-image"
            src="${escapeHTML(cover)}"
            alt="Sampul ${escapeHTML(item.title)}"
            loading="lazy"
            decoding="async"
            width="900"
            height="500"
          >
        `
        : gameCoverPlaceholder();

      return `
        <article class="project-card game-card">
          <div class="project-body">
            <div class="project-image">
              <span class="project-index">
                ${
                  String(games.indexOf(item) + 1)
                    .padStart(2, '0')
                }
                /
                ${String(games.length).padStart(2, '0')}
              </span>

              ${coverHTML}
            </div>

            <div class="project-content">
              <div class="project-category">
                ${escapeHTML(item.category)}
              </div>

              <h3>${escapeHTML(item.title)}</h3>

              <p>${escapeHTML(item.summary)}</p>

              <p class="system-access">
                ${
                  url
                    ? 'Public access'
                    : 'Sistem disembunyikan'
                }
              </p>

              ${
                url
                  ? fileLink(url, 'Mainkan Game ↗')
                  : ''
              }
            </div>
          </div>
        </article>
      `;
    }).join('');

    setText(
      '#game-result-count',
      `${filtered.length} dari ${games.length} game`
    );

    const empty = $('#empty-games');

    if (empty) {
      empty.hidden = filtered.length > 0;
    }
  }

  $('#game-search')?.addEventListener(
    'input',
    renderGames
  );

  $('#game-category')?.addEventListener(
    'change',
    renderGames
  );

  // Jika URL sampul gagal dimuat, tampilkan area pengganti.
  $('#game-projects')?.addEventListener(
    'error',
    event => {
      const image = event.target;

      if (
        !(image instanceof HTMLImageElement) ||
        !image.classList.contains('game-cover-image')
      ) {
        return;
      }

      const replacement = document.createElement('div');

      replacement.className = 'game-empty-cover';

      const icon = document.createElement('span');
      icon.className = 'game-empty-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '🎮';

      const text = document.createElement('span');
      text.className = 'game-empty-text';
      text.textContent = 'Sampul tidak dapat dimuat';

      replacement.append(icon, text);
      image.replaceWith(replacement);
    },
    true
  );

  renderGames();

  /* =========================
     JUMLAH DI BERANDA
  ========================= */

  function updateRoomCounts() {
    const screenshotCount = systems.reduce(
      (total, item) =>
        total + (
          Array.isArray(item.gallery)
            ? item.gallery.length
            : 0
        ),
      0
    );

    const portfolioCount =
      $('#room-portfolio-count') ||
      $('#board-hotspot .hotspot-label small');

    if (portfolioCount) {
      portfolioCount.textContent =
        `${systems.length} sistem · ` +
        `${screenshotCount} screenshot`;
    }

    const researchCount =
      $('#room-research-count') ||
      $('#research-hotspot .hotspot-label small');

    if (researchCount) {
      researchCount.textContent =
        `${research.length} riset`;
    }

    const gameCount = $('#room-games-count');

    if (gameCount) {
      gameCount.textContent = `${games.length} game`;
    }
  }

  updateRoomCounts();

  /* =========================
     DIALOG
  ========================= */

  const galleryDialog = $('#gallery-dialog');
  const researchDialog = $('#research-dialog');

  let returnFocus = null;

  function openDialog(dialog, trigger) {
    if (!dialog) return;

    returnFocus = trigger || document.activeElement;

    dialog.showModal();
    document.body.style.overflow = 'hidden';

    $('.close-dialog', dialog)?.focus();
  }

  [galleryDialog, researchDialog]
    .filter(Boolean)
    .forEach(dialog => {
      $('.close-dialog', dialog)?.addEventListener(
        'click',
        () => dialog.close()
      );

      dialog.addEventListener('close', () => {
        document.body.style.overflow = '';

        if (returnFocus && returnFocus.isConnected) {
          returnFocus.focus();
        }
      });

      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;

        const rectangle = dialog.getBoundingClientRect();

        if (
          event.clientX < rectangle.left ||
          event.clientX > rectangle.right ||
          event.clientY < rectangle.top ||
          event.clientY > rectangle.bottom
        ) {
          dialog.close();
        }
      });
    });

  /* =========================
     GALERI PORTFOLIO
  ========================= */

  let currentSystem = null;
  let imageIndex = 0;

  $('#full-image')?.addEventListener('load', () => {
    const image = $('#full-image');

    image.classList.remove('image-enter');

    requestAnimationFrame(() => {
      image.classList.add('image-enter');
    });
  });

  function showImage(index) {
    if (
      !currentSystem ||
      !Array.isArray(currentSystem.gallery) ||
      !currentSystem.gallery.length
    ) {
      return;
    }

    const gallery = currentSystem.gallery;

    imageIndex =
      (index + gallery.length) % gallery.length;

    const image = gallery[imageIndex];
    const fullImage = $('#full-image');

    if (fullImage) {
      fullImage.classList.remove('image-enter');
      fullImage.src = safeUrl(image.src);
      fullImage.alt =
        `${currentSystem.title} — ${image.caption || ''}`;
    }

    setText('#gallery-caption', image.caption);

    setText(
      '#gallery-number',
      `${imageIndex + 1} / ${gallery.length}`
    );

    const buttons = $$('#gallery-thumbnails button');

    buttons.forEach((button, index) => {
      button.setAttribute(
        'aria-current',
        String(index === imageIndex)
      );
    });

    if (galleryDialog?.open) {
      buttons[imageIndex]?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'auto'
      });
    }
  }

  function openGallery(id, trigger) {
    currentSystem = systems.find(item => item.id === id);

    if (
      !currentSystem ||
      !Array.isArray(currentSystem.gallery) ||
      !currentSystem.gallery.length
    ) {
      return;
    }

    setText('#gallery-title', currentSystem.title);

    setHTML(
      '#gallery-thumbnails',
      currentSystem.gallery.map((image, index) => `
        <button
          type="button"
          data-image="${index}"
          aria-label="Tampilan ${index + 1}: ${escapeHTML(
            image.caption
          )}"
          aria-current="${index === 0}"
        >
          <img
            src="${escapeHTML(thumb(image.src))}"
            alt=""
            loading="lazy"
          >
        </button>
      `).join('')
    );

    showImage(0);
    openDialog(galleryDialog, trigger);

    const thumbnails = $('#gallery-thumbnails');

    if (thumbnails) {
      thumbnails.scrollLeft = 0;
    }
  }

  $('#previous-image')?.addEventListener(
    'click',
    () => showImage(imageIndex - 1)
  );

  $('#next-image')?.addEventListener(
    'click',
    () => showImage(imageIndex + 1)
  );

  $('#gallery-thumbnails')?.addEventListener(
    'click',
    event => {
      const button = event.target.closest('[data-image]');

      if (button) {
        showImage(Number(button.dataset.image));
      }
    }
  );

  galleryDialog?.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(imageIndex + 1);
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showImage(imageIndex - 1);
    }
  });

  let touchX = null;
  let touchY = null;

  $('.image-stage')?.addEventListener(
    'touchstart',
    event => {
      touchX = event.changedTouches[0].clientX;
      touchY = event.changedTouches[0].clientY;
    },
    { passive: true }
  );

  $('.image-stage')?.addEventListener(
    'touchend',
    event => {
      if (touchX === null) return;

      const dx =
        event.changedTouches[0].clientX - touchX;

      const dy =
        event.changedTouches[0].clientY - touchY;

      if (
        Math.abs(dx) > 45 &&
        Math.abs(dx) > Math.abs(dy)
      ) {
        showImage(imageIndex + (dx < 0 ? 1 : -1));
      }

      touchX = null;
      touchY = null;
    },
    { passive: true }
  );

  /* =========================
     RISET
  ========================= */

  const topics = [
    'Semua',
    ...new Set(
      research
        .map(item => item.topic)
        .filter(Boolean)
        .filter(topic => topic !== 'Semua')
    )
  ];

  setHTML(
    '#research-filters',
    topics.map((topic, index) => `
      <button
        type="button"
        data-topic="${escapeHTML(topic)}"
        aria-pressed="${index === 0}"
      >${escapeHTML(topic)}</button>
    `).join('')
  );

  function renderResearch(topic) {
    setHTML(
      '#research',
      research
        .filter(item =>
          topic === 'Semua' || item.topic === topic
        )
        .map(item => `
          <article class="research-row">
            <span class="research-number">
              ${
                String(research.indexOf(item) + 1)
                  .padStart(2, '0')
              }
            </span>

            <div>
              <span class="tag">
                ${escapeHTML(item.type)}
              </span>

              <h3>${escapeHTML(item.title)}</h3>

              <p>${escapeHTML(item.summary)}</p>

              <p class="research-method">
                <strong>Fokus:</strong>
                ${escapeHTML(item.focus)}<br>

                <strong>Metode:</strong>
                ${escapeHTML(item.method)}
              </p>

              <p class="research-authors">
                ${
                  (
                    Array.isArray(item.authors)
                      ? item.authors
                      : []
                  ).map(escapeHTML).join(' · ')
                }
              </p>
            </div>

            <div class="research-actions">
              <button
                type="button"
                class="button secondary"
                data-research="${escapeHTML(item.id)}"
              >Baca Ringkasan</button>

              ${
                fileLink(
                  item.documentUrl,
                  'Lihat Dokumen'
                )
              }

              <span class="research-status">
                ${escapeHTML(item.status)}
              </span>
            </div>
          </article>
        `).join('')
    );
  }

  $('#research-filters')?.addEventListener(
    'click',
    event => {
      const button =
        event.target.closest('[data-topic]');

      if (!button) return;

      $$('#research-filters button').forEach(item => {
        item.setAttribute(
          'aria-pressed',
          String(item === button)
        );
      });

      renderResearch(button.dataset.topic);
    }
  );

  renderResearch('Semua');

  function openResearch(id, trigger) {
    const item = research.find(entry => entry.id === id);
    if (!item) return;

    const authors = Array.isArray(item.authors)
      ? item.authors
      : [];

    const supports = Array.isArray(item.supports)
      ? item.supports
      : [];

    setHTML(
      '#research-detail',
      `
        <span class="tag">
          ${escapeHTML(item.type)}
        </span>

        <h2 id="research-title">
          ${escapeHTML(item.title)}
        </h2>

        <p class="research-authors">
          ${authors.map(escapeHTML).join(' · ')}
        </p>

        <p>${escapeHTML(item.summary)}</p>

        <h3>Fokus & metode</h3>

        <p>
          ${escapeHTML(item.focus)}<br>
          ${escapeHTML(item.method)}
        </p>

        <h3>Ringkasan</h3>

        <p>${escapeHTML(item.detail)}</p>

        <div class="actions">
          ${fileLink(item.documentUrl, 'Lihat Dokumen')}

          ${
            supports
              .map(link => fileLink(link.url, link.label))
              .join('')
          }
        </div>

        <span class="research-status">
          ${escapeHTML(item.status)}
        </span>
      `
    );

    openDialog(researchDialog, trigger);
  }

  document.addEventListener('click', event => {
    const galleryButton =
      event.target.closest('[data-gallery]');

    if (galleryButton) {
      openGallery(
        galleryButton.dataset.gallery,
        galleryButton
      );
    }

    const researchButton =
      event.target.closest('[data-research]');

    if (researchButton) {
      openResearch(
        researchButton.dataset.research,
        researchButton
      );
    }
  });

  /* =========================
     ANIMASI HALAMAN
  ========================= */

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  function updateMotion() {
    document.documentElement.classList.remove(
      'motion-paused'
    );

    document.documentElement.classList.toggle(
      'motion-reduced',
      reducedMotion.matches
    );
  }

  reducedMotion.addEventListener?.(
    'change',
    updateMotion
  );

  updateMotion();

  $$('.focus-strip span').forEach((element, index) => {
    element.style.setProperty(
      '--item-delay',
      `${index * 80}ms`
    );
  });

  if ('IntersectionObserver' in window) {
    const cardsObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('motion-visible');
            cardsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06 }
    );

    const animatedSelectors =
      '.project-card,.research-row,.cert,.experience-row';

    function observeCards() {
      $$(animatedSelectors).forEach((element, index) => {
        if (element.classList.contains('motion-item')) {
          return;
        }

        element.classList.add('motion-item');

        element.style.setProperty(
          '--item-delay',
          `${(index % 3) * 65}ms`
        );

        cardsObserver.observe(element);
      });
    }

    observeCards();

    const cardChanges = new MutationObserver(
      observeCards
    );

    [
      $('#projects'),
      $('#research'),
      $('#game-projects')
    ]
      .filter(Boolean)
      .forEach(container => {
        cardChanges.observe(container, {
          childList: true
        });
      });

    if (!reducedMotion.matches) {
      document.documentElement.classList.add(
        'js-motion'
      );

      const revealObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08 }
      );

      $$('.reveal').forEach(element => {
        revealObserver.observe(element);
      });
    }
  }

  function updateBackTop() {
    const button = $('.back-top');

    if (button) {
      button.hidden = window.scrollY < 600;
    }
  }

  window.addEventListener(
    'scroll',
    updateBackTop,
    { passive: true }
  );

  updateBackTop();
})();
