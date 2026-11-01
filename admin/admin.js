(function () {
  'use strict';

  const $ = s => document.querySelector(s);
  const clone = v => JSON.parse(JSON.stringify(v));

  const labels = {
    profile: 'Profil & Kontak',
    experience: 'Pengalaman',
    systems: 'Portfolio Sistem',
    games: 'Games',
    research: 'Riset Akademik',
    education: 'Pendidikan',
    skills: 'Keahlian',
    certificates: 'Sertifikasi'
  };

  const schemas = {
    profile: {
      name: 'Nama lengkap',
      nickname: 'Nama panggilan',
      title: 'Profesi',
      headline: 'Judul perkenalan',
      heroDescription: 'Deskripsi perkenalan',
      aboutDescription: 'Tentang saya',
      email: 'Email publik',
      phone: 'Nomor telepon',
      whatsapp: 'WhatsApp (angka saja, awalan 62)',
      location: 'Lokasi',
      resumeUrl: 'Resume',
      website: 'Website',
      linkedinUrl: 'LinkedIn',
      githubUrl: 'GitHub'
    },
    experience: {
      period: 'Periode',
      role: 'Jabatan',
      company: 'Perusahaan / klien',
      description: 'Tanggung jawab'
    },
    systems: {
      id: 'Kode unik sistem',
      title: 'Nama sistem',
      category: 'Kategori',
      summary: 'Deskripsi singkat',
      cover: 'Gambar sampul sistem',
      accessStatus: 'Status akses sistem',
      publicUrl: 'Tautan Public Access',
      documentationUrl: 'Dokumentasi Google Docs',
      demoUrl: 'Demo',
      sourceUrl: 'Source code'
    },
    games: {
      id: 'Kode unik game',
      title: 'Nama game',
      category: 'Kategori',
      summary: 'Deskripsi singkat',
      cover: 'Gambar sampul game',
      accessStatus: 'Status akses game',
      publicUrl: 'Tautan game'
    },
    research: {
      id: 'Kode unik riset',
      title: 'Judul riset',
      topic: 'Topik',
      type: 'Jenis penelitian',
      authors: 'Penulis (satu per baris)',
      summary: 'Deskripsi singkat',
      focus: 'Fokus',
      method: 'Metode',
      detail: 'Ringkasan lengkap',
      documentUrl: 'Dokumen riset',
      status: 'Status'
    },
    education: {
      level: 'Jenjang / program',
      institution: 'Institusi',
      period: 'Periode',
      gpa: 'IPK',
      thesis: 'Tugas akhir',
      status: 'Status'
    },
    skills: {
      title: 'Kelompok keahlian',
      items: 'Daftar keahlian (satu per baris)'
    },
    certificates: {
      title: 'Nama sertifikasi',
      issuer: 'Penerbit',
      date: 'Tanggal'
    }
  };

  const nested = {
    gallery: { src: 'Gambar screenshot', caption: 'Keterangan' },
    supports: { label: 'Nama dokumen pendukung', url: 'Dokumen' }
  };

  const urls = new Set([
    'resumeUrl', 'cover', 'src', 'documentUrl', 'url',
    'website', 'linkedinUrl', 'githubUrl', 'documentationUrl',
    'demoUrl', 'sourceUrl', 'publicUrl'
  ]);

  const uploadKeys = new Set([
    'resumeUrl', 'cover', 'src', 'documentUrl', 'url'
  ]);

  let content = null;
  let revision = 0;
  let section = 'profile';
  let dirty = false;
  let busy = false;

  const draftKey = 'nest-portfolio-admin-draft';

  function normalize(data) {
    if (!Array.isArray(data.games)) data.games = [];
    return data;
  }

  function notice(message, error = false) {
    $('#notice').textContent = message;
    $('#notice').classList.toggle('error', error);
  }

  function status() {
    $('#state').textContent =
      `Versi ${revision} · ` +
      (dirty
        ? 'Ada perubahan belum diterbitkan'
        : 'Konten sesuai publikasi terakhir');
  }

  function changed() {
    dirty = true;
    status();
  }

  function el(tag, text, klass) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (klass) node.className = klass;
    return node;
  }

  function button(text, fn, klass) {
    const b = el('button', text, klass);
    b.type = 'button';
    b.addEventListener('click', fn);
    return b;
  }

  async function task(fn) {
    if (busy) return;
    busy = true;

    const controls = () => document.querySelectorAll(
      '.toolbar button,#login-button,.history button'
    );

    controls().forEach(b => b.disabled = true);

    try {
      await fn();
    } catch (e) {
      notice(
        e.name === 'AbortError'
          ? 'Koneksi terlalu lama. Coba lagi.'
          : e.message,
        true
      );
    } finally {
      busy = false;
      controls().forEach(b => b.disabled = false);
    }
  }

  function safeUrl(value) {
    if (!value) return true;

    if (
      /^assets\/[\w./ -]+$/.test(value) &&
      !value.includes('..')
    ) return true;

    try {
      const u = new URL(value);
      return /^https?:$/.test(u.protocol) &&
        !u.username && !u.password;
    } catch (_) {
      return false;
    }
  }

  function validate(data) {
    normalize(data);

    if (!data.profile || !String(data.profile.name || '').trim()) {
      throw new Error('Nama profil wajib diisi.');
    }

    for (const key of Object.keys(labels)) {
      if (key !== 'profile' && !Array.isArray(data[key])) {
        throw new Error(`Data ${labels[key]} harus berupa daftar.`);
      }
    }

    for (const key of ['systems', 'research', 'games']) {
      const ids = new Set();

      for (const item of data[key]) {
        if (
          !/^[a-zA-Z0-9_-]+$/.test(item.id || '') ||
          ids.has(item.id)
        ) {
          throw new Error(
            `Kode ${labels[key]} wajib unik dan hanya berisi huruf, angka, - atau _.`
          );
        }

        ids.add(item.id);

        if (!String(item.title || '').trim()) {
          throw new Error(`Judul ${labels[key]} wajib diisi.`);
        }
      }
    }

    function walk(obj) {
      for (const [key, value] of Object.entries(obj)) {
        if (
          urls.has(key) &&
          typeof value === 'string' &&
          !safeUrl(value)
        ) {
          throw new Error(
            `Tautan ${key} tidak valid. Gunakan https:// atau assets/.`
          );
        }

        if (value && typeof value === 'object') walk(value);
      }
    }

    walk(data);

    for (const item of [...data.systems, ...data.games]) {
      if (
        item.accessStatus === 'public' &&
        (
          !/^https?:\/\//i.test(item.publicUrl || '') ||
          !safeUrl(item.publicUrl)
        )
      ) {
        throw new Error(
          `Isi tautan Public Access yang valid untuk ${item.title}.`
        );
      }
    }

    for (const system of data.systems) {
      if (!Array.isArray(system.gallery) || !system.gallery.length) {
        throw new Error(
          `Sistem ${system.title} membutuhkan minimal satu screenshot.`
        );
      }

      if (system.gallery.some(image => !image.src)) {
        throw new Error(`Gambar galeri ${system.title} belum diisi.`);
      }

      if (system.documentationUrl) {
        const u = new URL(system.documentationUrl);

        if (
          u.protocol !== 'https:' ||
          u.hostname !== 'docs.google.com' ||
          !u.pathname.startsWith('/document/')
        ) {
          throw new Error(
            'Dokumentasi sistem harus berupa tautan Google Docs.'
          );
        }
      }
    }

    for (const research of data.research) {
      if (
        !Array.isArray(research.authors) ||
        !Array.isArray(research.supports)
      ) {
        throw new Error(
          'Penulis atau dokumen pendukung riset tidak valid.'
        );
      }
    }
  }

  function field(obj, key, label) {
    const wrap = el('label', label);

    if (key === 'accessStatus') {
      const select = el('select');

      for (const [value, text] of [
        ['hidden', 'Sistem disembunyikan'],
        ['public', 'Public access']
      ]) {
        const option = el('option', text);
        option.value = value;
        select.append(option);
      }

      select.value = obj[key] === 'public' ? 'public' : 'hidden';

      select.addEventListener('change', () => {
        obj[key] = select.value;
        changed();
      });

      wrap.append(select);
      return wrap;
    }

    const array = Array.isArray(obj[key]);
    const long = array || [
      'description', 'heroDescription', 'aboutDescription',
      'summary', 'detail', 'focus', 'method', 'thesis'
    ].includes(key);

    if (long) wrap.classList.add('wide');

    const input = el(long ? 'textarea' : 'input');
    if (!long) input.type = 'text';

    input.value = array ? obj[key].join('\n') : (obj[key] ?? '');

    if (key === 'publicUrl') input.placeholder = 'https://...';
    if (key === 'cover') input.placeholder = 'Unggah gambar atau isi URL gambar';

    input.addEventListener('input', () => {
      obj[key] = array
        ? input.value.split('\n').map(v => v.trim()).filter(Boolean)
        : input.value;

      changed();
    });

    if (!uploadKeys.has(key)) {
      wrap.append(input);
      return wrap;
    }

    const row = el('div', null, 'upload-row');
    row.append(input);

    const pick = el('input');
    pick.type = 'file';
    pick.hidden = true;

    const imageField = key === 'cover' || key === 'src';

    pick.accept = imageField
      ? '.png,.jpg,.jpeg,.webp'
      : '.png,.jpg,.jpeg,.webp,.pdf,.docx,.pptx';

    const upload = button('Unggah', () => pick.click());

    pick.addEventListener('change', async () => {
      const file = pick.files[0];
      if (!file) return;

      if (
        imageField &&
        !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
      ) {
        notice('Pilih gambar PNG, JPG, atau WEBP.', true);
        pick.value = '';
        return;
      }

      upload.disabled = true;

      try {
        const url = await NestCMS.upload(file);
        obj[key] = url;
        input.value = url;
        changed();
        notice('File berhasil diunggah. Klik Terbitkan untuk menampilkannya.');
      } catch (e) {
        notice(e.message, true);
      } finally {
        upload.disabled = false;
        pick.value = '';
      }
    });

    row.append(upload, pick);
    wrap.append(row);
    return wrap;
  }

  function form(obj, schema) {
    const grid = el('div', null, 'fields');

    for (const [key, label] of Object.entries(schema)) {
      grid.append(field(obj, key, label));
    }

    return grid;
  }

  function move(list, index, delta) {
    const next = index + delta;
    if (next < 0 || next >= list.length) return;

    [list[index], list[next]] = [list[next], list[index]];
    changed();
    render();
  }

  function nestedEditor(item, key) {
    if (!Array.isArray(item[key])) item[key] = [];

    const panel = el('div', null, 'wide');
    panel.append(el(
      'h3',
      key === 'gallery' ? 'Screenshot galeri' : 'Dokumen pendukung'
    ));

    item[key].forEach((obj, i) => {
      const box = el('div', null, 'nested');
      const head = el('div', null, 'entry-head');

      head.append(el(
        'h3',
        `${key === 'gallery' ? 'Screenshot' : 'Dokumen'} ${i + 1}`
      ));

      const actions = el('div', null, 'entry-actions');

      actions.append(
        button('↑', () => move(item[key], i, -1)),
        button('↓', () => move(item[key], i, 1)),
        button('Hapus', () => {
          if (!confirm('Hapus item ini dari draft?')) return;
          item[key].splice(i, 1);
          changed();
          render();
        }, 'danger')
      );

      head.append(actions);
      box.append(head, form(obj, nested[key]));
      panel.append(box);
    });

    panel.append(button(
      key === 'gallery' ? '+ Screenshot' : '+ Dokumen pendukung',
      () => {
        item[key].push(
          key === 'gallery'
            ? { src: '', caption: '' }
            : { label: '', url: '' }
        );
        changed();
        render();
      }
    ));

    return panel;
  }

  function newItem(key) {
    const item = {};

    for (const fieldName of Object.keys(schemas[key])) {
      item[fieldName] = '';
    }

    if (key === 'skills') item.items = [];

    if (key === 'games') {
      Object.assign(item, {
        id: 'game-' + Date.now(),
        accessStatus: 'hidden',
        cover: ''
      });
    }

    if (key === 'systems') {
      Object.assign(item, {
        id: 'system-' + Date.now(),
        gallery: [],
        accessStatus: 'hidden',
        accessType: 'gallery',
        requiresLogin: null
      });
    }

    if (key === 'research') {
      Object.assign(item, {
        id: 'research-' + Date.now(),
        authors: [],
        supports: [],
        status: 'Naskah riset akademik'
      });
    }

    return item;
  }

  function render() {
    normalize(content);
    $('#section-title').textContent = labels[section];

    const editor = $('#editor');
    editor.replaceChildren();

    const stats = $('#stats');
    stats.replaceChildren();

    for (const [label, value] of [
      ['Sistem', content.systems.length],
      ['Games', content.games.length],
      ['Riset', content.research.length],
      ['Pengalaman', content.experience.length]
    ]) {
      const stat = el('div', null, 'stat');
      stat.append(el('strong', String(value)), el('span', label));
      stats.append(stat);
    }

    if (section === 'profile') {
      const box = el('section', null, 'entry');
      box.append(form(content.profile, schemas.profile));
      editor.append(box);
    } else {
      content[section].forEach((item, i) => {
        const box = el('section', null, 'entry');
        const head = el('div', null, 'entry-head');

        head.append(el(
          'h2',
          `${i + 1}. ${item.title || item.role || item.level || 'Item baru'}`
        ));

        const actions = el('div', null, 'entry-actions');

        actions.append(
          button('↑', () => move(content[section], i, -1)),
          button('↓', () => move(content[section], i, 1)),
          button('Hapus', () => {
            if (!confirm(
              'Hapus item ini dari draft? Perubahan berlaku setelah diterbitkan.'
            )) return;

            content[section].splice(i, 1);
            changed();
            render();
          }, 'danger')
        );

        head.append(actions);
        box.append(head, form(item, schemas[section]));

        if (section === 'systems') {
          box.append(nestedEditor(item, 'gallery'));
        }

        if (section === 'research') {
          box.append(nestedEditor(item, 'supports'));
        }

        editor.append(box);
      });

      if (!content[section].length) {
        editor.append(el(
          'p', 'Belum ada item. Tambahkan konten pertama.', 'empty'
        ));
      }

      editor.append(button('+ Tambah ' + labels[section], () => {
        content[section].push(newItem(section));
        changed();
        render();
      }));
    }

    document.querySelectorAll('#tabs button').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.key === section));
    });

    status();
  }

  async function history() {
    const select = $('#versions');
    select.replaceChildren();

    const rows = await NestCMS.history();

    for (const row of rows) {
      const option = el(
        'option',
        `Versi ${row.revision} · ${new Date(row.created_at).toLocaleString('id-ID')}`
      );
      option.value = row.id;
      select.append(option);
    }

    if (!rows.length) {
      const option = el('option', 'Belum ada publikasi');
      option.value = '';
      select.append(option);
    }
  }

  async function load() {
    const rows = await NestCMS.readAdmin();
    content = normalize(clone(rows[0]?.content || window.PORTFOLIO_DATA));
    revision = rows[0]?.revision || 0;
    dirty = false;
    render();
    await history();

    if (!rows.length) {
      notice('Data awal dimuat. Periksa lalu klik Terbitkan untuk mengaktifkan CMS.');
    }
  }

  async function enter() {
    const user = await NestCMS.authorize();
    $('#user-email').textContent = user.email;
    $('#login').hidden = true;
    $('#dashboard').hidden = false;
    await load();
  }

  for (const [key, label] of Object.entries(labels)) {
    const b = button(label, () => {
      section = key;
      render();
    });
    b.dataset.key = key;
    $('#tabs').append(b);
  }

  $('#login-form').addEventListener('submit', e => {
    e.preventDefault();

    task(async () => {
      await NestCMS.login($('#email').value, $('#password').value);
      $('#password').value = '';
      await enter();
      notice('Selamat datang, Nest.');
    });
  });

  $('#logout').addEventListener('click', () => task(async () => {
    if (dirty && !confirm(
      'Keluar dengan perubahan belum diterbitkan? Simpan draft jika diperlukan.'
    )) return;

    await NestCMS.logout();
    location.reload();
  }));

  $('#publish').addEventListener('click', () => task(async () => {
    validate(content);
    if (!confirm('Terbitkan perubahan ini ke website publik?')) return;

    revision = await NestCMS.publish(content, revision);
    dirty = false;
    status();
    await history();
    notice(`Versi ${revision} berhasil diterbitkan. Muat ulang website.`);
  }));

  $('#draft').addEventListener('click', () => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({
        content,
        date: new Date().toISOString(),
        revision
      }));
      notice('Draft tersimpan di browser ini. Belum tampil di website.');
    } catch (e) {
      notice('Draft tidak dapat disimpan: ' + e.message, true);
    }
  });

  $('#load-draft').addEventListener('click', () => {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
      if (!draft) throw new Error('Belum ada draft di browser ini.');

      if (dirty && !confirm('Ganti perubahan saat ini dengan draft tersimpan?')) {
        return;
      }

      validate(draft.content);
      content = normalize(clone(draft.content));
      changed();
      render();
      notice('Draft dibuka. Periksa sebelum menerbitkan.');
    } catch (e) {
      notice(e.message, true);
    }
  });

  $('#reload').addEventListener('click', () => task(async () => {
    if (dirty && !confirm('Buang perubahan dan muat konten terbaru?')) return;
    await load();
    notice('Konten terbaru dimuat.');
  }));

  $('#restore').addEventListener('click', () => task(async () => {
    if (!$('#versions').value) throw new Error('Belum ada versi tersimpan.');
    if (dirty && !confirm('Ganti perubahan dengan versi yang dipilih?')) return;

    content = normalize(clone(await NestCMS.version($('#versions').value)));
    changed();
    render();
    notice('Versi lama dibuka sebagai draft. Klik Terbitkan untuk memulihkan.');
  }));

  $('#export').addEventListener('click', () => {
    const blob = new Blob(
      [JSON.stringify(content, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = el('a');
    a.href = url;
    a.download = 'nest-portfolio-backup.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  window.addEventListener('beforeunload', e => {
    if (dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  if (!NestCMS.configured()) {
    $('#setup').hidden = false;
    $('#login-button').disabled = true;
  } else {
    task(async () => {
      try {
        await enter();
      } catch (_) {
        $('#login').hidden = false;
        $('#dashboard').hidden = true;
      }
    });
  }
})();
