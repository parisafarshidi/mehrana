const persianParts = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', {
  year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC',
});
const jalaliDateCache = new Map();

function partsOf(date) {
  const parts = Object.fromEntries(persianParts.formatToParts(date).map(part => [part.type, part.value]));
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

export function todayISO() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function toJalali(iso) {
  if (!iso) return null;
  const date = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : partsOf(date);
}

export function jalaliToISO(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1) return '';
  const key = `${year}-${month}-${day}`;
  if (jalaliDateCache.has(key)) return jalaliDateCache.get(key);
  const monthOffset = month <= 7 ? (month - 1) * 31 : 6 * 31 + (month - 7) * 30;
  const estimate = Date.UTC(year + 621, 2, 19, 12) + (monthOffset + day - 1) * 86_400_000;
  for (let offset = -3; offset <= 3; offset += 1) {
    const date = new Date(estimate + offset * 86_400_000);
    const value = partsOf(date);
    if (value.year === year && value.month === month && value.day === day) {
      const iso = date.toISOString().slice(0, 10);
      jalaliDateCache.set(key, iso);
      return iso;
    }
  }
  jalaliDateCache.set(key, '');
  return '';
}

export function jalaliMonthLength(year, month) {
  if (month >= 1 && month <= 6) return 31;
  if (month >= 7 && month <= 11) return 30;
  const first = jalaliToISO(year, 12, 1);
  const next = jalaliToISO(year + 1, 1, 1);
  return first && next ? (Date.parse(`${next}T12:00:00Z`) - Date.parse(`${first}T12:00:00Z`)) / 86_400_000 : 29;
}

export function formatPersianDate(iso, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
  if (!iso) return '';
  const date = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('fa-IR-u-ca-persian', { ...options, timeZone: 'UTC' }).format(date);
}

export function jalaliMonthTitle(year, month) {
  const iso = jalaliToISO(year, month, 1);
  return iso ? formatPersianDate(iso, { year: 'numeric', month: 'long' }) : '';
}
