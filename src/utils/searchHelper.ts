import { Product } from '../types';

// Kirill harflarini Lotin harflariga o'girish
const CYRILLIC_TO_LATIN: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh',
  'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'ў': 'o', 'қ': 'q', 'ғ': 'g', 'ҳ': 'h',
};

// Keng tarqalgan sinonimlar va tarjimalar
const SYNONYMS: Record<string, string[]> = {
  'айфон': ['iphone', 'ayfon'],
  'ayfon': ['iphone', 'айфон'],
  'iphone': ['айфон', 'ayfon', 'iphone'],
  'apple': ['эппл', 'apple'],
  'эппл': ['apple', 'эппл'],
  'самсунг': ['samsung', 'galaxy'],
  'samsung': ['самсунг', 'galaxy'],
  'galaxy': ['samsung', 'galaxy'],
  'артел': ['artel'],
  'artel': ['артел', 'artel'],
  'дайсон': ['dyson', 'airwrap'],
  'dyson': ['дайсон', 'airwrap', 'dyson'],
  'xiaomi': ['сяоми', 'redmi', 'mi', 'xiaomi'],
  'redmi': ['xiaomi', 'редми', 'redmi'],
  'телефон': ['smartfon', 'smartphone', 'phone'],
  'smartfon': ['телефон', 'smartphone', 'phone', 'smartfon'],
  'noutbuk': ['noutbuklar', 'laptop', 'macbook', 'kompyuter', 'ноутбук'],
  'ноутбук': ['noutbuk', 'laptop', 'macbook'],
  'телевизор': ['tv', 'smart tv', 'televizor'],
  'tv': ['televizor', 'телевизор', 'tv'],
  'changyutgich': ['robot', 'пылесос', 'changyutgich'],
  'muzlatgich': ['sovutgich', 'xolodilnik', 'холодильник', 'refrigerator'],
  'xolodilnik': ['muzlatgich', 'sovutgich', 'холодильник'],
  'konditsioner': ['konditsionerlar', 'air conditioner', 'кондиционер'],
  'naushnik': ['quloqchin', 'airpods', 'headphones', 'наушники'],
  'airpods': ['naushnik', 'airpods pro', 'airpods'],
};

// Matnni qidiruv uchun tozalash va normallashtirish
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  let str = text.toLowerCase();
  
  // O'zbekcha maxsus tutruq va belgilarni tozalash: o', g', ’, ‘, ʻ, ʼ
  str = str.replace(/[’‘ʻʼ'`]/g, '');

  // Kirill harflarini lotinga transliteratsiya qilish
  let latinStr = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    latinStr += CYRILLIC_TO_LATIN[char] !== undefined ? CYRILLIC_TO_LATIN[char] : char;
  }

  return latinStr.trim();
}

// Bitta tovar matnini to'liq qidiruv maydoni sifatida yig'ish
function getProductSearchableContent(product: Product): string {
  const parts = [
    product.title,
    product.categoryName,
    product.sku,
    product.description || '',
    ...(product.tags || []),
    ...Object.keys(product.specs || {}),
    ...Object.values(product.specs || {}),
  ];
  return normalizeSearchText(parts.join(' '));
}

/**
 * Smart Search algoritmi:
 * - Har bir so'z (token) bo'yicha mustaqil tekshiradi
 * - Kirill/Lotin avtomatik qo'llab-quvvatlanadi
 * - Sinonimlar (masalan: "айфон" -> "iphone") tekshiriladi
 * - Qidiruv so'zi bo'sh bo'lsa barcha tovarlarni qaytaradi
 */
export function searchProducts(products: Product[], rawQuery: string): Product[] {
  const query = rawQuery.trim();
  if (!query) return products;

  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  if (queryTokens.length === 0) return products;

  // Har bir token uchun mumkin bo'lgan sinonimlar
  const tokenGroups = queryTokens.map((token) => {
    const variants = new Set<string>();
    variants.add(token);

    // To'g'ridan-to'g'ri so'rov sinonimi
    const originalLower = query.toLowerCase();
    if (SYNONYMS[originalLower]) {
      SYNONYMS[originalLower].forEach((s) => variants.add(normalizeSearchText(s)));
    }
    if (SYNONYMS[token]) {
      SYNONYMS[token].forEach((s) => variants.add(normalizeSearchText(s)));
    }

    return Array.from(variants);
  });

  return products.filter((product) => {
    const searchable = getProductSearchableContent(product);

    // Tovar hamma tokenlar guruhiga mos kelishi kerak (AND mantiqiy sharti)
    return tokenGroups.every((variants) => {
      // Kamida bitta variant tovar matnida uchrashi kerak (OR)
      return variants.some((v) => searchable.includes(v));
    });
  });
}
