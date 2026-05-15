/**
 * Stable filenames under `public/maps/` for the 10 shipped arenas.
 *
 * Source art was provided as Cursor workspace images `map1` … `map10`
 * (UUID-suffixed PNGs). To refresh from those exports when available:
 *
 *   Copy-Item "…\assets\*_images_map1-*.png" → `public/maps/birch-night-glade.jpg` (convert/rename as needed)
 *
 * Map number → MapId (semantic match to scene content):
 *   map1 → birch_night_glade   (moonlit birch / dark forest)
 *   map2 → cavern_glow         (cave, warm glow)
 *   map3 → pine_ridge_deck     (pine overlook / railed deck)
 *   map4 → midnight_grove      (pixel night forest, god rays)
 *   map5 → lakeside_clearing   (forest + water reflection)
 *   map6 → forest_trail        (dirt path, mountains)
 *   map7 → skyline_grove       (clearing + distant city)
 *   map8 → mountain_highway    (road, guardrail, peaks)
 *   map9 → alpine_dawn         (meadow, pines, sunrise peaks)
 *   map10 → golden_canopy      (warm enchanted / golden forest)
 */

export const MAP_PUBLIC_FILES = {
  birch_night_glade: '/maps/birch-night-glade.jpg',
  cavern_glow: '/maps/cavern-glow.jpg',
  pine_ridge_deck: '/maps/pine-ridge-deck.jpg',
  midnight_grove: '/maps/midnight-grove.jpg',
  lakeside_clearing: '/maps/lakeside-clearing.jpg',
  forest_trail: '/maps/forest-trail.jpg',
  skyline_grove: '/maps/skyline-grove.jpg',
  mountain_highway: '/maps/mountain-highway.jpg',
  alpine_dawn: '/maps/alpine-dawn.jpg',
  golden_canopy: '/maps/golden-canopy.jpg'
} as const;
