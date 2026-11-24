import productCopy from './shopProductCopy.json' with { type: 'json' };
import { shopProductGuides } from './shopProductGuides.js';

export const shopCategories = [
  { id: 'developmental-toys', title: 'بازی‌های تکاملی', icon: '✿', description: 'بازی برای تجربه‌کردن، حرکت و حل مسئله' },
  { id: 'feeding', title: 'لوازم تغذیه', icon: '◒', description: 'ابزارهای ساده برای تجربه غذا خوردن' },
  { id: 'learning', title: 'ابزارهای یادگیری', icon: '✦', description: 'وسایل روزمره برای کشف و یادگیری' },
  { id: 'safety', title: 'ایمنی کودک', icon: '♡', description: 'یادآورهایی برای محیط امن‌تر کودک' },
];

const refs = {
  nurturingCare: { label: 'چارچوب مراقبت پرورشی و یادگیری زودهنگام', publisher: 'سازمان جهانی بهداشت', url: 'https://www.who.int/publications/i/item/9789241514064', scope: 'پایه عمومی رشد و تعامل پاسخ‌گو؛ نه ارزیابی یک محصول' },
  unicefPlay: { label: 'فعالیت‌های یادگیری برای نوزادان و نوپایان', publisher: 'UNICEF Parenting', url: 'https://www.unicef.org/parenting/child-care/21-learning-activities-babies-and-toddlers', scope: 'ایده فعالیت و فرصت تمرین مهارت؛ نه تأیید یک اسباب‌بازی خاص' },
  unicefToys: { label: 'اسباب‌بازی‌ها برای زندگی: بازی و یادگیری', publisher: 'UNICEF Parenting', url: 'https://www.unicef.org/parenting/child-care/toys-life', scope: 'ایده‌های ساده بازی و جورکردن؛ نه آزمون محصول' },
  aapPlay: { label: 'قدرت بازی در رشد کودک', publisher: 'آکادمی اطفال آمریکا', url: 'https://www.healthychildren.org/English/family-life/power-of-play/Pages/the-power-of-play-how-fun-and-games-help-children-thrive.aspx', scope: 'مرور عمومی نقش بازی؛ نه اثبات اثر یک کالای مشخص' },
  cdcCup: { label: 'یادگیری استفاده از انگشتان، قاشق، چنگال و فنجان', publisher: 'CDC', url: 'https://www.cdc.gov/infant-toddler-nutrition/mealtime/fingers-spoons-forks-and-cups.html', scope: 'راهنمای عمومی یادگیری فنجان متناسب با سن' },
  whoFeeding: { label: 'راهنمای تغذیه تکمیلی کودکان ۶ تا ۲۳ ماهه (۲۰۲۳)', publisher: 'سازمان جهانی بهداشت', url: 'https://www.who.int/publications/b/70981', scope: 'توصیه‌های عمومی تغذیه تکمیلی؛ نه مشخصات ظرف یا فنجان' },
  cdcChoking: { label: 'پیشگیری از خطر خفگی هنگام غذاخوردن', publisher: 'CDC', url: 'https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/choking-hazards.html', scope: 'راهنمای عمومی آماده‌سازی غذا و نظارت' },
  cdcMilestones: { label: 'چک‌لیست نقاط عطف رشد بر پایه سن', publisher: 'CDC', url: 'https://www.cdc.gov/act-early/resources/milestones-checklist-by-age.html', scope: 'پایش و گفت‌وگو با متخصص؛ ابزار تشخیص نیست' },
  cpscToys: { label: 'راهنمای انتخاب و ایمنی اسباب‌بازی', publisher: 'کمیسیون ایمنی محصولات مصرفی آمریکا (CPSC)', url: 'https://www.cpsc.gov/Safety-Education/Safety-Education-Centers/Toys', scope: 'نکات عمومی ایمنی مصرف‌کننده؛ مقررات آمریکا جایگزین ضوابط ایران نیست' },
  cpscHome: { label: 'ایمن‌سازی خانه و قفل‌های کابینت', publisher: 'کمیسیون ایمنی محصولات مصرفی آمریکا (CPSC)', url: 'https://www.cpsc.gov/safety-education/safety-guides/kids-and-babies/Childproofing-Your-Home', scope: 'راهنمای عمومی کاهش دسترسی؛ قفل کودک کاملاً کودک‌گریز نیست' },
  cpscLocks: { label: 'استانداردهای داوطلبانه قفل و چفت ایمنی', publisher: 'کمیسیون ایمنی محصولات مصرفی آمریکا (CPSC)', url: 'https://www.cpsc.gov/Regulations-Laws--Standards/Voluntary-Standards/Safety-Locks-Other-Household-Child-Inaccessibility-Devices', scope: 'مرجع استانداردهای آمریکا؛ نه تأیید یا گواهی این نمونه' },
};

const ageNote = 'سن‌های این نمونه، بازه تقریبی برای راهنمای محتوایی و فیلتر هستند؛ رده‌بندی رسمی هر کالای واقعی باید از برچسب و راهنمای همان سازنده گرفته شود.';

// موارد زیر نمونه‌های آموزشی هستند. منبع رشد، یک محصول یا برند را تأیید نمی‌کند.
export const shopProducts = [
  {
    slug: 'stacking-cups', name: 'لیوان‌های روی‌هم‌چین', category: 'developmental-toys', ageMin: 6, ageMax: 36,
    skills: ['هماهنگی چشم و دست', 'حل مسئله', 'مفهوم اندازه'],
    summary: 'لیوان‌هایی با اندازه‌های متفاوت برای چیدن، درآوردن و بازی آزاد.',
    what: 'مجموعه‌ای از قطعات سبک و اندازه‌متفاوت برای تمرین گذاشتن، برداشتن و روی‌هم‌چیدن است؛ نتیجه رشدی خاصی را تضمین نمی‌کند.',
    use: 'چند لیوان را در دسترس بگذارید، یک بار بازی را نشان دهید و بعد فرصت کاوش آزاد بدهید. بازی را کوتاه و بدون اجبار نگه دارید.',
    activities: ['چند لیوان را روی هم بگذار و بگذار کودک آن‌ها را بردارد.','لیوان‌ها را داخل هم کنید و با هم بیرون بیاورید.','با لیوان‌ها یک برج کوتاه بسازید و اجازه بده کودک آن را دوباره بچیند.'], feelings: ['کنجکاوی','لذت کشف'],
    consider: 'برای کالای واقعی، رده سنی، اندازه قطعات، جنس و روش شست‌وشو را از بسته‌بندی و راهنمای سازنده بررسی کنید.',
    safety: 'همراه بزرگسال استفاده شود. قطعات را از نظر شکستگی و جداشدن اجزا بررسی کنید و هشدارهای سازنده را رعایت کنید.', ageNote,
    references: [refs.nurturingCare, refs.unicefPlay], safetyReferences: [refs.cpscToys],
    productSourceNote: 'این نمونه به مدل یا برند مشخصی اشاره نمی‌کند؛ مشخصات فنی و گواهی ایمنی محصول واقعی هنوز ثبت نشده است.',
  },
  {
    slug: 'silicone-open-cup', name: 'فنجان کوچکِ تمرین نوشیدن', category: 'feeding', ageMin: 6, ageMax: 24,
    skills: ['هماهنگی دست و دهان', 'تمرین نوشیدن از فنجان'],
    summary: 'فنجان کوچک برای تمرین تدریجی نوشیدن با کمک مراقب.',
    what: 'یک نمونه آموزشی از فنجان کوچک برای آشنایی با نوشیدن از فنجان است؛ انتخاب نوع فنجان به توانایی و وضعیت کودک بستگی دارد.',
    use: 'کودک را صاف و با پشتیبانی بنشانید؛ مطابق راهنمای تغذیه و با مقدار مناسب سن، فرصت تمرین بدهید و تمام مدت کنارش بمانید.',
    activities: ['در حالت نشسته و با نظارت، فنجان را به‌آرامی در دسترس کودک بگذار.','با مقدار کم و مطابق راهنمای تغذیه فرصت تمرین نوشیدن بده.','پس از استفاده، کودک را در پاک‌کردن فنجان با کمک بزرگسال همراه کن.'], feelings: ['استقلال','آرامش'],
    consider: 'لبه بدون تیزی، اندازه مناسب، مواد سازنده، دستور شست‌وشو و رده سنی درج‌شده روی همان مدل را بررسی کنید.',
    safety: 'کودک هنگام نوشیدن نشسته و زیر نظر بزرگسال باشد. اگر کودک مشکل بلع یا وضعیت پزشکی خاص دارد، درباره روش تغذیه از متخصصش راهنمایی بگیرید.', ageNote,
    references: [refs.cdcCup, refs.whoFeeding], safetyReferences: [refs.cdcChoking],
    productSourceNote: 'این رفرنس‌ها راهنمای عمومی یادگیری نوشیدن‌اند و جنس، ایمنی یا کیفیت هیچ فنجان مشخصی را تأیید نمی‌کنند.',
  },
  {
    slug: 'shape-sorter', name: 'جعبه جورچین شکل‌ها', category: 'learning', ageMin: 12, ageMax: 36,
    skills: ['حل مسئله', 'حرکت ظریف انگشتان', 'شناخت شکل‌ها'],
    summary: 'جورچینی ساده برای آزمون شکل‌ها و جا دادن قطعات در جای مناسب.',
    what: 'یک اسباب‌بازی جورکردنی برای آزمودن شکل‌ها، گرفتن قطعات و امتحان‌کردن جای آن‌هاست.',
    use: 'یک قطعه بزرگ را نشان دهید، نام شکل را بگویید و اجازه دهید کودک با راهنمایی کم و آزمون‌وخطا ادامه دهد.',
    activities: ['یک قطعه را نشان بده و شکلش را با هم نام ببرید.','دو جای ممکن را امتحان کنید و از کودک بخواه شکل را بچرخاند.','قطعات را بیرون بیاورید و یک‌به‌یک دوباره در جعبه بگذارید.'], feelings: ['کنجکاوی','اعتمادبه‌نفس'],
    consider: 'برای مدل واقعی، اندازه قطعات، هشدار بلع، رنگ و پرداخت سطح، دوام و رده سنی سازنده را بررسی کنید.',
    safety: 'قطعه کوچک یا جداشدنی می‌تواند خطر خفگی داشته باشد. رده سنی و هشدار بسته‌بندی را رعایت کنید و حین بازی نظارت داشته باشید.', ageNote,
    references: [refs.unicefToys, refs.aapPlay], safetyReferences: [refs.cpscToys, refs.cdcChoking],
    productSourceNote: 'این نمونه برند یا محصول آزموده‌شده‌ای نیست؛ ویژگی‌های واقعی فقط پس از بررسی مدل و مدارک سازنده قابل درج است.',
  },
  {
    slug: 'cabinet-latch', name: 'قفل ایمنی کابینت', category: 'safety', ageMin: 6, ageMax: 60,
    skills: ['کمک به کاهش دسترسی کودک به بعضی خطرهای خانگی'],
    summary: 'وسیله‌ای کمکی برای دشوارترکردن دسترسی کودک به بعضی کابینت‌ها.',
    what: 'چفت یا قفلی کمکی است که می‌تواند دسترسی کودک به برخی کابینت‌ها و کشوها را دشوارتر کند؛ به‌تنهایی خانه را ایمن نمی‌کند.',
    use: 'سازگاری با کابینت و روش نصب را از راهنمای همان مدل بررسی کنید، طبق دستور نصب کنید و مرتب از محکم‌بودن آن مطمئن شوید.',
    activities: ['همراه بزرگسال محل نصب و سازگاری قفل با کابینت را بررسی کن.','پس از نصب، عملکرد قفل را طبق دستور سازنده و دور از دسترس کودک کنترل کن.','در بازبینی دوره‌ای، محکم‌بودن قفل و امن‌بودن داروها و شوینده‌ها را بررسی کن.'], feelings: ['آرامش خانواده','احساس امنیت'],
    consider: 'سازگاری با در و کشو، روش نصب، دوام چسب یا پیچ، دستور بازکردن اضطراری و مدارک ایمنی همان مدل را بررسی کنید.',
    safety: 'هیچ قفلی کاملاً کودک‌گریز نیست. دارو، شوینده و اشیای خطرناک را در محل قفل‌شده و دور از دید و دسترس نگه دارید؛ قفل را مرتب کنترل کنید.', ageNote,
    references: [refs.cpscHome], safetyReferences: [refs.cpscHome, refs.cpscLocks],
    productSourceNote: 'استانداردهای پیوندشده مربوط به آمریکا هستند؛ برای فروش در ایران باید الزامات محلی و گواهی معتبر همان کالا جداگانه بررسی شود. این نمونه هیچ گواهی محصولی ندارد.',
  },
  ...shopProductGuides.map((guide, index) => {
    const copy = productCopy[index];
    const firstSentence = copy.description.match(/^.+?[.!؟؛](?:\s|$)/)?.[0]?.trim();
    const developmental = guide.category !== 'feeding';
    return {
      ...guide,
      name: copy.name,
      summary: firstSentence || copy.description.slice(0, 170),
      what: copy.description,
      use: guide.activities.join(' '),
      ageNote: 'بازه سنی این نمونه برای راهنمای آموزشی مهراناست و رده‌بندی رسمی محصول نیست؛ سن درج‌شده روی کالای واقعی و آمادگی کودک را بررسی کن.',
      references: developmental ? [refs.unicefPlay, refs.aapPlay, refs.nurturingCare] : [refs.whoFeeding, refs.cdcCup],
      safetyReferences: guide.category === 'safety' ? [refs.cpscHome, refs.cpscLocks] : [refs.cpscToys, refs.cdcChoking],
      productSourceNote: 'این معرفی یک نمونه آموزشی است و هیچ برند یا محصول مشخصی را ارزیابی یا تأیید نمی‌کند. منابع، پشتوانه عمومی بازی و ایمنی‌اند؛ مشخصات و گواهی کالای واقعی باید جداگانه بررسی شود.',
    };
  }),
];

export const ageLabel = months => months === 0 ? 'از بدو تولد' : months < 12 ? `${months} ماه به بالا` : `${Math.floor(months / 12)} سال به بالا`;

