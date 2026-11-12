/** Локальный каталог — только фронтенд, без API */
export const plants = [
  { id: 'p1', name: 'Жёлтые цветы', weight: '2500г', price: 129, city: 'Минск', light: 'яркий', tag: 'цветы', image: '/images/plants/yellow-flowers.png' },
  { id: 'p2', name: 'Розовые тюльпаны', weight: '3800г', price: 159, city: 'Гродно', light: 'средний', tag: 'цветы', image: '/images/plants/pink-tulips.png' },
  { id: 'p3', name: 'Кактус', weight: '1100г', price: 99, city: 'Брест', light: 'тень', tag: 'кактус', image: '/images/plants/cactus.png' },
  { id: 'p4', name: 'Калла', weight: '1800г', price: 149, city: 'Минск', light: 'средний', tag: 'цветы', image: '/images/plants/calla.png' },
  { id: 'p5', name: 'Росток', weight: '2200г', price: 139, city: 'Минск', light: 'яркий', tag: 'росток', image: '/images/plants/sprout.png' },
  { id: 'p6', name: 'Дерево', weight: '1500г', price: 119, city: 'Витебск', light: 'средний', tag: 'дерево', image: '/images/plants/tree.png' },
  { id: 'p7', name: 'Алоэ', weight: '900г', price: 75, city: 'Гомель', light: 'тень', tag: 'суккулент', image: '/images/plants/aloe.png' },
  { id: 'p8', name: 'Куст в горшке', weight: '1300г', price: 109, city: 'Могилёв', light: 'средний', tag: 'декор', image: '/images/plants/bush.png' },
  { id: 'p9', name: 'Фикус', weight: '1600г', price: 89, city: 'Минск', light: 'тень', tag: 'крупное', image: '/images/plants/ficus.png' },
  { id: 'p10', name: 'Цветы в кувшине', weight: '1700г', price: 125, city: 'Гродно', light: 'яркий', tag: 'цветы', image: '/images/plants/pitcher-flowers.png' },
  { id: 'p11', name: 'Сакура', weight: '600г', price: 55, city: 'Брест', light: 'средний', tag: 'цветы', image: '/images/plants/sakura.png' },
  { id: 'p12', name: 'Подсолнух', weight: '800г', price: 45, city: 'Минск', light: 'яркий', tag: 'цветы', image: '/images/plants/sunflower.png' }
]

export const cities = [...new Set(plants.map((p) => p.city))]
export const lights = [...new Set(plants.map((p) => p.light))]
