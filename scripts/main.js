import { db, PRIMARY_NOTIFICATION_EMAIL } from './firebase-config.js';
import { defaultServices, defaultAreas, defaultProducts, defaultOffers, defaultReviews, defaultSettings, defaultCategories } from './default-data.js';
import { currency, rand, qs, qsa, toast, whatsappUrl, socialIconMap } from './utils.js';
import {
  collection, addDoc, getDocs, serverTimestamp, doc, getDoc, setDoc
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const state = {
  products: [],
  offers: [],
  reviews: [],
  settings: defaultSettings,
  categories: defaultCategories,
  cart: loadCart()
};
let deferredPrompt = null;
let secretBrandClicks = 0;
let secretBrandTimer = null;

function loadCart() {
  try { return JSON.parse(localStorage.getItem('shm_cart') || '[]'); } catch { return []; }
}
function saveCart() { localStorage.setItem('shm_cart', JSON.stringify(state.cart)); }

function initUI() {
  const mobileToggle = qs('#mobileToggle');
  const mainNav = qs('#mainNav');
  mobileToggle?.addEventListener('click', () => mainNav.classList.toggle('open'));

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e; qs('#installBanner')?.classList.remove('hidden');
  });
  qs('#installBtn')?.addEventListener('click', async () => {
    if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; qs('#installBanner')?.classList.add('hidden'); deferredPrompt = null;
  });

  qs('#closeInvoiceBtn')?.addEventListener('click', () => qs('#invoiceDialog')?.close());
  qs('#printInvoiceBtn')?.addEventListener('click', printInvoice);
  ['#openCartBtn', '#openCartHeroBtn', '#openCartOfferBtn', '#cartFloatingBtn'].forEach(sel => qs(sel)?.addEventListener('click', openCart));
  qs('#closeCartBtn')?.addEventListener('click', closeCart);
  qs('#cartOverlay')?.addEventListener('click', closeCart);
  qs('#cartCheckoutForm')?.addEventListener('submit', handleCartCheckout);

  qs('#secretBrand')?.addEventListener('click', (e) => {
    e.preventDefault();
    secretBrandClicks += 1; clearTimeout(secretBrandTimer); secretBrandTimer = setTimeout(() => { secretBrandClicks = 0; }, 2500);
    if (secretBrandClicks >= 7) { secretBrandClicks = 0; location.href = 'admin-login.html'; }
    else { location.hash = 'top'; }
  });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}
function openCart(){ qs('#cartDrawer')?.classList.add('open'); qs('#cartOverlay')?.classList.add('show'); document.body.classList.add('cart-open'); }
function closeCart(){ qs('#cartDrawer')?.classList.remove('open'); qs('#cartOverlay')?.classList.remove('show'); document.body.classList.remove('cart-open'); }

function renderServices() {
  qs('#servicesGrid').innerHTML = defaultServices.map(item => `<article class="service-card"><div class="service-icon">${item.icon}</div><h3>${item.title}</h3><p>${item.description}</p></article>`).join('');
  qs('#coverageGrid').innerHTML = defaultAreas.map(area => `<div class="coverage-pill">${area}</div>`).join('');
  const areaOptions = defaultAreas.map(area => `<option value="${area}">${area}</option>`).join('');
  qs('#areaSelect').innerHTML = areaOptions; qs('#cartAreaSelect').innerHTML = areaOptions;
  qs('#serviceTypeSelect').innerHTML = defaultServices.map(service => `<option value="${service.title}">${service.title}</option>`).join('');
}

function renderSettings() {
  const settings = state.settings;
  const phoneCards = (settings.contactPhones || []).filter(x => x.showOnSite !== false).map(phone => `<div class="contact-card"><div><strong>${phone.label}</strong><small>${phone.number}</small></div><a class="btn btn-secondary" href="tel:${phone.number}">اتصال</a></div>`);
  const whatsappCards = (settings.whatsappNumbers || []).filter(x => x.showOnSite !== false).map(item => `<div class="contact-card"><div><strong>${item.label}</strong><small>${item.number}</small></div><a class="btn btn-primary" target="_blank" rel="noopener" href="${whatsappUrl(item.number, item.defaultMessage || 'مرحبًا')}">واتساب</a></div>`);
  qs('#contactCards').innerHTML = [...phoneCards, ...whatsappCards].join('') || `<div class="contact-card"><div><strong>بيانات التواصل</strong><small>يمكن إضافتها وتعديلها لاحقًا من لوحة التحكم.</small></div><a class="btn btn-secondary" href="#request">اطلب خدمة</a></div>`;
  qs('#socialRow').innerHTML = Object.entries(settings.socialLinks || {}).filter(([, value]) => value).map(([key, value]) => `<a class="social-chip" href="${value}" target="_blank" rel="noopener">${socialIconMap[key] || '🔗'} ${key}</a>`).join('');
  qs('#legalGrid').innerHTML = (settings.legalBlocks || []).map(block => `<article class="legal-card"><h3>${block.title}</h3><p>${block.text}</p></article>`).join('');
}

function renderProducts(filterCategory='all', search='') {
  const list = state.products.filter(p => p.published !== false).filter(p => filterCategory === 'all' || p.category === filterCategory).filter(p => [p.name,p.category,p.group,p.description].join(' ').toLowerCase().includes(search.toLowerCase()));
  qs('#productsGrid').innerHTML = list.length ? list.map(product => `<article class="product-card premium-panel">${product.badge ? `<span class="badge">${product.badge}</span>` : ''}<div class="product-image" style="background-image:url('${product.image || 'assets/product-1.svg'}')"></div><small class="muted">${product.category} / ${product.group || 'عام'}</small><h3>${product.name}</h3><p>${product.description || ''}</p><div class="price-row"><span class="current-price">${currency(product.discountPrice || product.price)}</span>${product.discountPrice ? `<span class="old-price">${currency(product.price)}</span>` : ''}</div><div class="product-actions-row"><button class="btn btn-primary add-cart-btn" type="button" data-id="${product.id || product.name}" ${product.available === false ? 'disabled' : ''}>${product.available === false ? 'غير متوفر' : 'أضف إلى السلة'}</button><button class="btn btn-light quick-buy-btn" type="button" data-id="${product.id || product.name}" ${product.available === false ? 'disabled' : ''}>اطلب الآن</button></div></article>`).join('') : `<div class="empty-state">لا توجد منتجات مطابقة للبحث الحالي.</div>`;
  const uniqueCategories = ['all', ...new Set(state.products.map(p => p.category).filter(Boolean))];
  qs('#categoryFilter').innerHTML = uniqueCategories.map(cat => `<option value="${cat}">${cat === 'all' ? 'كل الأقسام' : cat}</option>`).join('');
  qs('#categoryFilter').value = filterCategory;
  qs('#categoryChips').innerHTML = uniqueCategories.filter(c => c !== 'all').map(cat => `<button class="chip" data-category="${cat}">${cat}</button>`).join('');
  qsa('.chip').forEach(btn => btn.onclick = () => { qs('#categoryFilter').value = btn.dataset.category; renderProducts(btn.dataset.category, qs('#productSearch').value); });
  qsa('.add-cart-btn').forEach(btn => btn.onclick = () => addToCart(btn.dataset.id));
  qsa('.quick-buy-btn').forEach(btn => btn.onclick = () => { addToCart(btn.dataset.id, true); openCart(); });
}
function renderOffers(){ qs('#offersGrid').innerHTML = state.offers.length ? state.offers.map(offer => `<article class="offer-card premium-panel"><div class="offer-discount">${offer.discount || 0}%</div><h3>${offer.title}</h3><p>${offer.description}</p><span class="status-pill">${offer.featured ? 'عرض مميز' : 'عرض متاح'}</span></article>`).join('') : `<div class="empty-state">لا توجد عروض حالية.</div>`; }
function renderReviews(){ qs('#reviewsGrid').innerHTML = state.reviews.filter(r => r.approved !== false).map(review => `<article class="review-card premium-panel"><div class="rating">${'★'.repeat(Number(review.rating || 5))}</div><h3>${review.name}</h3><p>${review.comment}</p></article>`).join(''); }

function getCartDetails() {
  const items = state.cart.map(item => {
    const product = state.products.find(p => (p.id || p.name) === item.id) || defaultProducts.find(p => (p.id || p.name) === item.id || p.name === item.id);
    if (!product) return null;
    const basePrice = Number(product.price || 0), finalPrice = Number(product.discountPrice || product.price || 0);
    return { id:item.id, qty:item.qty, product, basePrice, finalPrice, lineBase:basePrice*item.qty, lineFinal:finalPrice*item.qty, savings:(basePrice-finalPrice)*item.qty };
  }).filter(Boolean);
  const itemsCount = items.reduce((s, i) => s + i.qty, 0), subtotal = items.reduce((s, i) => s + i.lineBase, 0), savings = items.reduce((s, i) => s + i.savings, 0), total = items.reduce((s, i) => s + i.lineFinal, 0);
  return { items, itemsCount, subtotal, savings, total };
}
function renderCart() {
  const { items, itemsCount, subtotal, savings, total } = getCartDetails();
  qs('#cartCountTop').textContent = itemsCount; qs('#cartCountFloating').textContent = itemsCount; qs('#cartItemsCount').textContent = itemsCount; qs('#cartSubtotal').textContent = currency(subtotal); qs('#cartSavings').textContent = currency(savings); qs('#cartTotal').textContent = currency(total);
  qs('#cartItems').innerHTML = items.length ? items.map(item => `<article class="cart-item premium-panel"><div class="cart-item-head"><div><strong>${item.product.name}</strong><small>${item.product.category || ''} ${item.product.group ? '/ ' + item.product.group : ''}</small></div><button class="btn btn-light remove-cart-item" type="button" data-id="${item.id}">حذف</button></div><div class="cart-item-body"><div class="cart-item-price"><span>${currency(item.finalPrice)}</span>${item.product.discountPrice ? `<small>${currency(item.basePrice)}</small>` : ''}</div><div class="qty-controls"><button type="button" class="qty-btn qty-increase" data-id="${item.id}">+</button><span>${item.qty}</span><button type="button" class="qty-btn qty-decrease" data-id="${item.id}">−</button></div></div><div class="cart-item-foot"><span>الإجمالي</span><strong>${currency(item.lineFinal)}</strong></div></article>`).join('') : `<div class="empty-state cart-empty">السلة فارغة حاليًا. أضف المنتجات المطلوبة ثم أكمل الطلب من هنا.</div>`;
  qsa('.qty-increase').forEach(btn => btn.onclick = () => changeQty(btn.dataset.id, 1));
  qsa('.qty-decrease').forEach(btn => btn.onclick = () => changeQty(btn.dataset.id, -1));
  qsa('.remove-cart-item').forEach(btn => btn.onclick = () => removeFromCart(btn.dataset.id));
}
function addToCart(id, silent = false) { const existing = state.cart.find(item => item.id === id); if (existing) existing.qty += 1; else state.cart.push({ id, qty:1 }); saveCart(); renderCart(); if (!silent) toast('تمت إضافة المنتج إلى السلة.'); }
function changeQty(id, delta) { const item = state.cart.find(row => row.id === id); if (!item) return; item.qty += delta; if (item.qty <= 0) state.cart = state.cart.filter(row => row.id !== id); saveCart(); renderCart(); }
function removeFromCart(id){ state.cart = state.cart.filter(row => row.id !== id); saveCart(); renderCart(); }

async function seedSettingsIfMissing() {
  const settingsRef = doc(db, 'settings', 'site'); const snapshot = await getDoc(settingsRef); if (!snapshot.exists()) await setDoc(settingsRef, { ...defaultSettings, updatedAt: serverTimestamp() });
}
async function loadData() {
  try {
    await seedSettingsIfMissing();
    const [productsSnap, offersSnap, reviewsSnap, settingsSnap, categoriesSnap] = await Promise.all([getDocs(collection(db, 'products')), getDocs(collection(db, 'offers')), getDocs(collection(db, 'reviews')), getDoc(doc(db, 'settings', 'site')), getDocs(collection(db, 'categories'))]);
    state.products = productsSnap.empty ? defaultProducts.map(p => ({ id: p.name, ...p })) : productsSnap.docs.map(d => ({ id:d.id, ...d.data() }));
    state.offers = offersSnap.empty ? defaultOffers : offersSnap.docs.map(d => ({ id:d.id, ...d.data() }));
    state.reviews = reviewsSnap.empty ? defaultReviews : reviewsSnap.docs.map(d => ({ id:d.id, ...d.data() }));
    state.settings = settingsSnap.exists() ? { ...defaultSettings, ...settingsSnap.data() } : defaultSettings;
    state.categories = categoriesSnap.empty ? defaultCategories : categoriesSnap.docs.map(d => ({ id:d.id, ...d.data() }));
  } catch (error) {
    console.error(error); state.products = defaultProducts.map(p => ({ id: p.name, ...p })); state.offers = defaultOffers; state.reviews = defaultReviews; state.settings = defaultSettings; state.categories = defaultCategories;
  }
  renderSettings(); renderProducts(); renderOffers(); renderReviews(); renderCart();
}
function bindFilters(){ qs('#productSearch').addEventListener('input', e => renderProducts(qs('#categoryFilter').value, e.target.value)); qs('#categoryFilter').addEventListener('change', e => renderProducts(e.target.value, qs('#productSearch').value)); }
function buildServiceInvoiceHTML(data){ return `<div class="invoice-box"><div class="invoice-header"><div><h2 style="margin:0">فاتورة / ملخص طلب خدمة</h2><p style="margin:6px 0 0;color:#5f7190">${state.settings.companyName}</p></div><div><div><strong>رقم الطلب:</strong> ${data.requestNo}</div><div><strong>كود المتابعة:</strong> ${data.trackingCode}</div><div><strong>التاريخ:</strong> ${new Date().toLocaleString('ar-EG')}</div></div></div><div class="invoice-grid"><div class="cell"><strong>اسم العميل</strong><br>${data.customerName}</div><div class="cell"><strong>رقم الهاتف</strong><br>${data.customerPhone}</div><div class="cell"><strong>الخدمة</strong><br>${data.serviceType}</div><div class="cell"><strong>المنطقة</strong><br>${data.area}</div><div class="cell"><strong>العنوان</strong><br>${data.address}</div><div class="cell"><strong>الموعد المناسب</strong><br>${data.preferredTime || 'يتم التنسيق لاحقًا'}</div></div><div class="cell" style="margin-top:18px"><strong>وصف الطلب</strong><br>${data.issueDescription}</div><div class="cell" style="margin-top:18px;background:#fff9ee;border:1px dashed rgba(214,162,74,.5)"><strong>الحالة الحالية</strong><br>تم استلام الطلب وسيتم التواصل معك قريبًا.</div></div>`; }
function buildOrderInvoiceHTML(data){ const rows = data.items.map((item, index) => `<tr><td>${index+1}</td><td>${item.name}</td><td>${item.category || '-'}</td><td>${item.qty}</td><td>${currency(item.unitPrice)}</td><td>${currency(item.lineTotal)}</td></tr>`).join(''); return `<div class="invoice-box"><div class="invoice-header"><div><h2 style="margin:0">فاتورة / ملخص طلب متجر</h2><p style="margin:6px 0 0;color:#5f7190">${state.settings.companyName}</p></div><div><div><strong>رقم الطلب:</strong> ${data.orderNo}</div><div><strong>كود المتابعة:</strong> ${data.trackingCode}</div><div><strong>التاريخ:</strong> ${new Date().toLocaleString('ar-EG')}</div></div></div><div class="invoice-grid"><div class="cell"><strong>اسم العميل</strong><br>${data.customerName}</div><div class="cell"><strong>رقم الهاتف</strong><br>${data.customerPhone}</div><div class="cell"><strong>المنطقة</strong><br>${data.area}</div><div class="cell"><strong>العنوان</strong><br>${data.address}</div></div><div class="invoice-table-wrap"><table class="invoice-table"><thead><tr><th>#</th><th>المنتج</th><th>القسم</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>${rows}</tbody></table></div><div class="invoice-totals"><div><span>الإجمالي قبل الخصم</span><strong>${currency(data.subtotal)}</strong></div><div><span>إجمالي الخصومات</span><strong>${currency(data.savings)}</strong></div><div class="final"><span>الإجمالي النهائي</span><strong>${currency(data.total)}</strong></div></div><div class="cell" style="margin-top:18px"><strong>ملاحظات العميل</strong><br>${data.orderNotes || 'لا توجد ملاحظات إضافية.'}</div><div class="cell" style="margin-top:18px;background:#fff9ee;border:1px dashed rgba(214,162,74,.5)"><strong>الحالة الحالية</strong><br>تم استلام طلب المتجر وسيتم التواصل لتأكيد التوريد.</div></div>`; }
function printInvoice(){ const invoiceShell = qs('#invoiceShell').innerHTML; const win = window.open('', '_blank'); win.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>فاتورة الطلب</title><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet"><style>body{font-family:Cairo,sans-serif;padding:24px}.invoice-box{border:1px solid #ddd;border-radius:24px;padding:24px}.invoice-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.cell{padding:14px;border-radius:14px;background:#f6f8fc}.invoice-header{display:flex;justify-content:space-between;gap:20px;border-bottom:1px dashed #ccc;padding-bottom:14px;margin-bottom:14px}.invoice-table{width:100%;border-collapse:collapse;margin-top:18px}.invoice-table th,.invoice-table td{border:1px solid #e5e7eb;padding:10px;text-align:right}.invoice-totals{display:grid;gap:8px;max-width:360px;margin-top:18px;margin-inline-start:auto}.invoice-totals div{display:flex;justify-content:space-between;padding:12px;border-radius:12px;background:#f8fafc}.invoice-totals .final{background:#fff7e6;font-weight:800}</style></head><body>${invoiceShell}</body></html>`); win.document.close(); win.print(); }
async function createMailDoc({ subject, html, text, cc }) { const settings = state.settings; const to = (settings.notificationEmails || [PRIMARY_NOTIFICATION_EMAIL]).join(','); const payload = { to, message:{ subject, html, text }, createdAt: serverTimestamp() }; if (cc) payload.cc = cc; return addDoc(collection(db, 'mail'), payload); }

async function handleRequestSubmit(e) {
  e.preventDefault(); const form = e.currentTarget; const formData = new FormData(form); const requestNo = rand('REQ'); const trackingCode = rand('TRK'); const payload = Object.fromEntries(formData.entries());
  const docData = { ...payload, requestNo, trackingCode, status:'تم الاستلام', type:'service', createdAt:serverTimestamp(), updatedAt:serverTimestamp(), invoiceType:'service-request' };
  try {
    await addDoc(collection(db, 'serviceRequests'), docData);
    await addDoc(collection(db, 'publicTracking'), { requestNo, trackingCode, status:'تم الاستلام', updatedAt:serverTimestamp(), note:'سيتم التواصل معك قريبًا لتأكيد التفاصيل.', type:'service' });
    await createMailDoc({ subject:`طلب خدمة جديد | ${requestNo}`, html:`<h2>طلب خدمة جديد - ${requestNo}</h2><p><strong>العميل:</strong> ${payload.customerName}</p><p><strong>الهاتف:</strong> ${payload.customerPhone}</p><p><strong>الخدمة:</strong> ${payload.serviceType}</p><p><strong>المنطقة:</strong> ${payload.area}</p><p><strong>العنوان:</strong> ${payload.address}</p><p><strong>الوصف:</strong> ${payload.issueDescription}</p><p><strong>كود المتابعة:</strong> ${trackingCode}</p>`, text:`طلب خدمة جديد ${requestNo}`, cc: payload.customerEmail || undefined });
    qs('#invoiceShell').innerHTML = buildServiceInvoiceHTML({ ...payload, requestNo, trackingCode }); qs('#invoiceDialog').showModal(); form.reset();
  } catch (error) { console.error(error); toast('تعذر حفظ الطلب الآن. تأكد من تفعيل Firestore وملحق البريد داخل Firebase.'); }
}

async function handleCartCheckout(e) {
  e.preventDefault(); const { items, subtotal, savings, total, itemsCount } = getCartDetails(); if (!items.length) { toast('السلة فارغة حاليًا.'); return; }
  const form = e.currentTarget; const formData = new FormData(form); const payload = Object.fromEntries(formData.entries()); const orderNo = rand('ORD'); const trackingCode = rand('TRK');
  const orderItems = items.map(item => ({ id:item.id, name:item.product.name, category:item.product.category || '', group:item.product.group || '', qty:item.qty, unitPrice:item.finalPrice, lineTotal:item.lineFinal, image:item.product.image || '' }));
  const orderDoc = { orderNo, requestNo:orderNo, trackingCode, type:'order', status:'تم الاستلام', customerName:payload.customerName, customerPhone:payload.customerPhone, customerEmail:payload.customerEmail || '', area:payload.area, address:payload.address, orderNotes:payload.orderNotes || '', items:orderItems, itemsCount, subtotal, savings, total, currency:'EGP', createdAt:serverTimestamp(), updatedAt:serverTimestamp() };
  try {
    await addDoc(collection(db, 'orders'), orderDoc);
    await addDoc(collection(db, 'publicTracking'), { requestNo:orderNo, trackingCode, status:'تم الاستلام', updatedAt:serverTimestamp(), note:'تم استلام طلب المتجر وسيتم التواصل لتأكيد التوريد.', type:'order', amountTotal: total });
    const itemsHtml = orderItems.map(item => `<li>${item.name} × ${item.qty} = ${currency(item.lineTotal)}</li>`).join('');
    await createMailDoc({ subject:`طلب متجر جديد | ${orderNo}`, html:`<h2>طلب متجر جديد - ${orderNo}</h2><p><strong>العميل:</strong> ${payload.customerName}</p><p><strong>الهاتف:</strong> ${payload.customerPhone}</p><p><strong>المنطقة:</strong> ${payload.area}</p><p><strong>العنوان:</strong> ${payload.address}</p><p><strong>كود المتابعة:</strong> ${trackingCode}</p><p><strong>المنتجات:</strong></p><ul>${itemsHtml}</ul><p><strong>الإجمالي النهائي:</strong> ${currency(total)}</p><p><strong>الملاحظات:</strong> ${payload.orderNotes || 'لا توجد'}</p>`, text:`طلب متجر جديد ${orderNo} بإجمالي ${currency(total)}`, cc: payload.customerEmail || undefined });
    qs('#invoiceShell').innerHTML = buildOrderInvoiceHTML({ ...payload, orderNo, trackingCode, items: orderItems, subtotal, savings, total }); qs('#invoiceDialog').showModal(); state.cart = []; saveCart(); renderCart(); closeCart(); form.reset();
  } catch (error) { console.error(error); toast('تعذر إتمام طلب المتجر الآن. تأكد من تفعيل Firestore وملحق البريد داخل Firebase.'); }
}

renderServices(); initUI(); loadData(); bindFilters(); qs('#serviceRequestForm').addEventListener('submit', handleRequestSubmit);
