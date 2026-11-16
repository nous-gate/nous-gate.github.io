/* =========================================================
   نوس · ملف المحتوى
   كل محتوى الموقع هنا. عدّل هذا الملف بس، والموقع يتحدث وحده.
   ========================================================= */
window.NOUS = {

  /* ---- التواصل ----
     whatsapp: الرقم بصيغة دولية بدون + ولا مسافات، مثال 9647701234567
     instagram / telegram: اسم المستخدم بدون @                              */
  contact: {
    whatsapp: '',
    instagram: '',
    telegram: '',
    email: ''
  },

  /* اختياري: رابط Formspree حتى توصلك نسخة من كل طلب على الإيميل
     مثال: 'https://formspree.io/f/xxxxxxx'                                  */
  formEndpoint: '',

  /* عَتَبة فرع خاص. تبقى مخفية بالموقع العام إلا إذا صارت true */
  showAtaba: false,

  /* إخفاء كل العناصر المؤقتة (demo) قبل الإطلاق */
  hideDemo: false,

  /* ---- الأقسام ---- */
  branches: [
    {
      id: 'graphic', name: 'الغرافيك دزاين', en: 'GRAPHIC DESIGN', dept: 'قسم الشكل', open: true,
      about: 'الفرع الأول المفتوح في شبكة نوس. تطلب من نوس، يشتغل عليك مصمم من الشبكة، وتستلم بعد المراجعة.',
      services: [
        { name: 'لوغو', gets: 'شعار بنسخ الاستخدام المختلفة' },
        { name: 'هوية بصرية مصغّرة', gets: 'لوغو وألوان وخطوط ودليل بسيط' },
        { name: 'بوستر أو إعلان', gets: 'تصميم واحد بمقاسات النشر والطباعة' },
        { name: 'باقة سوشيال ميديا', gets: 'مجموعة منشورات بهوية موحدة' },
        { name: 'قائمة طعام', gets: 'ملف جاهز للطباعة أو العرض الرقمي' },
        { name: 'بطاقة شخصية', gets: 'وجهان جاهزان للطباعة' },
        { name: 'لافتة أو بانر', gets: 'تصميم بمقاس المكان' },
        { name: 'تغليف أو ملصق', gets: 'تصميم على المنتج مع القطع' },
        { name: 'سيرة ذاتية', gets: 'ملف منسق بلغتين إن لزم' },
        { name: 'عرض تقديمي', gets: 'شرائح بهوية العميل' }
      ]
    },
    {
      id: 'photo', name: 'التصوير', en: 'PHOTOGRAPHY', dept: 'قسم الضوء', open: false,
      about: 'فرع التصوير يفتح قريباً. سجّل طلبك الحين وننبهك أول ما يفتح.',
      services: [{ name: 'تصوير منتجات' }, { name: 'بورتريه' }, { name: 'فعاليات' }, { name: 'أخرى' }]
    },
    {
      id: 'motion', name: 'المونتاج والموشن', en: 'EDITING · MOTION', dept: 'قسم الزمن', open: false,
      about: 'فرع المونتاج والموشن يفتح قريباً. سجّل طلبك الحين وننبهك أول ما يفتح.',
      services: [{ name: 'مونتاج ريلز' }, { name: 'موشن غرافيك' }, { name: 'فيديو إعلاني' }, { name: 'لوغو موشن' }]
    },
    {
      id: 'eng', name: 'التصميم الهندسي', en: 'ENGINEERING DESIGN', dept: 'قسم الفراغ', open: false,
      about: 'فرع التصميم الهندسي يفتح قريباً. سجّل طلبك الحين وننبهك أول ما يفتح.',
      services: [{ name: 'مخططات ومساقط' }, { name: 'تصميم داخلي' }, { name: 'نمذجة ثلاثية الأبعاد' }, { name: 'أخرى' }]
    }
  ],

  /* ---- المصممين ----
     tier: محترف أو صاعد · done: أعمال منجزة · replyMin: متوسط الرد بالدقائق
     onTime: نسبة الالتزام بالموعد · available: متاح للطلبات
     brand: { name, url } إذا عنده علامة خاصة · demo: true = اسم مؤقت           */
  designers: [
    { id: 'ahmed', name: 'أحمد إسماعيل', branch: 'graphic', tier: 'محترف', role: 'مؤسس نوس · هوية وموشن', done: 12, replyMin: 30, onTime: 100, available: true, brand: null },
    { id: 'd1', name: 'المصمم الأول', branch: 'graphic', tier: 'محترف', role: 'هويات ولوغوات', done: 8, replyMin: 60, onTime: 95, available: true, brand: { name: 'علامته الخاصة', url: '#' }, demo: true },
    { id: 'd2', name: 'المصمم الثاني', branch: 'graphic', tier: 'محترف', role: 'سوشيال ميديا', done: 6, replyMin: 45, onTime: 90, available: false, demo: true },
    { id: 'd3', name: 'المصمم الثالث', branch: 'graphic', tier: 'محترف', role: 'مطبوعات وتغليف', done: 5, replyMin: 120, onTime: 92, available: true, demo: true },
    { id: 'd4', name: 'المصممة الرابعة', branch: 'graphic', tier: 'صاعد', role: 'بوسترات', done: 1, replyMin: 40, onTime: 100, available: true, demo: true },
    { id: 'd5', name: 'المصمم الخامس', branch: 'graphic', tier: 'صاعد', role: 'سوشيال ميديا', done: 0, replyMin: 90, onTime: 100, available: true, demo: true }
  ],

  /* ---- تصنيفات المعرض ---- */
  categories: [
    { id: 'identity', name: 'هويات ولوغوات' },
    { id: 'social', name: 'سوشيال وموشن' },
    { id: 'print', name: 'مطبوعات' }
  ],

  /* ---- الأعمال ----
     image: مسار صورة داخل assets/works (مثال 'assets/works/nous.jpg')
     video: مسار فيديو mp4 اختياري · بدون صورة ينرسم غلاف تلقائي بلون hue    */
  works: [
    { id: 'nous', title: 'هوية نوس', client: 'نوس', category: 'identity', designer: 'ahmed', year: 2026, art: 'nous',
      desc: 'هوية كاملة مبنية على بوابة بيزييه وعين العقل: لوغو أساسي وثانوي، سب مارك، فافيكون، ونظام ألوان من الأسود للزمردي.' },
    { id: 'sanad', title: 'محتوى السوشيال ميديا', client: 'مطبعة السند', category: 'social', designer: 'ahmed', year: 2026, hue: 30,
      desc: 'إدارة صفحات المطبعة وخطة النشر وتصاميم المنشورات.' },
    { id: 'w3', title: 'هوية مقهى', client: 'اسم الزبون', category: 'identity', designer: 'd1', year: 2026, hue: 160, demo: true, desc: 'نموذج مؤقت.' },
    { id: 'w4', title: 'حملة افتتاح', client: 'اسم الزبون', category: 'social', designer: 'd2', year: 2026, hue: 200, demo: true, desc: 'نموذج مؤقت.' },
    { id: 'w5', title: 'تغليف قهوة', client: 'اسم الزبون', category: 'print', designer: 'd3', year: 2026, hue: 38, demo: true, desc: 'نموذج مؤقت.' },
    { id: 'w6', title: 'بوستر أمسية', client: 'اسم الزبون', category: 'print', designer: 'd4', year: 2026, hue: 280, demo: true, desc: 'نموذج مؤقت.' }
  ],

  /* ---- الزبائن والعلامات ---- */
  clients: [
    { name: 'مطبعة السند', field: 'طباعة ودعاية وإعلان', did: 'إدارة صفحات السوشيال وخطة النشر والتصاميم', category: 'social' },
    { name: 'نوس', field: 'شبكة تصميم', did: 'الهوية البصرية الكاملة من اللوغو للفافيكون', category: 'identity' }
  ],

  /* ---- آراء الزبائن ----
     تنعرض بس إذا انضاف رأي حقيقي. مثال:
     { name: 'اسم الزبون', role: 'صاحب مقهى', text: 'الكلام كما قاله' }        */
  testimonials: [],

  /* ---- أرشيف الحملة «ما قبل الشكل» ----
     released: true حتى ينفتح الملف · video: مسار mp4 داخل assets/video
     revealed: true بعد التريلر، يكشف ربط الأقسام بالفروع                      */
  campaign: {
    revealed: false,
    files: [
      { no: '00', title: 'شي ناقص', q: 'ما الذي ينقص هذا الشارع؟', note: 'شيءٌ ما ينقص.', dur: '12.5', branch: null, released: true, video: 'assets/video/file-00.mp4', poster: 'assets/video/file-00.jpg' },
      { no: '01', title: 'قسم الشكل', q: 'من يمنح الأشياء شكلها؟', note: 'كل شيء يصل بلا شكل، ويغادر بهوية.', dur: '15.5', branch: 'graphic', released: false, video: 'assets/video/file-01.mp4' },
      { no: '02', title: 'قسم الضوء', q: 'أين يختبئ النهار؟', note: 'لا يوجد الشيء قبل أن يُضاء.', dur: '15.5', branch: 'photo', released: false, video: 'assets/video/file-02.mp4' },
      { no: '03', title: 'قسم الزمن', q: 'من أوقف كل شيء؟', note: 'الحركة إذنٌ يُمنح.', dur: '17.1', branch: 'motion', released: false, video: 'assets/video/file-03.mp4' },
      { no: '04', title: 'قسم الفراغ', q: 'من رسم هذا المكان؟', note: 'كل مكان بدأ خطًّا في الهواء.', dur: '17.1', branch: 'eng', released: false, video: 'assets/video/file-04.mp4' },
      { no: 'TR', title: 'البوابة', q: 'منذ أن وُجد الشيء، وُجدت الحاجة إلى شكله.', note: 'نوس: البوابة مفتوحة.', dur: '50', branch: null, released: false, video: 'assets/video/trailer.mp4', trailer: true }
    ]
  },

  /* ---- استوديو عَتَبة (صفحة خاصة: nous-gate.github.io/#ataba) ----
     codeHash: بصمة SHA-256 لرمز الدخول. لتغيير الرمز اطلب من Claude يحدّثها */
  ataba: {
    codeHash: '933d5625fce32730ab9f45caf9153120be37501b67a547ba7a814182cbc6909a',
    hashtags: '#عتبة #خواطر #خواطر_فلسفية #تأملات'
  },

  /* ---- عني ---- */
  about: {
    name: 'AHMED ISMAIL',
    nameAr: 'أحمد إسماعيل',
    tagline: 'Meaning begins where sight ends.',
    portrait: 'assets/img/portrait.jpg',
    skills: ['GRAPHIC DESIGN', 'MOTION', 'AI'],
    bio: 'مصمم غرافيك وموشن ومختص بالذكاء الاصطناعي من الموصل. بنيت نوس حتى تكون بوابة: الزبون يدخل من مكان واحد، ويوصل لمصمم يعرف شغله، ويستلم شي مبني على فكرة مو على قالب.'
  }
};
