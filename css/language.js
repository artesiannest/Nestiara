(function () {
  'use strict';
  const languages = {
    id: { code: 'ID', label: 'Bahasa Indonesia', flag: 'id' },
    en: { code: 'EN', label: 'English', flag: 'gb' },
    th: { code: 'TH', label: 'ไทย · Thai', flag: 'th' },
    'zh-CN': { code: '中文', label: '中文 (简体) · Chinese', flag: 'cn' }
  };
  const key = 'nestiara-language-v1';
  let language = 'id';
  try { const saved = localStorage.getItem(key); if (languages[saved]) language = saved; } catch (_) {}
  const textSources = new WeakMap(), attributeSources = new WeakMap();
  const normalize = s => s.replace(/\s+/g, ' ').trim();
  const skip = 'script,style,textarea,code,pre,svg,[contenteditable="true"],[data-no-translate],.language-switcher';
  function flag(country) {
    const shapes = {
      id: '<path fill="#fff" d="M0 0h30v20H0z"/><path fill="#e63838" d="M0 0h30v10H0z"/>',
      gb: '<path fill="#183d83" d="M0 0h30v20H0z"/><path stroke="#fff" stroke-width="5" d="m0 0 30 20M30 0 0 20"/><path stroke="#d52b36" stroke-width="2" d="m0 0 30 20M30 0 0 20"/><path stroke="#fff" stroke-width="7" d="M15 0v20M0 10h30"/><path stroke="#d52b36" stroke-width="4" d="M15 0v20M0 10h30"/>',
      th: '<path fill="#cf2838" d="M0 0h30v20H0z"/><path fill="#fff" d="M0 3.33h30v13.34H0z"/><path fill="#27316e" d="M0 6.67h30v6.66H0z"/>',
      cn: '<path fill="#de2910" d="M0 0h30v20H0z"/><g fill="#ffde00"><path d="m5 2 1 3h3L6.6 7l.9 3L5 8.2 2.5 10l.9-3L1 5h3z"/><path d="m10 1 .45 1.2 1.3.05-1 .8.35 1.25-1.1-.7-1.05.75.3-1.3-1.05-.75 1.3-.1z"/><path d="m13 4 .45 1.2 1.3.05-1 .8.35 1.25-1.1-.7-1.05.75.3-1.3-1.05-.75 1.3-.1z"/><path d="m13 8 .45 1.2 1.3.05-1 .8.35 1.25-1.1-.7-1.05.75.3-1.3-1.05-.75 1.3-.1z"/><path d="m10 11 .45 1.2 1.3.05-1 .8.35 1.25-1.1-.7-1.05.75.3-1.3-1.05-.75 1.3-.1z"/></g>'
    };
    return '<svg class="language-flag" viewBox="0 0 30 20" aria-hidden="true" focusable="false">' + shapes[country] + '</svg>';
  }
  function translate(source) {
    if (language === 'id') return source;
    const text = normalize(source);
    const dict = window.NEST_TRANSLATIONS || {};
    let output = dict[text] && dict[text][language];
    if (!output) {
      const counters = [
        [/^(\d+) sistem · (\d+) (screenshot|tampilan)$/, {en:'$1 systems · $2 screenshots',th:'$1 ระบบ · $2 ภาพหน้าจอ','zh-CN':'$1 个系统 · $2 张截图'}],
        [/^(\d+) sistem\.$/, {en:'$1 systems.',th:'$1 ระบบ','zh-CN':'$1 个系统。'}],
        [/^(\d+) sistem$/, {en:'$1 systems',th:'$1 ระบบ','zh-CN':'$1 个系统'}],
        [/^(\d+) riset(?: akademik)?$/, {en:'$1 research works',th:'$1 งานวิจัย','zh-CN':'$1 项研究'}],
        [/^(\d+) game$/, {en:'$1 games',th:'$1 เกม','zh-CN':'$1 个游戏'}],
        [/^(\d+) (?:dari|\/) (\d+) sistem$/, {en:'$1 of $2 systems',th:'$1 จาก $2 ระบบ','zh-CN':'$1 / $2 个系统'}],
        [/^IPK (.*)$/, {en:'GPA $1',th:'เกรดเฉลี่ย $1','zh-CN':'平均绩点 $1'}],
        [/^Tugas akhir: (.*)$/, {en:'Thesis: $1',th:'วิทยานิพนธ์: $1','zh-CN':'毕业论文：$1'}]
      ];
      for (const [pattern, values] of counters) if (pattern.test(text)) { output = text.replace(pattern,values[language]); break; }
      if (!output) {
        const numbered = text.match(/^(.*?) (\d+)$/);
        if (numbered && dict[numbered[1]]?.[language]) output = dict[numbered[1]][language] + ' ' + numbered[2];
      }
      if (!output && /^(?:Kamar Nest|Kamar Nestiara|Tentang & Pengalaman|Portfolio Sistem|Riset Akademik|Kontak|Games) [—|] Nestiara(?: Lidya Kakihary)?$/.test(text)) {
        const base = text.split(/ [—|] /)[0];
        const name = base.startsWith('Kamar') ? ({en:'Room',th:'ห้องทำงาน','zh-CN':'工作室'})[language] : (dict[base]?.[language] || base);
        output = name + ' | Nestiara';
      }
    }
    if (!output) return source;
    const before = source.match(/^\s*/)[0], after = source.match(/\s*$/)[0];
    return before + output + after;
  }
  function translateText(node) {
    if (!node.parentElement || node.parentElement.closest(skip)) return;
    let record = textSources.get(node);
    if (!record || node.nodeValue !== record.output) record = { source: node.nodeValue, output: node.nodeValue };
    const output = translate(record.source);
    if (node.nodeValue !== output) node.nodeValue = output;
    record.output = output; textSources.set(node,record);
  }
  function translateAttributes(el) {
    if (el.closest(skip)) return;
    let records = attributeSources.get(el) || {};
    for (const name of ['placeholder','title','aria-label','alt']) {
      if (!el.hasAttribute(name)) continue;
      const value=el.getAttribute(name);
      let record=records[name];
      if (!record || value!==record.output) record={source:value,output:value};
      const output=translate(record.source);
      if (value!==output) el.setAttribute(name,output);
      record.output=output;records[name]=record;
    }
    attributeSources.set(el,records);
  }
  const observer = new MutationObserver(() => {
    if (apply.timer) return;
    apply.timer=setTimeout(() => {apply.timer=null;apply();},20);
  });
  const observe=()=>observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder','alt']});
  function apply() {
    observer.disconnect();
    document.documentElement.lang=language;
    const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
    let node;while ((node=walker.nextNode())) translateText(node);
    document.querySelectorAll('[placeholder],[title],[aria-label],[alt]').forEach(translateAttributes);
    observe();
  }
  function setLanguage(value) {
    if (!languages[value]) return;
    language=value;
    try {localStorage.setItem(key,language);} catch (_) {}
    const item=languages[language];
    const selected=document.getElementById('language-current');
    if (selected) selected.innerHTML=flag(item.flag)+'<span>'+item.code+'</span><span class="language-chevron" aria-hidden="true">⌄</span>';
    document.querySelectorAll('[data-language]').forEach(button=>{
      const active=button.dataset.language===language;
      button.setAttribute('aria-pressed',String(active));
      button.classList.toggle('selected',active);
    });
    apply();
  }
  function init() {
    const host=document.getElementById('language-switcher');
    if (!host) return;
    host.innerHTML='<summary id="language-current" aria-label="Choose language / Pilih bahasa"></summary><div class="language-options" role="group" aria-label="Language / Bahasa">'+Object.entries(languages).map(([key,item])=>'<button type="button" data-language="'+key+'" lang="'+key+'">'+flag(item.flag)+'<span>'+item.label+'</span><span class="language-check" aria-hidden="true">✓</span></button>').join('')+'</div>';
    host.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{setLanguage(button.dataset.language);host.open=false;host.querySelector('summary').focus();}));
    document.addEventListener('click',event=>{if(!host.contains(event.target))host.open=false;});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&host.open){host.open=false;host.querySelector('summary').focus();}});
    setLanguage(language);
  }
  window.NestLanguage={setLanguage,translate,getLanguage:()=>language,refresh:apply};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
