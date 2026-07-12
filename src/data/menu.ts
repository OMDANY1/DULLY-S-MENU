// DULLY'S — OFFICIAL MENU DATA 2026 (VALUES ONLY AUTHORITATIVE EXPORT)
// Rebuilt strictly from DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf
// Intended customer-facing whole prices applied to Hot Tea.

export type MenuSize = {
  label: string;
  oz: number | null;
  price: number;
  calories: number | null;
  calorieNote?: string | null;
};

export type MenuItem = {
  id: string;
  name: string;
  arabicName: string;
  category: string;
  image: string;
  num: string | null;
  sizes: MenuSize[];
  dairyMilk: string | null;
};

export type MenuCategory = {
  id: string;
  name: string;
  displayName: string;
  arabicName: string;
  description: string;
  visibility: "standard" | "ipad";
  items: MenuItem[];
};

export type MenuSourceTrace = {
  productId: string;
  source: "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf";
  verified: boolean;
};

export const menuCategories: MenuCategory[] = [
  {
    "id": "hot-tea",
    "name": "HOT TEA",
    "displayName": "Hot Tea",
    "arabicName": "الشاي الحار",
    "description": "Warm. Fragrant. Perfectly brewed.",
    "visibility": "standard",
    "items": [
      {
        "id": "asam-black-tea",
        "name": "ASAM BLACK TEA",
        "arabicName": "شاي أسام الأسود",
        "num": "1",
        "category": "hot-tea",
        "image": "/assets/products/asam-black-tea.png",
        "dairyMilk": "N/L",
        "sizes": [
          {
            "label": "8 OZ",
            "oz": 8,
            "price": 9,
            "calories": 2.5,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "jasmine-green-tea",
        "name": "JASMINE GREEN TEA",
        "arabicName": "شاي الياسمين الأخضر",
        "num": "2",
        "category": "hot-tea",
        "image": "/assets/products/jasmine-green-tea.png",
        "dairyMilk": "N/L",
        "sizes": [
          {
            "label": "8 OZ",
            "oz": 8,
            "price": 9,
            "calories": 2.5,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "osmanthus-oolong-tea",
        "name": "OSMANTHUS OOLONG TEA",
        "arabicName": "شاي الأوسمانثوس الأولونغ",
        "num": "3",
        "category": "hot-tea",
        "image": "/assets/products/osmanthus-oolong-tea.png",
        "dairyMilk": "N/L",
        "sizes": [
          {
            "label": "8 OZ",
            "oz": 8,
            "price": 9,
            "calories": 2.5,
            "calorieNote": null
          }
        ]
      }
    ]
  },
  {
    "id": "hot-tea-latte",
    "name": "HOT TEA LATTE",
    "displayName": "Hot Tea Latte",
    "arabicName": "شاي لاتيه حار",
    "description": "Smooth. Creamy. Perfectly balanced.",
    "visibility": "standard",
    "items": [
      {
        "id": "thai-tea-latte",
        "name": "THAI TEA LATTE",
        "arabicName": "لاتيه الشاي التايلندي",
        "num": "4",
        "category": "hot-tea-latte",
        "image": "/assets/products/thai-tea-latte.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "12 OZ",
            "oz": 12,
            "price": 18,
            "calories": 133,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "matcha-green-tea-latte",
        "name": "MATCHA GREEN TEA LATTE",
        "arabicName": "لاتيه شاي الماتشا الأخضر",
        "num": "5",
        "category": "hot-tea-latte",
        "image": "/assets/products/matcha-green-tea-latte.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "12 OZ",
            "oz": 12,
            "price": 18,
            "calories": 108,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "hojicha-latte",
        "name": "HOJICHA LATTE",
        "arabicName": "لاتيه شاي الهوجيتشا",
        "num": "6",
        "category": "hot-tea-latte",
        "image": "/assets/products/hojicha-latte.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "12 OZ",
            "oz": 12,
            "price": 18,
            "calories": 157,
            "calorieNote": null
          }
        ]
      }
    ]
  },
  {
    "id": "iced-tea",
    "name": "ICED TEA",
    "displayName": "Iced Boba Tea",
    "arabicName": "شاي البوبا البارد",
    "description": "Refreshing iced tea shaken with sweet boba.",
    "visibility": "standard",
    "items": [
      {
        "id": "iced-osmanthus-oolong-boba-tea",
        "name": "ICED OSMANTHUS OOLONG BOBA TEA",
        "arabicName": "شاي الأوسمانثوس الأولونغ البارد مع البوبا",
        "num": "7",
        "category": "iced-tea",
        "image": "/assets/products/iced-osmanthus-oolong-boba-tea.png",
        "dairyMilk": "N/L",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 14,
            "calories": 121,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 18,
            "calories": 171,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "iced-hibiscus-boba-tea",
        "name": "ICED HIBISCUS BOBA TEA",
        "arabicName": "شاي الكركديه البارد مع البوبا",
        "num": "8",
        "category": "iced-tea",
        "image": "/assets/products/iced-hibiscus-boba-tea.png",
        "dairyMilk": "N/L",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 14,
            "calories": 232,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 18,
            "calories": 292,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "iced-assam-black-boba-tea",
        "name": "ICED ASSAM BLACK BOBA TEA",
        "arabicName": "شاي أسام الأسود البارد مع البوبا",
        "num": "9",
        "category": "iced-tea",
        "image": "/assets/products/iced-assam-black-boba-tea.png",
        "dairyMilk": "N/L",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 14,
            "calories": 99,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 18,
            "calories": 133,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "iced-jasmine-green-boba-tea",
        "name": "ICED JASMINE GREEN BOBA TEA",
        "arabicName": "شاي الياسمين الأخضر البارد مع البوبا",
        "num": "10",
        "category": "iced-tea",
        "image": "/assets/products/iced-jasmine-green-boba-tea.png",
        "dairyMilk": "N/L",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 14,
            "calories": 73,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 18,
            "calories": 107,
            "calorieNote": null
          }
        ]
      }
    ]
  },
  {
    "id": "iced-japanese-tea",
    "name": "ICED JAPANESE TEA",
    "displayName": "Iced Japanese Tea",
    "arabicName": "الشاي الياباني البارد",
    "description": "Minimal. Ceremonial matchas and fusions.",
    "visibility": "standard",
    "items": [
      {
        "id": "mastic-matcha-boba-milk-tea",
        "name": "MASTIC MATCHA BOBA MILK TEA",
        "arabicName": "شاي حليب الماتشا مع البوبا والمستكة",
        "num": "11",
        "category": "iced-japanese-tea",
        "image": "/assets/products/mastic-matcha-boba-milk-tea.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 28,
            "calories": 222,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 36,
            "calories": 305,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "strawberry-matcha-milk-tea",
        "name": "STRAWBERRY MATCHA MILK TEA",
        "arabicName": "شاي حليب الماتشا بالفراولة",
        "num": "12",
        "category": "iced-japanese-tea",
        "image": "/assets/products/strawberry-matcha-milk-tea.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 20,
            "calories": 168,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 26,
            "calories": 224,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "matcha-boba-milk-tea",
        "name": "MATCHA BOBA MILK TEA",
        "arabicName": "شاي حليب الماتشا مع البوبا",
        "num": "13",
        "category": "iced-japanese-tea",
        "image": "/assets/products/matcha-boba-milk-tea.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 20,
            "calories": 195,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 26,
            "calories": 281,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "tropical-matcha-milk-tea",
        "name": "TROPICAL MATCHA MILK TEA",
        "arabicName": "شاي حليب الماتشا الاستوائي",
        "num": "14",
        "category": "iced-japanese-tea",
        "image": "/assets/products/tropical-matcha-milk-tea.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 22,
            "calories": 213,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 28,
            "calories": 297,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "cracking-white-chocolate-matcha-boba-milk-tea",
        "name": "CRACKING WHITE CHOCOLATE MATCHA BOBA MILK TEA",
        "arabicName": "شاي حليب الماتشا مع الشوكولاتة البيضاء المقرمشة والبوبا",
        "num": "15",
        "category": "iced-japanese-tea",
        "image": "/assets/products/cracking-white-chocolate-matcha-boba-milk-tea.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 28,
            "calories": 486,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 36,
            "calories": 630,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "taro-matcha-boba-milk-tea",
        "name": "TARO MATCHA BOBA MILK TEA",
        "arabicName": "شاي حليب الماتشا بالتارو والبوبا",
        "num": "16",
        "category": "iced-japanese-tea",
        "image": "/assets/products/taro-matcha-boba-milk-tea.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 22,
            "calories": 208,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 28,
            "calories": 281,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "matcha-lemonade-boba-tea",
        "name": "MATCHA LEMONADE BOBA TEA",
        "arabicName": "شاي الماتشا بالليمون والبوبا",
        "num": "17",
        "category": "iced-japanese-tea",
        "image": "/assets/products/matcha-lemonade-boba-tea.png",
        "dairyMilk": "N/L",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 20,
            "calories": 323,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 26,
            "calories": 439,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "matcha-colada-boba-milk-tea",
        "name": "MATCHA COLADA BOBA MILK TEA",
        "arabicName": "شاي حليب ماتشا كولادا مع البوبا",
        "num": "18",
        "category": "iced-japanese-tea",
        "image": "/assets/products/matcha-colada-boba-milk-tea.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 24,
            "calories": 354,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 32,
            "calories": 472,
            "calorieNote": null
          }
        ]
      }
    ]
  },
  {
    "id": "iced-fruit-tea",
    "name": "ICED FRUIT TEA",
    "displayName": "Iced Fruit Tea",
    "arabicName": "شاي الفواكه البارد",
    "description": "Vibrant and refreshing fruit combinations.",
    "visibility": "standard",
    "items": [
      {
        "id": "strawberry-jasmine-tea-cheezi",
        "name": "STRAWBERRY JASMINE TEA CHEEZI",
        "arabicName": "شاي الياسمين بالفراولة والجبنة",
        "num": "19",
        "category": "iced-fruit-tea",
        "image": "/assets/products/strawberry-jasmine-tea-cheezi.png",
        "dairyMilk": "N/L",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 24,
            "calories": 319,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 32,
            "calories": 443,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "very-berry-jasmine-tea-cheezi",
        "name": "VERY BERRY JASMINE TEA CHEEZI",
        "arabicName": "شاي الياسمين بالتوت المشكل والجبنة",
        "num": "20",
        "category": "iced-fruit-tea",
        "image": "/assets/products/very-berry-jasmine-tea-cheezi.png",
        "dairyMilk": "N/L",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 28,
            "calories": 300,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 36,
            "calories": 401,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "mango-jasmine-tea-cheezi",
        "name": "MANGO JASMINE TEA CHEEZI",
        "arabicName": "شاي الياسمين بالمانجو والجبنة",
        "num": "21",
        "category": "iced-fruit-tea",
        "image": "/assets/products/mango-jasmine-tea-cheezi.png",
        "dairyMilk": "N/L",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 28,
            "calories": 300,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 36,
            "calories": 411,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "green-grape-osmanthos-tea-freezi",
        "name": "GREEN GRAPE OSMANTHOS TEA FREEZI",
        "arabicName": "شاي الأوسمانثوس بالعنب الأخضر المثلج",
        "num": "22",
        "category": "iced-fruit-tea",
        "image": "/assets/products/green-grape-osmanthos-tea-freezi.png",
        "dairyMilk": "N/L",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 20,
            "calories": 275,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 26,
            "calories": 376,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "watermelon-prickly-pear-assam-tea-freezi",
        "name": "WATERMELON PRICKLY PEAR ASSAM TEA FREEZI",
        "arabicName": "شاي أسام بالبطيخ والتين الشوكي المثلج",
        "num": "23",
        "category": "iced-fruit-tea",
        "image": "/assets/products/watermelon-prickly-pear-assam-tea-freezi.png",
        "dairyMilk": "N/L",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 24,
            "calories": 213,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 32,
            "calories": 283,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "passion-fruit-osmanthus-oolong-tea-freezi",
        "name": "PASSION FRUIT OSMANTHUS OOLONG TEA FREEZI",
        "arabicName": "شاي الأوسمانثوس الأولونغ بالبشن فروت المثلج",
        "num": "24",
        "category": "iced-fruit-tea",
        "image": "/assets/products/passion-fruit-osmanthus-oolong-tea-freezi.png",
        "dairyMilk": "N/L",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 24,
            "calories": 247,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 32,
            "calories": 342,
            "calorieNote": null
          }
        ]
      }
    ]
  },
  {
    "id": "iced-boba-milk-tea",
    "name": "ICED BOBA MILK TEA",
    "displayName": "Iced Boba Milk Tea",
    "arabicName": "شاي حليب البوبا البارد",
    "description": "Traditional sweet milk tea with boba.",
    "visibility": "standard",
    "items": [
      {
        "id": "thai-boba-milk-tea",
        "name": "THAI BOBA MILK TEA",
        "arabicName": "شاي حليب تايلندي مع البوبا",
        "num": "25",
        "category": "iced-boba-milk-tea",
        "image": "/assets/products/thai-boba-milk-tea.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 22,
            "calories": 255,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 28,
            "calories": 353,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "winter-melon-boba-milk-tea",
        "name": "WINTER MELON BOBA MILK TEA",
        "arabicName": "شاي حليب وينتر ميلون مع البوبا",
        "num": "26",
        "category": "iced-boba-milk-tea",
        "image": "/assets/products/winter-melon-boba-milk-tea.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 22,
            "calories": 290,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 28,
            "calories": 387,
            "calorieNote": null
          }
        ]
      }
    ]
  },
  {
    "id": "iced-boba-milk",
    "name": "ICED BOBA MILK",
    "displayName": "Iced Boba Milk",
    "arabicName": "حليب البوبا البارد",
    "description": "Sweet milk bases paired with chewy boba.",
    "visibility": "standard",
    "items": [
      {
        "id": "taro-boba-milk",
        "name": "TARO BOBA MILK",
        "arabicName": "حليب التارو مع البوبا",
        "num": "27",
        "category": "iced-boba-milk",
        "image": "/assets/products/taro-boba-milk.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 22,
            "calories": 331,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 28,
            "calories": 442,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "brown-sugar-boba-milk",
        "name": "BROWN SUGAR BOBA MILK",
        "arabicName": "حليب السكر البني مع البوبا",
        "num": "28",
        "category": "iced-boba-milk",
        "image": "/assets/products/brown-sugar-boba-milk.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 24,
            "calories": 390,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 32,
            "calories": 536,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "chocolate-and-custard-boba-milk",
        "name": "CHOCOLATE & CUSTARD BOBA MILK",
        "arabicName": "حليب الشوكولاتة والكاسترد مع البوبا",
        "num": "29",
        "category": "iced-boba-milk",
        "image": "/assets/products/chocolate-and-custard-boba-milk.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 24,
            "calories": 369,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 32,
            "calories": 498,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "wintermelon-boba-milk",
        "name": "WINTERMELON BOBA MILK",
        "arabicName": "حليب وينتر ميلون مع البوبا",
        "num": "30",
        "category": "iced-boba-milk",
        "image": "/assets/products/wintermelon-boba-milk.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 20,
            "calories": 321,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 26,
            "calories": 443,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "cream-caramel-boba-milk",
        "name": "CREAM CARAMEL BOBA MILK",
        "arabicName": "حليب كريم كراميل مع البوبا",
        "num": "31",
        "category": "iced-boba-milk",
        "image": "/assets/products/cream-caramel-boba-milk.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 24,
            "calories": 362,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 32,
            "calories": 483,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "honeycomb-boba-milk",
        "name": "HONEYCOMB BOBA MILK",
        "arabicName": "حليب قرص العسل مع البوبا",
        "num": "32",
        "category": "iced-boba-milk",
        "image": "/assets/products/honeycomb-boba-milk.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 20,
            "calories": 232,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 26,
            "calories": 313,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "coco-mango-boba-milk",
        "name": "COCO MANGO BOBA MILK",
        "arabicName": "حليب مانجو جوز الهند مع البوبا",
        "num": "33",
        "category": "iced-boba-milk",
        "image": "/assets/products/coco-mango-boba-milk.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 28,
            "calories": 369,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 36,
            "calories": 495,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "durian-boba-milk",
        "name": "DURIAN BOBA MILK",
        "arabicName": "حليب الدوريان مع البوبا",
        "num": "34",
        "category": "iced-boba-milk",
        "image": "/assets/products/durian-boba-milk.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 20,
            "calories": 325,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 26,
            "calories": 428,
            "calorieNote": null
          }
        ]
      }
    ]
  },
  {
    "id": "special-drinks",
    "name": "SPECIAL DRINKS",
    "displayName": "Special Drinks",
    "arabicName": "المشروبات الخاصة",
    "description": "Unique house specialties and fun kiddie mixes.",
    "visibility": "standard",
    "items": [
      {
        "id": "hojicha-boba-milk-tea",
        "name": "HOJICHA BOBA MILK TEA",
        "arabicName": "شاي حليب الهوجيتشا مع البوبا",
        "num": null,
        "category": "special-drinks",
        "image": "/assets/products/hojicha-boba-milk-tea.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "12 OZ",
            "oz": 12,
            "price": 18,
            "calories": 146,
            "calorieNote": null
          },
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 22,
            "calories": 208,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 28,
            "calories": 291,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "kiddy-bunny-mango-boba-milk-tea",
        "name": "KIDDY BUNNY MANGO BOBA MILK TEA",
        "arabicName": "شاي حليب الأرنب كيدي بالمانجو والبوبا",
        "num": "36",
        "category": "special-drinks",
        "image": "/assets/products/kiddy-bunny-mango-boba-milk-tea.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "12 OZ",
            "oz": 12,
            "price": 20,
            "calories": 179,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "kiddy-kitty-strawberry-boba-milk-tea",
        "name": "KIDDY KITTY STRAWBERRY BOBA MILK TEA",
        "arabicName": "شاي حليب القطة كيدي بالفراولة والبوبا",
        "num": "37",
        "category": "special-drinks",
        "image": "/assets/products/kiddy-kitty-strawberry-boba-milk-tea.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "12 OZ",
            "oz": 12,
            "price": 20,
            "calories": 177,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "kiddy-teddy-chocolate-boba-milk-tea",
        "name": "KIDDY TEDDY CHOCOLATE BOBA MILK TEA",
        "arabicName": "شاي حليب الدب كيدي بالشوكولاتة والبوبا",
        "num": "38",
        "category": "special-drinks",
        "image": "/assets/products/kiddy-teddy-chocolate-boba-milk-tea.png",
        "dairyMilk": "FREE",
        "sizes": [
          {
            "label": "12 OZ",
            "oz": 12,
            "price": 26,
            "calories": 244,
            "calorieNote": null
          }
        ]
      }
    ]
  },
  {
    "id": "snow-ice",
    "name": "SNOW ICE",
    "displayName": "Snow Ice",
    "arabicName": "ثلج مبشور",
    "description": "Light, fluffy snow ice altars.",
    "visibility": "standard",
    "items": [
      {
        "id": "oreo-blast-snow-ice",
        "name": "OREO BLAST SNOW ICE",
        "arabicName": "ثلج الأوريو المبشور الفاخر",
        "num": "39",
        "category": "snow-ice",
        "image": "/assets/products/oreo-blast-snow-ice.png",
        "dairyMilk": null,
        "sizes": [
          {
            "label": "PREMIUM",
            "oz": null,
            "price": 35,
            "calories": 735,
            "calorieNote": null
          },
          {
            "label": "STANDARD",
            "oz": null,
            "price": 18,
            "calories": 500,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "mango-snow-ice",
        "name": "MANGO SNOW ICE",
        "arabicName": "ثلج المانجو المبشور الفاخر",
        "num": "40",
        "category": "snow-ice",
        "image": "/assets/products/mango-snow-ice.png",
        "dairyMilk": null,
        "sizes": [
          {
            "label": "PREMIUM",
            "oz": null,
            "price": 35,
            "calories": 520,
            "calorieNote": null
          },
          {
            "label": "STANDARD",
            "oz": null,
            "price": 18,
            "calories": 320,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "taro-snow-ice",
        "name": "TARO SNOW ICE",
        "arabicName": "ثلج التارو المبشور الفاخر",
        "num": "41",
        "category": "snow-ice",
        "image": "/assets/products/taro-snow-ice.png",
        "dairyMilk": null,
        "sizes": [
          {
            "label": "PREMIUM",
            "oz": null,
            "price": 35,
            "calories": 510,
            "calorieNote": null
          },
          {
            "label": "STANDARD",
            "oz": null,
            "price": 18,
            "calories": 305,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "strawberry-snow-ice",
        "name": "STRAWBERRY SNOW ICE",
        "arabicName": "ثلج الفراولة المبشور الفاخر",
        "num": "42",
        "category": "snow-ice",
        "image": "/assets/products/strawberry-snow-ice.png",
        "dairyMilk": null,
        "sizes": [
          {
            "label": "PREMIUM",
            "oz": null,
            "price": 35,
            "calories": 579,
            "calorieNote": null
          },
          {
            "label": "STANDARD",
            "oz": null,
            "price": 18,
            "calories": 380,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "thai-tea-snow-ice",
        "name": "THAI TEA SNOW ICE",
        "arabicName": "ثلج الشاي التايلندي المبشور الفاخر",
        "num": "43",
        "category": "snow-ice",
        "image": "/assets/products/thai-tea-snow-ice.png",
        "dairyMilk": null,
        "sizes": [
          {
            "label": "PREMIUM",
            "oz": null,
            "price": 35,
            "calories": 213,
            "calorieNote": null
          },
          {
            "label": "STANDARD",
            "oz": null,
            "price": 18,
            "calories": 110,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "matcha-snow-ice",
        "name": "MATCHA SNOW ICE",
        "arabicName": "ثلج الماتشا المبشور الفاخر",
        "num": "44",
        "category": "snow-ice",
        "image": "/assets/products/matcha-snow-ice.png",
        "dairyMilk": null,
        "sizes": [
          {
            "label": "PREMIUM",
            "oz": null,
            "price": 35,
            "calories": 526,
            "calorieNote": null
          },
          {
            "label": "STANDARD",
            "oz": null,
            "price": 18,
            "calories": 322,
            "calorieNote": null
          }
        ]
      }
    ]
  },
  {
    "id": "special",
    "name": "SPECIAL",
    "displayName": "Special",
    "arabicName": "العروض الخاصة",
    "description": "Mineral water, combo offers, and special menu items.",
    "visibility": "standard",
    "items": [
      {
        "id": "mineral-water-small",
        "name": "MINERAL WATER SMALL",
        "arabicName": "مياه معدنية صغيرة",
        "num": "45",
        "category": "special",
        "image": "/assets/products/mineral-water-small.png",
        "dairyMilk": null,
        "sizes": [
          {
            "label": "Standard",
            "oz": null,
            "price": 2,
            "calories": 0,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "drink-and-chips-combo-offer",
        "name": "DRINK & CHIPS COMBO OFFER",
        "arabicName": "عرض كومبو المشروب والبطاطس",
        "num": "46",
        "category": "special",
        "image": "/assets/products/drink-and-chips-combo-offer.png",
        "dairyMilk": null,
        "sizes": [
          {
            "label": "Standard",
            "oz": null,
            "price": 5,
            "calories": null,
            "calorieNote": "FREE W/ANY DRINK"
          }
        ]
      }
    ]
  },
  {
    "id": "mojitos",
    "name": "MOJITOS",
    "displayName": "Mojitos",
    "arabicName": "موهيتو",
    "description": "Icy, zesty limeades and mojitos.",
    "visibility": "standard",
    "items": [
      {
        "id": "blueberry-mojito",
        "name": "BLUEBERRY MOJITO",
        "arabicName": "موهيتو التوت الأزرق",
        "num": "1",
        "category": "mojitos",
        "image": "/assets/products/blueberry-mojito.png",
        "dairyMilk": null,
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 24,
            "calories": 172,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 32,
            "calories": 231,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "passion-fruit-mojito",
        "name": "PASSION FRUIT MOJITO",
        "arabicName": "موهيتو البشن فروت",
        "num": "2",
        "category": "mojitos",
        "image": "/assets/products/passion-fruit-mojito.png",
        "dairyMilk": null,
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 22,
            "calories": 240,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 28,
            "calories": 320,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "brazelian-limeade",
        "name": "BRAZELIAN LIMEADE",
        "arabicName": "الليمونادة البرازيلية",
        "num": "3",
        "category": "mojitos",
        "image": "/assets/products/brazelian-limeade.png",
        "dairyMilk": null,
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 14,
            "calories": 134,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 18,
            "calories": 183,
            "calorieNote": null
          }
        ]
      },
      {
        "id": "dragon-fruit-mojito",
        "name": "DRAGON FRUIT MOJITO",
        "arabicName": "موهيتو دراغون فروت",
        "num": "4",
        "category": "mojitos",
        "image": "/assets/products/dragon-fruit-mojito.png",
        "dairyMilk": null,
        "sizes": [
          {
            "label": "16 OZ",
            "oz": 16,
            "price": 20,
            "calories": 273,
            "calorieNote": null
          },
          {
            "label": "22 OZ",
            "oz": 22,
            "price": 26,
            "calories": 380,
            "calorieNote": null
          }
        ]
      }
    ]
  }
];

// Traceability Manifest for development-only validation
export const menuSourceTrace: MenuSourceTrace[] = [
  {
    "productId": "asam-black-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "jasmine-green-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "osmanthus-oolong-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "thai-tea-latte",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "matcha-green-tea-latte",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "hojicha-latte",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "iced-osmanthus-oolong-boba-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "iced-osmanthus-oolong-boba-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "iced-hibiscus-boba-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "iced-hibiscus-boba-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "iced-assam-black-boba-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "iced-assam-black-boba-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "iced-jasmine-green-boba-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "iced-jasmine-green-boba-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "mastic-matcha-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "mastic-matcha-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "strawberry-matcha-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "strawberry-matcha-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "matcha-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "matcha-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "tropical-matcha-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "tropical-matcha-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "cracking-white-chocolate-matcha-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "cracking-white-chocolate-matcha-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "taro-matcha-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "taro-matcha-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "matcha-lemonade-boba-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "matcha-lemonade-boba-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "matcha-colada-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "matcha-colada-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "strawberry-jasmine-tea-cheezi",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "strawberry-jasmine-tea-cheezi",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "very-berry-jasmine-tea-cheezi",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "very-berry-jasmine-tea-cheezi",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "mango-jasmine-tea-cheezi",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "mango-jasmine-tea-cheezi",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "green-grape-osmanthos-tea-freezi",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "green-grape-osmanthos-tea-freezi",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "watermelon-prickly-pear-assam-tea-freezi",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "watermelon-prickly-pear-assam-tea-freezi",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "passion-fruit-osmanthus-oolong-tea-freezi",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "passion-fruit-osmanthus-oolong-tea-freezi",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "thai-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "thai-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "winter-melon-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "winter-melon-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "taro-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "taro-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "brown-sugar-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "brown-sugar-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "chocolate-and-custard-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "chocolate-and-custard-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "wintermelon-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "wintermelon-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "cream-caramel-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "cream-caramel-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "honeycomb-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "honeycomb-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "coco-mango-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "coco-mango-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "durian-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "durian-boba-milk",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "hojicha-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "hojicha-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "hojicha-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "kiddy-bunny-mango-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "kiddy-kitty-strawberry-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "kiddy-teddy-chocolate-boba-milk-tea",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "oreo-blast-snow-ice",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "oreo-blast-snow-ice",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "mango-snow-ice",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "mango-snow-ice",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "taro-snow-ice",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "taro-snow-ice",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "strawberry-snow-ice",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "strawberry-snow-ice",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "thai-tea-snow-ice",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "thai-tea-snow-ice",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "matcha-snow-ice",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "matcha-snow-ice",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "mineral-water-small",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "drink-and-chips-combo-offer",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "blueberry-mojito",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "blueberry-mojito",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "passion-fruit-mojito",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "passion-fruit-mojito",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "brazelian-limeade",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "brazelian-limeade",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "dragon-fruit-mojito",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  },
  {
    "productId": "dragon-fruit-mojito",
    "source": "DULLYS_OFFICIAL_MENU_DATA_2026_VALUES_ONLY.pdf",
    "verified": true
  }
];
