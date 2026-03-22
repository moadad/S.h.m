import { db } from './firebase-config.js';
import { collection, getDocs, query, where, limit } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { qs } from './utils.js';

const serviceSteps = ['تم الاستلام','تم التواصل','جارٍ المعاينة','جارٍ التنفيذ','تم الإنجاز'];
const orderSteps = ['تم الاستلام','تم التواصل','جارٍ التجهيز','جارٍ التنفيذ','تم الإنجاز'];

function renderResult(data) {
  const steps = data.type === 'order' ? orderSteps : serviceSteps;
  const currentIndex = Math.max(steps.indexOf(data.status), 0);
  qs('#trackingResult').innerHTML = `<div class="tracking-card premium-panel"><h3>${data.type === 'order' ? 'طلب متجر' : 'طلب خدمة'}: ${data.requestNo}</h3><p><strong>الحالة الحالية:</strong> ${data.status}</p>${data.amountTotal ? `<p><strong>إجمالي الطلب:</strong> ${new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(Number(data.amountTotal || 0))}</p>` : ''}<p><strong>ملاحظة:</strong> ${data.note || 'لا توجد ملاحظات إضافية.'}</p><div class="progress-steps">${steps.map((step, i) => `<div class="progress-step ${i <= currentIndex ? 'active' : ''}">${step}</div>`).join('')}</div></div>`;
}

qs('#trackingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = qs('#trackingCode').value.trim();
  if (!code) return;
  try {
    let snap = await getDocs(query(collection(db, 'publicTracking'), where('trackingCode', '==', code), limit(1)));
    if (snap.empty) snap = await getDocs(query(collection(db, 'publicTracking'), where('requestNo', '==', code), limit(1)));
    if (snap.empty) { qs('#trackingResult').innerHTML = `<div class="empty-state">لم يتم العثور على الطلب بهذا الكود أو الرقم.</div>`; return; }
    renderResult(snap.docs[0].data());
  } catch (error) {
    console.error(error);
    qs('#trackingResult').innerHTML = `<div class="empty-state">الواجهة جاهزة، لكن يلزم ربط Firestore لقراءة حالة الطلب.</div>`;
  }
});
