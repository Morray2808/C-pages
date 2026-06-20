// Scale: -2 to 2 for body and acidity (light to pronounced), centered at 0 = medium
// sweetness: 0 (bone dry) to 5 (lusciously sweet) -- drives bubble size
// tannin (reds only): 0-2 (low to high) -- drives border thickness
// fruitFamily: categorical color key

const WHITES = [
  { grape: "Sauvignon Blanc", body: -1.3, acidity: 1.6, sweetness: 0, fruitFamily: "citrus_green" },
  { grape: "Riesling", body: -1.0, acidity: 1.7, sweetness: 1.5, fruitFamily: "citrus_green" },
  { grape: "Chardonnay (unoaked, Chablis)", body: -0.6, acidity: 1.3, sweetness: 0, fruitFamily: "citrus_green" },
  { grape: "Chardonnay (oaked, New World)", body: 1.2, acidity: 0.0, sweetness: 0.3, fruitFamily: "stone_tropical" },
  { grape: "Pinot Grigio", body: -1.1, acidity: 0.6, sweetness: 0, fruitFamily: "citrus_green" },
  { grape: "Albariño", body: -0.8, acidity: 1.1, sweetness: 0, fruitFamily: "citrus_green" },
  { grape: "Grüner Veltliner", body: -0.7, acidity: 1.2, sweetness: 0, fruitFamily: "citrus_green" },
  { grape: "Viognier", body: 1.0, acidity: -0.6, sweetness: 0.3, fruitFamily: "stone_tropical" },
  { grape: "Gewürztraminer", body: 0.6, acidity: -0.8, sweetness: 1.0, fruitFamily: "floral_aromatic" },
  { grape: "Torrontés", body: 0.3, acidity: -0.5, sweetness: 0.8, fruitFamily: "floral_aromatic" },
  { grape: "Chenin Blanc (dry, Savennières)", body: -0.4, acidity: 1.4, sweetness: 0.2, fruitFamily: "stone_tropical" },
  { grape: "Chenin Blanc (sweet, Vouvray moelleux)", body: 0.2, acidity: 1.3, sweetness: 3.5, fruitFamily: "stone_tropical" },
  { grape: "Sémillon (dry, Graves)", body: 0.4, acidity: 0.2, sweetness: 0.2, fruitFamily: "stone_tropical" },
  { grape: "Sémillon (Sauternes, botrytised)", body: 1.5, acidity: 0.8, sweetness: 5, fruitFamily: "stone_tropical" },
  { grape: "Furmint (Tokaji Aszú)", body: 0.6, acidity: 1.5, sweetness: 4.5, fruitFamily: "stone_tropical" },
  { grape: "Muscat (Alsace, dry)", body: -0.5, acidity: 0.3, sweetness: 0.3, fruitFamily: "floral_aromatic" }
];

const REDS = [
  { grape: "Pinot Noir", body: -0.8, acidity: 1.1, sweetness: 0, tannin: 0.6, fruitFamily: "red_fruit" },
  { grape: "Gamay", body: -1.0, acidity: 0.9, sweetness: 0, tannin: 0.4, fruitFamily: "red_fruit" },
  { grape: "Sangiovese", body: 0.1, acidity: 1.3, sweetness: 0, tannin: 1.3, fruitFamily: "red_fruit" },
  { grape: "Tempranillo", body: 0.4, acidity: 0.2, sweetness: 0, tannin: 1.0, fruitFamily: "dark_fruit" },
  { grape: "Grenache / Garnacha", body: 0.3, acidity: -0.3, sweetness: 0, tannin: 0.8, fruitFamily: "red_fruit" },
  { grape: "Merlot", body: 0.6, acidity: -0.2, sweetness: 0, tannin: 1.0, fruitFamily: "dark_fruit" },
  { grape: "Cabernet Franc", body: -0.2, acidity: 0.7, sweetness: 0, tannin: 1.1, fruitFamily: "dark_fruit" },
  { grape: "Cabernet Sauvignon", body: 1.2, acidity: 0.4, sweetness: 0, tannin: 1.7, fruitFamily: "dark_fruit" },
  { grape: "Malbec", body: 1.0, acidity: -0.1, sweetness: 0, tannin: 1.2, fruitFamily: "dark_fruit" },
  { grape: "Syrah / Shiraz (cool, N. Rhône)", body: 0.5, acidity: 0.5, sweetness: 0, tannin: 1.3, fruitFamily: "dark_fruit" },
  { grape: "Syrah / Shiraz (warm, Barossa)", body: 1.6, acidity: -0.5, sweetness: 0.2, tannin: 1.5, fruitFamily: "dark_fruit" },
  { grape: "Nebbiolo", body: 0.2, acidity: 1.6, sweetness: 0, tannin: 1.8, fruitFamily: "red_fruit" },
  { grape: "Mourvèdre", body: 1.1, acidity: -0.2, sweetness: 0, tannin: 1.6, fruitFamily: "dark_fruit" }
];

const FRUIT_FAMILY_LABELS = {
  citrus_green: "Citrus / green fruit",
  stone_tropical: "Stone / tropical fruit",
  floral_aromatic: "Floral / aromatic",
  red_fruit: "Red fruit",
  dark_fruit: "Dark / black fruit"
};

const FRUIT_FAMILY_COLORS = {
  citrus_green: "#639922",
  stone_tropical: "#BA7517",
  floral_aromatic: "#D4537E",
  red_fruit: "#D85A30",
  dark_fruit: "#72243E"
};
