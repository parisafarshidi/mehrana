import { publicPages } from '../src/publicContent.js';
import { keywordClusters, keywordBankStats } from '../src/seoKeywordBank.js';

const errors = [];
const warnings = [];
const pagePaths = new Set(publicPages.map(page => page.path));
const seen = new Map();

for (const cluster of keywordClusters) {
  if (!cluster.id || !cluster.title || !cluster.primary || !cluster.targetPath) {
    errors.push(`خوشه ناقص است: ${cluster.id || '(بدون شناسه)'}`);
  }
  if (!['published', 'planned'].includes(cluster.status)) {
    errors.push(`${cluster.id}: وضعیت باید published یا planned باشد.`);
  }
  if (cluster.status === 'published' && !pagePaths.has(cluster.targetPath)) {
    errors.push(`${cluster.id}: صفحه منتشرشده ${cluster.targetPath} در publicContent.js وجود ندارد.`);
  }
  if (cluster.status === 'planned' && pagePaths.has(cluster.targetPath)) {
    warnings.push(`${cluster.id}: صفحه هدف وجود دارد اما وضعیت خوشه هنوز planned است.`);
  }
  for (const keyword of [cluster.primary, ...cluster.keywords]) {
    const normalized = keyword.trim().toLocaleLowerCase('fa');
    if (!normalized) errors.push(`${cluster.id}: عبارت کلیدی خالی است.`);
    if (seen.has(normalized) && seen.get(normalized) !== cluster.id) {
      warnings.push(`عبارت «${keyword}» در دو خوشه ثبت شده است: ${seen.get(normalized)} و ${cluster.id}`);
    } else {
      seen.set(normalized, cluster.id);
    }
  }
}

console.log(`خوشه‌ها: ${keywordBankStats.clusterCount}`);
console.log(`عبارت‌های کلیدی: ${keywordBankStats.keywordCount}`);
console.log(`صفحات دارای هدف منتشرشده: ${keywordBankStats.publishedTargets}`);
console.log(`صفحات هدف برنامه‌ریزی‌شده: ${keywordBankStats.plannedTargets}`);
for (const warning of warnings) console.warn(`هشدار: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`خطا: ${error}`);
  process.exitCode = 1;
} else {
  console.log('بررسی ساختار بانک کلمات کلیدی موفق بود.');
}
