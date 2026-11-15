اتصال Migration به نسخه بازسازی‌شده مهرانا

این نسخه بر اساس mehrana-rebuilt-source-fixed.zip ساخته شده است.
اسکریپت db:migrate به package.json اضافه شده و فایل database.js از همان مسیر پیش‌فرض دیتابیس API استفاده می‌کند:
server/data/mehrana.sqlite

قبل از اجرا:
1) از کل پوشه پروژه و به‌ویژه server/data نسخه پشتیبان بگیر.
2) اگر MEHRANA_DB_PATH در محیط تنظیم شده، مطمئن شو همان مسیر دیتابیس مورد استفاده API است.
3) سرور توسعه/API را متوقف کن.
4) در پوشه اصلی پروژه اجرا کن: npm run db:migrate

این Migration فقط جدول‌های جدید admin_users، admin_sessions،
admin_otp_challenges و audit_logs و جدول ثبت نسخه‌ها را ایجاد می‌کند.
جدول‌های مادر، OTP مادر و sessions فعلی تغییر نمی‌کنند.
این مرحله حساب مدیر یا مسیر ورود مدیر ایجاد نمی‌کند.
