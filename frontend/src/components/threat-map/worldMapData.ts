/**
 * Offline High-Quality Equirectangular World Map Vector Landmass Paths.
 * ViewBox: 0 0 1000 500
 * Coordinate Mapping:
 *   x = ((lng + 180) / 360) * 1000
 *   y = ((90 - lat) / 180) * 500
 */

export interface LandmassFeature {
  id: string;
  name: string;
  path: string;
}

export const WORLD_VIEWBOX = { width: 1000, height: 500 };

export function projectLatLngToXY(lat: number, lng: number, width = 1000, height = 500): { x: number; y: number } {
  // Clamp latitude to [-85, 85] and longitude to [-180, 180]
  const clampedLat = Math.max(-85, Math.min(85, lat));
  const clampedLng = Math.max(-180, Math.min(180, lng));

  const x = ((clampedLng + 180) / 360) * width;
  const y = ((90 - clampedLat) / 180) * height;

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
  };
}

export const WORLD_LANDMASS_PATHS: LandmassFeature[] = [
  // 1. North America & Central America
  {
    id: 'north_america',
    name: 'North America',
    path: 'M 140 60 L 170 50 L 220 52 L 260 70 L 300 80 L 320 120 L 300 145 L 290 170 L 275 180 L 285 200 L 270 215 L 260 210 L 245 220 L 230 250 L 240 270 L 255 285 L 230 300 L 210 270 L 195 240 L 170 215 L 160 175 L 130 145 L 105 130 L 90 90 L 115 70 Z M 165 75 L 205 70 L 225 105 L 190 120 Z',
  },
  // 2. Greenland
  {
    id: 'greenland',
    name: 'Greenland',
    path: 'M 360 40 L 410 35 L 430 65 L 395 105 L 370 95 L 350 70 Z',
  },
  // 3. South America
  {
    id: 'south_america',
    name: 'South America',
    path: 'M 285 295 L 320 280 L 370 300 L 400 325 L 410 355 L 390 400 L 370 435 L 340 475 L 325 480 L 325 450 L 310 400 L 285 345 L 275 315 Z',
  },
  // 4. Europe & Scandinavia
  {
    id: 'europe',
    name: 'Europe',
    path: 'M 470 120 L 515 95 L 540 100 L 565 125 L 550 140 L 530 145 L 540 170 L 515 190 L 485 195 L 470 175 L 450 170 L 440 190 L 430 170 L 460 140 Z M 480 80 L 510 75 L 530 100 L 505 120 L 490 105 Z',
  },
  // 5. British Isles
  {
    id: 'british_isles',
    name: 'British Isles',
    path: 'M 460 115 L 472 110 L 478 128 L 465 138 L 455 128 Z M 445 125 L 455 122 L 452 135 L 442 130 Z',
  },
  // 6. Africa & Madagascar
  {
    id: 'africa',
    name: 'Africa',
    path: 'M 460 195 L 510 190 L 560 215 L 610 240 L 595 270 L 565 310 L 550 365 L 535 410 L 505 405 L 480 340 L 460 280 L 435 250 L 445 220 Z M 605 350 L 620 345 L 625 390 L 610 400 Z',
  },
  // 7. Eurasia / Northern Asia
  {
    id: 'eurasia_north',
    name: 'Northern Eurasia & Siberia',
    path: 'M 565 125 L 620 110 L 700 95 L 790 90 L 880 95 L 910 120 L 870 140 L 820 135 L 760 145 L 690 140 L 610 155 L 565 140 Z',
  },
  // 8. Middle East & Central Asia
  {
    id: 'middle_east_central_asia',
    name: 'Middle East & Central Asia',
    path: 'M 560 200 L 610 195 L 650 205 L 685 225 L 665 260 L 630 270 L 600 250 L 575 225 Z M 630 155 L 710 150 L 730 190 L 670 195 L 625 180 Z',
  },
  // 9. South Asia / Indian Subcontinent
  {
    id: 'south_asia',
    name: 'South Asia',
    path: 'M 685 220 L 740 215 L 755 250 L 735 295 L 705 290 L 685 255 Z M 740 305 L 748 302 L 745 315 L 738 312 Z',
  },
  // 10. East Asia (China, Mongolia, Korea)
  {
    id: 'east_asia',
    name: 'East Asia',
    path: 'M 720 150 L 810 145 L 855 170 L 845 220 L 815 250 L 765 245 L 735 210 L 715 185 Z M 848 185 L 860 180 L 858 200 L 845 198 Z',
  },
  // 11. Japan
  {
    id: 'japan',
    name: 'Japan',
    path: 'M 875 165 L 895 155 L 890 190 L 870 195 Z M 865 195 L 878 190 L 872 205 L 860 202 Z',
  },
  // 12. Southeast Asia & Maritime Islands
  {
    id: 'southeast_asia',
    name: 'Southeast Asia',
    path: 'M 765 245 L 805 240 L 815 285 L 785 305 L 770 270 Z M 770 320 L 810 325 L 800 345 L 760 335 Z M 815 315 L 855 310 L 845 335 L 810 330 Z M 825 240 L 845 235 L 840 275 L 820 270 Z',
  },
  // 13. Australia & New Zealand
  {
    id: 'australia',
    name: 'Australia & New Zealand',
    path: 'M 800 365 L 860 350 L 910 375 L 905 435 L 865 445 L 815 425 L 795 390 Z M 920 440 L 945 435 L 935 470 L 915 465 Z M 860 455 L 875 452 L 870 468 L 855 465 Z',
  },
  // 14. Antarctica (subtle coastal baseline)
  {
    id: 'antarctica',
    name: 'Antarctica',
    path: 'M 50 490 L 250 480 L 450 488 L 650 482 L 850 485 L 950 490 L 950 500 L 50 500 Z',
  },
];

// Graticule lines for subtle cartographic grid
export const GRATICULE_GRID_LINES = [
  // Equator (lat = 0)
  { type: 'equator', path: 'M 0 250 L 1000 250' },
  // Tropic of Cancer (lat = +23.5) -> y = ((90 - 23.5) / 180) * 500 = 184.7
  { type: 'tropic', path: 'M 0 185 L 1000 185' },
  // Tropic of Capricorn (lat = -23.5) -> y = ((90 + 23.5) / 180) * 500 = 315.3
  { type: 'tropic', path: 'M 0 315 L 1000 315' },
  // Prime Meridian (lng = 0) -> x = 500
  { type: 'meridian', path: 'M 500 0 L 500 500' },
  // Meridians at -90 (x=250) and +90 (x=750)
  { type: 'meridian', path: 'M 250 0 L 250 500' },
  { type: 'meridian', path: 'M 750 0 L 750 500' },
];
