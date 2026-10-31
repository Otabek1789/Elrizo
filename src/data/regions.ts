export interface CityOption {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn?: string;
  shortUz: string;
  popular?: boolean;
}

export const UZBEKISTAN_REGIONS: CityOption[] = [
  { id: 'tashkent_city', nameUz: 'Toshkent shahri', nameRu: 'г. Ташкент', nameEn: 'Tashkent city', shortUz: 'Toshkent', popular: true },
  { id: 'samarkand', nameUz: 'Samarqand viloyati', nameRu: 'Самаркандская область', nameEn: 'Samarkand region', shortUz: 'Samarqand', popular: true },
  { id: 'fergana', nameUz: "Farg'ona viloyati", nameRu: 'Ферганская область', nameEn: 'Fergana region', shortUz: "Farg'ona", popular: true },
  { id: 'andijan', nameUz: 'Andijon viloyati', nameRu: 'Андижанская область', nameEn: 'Andijan region', shortUz: 'Andijon', popular: true },
  { id: 'namangan', nameUz: 'Namangan viloyati', nameRu: 'Наманганская область', nameEn: 'Namangan region', shortUz: 'Namangan', popular: true },
  { id: 'bukhara', nameUz: 'Buxoro viloyati', nameRu: 'Бухарская область', nameEn: 'Bukhara region', shortUz: 'Buxoro', popular: true },
  { id: 'tashkent_region', nameUz: 'Toshkent viloyati', nameRu: 'Ташкентская область', nameEn: 'Tashkent region', shortUz: 'Toshkent vil.' },
  { id: 'kashkadarya', nameUz: "Qashqadaryo viloyati (Qarshi)", nameRu: 'Кашкадарьинская область (Карши)', nameEn: 'Kashkadarya region (Karshi)', shortUz: 'Qashqadaryo' },
  { id: 'surkhandarya', nameUz: 'Surxondaryo viloyati (Termiz)', nameRu: 'Сурхандарьинская область (Термез)', nameEn: 'Surkhandarya region (Termez)', shortUz: 'Surxondaryo' },
  { id: 'khorezm', nameUz: 'Xorazm viloyati (Urganch)', nameRu: 'Хорезмская область (Ургенч)', nameEn: 'Khorezm region (Urgench)', shortUz: 'Xorazm' },
  { id: 'navoiy', nameUz: 'Navoiy viloyati', nameRu: 'Навоийская область', nameEn: 'Navoiy region', shortUz: 'Navoiy' },
  { id: 'jizzakh', nameUz: 'Jizzax viloyati', nameRu: 'Джизакская область', nameEn: 'Jizzakh region', shortUz: 'Jizzax' },
  { id: 'sirdarya', nameUz: 'Sirdaryo viloyati (Guliston)', nameRu: 'Сырдарьинская область (Гулистан)', nameEn: 'Sirdarya region (Gulistan)', shortUz: 'Sirdaryo' },
  { id: 'karakalpakstan', nameUz: "Qoraqalpog'iston Respublikasi (Nukus)", nameRu: 'Республика Каракалпакстан (Нукус)', nameEn: 'Republic of Karakalpakstan (Nukus)', shortUz: "Qoraqalpog'iston" },
];
