import React from 'react';
import { ArrowLeft, BookOpen, Check, Heart, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const sources = [
  { label: 'پرسش‌ها و پاسخ‌های شیردهی', publisher: 'سازمان جهانی بهداشت (WHO)', url: 'https://www.who.int/news-room/questions-and-answers/item/breastfeeding' },
  { label: 'تغذیه انحصاری با شیر مادر در شش ماه نخست', publisher: 'سازمان جهانی بهداشت (WHO)', url: 'https://www.who.int/tools/elena/interventions/exclusive-breastfeeding' },
  { label: 'پوزیشن‌های رایج شیردهی', publisher: 'NHS', url: 'https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/breastfeeding/how-to-breastfeed/breastfeeding-positions/' },
  { label: 'نشانه‌های گرفتن صحیح سینه و دریافت شیر', publisher: 'NHS', url: 'https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding-problems/enough-milk/' },
  { label: 'پاسخ به پرسش‌های شیردهی و تغذیه پاسخ‌گو', publisher: 'NHS', url: 'https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding/your-questions-answered/' },
  { label: 'پوزیشن و گرفتن صحیح سینه', publisher: 'UNICEF Parenting', url: 'https://www.unicef.org/parenting/food-nutrition/breastfeeding-positions' },
  { label: 'نگهداری و آماده‌سازی شیر دوشیده‌شده', publisher: 'CDC', url: 'https://www.cdc.gov/breastfeeding/breast-milk-preparation-and-storage/handling-breastmilk.html' },
  { label: 'شیردهی پس از بازگشت به محل کار', publisher: 'CDC', url: 'https://www.cdc.gov/infant-toddler-nutrition/breastfeeding/returning-to-your-workplace.html' },
  { label: 'التهاب پستان و نشانه‌های آن', publisher: 'NHS', url: 'https://www.nhs.uk/conditions/mastitis/' },
  { label: 'توصیه‌های خواب ایمن نوزاد', publisher: 'NHS', url: 'https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/' },
];

const positions = [
  { id: 'cradle', number: '۱', title: 'گهواره‌ای', short: 'Cradle hold', best: 'برای بسیاری از خانواده‌ها بعد از جاافتادن شیردهی راحت است.', steps: ['تکیه‌گاه پشت و آرنجت را تنظیم کن.', 'بدن کودک را روبه‌روی خودت، شکم‌به‌شکم، روی ساعد همان سمت قرار بده.', 'گوش، شانه و لگن کودک در یک راستا باشد؛ بینی روبه‌روی نوک سینه قرار بگیرد.'] },
  { id: 'cross', number: '۲', title: 'گهواره‌ایِ متقاطع', short: 'Cross-cradle', best: 'برای روزهای اول یا زمانی که می‌خواهی سر و شانه‌های کودک را بهتر هدایت کنی، می‌تواند مفید باشد.', steps: ['کودک را با دستِ مخالفِ سینه‌ای که می‌خواهد بخورد نگه دار.', 'کف دست را پشت شانه‌ها و گردن بگذار؛ سر آزاد باشد و به پشت سر فشار نده.', 'با دست دیگر سینه را در صورت نیاز حمایت کن و کودک را نزدیک بیاور.'] },
  { id: 'rugby', number: '۳', title: 'زیر بغلی / راگبی', short: 'Rugby / clutch', best: 'ممکن است پس از سزارین فشار کمتری به شکم وارد کند؛ برای دوقلوها نیز بعضی خانواده‌ها آن را امتحان می‌کنند.', steps: ['بالشی کنار بدنت بگذار و کودک را کنار همان سینه، زیر بازو قرار بده.', 'پاهای کودک به سمت پشت تو باشد و بینی‌اش هم‌سطح نوک سینه.', 'گردن و شانه‌ها را نگه دار و کودک را نزدیک کن؛ صورت و راه تنفسش باید دیده شود.'] },
  { id: 'side', number: '۴', title: 'به پهلو خوابیده', short: 'Side-lying', best: 'برای استراحت در زمان شیردهی ممکن است راحت باشد، به‌ویژه پس از زایمان؛ اگر احتمال خواب‌رفتنت هست، ایمنی خواب را جدی بگیر.', steps: ['به پهلو دراز بکش و کودک را روبه‌روی خودت، شکم‌به‌شکم قرار بده.', 'بدن کودک از گوش تا لگن در یک راستا باشد و بینی آزاد بماند.', 'بالش و پتو را از صورت کودک دور نگه دار؛ پس از شیرخوردن، کودک را به محل خواب ایمن خودش منتقل کن.'] },
  { id: 'laidback', number: '۵', title: 'تکیه‌داده / نیمه‌خوابیده', short: 'Laid-back', best: 'بعضی مادران این حالت نیمه‌تکیه‌داده را برای آرامش و تماس نزدیک ترجیح می‌دهند.', steps: ['روی مبل یا تخت، نیمه‌تکیه بده؛ کاملاً صاف دراز نکش.', 'پشت و گردنت را با تکیه‌گاه راحت کن و کودک را روی سینه‌ات، شکم‌به‌شکم بگذار.', 'صورت کودک همیشه قابل دیدن و بینی و دهانش آزاد باشد؛ اگر خواب‌آلودی، این حالت را روی مبل ادامه نده.'] },
];

function PositionIllustration({ type, title }) {
  return <svg className={`bf-illustration bf-${type}`} viewBox="0 0 320 210" role="img" aria-label={`طرح شماتیک پوزیشن ${title}`}>
    <rect x="8" y="8" width="304" height="194" rx="26" fill="#f5eee5" />
    <circle cx="267" cy="42" r="18" fill="#f3d68f" opacity=".85" />
    {type === 'side' ? <>
      <path d="M24 166 Q80 147 131 157 L280 157 Q300 163 297 187 L22 187Z" fill="#e6d4c4" />
      <path d="M67 111 Q88 86 143 91 Q183 95 218 112 L249 141 Q215 162 168 157 L88 152Z" fill="#92ad91" />
      <circle cx="235" cy="103" r="26" fill="#efc5a7" /><path d="M209 102 Q211 70 243 77 Q263 82 260 105 Q250 91 232 91Z" fill="#57464b" />
      <path d="M96 125 Q128 112 160 121 L193 142 Q171 156 130 149Z" fill="#e6a994" />
      <circle cx="190" cy="126" r="17" fill="#f2c7a9" /><path d="M175 124 Q178 104 197 109 Q208 113 204 127Z" fill="#725658" />
      <path d="M219 127 Q205 129 202 124" fill="none" stroke="#a95654" strokeWidth="3" strokeLinecap="round" />
    </> : type === 'laidback' ? <>
      <path d="M40 173 Q95 154 145 148 L246 105 Q272 101 288 120 L295 177Z" fill="#e4d1c0" />
      <path d="M82 156 Q112 135 151 119 L214 91 Q233 89 246 107 L195 148 Q142 171 99 178Z" fill="#91ad91" />
      <circle cx="245" cy="89" r="25" fill="#efc5a7" /><path d="M222 86 Q224 56 254 64 Q273 70 268 93 Q257 78 237 78Z" fill="#57464b" />
      <path d="M95 157 Q125 137 158 129 L192 144 Q166 164 130 172Z" fill="#e6a994" />
      <circle cx="193" cy="133" r="17" fill="#f2c7a9" /><path d="M178 131 Q180 111 199 116 Q211 120 207 135Z" fill="#725658" />
      <path d="M222 109 Q208 117 205 128" fill="none" stroke="#a95654" strokeWidth="3" strokeLinecap="round" />
    </> : <>
      <path d="M190 176 L282 176 Q292 176 292 190 L181 190Z" fill="#dfcabc" />
      <path d="M173 92 Q186 74 213 78 L244 96 L252 176 L160 176 L158 118Z" fill="#91ad91" />
      <circle cx="218" cy="59" r="25" fill="#efc5a7" /><path d="M194 58 Q194 29 225 34 Q246 39 241 63 Q228 47 209 49Z" fill="#57464b" />
      {type === 'rugby' ? <>
        <path d="M186 116 Q142 103 111 112 L72 130 Q52 138 57 156 Q85 166 115 150 L170 143Z" fill="#e6a994" />
        <circle cx="157" cy="112" r="18" fill="#f2c7a9" /><path d="M142 109 Q145 88 164 93 Q176 97 171 113Z" fill="#725658" />
        <path d="M197 97 Q180 106 175 111" fill="none" stroke="#6c8b72" strokeWidth="12" strokeLinecap="round" />
      </> : <>
        <path d="M189 119 Q161 104 129 113 L82 129 Q64 138 72 155 Q100 163 128 148 L181 144Z" fill="#e6a994" />
        <circle cx="173" cy="113" r="18" fill="#f2c7a9" /><path d="M158 110 Q160 90 180 95 Q191 99 187 114Z" fill="#725658" />
        {type === 'cross' ? <path d="M202 149 Q183 133 161 124" fill="none" stroke="#59785f" strokeWidth="12" strokeLinecap="round" /> : <path d="M202 150 Q182 145 175 126" fill="none" stroke="#59785f" strokeWidth="12" strokeLinecap="round" />}
      </>}
      <path d="M194 97 Q180 105 178 112" fill="none" stroke="#a95654" strokeWidth="3" strokeLinecap="round" />
    </>}
    <path d="M25 181 Q53 174 79 181" fill="none" stroke="#d0bdad" strokeWidth="3" strokeLinecap="round" />
    <text x="29" y="35" fontSize="12" fill="#7b8c68" fontFamily="Tahoma">طرح آموزشی</text>
  </svg>;
}

function BreastfeedingDeepDive() {
  return <>
    <nav className="bf-contents" aria-label="بخش‌های راهنمای شیردهی">
      <a href="#feeding-pattern">الگوی شیرخوردن</a><a href="#milk-supply">دریافت شیر</a>
      <a href="#expressing">دوشیدن و نگهداری</a><a href="#common-concerns">مشکلات رایج</a>
    </nav>
    <section className="bf-section bf-deep-dive" id="feeding-pattern">
      <div className="bf-section-heading"><span className="eyebrow">الگوی شیرخوردن</span><h2>چند بار و چه مدت؟ به نشانه‌های نوزاد پاسخ بده</h2><p>برای همهٔ نوزادان یک جدول ثابت و دقیقه‌شمار وجود ندارد.</p></div>
      <div className="bf-two-columns">
        <article className="panel"><h3>در روزها و هفته‌های اول</h3><p>نوزادان در شبانه‌روز بارها شیر می‌خواهند؛ گاهی وعده‌ها نزدیک به هم می‌شوند. این الگوی خوشه‌ای به‌تنهایی نشانهٔ کمبود شیر نیست. نشانه‌های زودهنگام مثل جست‌وجو، بردن دست به دهان و بیدارشدن را ببین و اگر ممکن است پیش از گریه پاسخ بده.</p><p>تماس پوست‌به‌پوست و کمک اطرافیان می‌تواند فرصت شروع و ادامهٔ شیردهی را بیشتر کند. اگر نوزاد برای شیر خوردن سخت بیدار می‌شود یا وعده‌ها مؤثر نیستند، زود از مراقب سلامت کمک بگیر.</p></article>
        <article className="panel"><h3>پس از شروع غذای کمکی</h3><p>WHO تغذیهٔ انحصاری با شیر مادر را در شش ماه اول توصیه می‌کند؛ پس از شروع غذای کمکی، ادامهٔ شیردهی تا دو سالگی یا بیشتر می‌تواند در کنار غذای متنوع ادامه یابد.</p><p>شیر همچنان بخش مهمی از تغذیه است. مقدار و دفعات دقیق را با توجه به سن، رشد، اشتها و توصیهٔ مراقب سلامت تنظیم کن؛ این صفحه برنامهٔ فردی یا نسخهٔ تغذیه نمی‌دهد.</p></article>
      </div>
    </section>
    <section className="bf-section bf-deep-dive" id="milk-supply">
      <div className="bf-section-heading"><span className="eyebrow">دریافت شیر و تولید شیر</span><h2>چطور بفهمیم شیر به‌اندازه می‌رسد؟</h2><p>هیچ نشانهٔ تکی به‌تنهایی پاسخ قطعی نمی‌دهد؛ چند سرنخ را کنار هم ببین.</p></div>
      <div className="bf-check-grid">
        <article className="panel bf-check-card"><div className="bf-check-icon"><Check/></div><h3>هنگام یک وعده</h3><ul><li>پس از مکیدن‌های سریع اولیه، مکیدن عمیق‌تر و ریتم‌دار و گاهی بلع دیده یا شنیده می‌شود.</li><li>کودک گاهی خودش رها می‌کند یا آرام‌تر می‌شود؛ اما آرام‌بودن به‌تنهایی کافی‌بودن شیر را ثابت نمی‌کند.</li><li>درد ماندگار مادر یا زخم شدن نوک سینه، نشانه‌ای برای بررسی گرفتن سینه است.</li></ul></article>
        <article className="panel bf-check-card"><div className="bf-check-icon"><Heart/></div><h3>در طول چند روز</h3><ul><li>پوشک خیس و مدفوع را با توجه به سن و روزهای اول زندگی ارزیابی کن؛ الگو با بزرگ‌ترشدن نوزاد تغییر می‌کند.</li><li>روند وزن‌گیری، هوشیاری و ارزیابی بالینی مهم‌اند.</li><li>اگر پوشک خیس کم شده، نوزاد بی‌حال است، زردی بیشتر می‌شود یا وزن‌گیری نگرانت کرده، سریع با پزشک یا ماما تماس بگیر.</li></ul></article>
      </div>
      <div className="notice"><ShieldCheck/><span>اندازهٔ سینه، احساس پُری، مقدار شیر با پمپ یا تعداد دقیقهٔ مکیدن به‌تنهایی معیار قابل اتکایی برای سنجش دریافت شیر نیستند.</span></div>
      <div className="bf-latch-signs"><h3>تولید شیر با تخلیهٔ مؤثر پیوند دارد</h3><p>مکیدن مؤثر و خارج‌شدن شیر به بدن پیام می‌دهد که شیر بیشتری بسازد. اگر نگرانی از کمبود شیر داری، پیش از استفاده از دمنوش، مکمل یا برنامهٔ پمپاژ فشرده، وضعیت گرفتن سینه و انتقال شیر را با مشاور شیردهی یا پزشک بررسی کن.</p></div>
    </section>
    <section className="bf-section bf-deep-dive" id="expressing">
      <div className="bf-section-heading"><span className="eyebrow">دوشیدن و نگهداری شیر</span><h2>اگر قرار است شیر بدوشی یا ذخیره کنی</h2><p>زمان‌های زیر از راهنمای CDC برای نوزاد سالم و ترم است؛ برای نوزاد نارس یا بیمار از تیم درمان راهنمایی بگیر.</p></div>
      <div className="bf-storage-grid">
        <article><span>🧼</span><b>پیش از دوشیدن</b><p>دست‌ها را بشوی؛ ظرف تمیز و مخصوص مواد غذایی یا کیسهٔ مخصوص نگهداری شیر انتخاب کن و تاریخ دوشیدن را روی آن بنویس.</p></article>
        <article><span>🌡️</span><b>شیر تازه دوشیده‌شده</b><p>دمای اتاق تا ۲۵ درجه: حداکثر ۴ ساعت. یخچال ۴ درجه یا سردتر: حداکثر ۴ روز. فریزر منفی ۱۸ درجه یا سردتر: ۶ ماه بهترین کیفیت؛ تا ۱۲ ماه پذیرفتنی است.</p></article>
        <article><span>❄️</span><b>یخ‌زدایی و گرم‌کردن</b><p>قدیمی‌ترین شیر را زودتر مصرف کن. در یخچال یا آب ولرم یخ‌زدایی کن؛ مایکروویو مناسب نیست. شیر یخ‌زدایی‌شده در یخچال تا ۲۴ ساعت و پس از گرم‌شدن یا رسیدن به دمای اتاق تا ۲ ساعت مصرف شود؛ دوباره منجمد نکن.</p></article>
        <article><span>🍼</span><b>ماندهٔ شیشه</b><p>اگر کودک شیشه را تمام نکرد، شیر باقی‌مانده را حداکثر تا ۲ ساعت پس از پایان وعده مصرف کن و بعد دور بریز. برای حمل‌ونقل، کیف عایق با یخ‌پک تا ۲۴ ساعت می‌تواند کمک کند.</p></article>
      </div>
      <div className="bf-latch-signs"><h3>دوشیدن با دست یا پمپ</h3><p>هر دو روش می‌توانند استفاده شوند. با پمپ، اندازهٔ مناسب قیف و راحتی مهم است؛ پمپاژ نباید دردناک باشد. قطعاتی را که با شیر تماس دارند طبق راهنمای سازنده تمیز و خشک کن. برای بازگشت به کار، برنامهٔ دوشیدن و محل نگهداری را با مراقب کودک هماهنگ کن.</p><a href="https://www.cdc.gov/infant-toddler-nutrition/breastfeeding/returning-to-your-workplace.html" target="_blank" rel="noopener noreferrer">راهنمای CDC برای شیردهی و بازگشت به محل کار ↗</a></div>
    </section>
    <section className="bf-section bf-deep-dive" id="common-concerns">
      <div className="bf-section-heading"><span className="eyebrow">مشکلات رایج</span><h2>درد، پُری یا التهاب پستان را تنها تحمل نکن</h2><p>تشخیص علت و انتخاب درمان به معاینه و شرایط فرد بستگی دارد.</p></div>
      <div className="bf-two-columns">
        <article className="panel"><h3>درد و زخم نوک سینه</h3><p>حساسیت اولیه ممکن است رخ دهد، اما درد شدید یا ادامه‌دار و زخم نیاز به بررسی دارد. گرفتن سینه و وضعیت بدن کودک را اصلاح کن و از ماما یا مشاور شیردهی بخواه یک وعده را مشاهده کند. اگر درد ادامه دارد، کمک بگیر.</p></article>
        <article className="panel"><h3>پُری، تودهٔ دردناک یا علائم شبیه آنفلوآنزا</h3><p>ناحیهٔ داغ و دردناک، قرمزی، تب یا لرز می‌تواند با التهاب پستان همراه باشد. ادامهٔ شیردهی معمولاً ممکن است؛ از فشار یا ماساژ محکم و دوشیدن بیش از نیاز پرهیز کن و برای تب، بدحالی یا بدترشدن علائم با پزشک تماس بگیر.</p></article>
      </div>
      <div className="notice bf-urgent"><ShieldCheck/><span>اگر نوزاد به‌سختی بیدار می‌شود، شیر نمی‌خورد، نشانه‌های کم‌آبی دارد یا مادر تب و بدحالی شدید دارد، منتظر نمان و همان روز ارزیابی پزشکی بگیر.</span></div>
      <p className="bf-medication-note">در دوران شیردهی، پیش از شروع یا قطع دارو، گیاه دارویی یا مکمل با پزشک یا داروساز مشورت کن؛ خودسرانه داروی ضروری را قطع نکن.</p>
    </section>
  </>;
}

function SourceLinks() { return <section className="panel bf-sources" id="bf-sources"><div className="bf-section-heading"><span className="eyebrow"><BookOpen size={15}/> منابع برای مطالعه بیشتر</span><h2>مبنای این راهنما</h2></div><p>مطالب این صفحه با استفاده از راهنماهای WHO، CDC، NHS و UNICEF گردآوری و به زبان ساده بازنویسی شده‌اند. توصیه‌ها عمومی‌اند و ممکن است برای نوزاد نارس، بیمار یا شرایط ویژه متفاوت باشند. شکل‌ها شماتیک‌اند و جای مشاهدهٔ یک وعدهٔ واقعی توسط متخصص را نمی‌گیرند.</p><ul>{sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} <small>({source.publisher})</small></a></li>)}</ul><small>برای درد مداوم، زخم، مشکل گرفتن سینه یا نگرانی دربارهٔ وزن‌گیری، از ماما، پزشک یا مشاور شیردهی کمک بگیر.</small></section> }

export default function BreastfeedingGuide({ cmsItems = [] }) {
  return <div className="breastfeeding-guide">
    <section className="bf-hero"><div className="bf-hero-copy"><span className="eyebrow">راهنمای تصویری مهرانا</span><h1>شیردهی، قدم‌به‌قدم و با آرامش</h1><p>چند حالت رایج برای قرارگرفتن مادر و نوزاد، اصول گرفتن سینه و نشانه‌هایی که می‌توانند به ارزیابی یک وعده کمک کنند.</p><div className="bf-hero-links"><a href="#positions">دیدن پوزیشن‌ها <ArrowLeft size={16}/></a><a href="#latch">اصول گرفتن سینه <ArrowLeft size={16}/></a></div></div><div className="bf-hero-art" aria-hidden="true"><div className="bf-hero-sun"/><span>♡</span><small>نزدیک، راحت، روبه‌رو</small></div></section>
    <div className="notice bf-notice"><ShieldCheck/><span>این راهنما آموزشی است و جایگزین مشاهده و ارزیابی مادر و نوزاد توسط ماما، پزشک یا مشاور شیردهی نیست. لازم نیست یک پوزیشن خاص را انتخاب کنی؛ حالتی را پیدا کن که برای هر دوی شما راحت و ایمن باشد.</span></div>

    <section className="bf-section" id="positions"><div className="bf-section-heading"><span className="eyebrow">پنج حالت رایج</span><h2>پوزیشن‌های شیردهی با شکل</h2><p>در همهٔ حالت‌ها، بدن کودک را نزدیک و رو به خودت نگه دار؛ گوش، شانه و لگنش در یک راستا باشد.</p></div><div className="bf-position-grid">{positions.map(position=><article className="bf-position-card" key={position.id}><PositionIllustration type={position.id} title={position.title}/><div className="bf-position-copy"><div className="bf-position-title"><span>{position.number}</span><div><h3>{position.title}</h3><small>{position.short}</small></div></div><p className="bf-best-for">{position.best}</p><ol>{position.steps.map(step=><li key={step}>{step}</li>)}</ol></div></article>)}</div></section>

    <section className="bf-section" id="latch"><div className="bf-section-heading"><span className="eyebrow">قبل و هنگام گرفتن سینه</span><h2>یک چک‌لیست ساده برای شروع</h2></div><div className="bf-check-grid"><article className="panel bf-check-card"><div className="bf-check-icon"><Heart/></div><h3>اول خودت راحت باش</h3><ul><li>کمرت و بازوها را تکیه بده و شانه‌ها را رها کن.</li><li>کودک را به سمت سینه بیاور؛ خودت به جلو خم نشو.</li><li>بدن کودک روبه‌روی تو و نزدیک باشد؛ گردن پیچ نخورده باشد.</li><li>بینی کودک را مقابل نوک سینه قرار بده و سر را آزاد نگه دار تا بتواند کمی به عقب متمایل شود.</li></ul></article><article className="panel bf-check-card"><div className="bf-check-icon"><Check/></div><h3>وقتی کودک دهانش را باز می‌کند</h3><ol><li>نوک سینه را آرام با لب بالایی کودک تماس بده و برای بازشدن دهان مکث کن.</li><li>وقتی دهان باز و بزرگ شد، کودک را نزدیک کن؛ چانه زودتر به سینه برسد.</li><li>بگذار بخش مناسبی از سینه وارد دهان شود؛ فقط نوک سینه را به دهان فشار نده.</li><li>اگر درد ادامه‌دار است، کودک را با انگشت تمیز به‌آرامی از سینه جدا کن و دوباره تلاش کن یا کمک بگیر.</li></ol></article></div><div className="bf-latch-signs"><h3>نشانه‌هایی که می‌توانند از گرفتن مناسب خبر بدهند</h3><div>{['دهان باز و پر از سینه','چانه نزدیک سینه','بینی آزاد و قابل تنفس','گونه‌های گرد هنگام مکیدن','مکیدن‌های ریتم‌دار و دیدن یا شنیدن بلع','نبود درد مداوم در نوک سینه'].map(item=><span key={item}><Check size={15}/>{item}</span>)}</div><small>این نشانه‌ها به‌تنهایی مقدار شیر دریافتی را مشخص نمی‌کنند؛ روند رشد و وضعیت کلی نوزاد باید در کنار هم ارزیابی شوند.</small></div></section>

    <section className="bf-section bf-two-columns"><article className="panel bf-cues"><span className="eyebrow">به نشانه‌های کودک توجه کن</span><h2>زمان شیر خواستن</h2><p>جنب‌وجوش، بردن دست به دهان، چرخاندن سر و جست‌وجو می‌توانند از نشانه‌های زودهنگام باشند. گریه معمولاً نشانهٔ دیرتر است؛ آرام‌کردن کودک پیش از تلاش برای گرفتن سینه ممکن است کمک‌کننده باشد.</p><p>تغذیهٔ پاسخ‌گو یعنی به نشانه‌های کودک توجه شود؛ تعداد و طول وعده‌ها برای همه یکسان نیست.</p></article><article className="panel bf-help"><span className="eyebrow">کمک گرفتن بخشی از مسیر است</span><h2>چه وقت با متخصص تماس بگیرم؟</h2><ul><li>درد شدید یا مداوم، ترک یا خون‌ریزی نوک سینه داری.</li><li>کودک مرتب نمی‌تواند سینه را بگیرد، مکیدن یا بلع مؤثر دیده نمی‌شود، یا برای شیر خوردن به‌سختی بیدار می‌شود.</li><li>دربارهٔ پوشک خیس، وزن‌گیری یا دریافت شیر نگرانی داری.</li><li>سینه قرمز و داغ شده یا همراه با تب و بدحالی هستی.</li></ul><p>برای ارزیابی متناسب با شرایط خودت با ماما، پزشک یا مشاور شیردهی تماس بگیر.</p></article></section>

    <BreastfeedingDeepDive/>
    <div className="notice bf-sleep-note"><ShieldCheck/><span>اگر هنگام شیردهی احتمال می‌دهی خوابت ببرد، روی مبل یا صندلی با نوزاد شیر نده. پس از وعده، نوزاد را به محل خواب ایمن خودش منتقل کن؛ صورت و راه تنفسش باید آزاد بماند. <a href={sources.find(source=>source.publisher==='NHS'&&source.label.includes('خواب'))?.url} target="_blank" rel="noopener noreferrer">راهنمای خواب ایمن NHS</a></span></div>

    {cmsItems.length>0&&<section className="bf-section"><div className="bf-section-heading"><span className="eyebrow">مقاله‌های تکمیلی مهرانا</span><h2>مطالب بیشتر</h2></div><div className="bf-extra-grid">{cmsItems.map(item=><article className="panel bf-extra-card" key={item.id}><small>{item.category||'راهنمای مهرانا'}{item.minAgeMonths!=null?` · ${item.minAgeMonths} ماه به بالا`:''}</small><h3>{item.title}</h3>{item.summary&&<p>{item.summary}</p>}<div>{item.body}</div>{item.sourceTitle&&<small className="cms-public-source">منبع: {item.sourceTitle}{item.sourcePages?` · صفحه ${item.sourcePages}`:''}{item.reviewerName?` · بازبینی: ${item.reviewerName}`:''}</small>}</article>)}</div></section>}
    <SourceLinks/>
  </div>;
}

