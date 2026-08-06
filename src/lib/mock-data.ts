import biryani from "@/assets/dish-biryani.jpg";
import kebab from "@/assets/dish-kebab.jpg";
import pizza from "@/assets/dish-pizza.jpg";

export type Dish = {
  id: string;
  name: string;
  price: number;
  portionsLeft: number;
  image: string;
};

export type Restaurant = {
  id: string;
  name: string;
  area: string;
  cuisine: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  tablesLeft: number;
  heroImage: string;
  dishes: Dish[];
};

export const restaurants: Restaurant[] = [
  {
    id: "heritage-spice",
    name: "Heritage Spice Kitchen",
    area: "Khar West",
    cuisine: "Mughlai",
    distanceKm: 1.2,
    rating: 4.8,
    reviews: 214,
    tablesLeft: 4,
    heroImage: biryani,
    dishes: [
      { id: "d1", name: "Slow-Cooked Mutton Biryani", price: 480, portionsLeft: 8, image: biryani },
      { id: "d2", name: "Galouti Kebab (4 pc)", price: 320, portionsLeft: 14, image: kebab },
    ],
  },
  {
    id: "copper-handi",
    name: "The Copper Handi",
    area: "Bandra",
    cuisine: "North Indian",
    distanceKm: 0.8,
    rating: 4.6,
    reviews: 512,
    tablesLeft: 2,
    heroImage: kebab,
    dishes: [
      { id: "d3", name: "Awadhi Mutton Korma", price: 520, portionsLeft: 3, image: biryani },
      { id: "d4", name: "Sheekh Kebab (6 pc)", price: 380, portionsLeft: 22, image: kebab },
    ],
  },
  {
    id: "saffron-silk",
    name: "Saffron & Silk",
    area: "Lower Parel",
    cuisine: "Persian",
    distanceKm: 2.1,
    rating: 4.7,
    reviews: 89,
    tablesLeft: 6,
    heroImage: pizza,
    dishes: [
      { id: "d5", name: "Chelow Kebab Barg", price: 640, portionsLeft: 5, image: kebab },
    ],
  },
  {
    id: "forno-legno",
    name: "Forno Legno",
    area: "Colaba",
    cuisine: "Italian",
    distanceKm: 3.4,
    rating: 4.5,
    reviews: 340,
    tablesLeft: 0,
    heroImage: pizza,
    dishes: [
      { id: "d6", name: "Burrata Margherita", price: 620, portionsLeft: 12, image: pizza },
    ],
  },
];