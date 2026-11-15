/**
 * Mehrana SEO keyword map.
 * This is an editorial planning source, not a list to stuff into page copy.
 * Every cluster has one primary landing page to avoid keyword cannibalization.
 * Search-volume and difficulty fields intentionally stay empty until validated
 * with Search Console / a keyword research tool.
 */
export const keywordClusters = [
  {
    id: 'breastfeeding', title: 'شیر مادر و شیردهی', category: 'تغذیه نوزاد', priority: 'high',
    targetPath: '/articles/breastfeeding/', status: 'planned',
    primary: 'شیر مادر',
    keywords: ['شیر مادر', 'فواید شیر مادر', 'خواص شیر مادر', 'تغذیه با شیر مادر', 'شیردهی نوزاد', 'تا چند ماهگی شیر مادر کافی است', 'نشانه های کافی بودن شیر مادر', 'از کجا بفهمم نوزاد شیر کافی می خورد', 'افزایش شیر مادر', 'علت کم شدن شیر مادر', 'ذخیره شیر مادر', 'دوشیدن شیر مادر', 'نگهداری شیر دوشیده شده', 'تغذیه مادر در دوران شیردهی', 'غذاهای مناسب مادر شیرده', 'شیردهی شبانه', 'تعداد دفعات شیر خوردن نوزاد', 'مدت زمان شیر خوردن نوزاد']
  },
  {
    id: 'formula', title: 'شیر خشک و تغذیه با شیشه', category: 'تغذیه نوزاد', priority: 'medium',
    targetPath: '/articles/formula-feeding/', status: 'planned',
    primary: 'شیر خشک نوزاد',
    keywords: ['شیر خشک نوزاد', 'طرز آماده کردن شیر خشک', 'نحوه درست کردن شیر خشک', 'مقدار شیر خشک نوزاد', 'هر چند ساعت به نوزاد شیر خشک بدهیم', 'نگهداری شیر خشک آماده', 'تفاوت شیر مادر و شیر خشک', 'شیشه شیر نوزاد', 'شستن و ضدعفونی شیشه شیر', 'علائم عدم تحمل شیر خشک']
  },
  {
    id: 'complementary-feeding', title: 'شروع و برنامه تغذیه تکمیلی', category: 'تغذیه کودک', priority: 'high',
    targetPath: '/articles/complementary-feeding/', status: 'published',
    primary: 'تغذیه تکمیلی',
    keywords: ['تغذیه تکمیلی', 'شروع غذای کمکی', 'غذای کمکی نوزاد', 'اولین غذای نوزاد', 'نوزاد از چند ماهگی غذا می خورد', 'نوزاد شش ماهه چی بخوره', 'غذای کمکی شش ماهگی', 'برنامه غذایی نوزاد شش ماهه', 'برنامه غذایی کودک هفت ماهه', 'برنامه غذایی کودک هشت ماهه', 'برنامه غذایی کودک نه ماهه', 'غذای مناسب نوزاد یک ساله', 'ترتیب دادن غذای کمکی', 'دفعات غذای کمکی در روز', 'مقدار غذای کمکی نوزاد', 'بافت غذای کودک', 'پوره برای نوزاد', 'غذای انگشتی کودک', 'تغذیه پاسخگو کودک', 'آمادگی نوزاد برای غذای کمکی']
  },
  {
    id: 'food-safety', title: 'ایمنی غذا، آلرژی و واکنش غذایی', category: 'تغذیه کودک', priority: 'high',
    targetPath: '/articles/food-allergy/', status: 'published',
    primary: 'حساسیت غذایی نوزاد',
    keywords: ['حساسیت غذایی نوزاد', 'علائم حساسیت غذایی در نوزاد', 'آلرژی غذایی کودک', 'واکنش نوزاد بعد از خوردن غذا', 'غذاهای حساسیت زا برای نوزاد', 'معرفی تخم مرغ به نوزاد', 'معرفی بادام زمینی به کودک', 'غذاهای ممنوع برای نوزاد زیر یک سال', 'عسل برای نوزاد', 'خطر خفگی غذا در کودک', 'غذاهای پرخطر برای خفگی کودک', 'ثبت واکنش غذایی کودک']
  },
  {
    id: 'food-pages', title: 'مواد غذایی و دستور غذای کودک', category: 'تغذیه کودک', priority: 'high',
    targetPath: '/food-guides/', status: 'planned',
    primary: 'غذای مناسب نوزاد',
    keywords: ['غذای مناسب نوزاد', 'چه غذایی به نوزاد بدهیم', 'چی به نوزاد بدیم', 'موز برای نوزاد', 'سیب برای نوزاد', 'هویج برای نوزاد', 'تخم مرغ برای نوزاد', 'ماست برای نوزاد', 'برنج برای نوزاد', 'عدس برای نوزاد', 'گوشت برای نوزاد', 'مرغ برای نوزاد', 'اسفناج برای نوزاد', 'آووکادو برای نوزاد', 'فرنی برای نوزاد', 'طرز تهیه حریره بادام', 'طرز تهیه سوپ نوزاد', 'طرز تهیه پوره نوزاد', 'غذای انگشتی برای نوزاد', 'غذاهای مقوی برای کودک']
  },
  {
    id: 'growth', title: 'رشد جسمی کودک', category: 'رشد کودک', priority: 'high',
    targetPath: '/articles/child-growth/', status: 'published',
    primary: 'رشد کودک',
    keywords: ['رشد کودک', 'نمودار رشد کودک', 'جدول وزن نوزاد', 'وزن مناسب نوزاد', 'قد مناسب کودک', 'دور سر نوزاد', 'وزن گیری نوزاد', 'رشد نوزاد ماه به ماه', 'رشد کودک بر اساس سن', 'محاسبه سن دقیق کودک', 'صدک رشد کودک', 'علت وزن نگرفتن نوزاد']
  },
  {
    id: 'development', title: 'رشد و تکامل مهارت ها', category: 'تکامل کودک', priority: 'high',
    targetPath: '/articles/child-development/', status: 'planned',
    primary: 'مراحل رشد و تکامل کودک',
    keywords: ['مراحل رشد و تکامل کودک', 'نقاط عطف رشد کودک', 'جدول تکامل کودک', 'رشد حرکتی نوزاد', 'رشد گفتار کودک', 'نوزاد از کی می نشیند', 'نوزاد از کی چهار دست و پا می رود', 'کودک از کی راه می رود', 'بازی مناسب سن کودک', 'فعالیت مناسب نوزاد', 'تقویت مهارت های حرکتی کودک', 'تکامل اجتماعی کودک']
  },
  {
    id: 'sleep', title: 'خواب نوزاد و کودک', category: 'مراقبت کودک', priority: 'medium',
    targetPath: '/articles/baby-sleep/', status: 'planned',
    primary: 'خواب نوزاد',
    keywords: ['خواب نوزاد', 'میزان خواب نوزاد در شبانه روز', 'برنامه خواب نوزاد', 'چرت روزانه نوزاد', 'علت بیدار شدن نوزاد در شب', 'تنظیم خواب کودک', 'خواب کودک بر اساس سن', 'بهداشت خواب کودک', 'محیط خواب ایمن نوزاد']
  },
  {
    id: 'health', title: 'سلامت و مراقبت های کودک', category: 'سلامت کودک', priority: 'medium',
    targetPath: '/articles/child-health/', status: 'planned',
    primary: 'مراقبت از نوزاد',
    keywords: ['مراقبت از نوزاد', 'مراقبت های نوزاد بعد از تولد', 'برنامه واکسیناسیون کودک', 'تقویم واکسن نوزاد', 'تب نوزاد', 'علائم خطر در نوزاد', 'بهداشت دهان و دندان کودک', 'مراقبت از پوست نوزاد', 'چکاپ نوزاد', 'آزمایش های نوزاد']
  },
  {
    id: 'parenting', title: 'رفتار و فرزندپروری', category: 'فرزندپروری', priority: 'medium',
    targetPath: '/articles/parenting/', status: 'planned',
    primary: 'فرزندپروری کودک',
    keywords: ['فرزندپروری', 'تربیت کودک', 'بدغذایی کودک', 'علت غذا نخوردن کودک', 'اضطراب جدایی کودک', 'لجبازی کودک', 'تنظیم هیجان کودک', 'آموزش دستشویی رفتن کودک', 'استقلال کودک', 'ارتباط موثر با کودک']
  }
];

export const keywordBankStats = {
  clusterCount: keywordClusters.length,
  keywordCount: keywordClusters.reduce((sum, cluster) => sum + cluster.keywords.length + 1, 0),
  publishedTargets: keywordClusters.filter(cluster => cluster.status === 'published').length,
  plannedTargets: keywordClusters.filter(cluster => cluster.status === 'planned').length,
};

export function getKeywordCluster(id) {
  return keywordClusters.find(cluster => cluster.id === id) ?? null;
}

export function getClustersForPath(path) {
  return keywordClusters.filter(cluster => cluster.targetPath === path);
}
