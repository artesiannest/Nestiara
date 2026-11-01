(async function () {
  'use strict';

  // Ambil konten terbaru dari CMS.
  if (window.NestCMS && NestCMS.configured()) {
    try {
      const rows = await NestCMS.readPublic();

      if (rows[0] && rows[0].content) {
        window.PORTFOLIO_DATA = rows[0].content;
      }
    } catch (error) {
      console.warn(
        'CMS tidak tersedia; menggunakan data cadangan.',
        error.message
      );
    }
  }

  // Public identity is fixed even when older CMS content is loaded.
  const publicData = window.PORTFOLIO_DATA;
  if (publicData && publicData.profile) {
    publicData.profile.name = 'Nestiara';
    publicData.profile.nickname = 'Nestiara';
    for (const field of ['heroDescription', 'aboutDescription']) {
      if (typeof publicData.profile[field] === 'string') {
        publicData.profile[field] = publicData.profile[field]
          .replace(/Nestiara\s+Lidya\s+Kakihary/gi, 'Nestiara')
          .replace(/\bNest\b/g, 'Nestiara');
      }
    }
  }

  function updateCounts() {
    const data = window.PORTFOLIO_DATA;
    if (!data) return;

    const systems = Array.isArray(data.systems)
      ? data.systems
      : [];

    const research = Array.isArray(data.research)
      ? data.research
      : [];

    const screenshots = systems.reduce(
      (total, system) =>
        total + (
          Array.isArray(system.gallery)
            ? system.gallery.length
            : 0
        ),
      0
    );

    // Targetkan label mading, bukan caption screenshot.
    const boardLabel = document.getElementById(
  'room-portfolio-count'
    );

    if (boardLabel) {
      boardLabel.textContent =
        `${systems.length} sistem · ${screenshots} tampilan`;
    }

    const researchLabel = document.querySelector(
      '#research-hotspot .hotspot-label small'
    );

    if (researchLabel) {
      researchLabel.textContent =
        `${research.length} riset akademik`;
    }

    const portfolioHeading = document.querySelector(
      '#portfolio .section-heading h2 em'
    );

    if (portfolioHeading) {
      portfolioHeading.textContent =
        `${systems.length} sistem.`;
    }
  }

  updateCounts();

  // Jalankan tampilan setelah data selesai dimuat.
  for (const path of ['js/main.js', 'js/room.js']) {
    await new Promise(resolve => {
      const script = document.createElement('script');
      script.src = path + '?v=nestiara-20261102';
      script.onload = resolve;

      script.onerror = () => {
        console.error('Gagal memuat:', path);
        resolve();
      };

      document.body.appendChild(script);
    });
  }

  updateCounts();
})();
