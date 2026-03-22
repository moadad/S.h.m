import { auth, ADMIN_EMAIL } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { qs } from './utils.js';

qs('#adminLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = qs('#adminEmail').value.trim();
  const password = qs('#adminPassword').value;
  const helper = qs('#loginHelper');
  helper.textContent = 'جاري تسجيل الدخول...';
  try {
    await signInWithEmailAndPassword(auth, email, password);
    location.href = 'admin.html';
  } catch (error) {
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      try {
        const created = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(created.user, { displayName: 'S.H.M Admin' });
        helper.textContent = 'تم إنشاء حساب الإدارة لأول مرة بنجاح.';
        location.href = 'admin.html';
        return;
      } catch (createError) {
        console.error(createError);
      }
    }
    console.error(error);
    helper.textContent = 'فشل تسجيل الدخول. استخدم بريد الإدارة الصحيح وكلمة مرورك الحالية.';
  }
});
