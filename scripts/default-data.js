export const defaultServices = [
  { title: 'السباكة الصحية', icon: '🚿', description: 'أعمال سباكة صحية احترافية، تأسيس، تركيب، تبديل، وصيانة دقيقة للحمامات والمطابخ.' },
  { title: 'تأسيس الشقق السكنية', icon: '🏗️', description: 'تأسيس سباكة وكهرباء للشقق الجديدة بخطط منظمة وتنفيذ يناسب المشاريع السكنية.' },
  { title: 'أعمال الكهرباء', icon: '⚡', description: 'تمديدات، مفاتيح، لوحات، أعطال طارئة، وتحديثات كاملة لشبكات الكهرباء.' },
  { title: 'صيانة السخانات', icon: '🔥', description: 'صيانة سخانات الغاز والكهرباء، فحص الأعطال، وتبديل القطع عند الحاجة.' },
  { title: 'تركيب الأدوات الصحية', icon: '🛁', description: 'تركيب خلاطات ومحابس وأحواض وملحقات التشطيب النهائي بخامات ممتازة.' },
  { title: 'خدمة المتابعة والفواتير', icon: '📋', description: 'رقم طلب، كود متابعة، وفاتورة/ملخص احترافي يظهر مباشرة بعد الإرسال.' }
];

export const defaultAreas = ['العبور','التجمع الخامس','القاهرة الجديدة','التجمع الأول','6 أكتوبر','الشيخ زايد'];

export const defaultCategories = [
  { name: 'الخلاطات', groups: ['خلاطات مطبخ','خلاطات حمام','خلاطات دفن'] },
  { name: 'المحابس والمواسير', groups: ['محابس','مواسير PPR','وصلات'] },
  { name: 'السخانات', groups: ['سخانات غاز','سخانات كهرباء','قطع تبديل'] },
  { name: 'إكسسوارات التركيب', groups: ['شريط تيفلون','سيفونات','حوامل'] }
];

export const defaultProducts = [
  { name: 'خلاط مطبخ ستانلس فاخر', description: 'تصميم أنيق مناسب للمطابخ الحديثة مع ضمان جودة.', category: 'الخلاطات', group: 'خلاطات مطبخ', price: 1850, discountPrice: 1590, available: true, badge: 'خصم 14%', image: 'assets/product-1.svg', published: true },
  { name: 'سخان غاز منزلي 10 لتر', description: 'كفاءة عالية وحماية متعددة، مناسب للشقق السكنية.', category: 'السخانات', group: 'سخانات غاز', price: 9500, discountPrice: 8990, available: true, badge: 'الأكثر طلبًا', image: 'assets/product-2.svg', published: true },
  { name: 'محبس زاوية كروم', description: 'تشطيب فاخر وعمر استخدام طويل.', category: 'المحابس والمواسير', group: 'محابس', price: 240, discountPrice: 0, available: true, badge: 'جديد', image: 'assets/product-3.svg', published: true }
];

export const defaultOffers = [
  { title: 'عرض تأسيس الحمام', description: 'خصومات موسمية على أعمال تأسيس السباكة للشقق السكنية مع متابعة تنفيذ وملخص فاتورة.', discount: 20, featured: true },
  { title: 'خصم على السخانات', description: 'تخفيضات على بعض السخانات وقطع التبديل مع خدمة تركيب داخل المناطق المغطاة.', discount: 10, featured: false },
  { title: 'باقة تركيب وتشطيب', description: 'أسعار خاصة عند الجمع بين الأدوات الصحية وخدمة التركيب والصيانة.', discount: 15, featured: true }
];

export const defaultReviews = [
  { name: 'عميل من القاهرة الجديدة', rating: 5, comment: 'الالتزام ممتاز والواجهة مرتبة جدًا، وتم التواصل بسرعة.', approved: true },
  { name: 'عميل من التجمع الخامس', rating: 5, comment: 'طلبت صيانة سخان ووصل الفني في الوقت المحدد والتعامل راقٍ.', approved: true },
  { name: 'عميل من الشيخ زايد', rating: 4, comment: 'المتجر واضح والعرض ظاهر بشكل جميل جدًا.', approved: true }
];

export const defaultSettings = {
  companyName: 'S.H.M',
  companySummary: 'شركة خدمات حرفية احترافية للسباكة الصحية والكهرباء وصيانة السخانات مع متجر أدوات صحية وعروض وخصومات وفواتير طلبات أنيقة.',
  contactPhones: [],
  whatsappNumbers: [],
  notificationEmails: ['lanakids83@gmail.com'],
  publicUrl: 'https://moadad.github.io/S.h.m/',
  cloudinary: {
    cloudName: 'Sham miser',
    uploadPreset: 'dueuyivqo'
  },
  socialLinks: {
    facebook: '', instagram: '', tiktok: '', youtube: '', telegram: '', x: ''
  },
  legalBlocks: [
    { title: 'الشروط والأحكام', text: 'تخضع مواعيد التنفيذ وتأكيد الأسعار وحالات الخصم للمعاينة والتوفر النهائي وحجم الأعمال المطلوبة.' },
    { title: 'سياسة الخصوصية', text: 'تُستخدم بيانات العملاء فقط لأغراض التواصل وتنفيذ الطلبات والمتابعة الداخلية وتحسين الخدمة، ولا يتم إظهار الإيميلات للجمهور.' },
    { title: 'التنبيهات', text: 'العروض والخصومات والمنتجات قد تتغير حسب التوفر والفترة الزمنية المعلنة، ويُعتمد آخر تحديث مسجل داخل لوحة الإدارة.' },
    { title: 'العقود والضمان', text: 'يمكن إصدار اتفاق أو عقد أو ملاحظات تنفيذ لكل طلب حسب نوع العمل، كما يمكن تعديل هذه البنود لاحقًا من لوحة التحكم.' }
  ]
};
