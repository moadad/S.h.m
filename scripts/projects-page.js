import { db } from './firebase-config.js';
import { defaultProjects, defaultBeforeAfter, defaultSettings } from './default-data.js';
import { qs, whatsappUrl, socialIconMap } from './utils.js';
import { collection, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const state = { projects: defaultProjects, beforeAfter: defaultBeforeAfter, settings: defaultSettings };

async function loadData() {
  try {
    const [projectsSnap, beforeAfterSnap, settingsSnap] = await Promise.all([
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'beforeAfter')),
      getDoc(doc(db, 'settings', 'site'))
    ]);
    state.projects = projectsSnap.empty ? defaultProjects : projectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    state.beforeAfter = beforeAfterSnap.empty ? defaultBeforeAfter : beforeAfterSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    state.settings = settingsSnap.exists() ? { ...defaultSettings, ...settingsSnap.data() } : defaultSettings;
  } catch (e) {
    console.error(e);
  }
  renderProjects();
  renderBeforeAfter();
  renderContact();
}

function renderProjects() {
  const grid = qs('#projectsPageGrid');
  if (!grid) return;
  grid.innerHTML = state.projects.map(project => `
    <article class="project-card royal-card premium-panel large">
      <div class="project-image" style="background-image:url('${project.image}')"></div>
      <div class="project-content">
        <div class="project-meta"><span>${project.category}</span><span>${project.area}</span></div>
        <h3>${project.title}</h3>
        <p>${project.summary}</p>
        <div class="project-stats">${(project.stats || []).map(stat => `<span>${stat}</span>`).join('')}</div>
      </div>
    </article>`).join('');
}

function renderBeforeAfter() {
  const grid = qs('#beforeAfterPageGrid');
  if (!grid) return;
  grid.innerHTML = state.beforeAfter.map(item => `
    <article class="before-after-card royal-card premium-panel large">
      <div class="before-after-images">
        <div class="before-shot"><span class="before-after-badge">قبل</span><div class="before-after-image" style="background-image:url('${item.beforeImage}')"></div></div>
        <div class="after-shot"><span class="before-after-badge gold">بعد</span><div class="before-after-image" style="background-image:url('${item.afterImage}')"></div></div>
      </div>
      <div class="before-after-copy">
        <div class="project-meta"><span>${item.area}</span><span>تنفيذ موثق</span></div>
        <h3>${item.title}</h3>
        <p>${item.summary}</p>
      </div>
    </article>`).join('');
}

function renderContact() {
  const wrap = qs('#projectsContact');
  if (!wrap) return;
  const phoneCards = (state.settings.contactPhones || []).filter(x => x.showOnSite !== false).map(phone => `<a class="social-chip" href="tel:${phone.number}">📞 ${phone.label}</a>`);
  const whatsappCards = (state.settings.whatsappNumbers || []).filter(x => x.showOnSite !== false).map(item => `<a class="social-chip" href="${whatsappUrl(item.number, item.defaultMessage || 'مرحبًا')}">💬 ${item.label}</a>`);
  const socials = Object.entries(state.settings.socialLinks || {}).filter(([, value]) => value).map(([key, value]) => `<a class="social-chip" href="${value}" target="_blank" rel="noopener">${socialIconMap[key] || '🔗'} ${key}</a>`);
  wrap.innerHTML = [...phoneCards, ...whatsappCards, ...socials].join('') || `<a class="btn btn-primary" href="request.html">اطلب خدمة الآن</a>`;
}

loadData();
