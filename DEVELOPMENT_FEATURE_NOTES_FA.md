# قابلیت مسیر رشد و تکامل کودک در مهرانا

## چه چیزی اضافه شده؟
- حلقه سن کودک در داشبورد اصلی با پیشرفت از تولد تا ۶۰ ماهگی.
- صفحه «رشد و تکامل کودک» در مسیر `/development`.
- ۱۲ ایستگاه سنی: ۲، ۴، ۶، ۹، ۱۲، ۱۵، ۱۸، ۲۴، ۳۰، ۳۶، ۴۸ و ۶۰ ماهگی.
- نمونه نقاط عطف در پنج حوزه: حرکتی درشت، حرکتی ظریف، زبان و ارتباط، شناختی، اجتماعی و هیجانی.
- ثبت وضعیت هر مهارت: مشاهده‌شده، در حال تمرین، هنوز مشاهده نشده، نگرانم.
- فعالیت‌های ساده پیشنهادی برای هر ایستگاه سنی.
- نمایش یادآوری ارزیابی‌های تکامل در ۹، ۱۸ و ۳۰ ماهگی و غربالگری اوتیسم در ۱۸ و ۲۴ ماهگی مطابق منبع CDC؛ پروتکل محلی باید جداگانه بررسی شود.

## ذخیره‌سازی
ثبت‌ها در آرایه `development` داخل داده حساب خانواده ذخیره می‌شوند و با همان API فعلی `/api/account/data` همگام می‌شوند. کلید هر ثبت شامل شناسه کودک و شناسه نقطه عطف است؛ بنابراین اطلاعات چند کودک با هم مخلوط نمی‌شود.

هیچ جدول جدیدی به SQLite اضافه نشده و هیچ مهاجرت دیتابیسی لازم نیست. اطلاعات موجود مادران و کودکان دست‌نخورده می‌ماند.

## فایل‌های تغییرکرده
- `src/App.jsx`
- `src/style.css`
- `src/developmentMilestones.js` (جدید)

## منبع و محدودیت علمی
نمونه نقاط عطف و فعالیت‌ها با اقتباس و ترجمه از دفترچه CDC Milestone Moments تهیه شده‌اند. CDC توضیح می‌دهد که نقاط عطف نشان‌دهنده مهارت‌هایی هستند که دست‌کم ۷۵٪ کودکان تا آن سن انجام می‌دهند و این چک‌لیست‌ها جایگزین ابزار غربالگری استاندارد و معتبر نیستند.

منبع: https://www.cdc.gov/act-early/media/pdfs/2025/05/Milestone-Moments-Booklet21_Eng_Sng_FNL-508-1.pdf

پیش از انتشار عمومی، متن فارسی، فعالیت‌ها و ارجاعات باید توسط متخصص رشد و تکامل کودک بازبینی و با دستورالعمل‌های محلی تطبیق داده شوند.

## Feature bundle added in the next development pass

The feature bundle introduces a unified administrator content library for:
- Food detail pages (`food`) and breastfeeding topics (`breastfeeding`). Published entries are exposed at `/food-guides/:slug` and `/breastfeeding-guides/:slug`.
- Development milestone editorial entries (`milestone`), activity ideas (`activity`), sleep education (`sleep_guide`), and reminder templates (`reminder`).

The family workspace also adds first-pass tools stored inside the authenticated account data document: sleep diary, reminders, daily activity completion, child health notes/measurements, and print-to-PDF monthly record review. These are record-keeping tools, not clinical interpretation or diagnostic features.

Migration `004_feature_content.sql` creates the content library. Migration `005_family_subscriptions.sql` creates subscription plans, subscription records, and family invitation foundations. The payment provider, invitation delivery, real role-based family access, and subscription entitlement enforcement are intentionally not active yet. Do not imply that an invitation or payment has been completed.

Admin route: `/admin/modules` (requires the existing admin session). It manages editorial entries; it does not expose private family records.
