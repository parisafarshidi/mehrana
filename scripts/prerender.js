import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { publicPages } from '../src/publicContent.js';
import { openDatabase } from '../server/db/database.js';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const base = (process.env.SITE_URL || 'https://mehranaman.ir').replace(/\/$/, ''); // Set SITE_URL to the real production domain before deployment.
const template = await readFile(resolve(dist, 'index.html'), 'utf8');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = (path, label) => `<a href="${esc(path)}">${esc(label)}</a>`;
function body(page){
  const header = `<header class="seo-header"><a class="seo-brand" href="/"><span>✿</span><b>مهرانا<small>رشد سالم، با عشق و آگاهی</small></b></a><nav>${link('/features/','امکانات')}${link('/articles/','مجله')}${link('/plans/','اشتراک')}${link('/about/','درباره مهرانا')}${link('/about-me/','درباره من')}</nav>${link('/login','ورود')}</header>`;
  let content = '';
  if(page.type==='home') content = `<main><section class="seo-hero"><div><span>همراه خانواده از تولد تا پنج‌سالگی</span><h1>رشد سالم،<br>با عشق و آگاهی</h1><p>${esc(page.intro)}</p><p>${link('/login','ورود به مهرانا')}　${link('/features/','آشنایی با امکانات')}</p><small>آموزش عمومی و ابزار ثبت؛ نه جایگزین ارزیابی پزشکی</small></div><div><h2>همراهی در هر مرحله</h2><p>پروفایل کودک، دفترچه تغذیه، برنامه روزانه غذایی و پایش رشد</p></div></section><section><h2>ابزارهایی برای مسیر رشد و تغذیه کودک</h2><div class="cards">${[['پروفایل کودک','ثبت اطلاعات پایه و مسیر رشد هر کودک.'],['دفترچه تغذیه','ثبت غذاهای معرفی‌شده و واکنش‌های مشاهده‌شده.'],['برنامه روزانه غذایی','برنامه پیشنهادی بر پایه ویژگی‌های همان کودک.'],['پایش رشد','ثبت اندازه‌گیری‌ها و مرور روند تغییرات.']].map(([h,p])=>`<article><h3>${h}</h3><p>${p}</p></article>`).join('')}</div></section><section><h2>برنامه غذایی که از کودک شما شروع می‌شود</h2><p>سن، آمادگی رشدی، مهارت خوردن، غذاهای تجربه‌شده و حساسیت‌ها در طراحی برنامه روزانه لحاظ می‌شوند.</p>${link('/features/daily-food-plan/','درباره برنامه روزانه غذایی')}</section><section><h2>آموزش برای والدین</h2><div class="cards">${publicPages.filter(x=>x.type==='article').map(a=>`<article><h3>${link(a.path,a.h1)}</h3><p>${esc(a.description)}</p></article>`).join('')}</div></section></main>`;
  else if(page.type==='article') content = `<main class="article"><nav>${link('/','خانه')} / ${link('/articles/','مجله مهرانا')} / ${esc(page.category)}</nav><p>${esc(page.category)}</p><h1>${esc(page.h1)}</h1><p class="lead">${esc(page.intro)}</p>${(page.sections||[]).map(([h,p])=>`<section><h2>${esc(h)}</h2><p>${esc(p)}</p></section>`).join('')}<aside>این مطلب آموزشی و عمومی است و جایگزین ارزیابی یا توصیه پزشک کودک نیست.</aside>${page.sources?.length?`<section><h2>منابع برای مطالعه بیشتر</h2><ul>${page.sources.map(s=>`<li><a href="${esc(s.url)}" rel="nofollow noopener">${esc(s.label)}</a></li>`).join('')}</ul></section>`:''}</main>`;
  else if(page.type==='articles') content = `<main><h1>${esc(page.h1)}</h1><p>${esc(page.intro)}</p><div class="cards">${publicPages.filter(x=>x.type==='article').map(a=>`<article><small>${esc(a.category)}</small><h2>${link(a.path,a.h1)}</h2><p>${esc(a.description)}</p></article>`).join('')}</div></main>`;
  else if(page.slug==='about-me') content = `<main><h1>${esc(page.h1)}</h1><p class="lead">${esc(page.intro)}</p><section><h2>ارتباط و پرسش</h2><p>برای تماس با پریسا فرشیدی: <a href="tel:+989177583503">۰۹۱۷۷۵۸۳۵۰۳</a></p><p>برای ارسال پرسش عمومی و درخواست پیگیری، از فرم داخل سایت استفاده کن.</p>${link('/about-me/#ask','رفتن به فرم پرسش')}<h2>حدود راهنمایی</h2><p>پاسخ فرم جایگزین معاینه، تشخیص یا رسیدگی فوری نیست.</p></section></main>`;
  else if(page.slug==='daily-food-plan') content = `<main><h1>${esc(page.h1)}</h1><p>${esc(page.intro)}</p><section><h2>چه اطلاعاتی در شخصی‌سازی نقش دارند؟</h2><ul><li>سن دقیق و تاریخ تولد کودک</li><li>آمادگی رشدی، نشستن، بلع و مهارت خوردن</li><li>غذاهای معرفی‌شده، پذیرفته‌شده یا ردشده</li><li>حساسیت‌ها و واکنش‌های ثبت‌شده</li><li>الگوی شیر مادر یا شیرخشک و محدودیت‌ها</li></ul><h2>جزئیات هر وعده</h2><p>غذا و ترکیبات، بافت پیشنهادی، مقدار راهنمایی‌شده، زمان‌بندی انعطاف‌پذیر، روش آماده‌سازی و نکات ایمنی. مقدار و زمان قطعی و یکسان برای همه کودکان تعیین نمی‌شود.</p><h2>ایمنی مقدم بر برنامه است</h2><p>در صورت واکنش مشکوک یا مشکل بلع، برنامه باید برای بررسی علامت‌گذاری شود؛ سیستم خودکار غذای جایگزین یا رژیم درمانی تجویز نمی‌کند.</p></section></main>`;
  else if(page.slug==='plans') content = `<main><h1>${esc(page.h1)}</h1><p>${esc(page.intro)}</p><div class="cards"><article><h2>رایگان</h2><p>راهنماهای عمومی و ایمنی، پروفایل کودک، دفترچه تغذیه و پایش رشد.</p></article><article><h2>مهرانا پلاس</h2><p>برنامه روزانه غذایی شخصی‌سازی‌شده و ابزارهای تکمیلی. قیمت و پرداخت پس از آماده‌سازی زیرساخت اشتراک و پایلوت اعلام می‌شود.</p></article></div></main>`;
  else content = `<main><h1>${esc(page.h1)}</h1><p>${esc(page.intro)}</p><section><h2>رویکرد مهرانا</h2><p>اطلاعات عمومی باید قابل فهم و مبتنی بر منابع معتبر باشد. اطلاعات خانواده حساس‌اند و دسترسی به آن‌ها باید محدود و قابل پیگیری باشد.</p></section></main>`;
  const footer = `<footer><b>مهرانا</b><nav>${link('/privacy/','حریم خصوصی')} ${link('/articles/','مقاله‌ها')} ${link('/features/','امکانات')} ${link('/login','ورود خانواده')} ${link('/about-me/','درباره من و مشاوره')}</nav><small>© مهرانا · محتوای آموزشی جایگزین ارزیابی پزشکی نیست.</small></footer>`;
  return header+content+footer;
}
for(const page of publicPages){
  const outDir = page.path==='/'?dist:resolve(dist,page.path.replace(/^\//,'').replace(/\/$/,''));
  await mkdir(outDir,{recursive:true});
  const canonical = `${base}${page.path}`;
  const jsonLd = page.type==='article' ? { '@context':'https://schema.org','@type':'Article',headline:page.h1,description:page.description,mainEntityOfPage:canonical,publisher:{'@type':'Organization',name:'مهرانا'}} : {'@context':'https://schema.org','@type':'WebPage',name:page.title,description:page.description,url:canonical,isPartOf:{'@type':'WebSite',name:'مهرانا',url:base}};
  let html = template.replace(/<div id="root"><\/div>/, `<div id="root">${body(page)}</div>`);
  html = html.replace(/<title>.*?<\/title>/,`<title>${esc(page.title)}</title>`)
    .replace('</head>',`<meta name="description" content="${esc(page.description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${esc(canonical)}"><meta property="og:type" content="${page.type==='article'?'article':'website'}"><meta property="og:title" content="${esc(page.title)}"><meta property="og:description" content="${esc(page.description)}"><meta property="og:url" content="${esc(canonical)}"><meta name="twitter:card" content="summary"><script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g,'\\u003c')}</script></head>`);
  // Small critical styles keep the pre-rendered content readable before React loads.
  html = html.replace('</head>',`<style>body{margin:0;font-family:Tahoma,sans-serif;direction:rtl;color:#392f3a;background:#fbfaf7;line-height:2}.seo-header,footer{padding:20px max(18px,calc((100% - 1100px)/2));display:flex;justify-content:space-between;gap:20px;align-items:center;border-bottom:1px solid #eee7e8}.seo-header a,footer a{color:#4b2b49;text-decoration:none;font-size:12px}main{max-width:1100px;margin:auto;padding:45px 20px 70px}h1{font-size:36px;color:#4b2b49;line-height:1.7}h2{font-size:22px;color:#4b2b49}p,li{font-size:14px;line-height:2.3;color:#756c75}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:15px}.cards article{background:white;border:1px solid #eee7e8;border-radius:8px 20px;padding:20px}.lead{font-size:17px}.article{max-width:820px}.article aside{background:#f5f0e2;padding:15px;border-right:3px solid #b65c4c;font-size:12px}footer{border-top:1px solid #eee7e8;border-bottom:0;flex-wrap:wrap}footer small{width:100%;text-align:center;color:#999;font-size:10px}@media(max-width:650px){.seo-header nav{display:none}h1{font-size:28px}}</style></head>`);
  await writeFile(resolve(outDir,'index.html'),html,'utf8');
}
// Public shop pages are pre-rendered with the same product facts shown by React.
const { shopProducts, shopCategories, ageLabel } = await import('../src/shopData.js');
const shopRoutes = [{ path: '/shop/', title: 'فروشگاه رشد و یادگیری کودک | مهرانا', description: 'راهنمای انتخاب بازی‌های تکاملی، لوازم تغذیه، ابزارهای یادگیری و ایمنی کودک متناسب با سن و مرحله رشد.' }, ...shopProducts.map(item => ({ path: `/shop/${item.slug}/`, title: `${item.name} | فروشگاه مهرانا`, description: item.summary, product: item }))];
for (const page of shopRoutes) {
  const canonical = `${base}${page.path}`;
  let bodyHtml;
  if (page.product) {
    const item = page.product;
    const category = shopCategories.find(x => x.id === item.category);
    const sourceSection = (heading, sources) => `<section><h3>${esc(heading)}</h3><ul>${sources.map(ref => `<li><a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">${esc(ref.label)}</a><small>${esc(ref.publisher)} · ${esc(ref.scope)}</small></li>`).join('')}</ul></section>`;
    bodyHtml = `<main class="article"><nav>${link('/','خانه')} / ${link('/shop/','فروشگاه مهرانا')} / ${esc(category.title)}</nav><p>${esc(category.title)} · نمونه نمایشی</p><h1>${esc(item.name)}</h1><p class="lead">${esc(item.summary)}</p><section><h2>معرفی محصول</h2><p>${esc(item.what)}</p><h2>برای چه سنی مناسب است؟</h2><p>${esc(ageLabel(item.ageMin))} تا ${item.ageMax < 12 ? `${item.ageMax} ماهگی` : item.ageMax < 24 ? '۲ سالگی' : `${Math.floor(item.ageMax / 12)} سالگی`}؛ ${esc(item.ageNote)}</p><h2>این بازی چه چیزی به کودک می‌دهد؟</h2><ul>${item.skills.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p><b>احساس‌های همراه بازی:</b> ${item.feelings?.map(esc).join('، ') || 'کنجکاوی و تعامل'}</p><h2>سه بازی ساده در خانه</h2><ol>${item.activities?.map(x => `<li>${esc(x)}</li>`).join('') || `<li>${esc(item.use)}</li>`}</ol><h2>هنگام انتخاب به چه نکاتی توجه کنیم؟</h2><p>${esc(item.consider)}</p><h2>نکته‌های ایمنی</h2><p>${esc(item.safety)}</p><h2>منابع و حدود این معرفی</h2><p>${esc(item.productSourceNote)}</p>${sourceSection('پشتوانه توضیح رشد و فعالیت',item.references)}${sourceSection('مرجع نکته‌های ایمنی',item.safetyReferences)}<aside>منابع عمومی، کالا یا برند خاصی را تأیید نمی‌کنند. نمونه نمایشی است؛ فروشنده، گواهی همان محصول، پیوند خرید، قیمت و موجودی ثبت نشده است.</aside></section></main>`;
  } else {
    const cards = shopProducts.map(item => `<article><small>نمونه نمایشی · ${esc(shopCategories.find(x => x.id === item.category).title)}</small><h2>${link(`/shop/${item.slug}/`, item.name)}</h2><p>${esc(item.summary)}</p><p>سن تقریبی: ${esc(ageLabel(item.ageMin))} · مهارت‌ها: ${esc(item.skills.slice(0,2).join('، '))}</p></article>`).join('');
    bodyHtml = `<main><p>انتخاب آگاهانه، متناسب با مسیر رشد</p><h1>فروشگاه رشد و یادگیری کودک مهرانا</h1><p class="lead">درباره ابزارهای بازی، یادگیری، تغذیه و ایمنی بیشتر بدانید؛ با توجه به سن کودک و مهارت‌هایی که هر وسیله می‌تواند فرصت تمرینشان را فراهم کند.</p><section><h2>دسته‌بندی‌ها</h2><p>${shopCategories.map(x => esc(x.title)).join(' · ')}</p></section><section><h2>نمونه‌های معرفی‌شده</h2><div class="cards">${cards}</div></section><aside>همه موارد فعلی نمونه نمایشی هستند. پیوند خرید، فروشنده، قیمت یا موجودی ثبت نشده است.</aside></main>`;
  }
  const html = template.replace(/<div id="root"><\/div>/, `<div id="root"><header class="seo-header">${link('/', 'مهرانا')}<nav>${link('/shop/', 'فروشگاه')}${link('/articles/', 'مجله')}${link('/about/', 'درباره مهرانا')}</nav>${link('/login', 'ورود')}</header>${bodyHtml}<footer><b>مهرانا</b>${link('/privacy/', 'حریم خصوصی')}<small>محتوای آموزشی جایگزین ارزیابی متخصص نیست.</small></footer></div>`)
    .replace(/<title>.*?<\/title>/, `<title>${esc(page.title)}</title>`)
    .replace('</head>', `<meta name="description" content="${esc(page.description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${esc(canonical)}"><meta property="og:title" content="${esc(page.title)}"><meta property="og:description" content="${esc(page.description)}"><meta property="og:url" content="${esc(canonical)}"></head>`);
  const outDir = resolve(dist, page.path.replace(/^\//, '').replace(/\/$/, ''));
  await mkdir(outDir, { recursive: true });
  await writeFile(resolve(outDir, 'index.html'), html, 'utf8');
}
const featurePages = [];
let contentDb;
try {
  contentDb = openDatabase();
  const rows = contentDb.prepare(`SELECT content_type,title,slug,summary,body,category,min_age_months,max_age_months,reviewer_name,source_notes FROM feature_content WHERE status='published' AND content_type IN ('food','breastfeeding') ORDER BY title`).all();
  for (const item of rows) {
    const prefix = item.content_type === 'food' ? '/food-guides/' : '/breastfeeding-guides/';
    const path = `${prefix}${item.slug}/`;
    const title = `${item.title} | مهرانا`;
    const canonical = `${base}${path}`;
    const paragraphs = String(item.body || '').split(/\n{2,}/).map(x => `<p>${esc(x)}</p>`).join('');
    const age = item.min_age_months == null ? '' : `<p>بازه سنی: ${item.min_age_months} تا ${item.max_age_months ?? 'نامشخص'} ماه</p>`;
    const htmlBody = `<main class="article"><nav>${link('/','خانه')} / ${link(prefix, item.content_type === 'food' ? 'غذاهای کودک' : 'راهنمای شیردهی')} / ${esc(item.category)}</nav><p>${esc(item.category)}</p><h1>${esc(item.title)}</h1><p class="lead">${esc(item.summary)}</p>${age}${paragraphs}<aside>این محتوا آموزشی است و جایگزین ارزیابی یا توصیه متخصص نیست.</aside>${item.reviewer_name ? `<p>بازبینی علمی: ${esc(item.reviewer_name)}</p>` : ''}</main>`;
    const html = template.replace(/<div id="root"><\/div>/, `<div id="root">${headerForFeature(path, item.content_type)}${htmlBody}</div>`)
      .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace('</head>', `<meta name="description" content="${esc(item.summary)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${esc(canonical)}"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Article',headline:item.title,description:item.summary,mainEntityOfPage:canonical,publisher:{'@type':'Organization',name:'مهرانا'}}).replace(/</g,'\\u003c')}</script></head>`);
    const outDir = resolve(dist, path.replace(/^\//,'').replace(/\/$/,''));
    await mkdir(outDir,{recursive:true}); await writeFile(resolve(outDir,'index.html'),html,'utf8');
    featurePages.push({path,title,summary:item.summary,type:item.content_type});
  }
} catch (error) {
  if (error.code !== 'ERR_SQLITE_ERROR' && !String(error.message).includes('no such table')) console.warn('Dynamic content prerender skipped:', error.message);
} finally { contentDb?.close(); }
function headerForFeature(path, type) { return `<header class="seo-header"><a class="seo-brand" href="/"><span>✿</span><b>مهرانا<small>رشد سالم، با عشق و آگاهی</small></b></a><nav>${link('/features/','امکانات')}${link('/articles/','مجله')}${link('/food-guides/','غذاها')}${link('/breastfeeding-guides/','شیردهی')}${link('/plans/','اشتراک')}</nav>${link('/login','ورود')}</header>`; }
for (const listing of [{type:'food',path:'/food-guides/',title:'راهنمای غذاهای کودک | مهرانا',heading:'صفحات اختصاصی غذاهای کودک',description:'معرفی غذاها، سن پیشنهادی، آماده‌سازی و نکات ایمنی.'},{type:'breastfeeding',path:'/breastfeeding-guides/',title:'راهنمای شیردهی | مهرانا',heading:'موضوعات شیردهی',description:'راهنماهای شیردهی، دوشیدن و نگهداری شیر مادر.'}]) {
  const items = featurePages.filter(x=>x.type===listing.type);
  const cards = items.map(x=>`<article><h2>${link(x.path,x.title.replace(/ \| مهرانا$/,''))}</h2><p>${esc(x.summary)}</p></article>`).join('');
  const html = template.replace(/<div id="root"><\/div>/, `<div id="root">${headerForFeature(listing.path,listing.type)}<main><h1>${esc(listing.heading)}</h1><p>${esc(listing.description)}</p><div class="cards">${cards||'<p>محتوای این بخش به‌زودی منتشر می‌شود.</p>'}</div></main></div>`)
    .replace(/<title>.*?<\/title>/,`<title>${esc(listing.title)}</title>`)
    .replace('</head>',`<meta name="description" content="${esc(listing.description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${base}${listing.path}"></head>`);
  const outDir=resolve(dist,listing.path.replace(/^\//,'').replace(/\/$/,''));await mkdir(outDir,{recursive:true});await writeFile(resolve(outDir,'index.html'),html,'utf8');
}
const extraUrls = ['/food-guides/','/breastfeeding-guides/','/shop/',...shopProducts.map(x=>`/shop/${x.slug}/`),...featurePages.map(x=>x.path)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...publicPages.map(p=>p.path),...extraUrls].map(path=>`<url><loc>${base}${path}</loc><changefreq>${path.includes('/articles/')?'monthly':'weekly'}</changefreq><priority>${path==='/'?'1.0':path.endsWith('/')?'0.8':'0.7'}</priority></url>`).join('')}</urlset>`;
await writeFile(resolve(dist,'sitemap.xml'),sitemap,'utf8');
await writeFile(resolve(dist,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\n`,'utf8');
console.log(`Prerendered ${publicPages.length} public pages and ${featurePages.length} published food/breastfeeding pages, sitemap.xml and robots.txt`);
