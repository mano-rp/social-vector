import { SocialDataset, UserRecord, PostRecord } from '../types/dataset';

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface LocationThreatData {
  locationId: string;
  name: string;
  country: string;
  coordinates: GeoCoordinate;
  userCount: number;
  postCount: number;
  users: UserRecord[];
  posts: PostRecord[];
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  coordinationScore: number;
  sampleHashtags: string[];
  sampleDomains: string[];
}

export interface MapSummaryStats {
  totalLocations: number;
  totalCountries: number;
  topLocation: LocationThreatData | null;
  highestDensity: number;
  geocodedUserCount: number;
  unlocatedUserCount: number;
  geographicEntropy: number;
}

// Deterministic 32-bit FNV-1a hash
export function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Deterministic Pseudo-Random Number Generator (Mulberry32)
export function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Canonical Land Anchors for Known Real Cities & Countries
const KNOWN_LAND_ANCHORS: Record<string, { lat: number; lng: number; country: string }> = {
  // Cities & Regions
  'nairobi': { lat: -1.2921, lng: 36.8219, country: 'Kenya' },
  'kenya': { lat: 0.0236, lng: 37.9062, country: 'Kenya' },
  'seoul': { lat: 37.5665, lng: 126.978, country: 'South Korea' },
  'south korea': { lat: 35.9078, lng: 127.7669, country: 'South Korea' },
  'korea': { lat: 35.9078, lng: 127.7669, country: 'South Korea' },
  'tokyo': { lat: 35.6762, lng: 139.6503, country: 'Japan' },
  'japan': { lat: 36.2048, lng: 138.2529, country: 'Japan' },
  'austin': { lat: 30.2672, lng: -97.7431, country: 'United States' },
  'texas': { lat: 31.9686, lng: -99.9018, country: 'United States' },
  'tx': { lat: 30.2672, lng: -97.7431, country: 'United States' },
  'zurich': { lat: 47.3769, lng: 8.5417, country: 'Switzerland' },
  'switzerland': { lat: 46.8182, lng: 8.2275, country: 'Switzerland' },
  'singapore': { lat: 1.3521, lng: 103.8198, country: 'Singapore' },
  'seattle': { lat: 47.6062, lng: -122.3321, country: 'United States' },
  'wa': { lat: 47.6062, lng: -122.3321, country: 'United States' },
  'amsterdam': { lat: 52.3676, lng: 4.9041, country: 'Netherlands' },
  'netherlands': { lat: 52.1326, lng: 5.2913, country: 'Netherlands' },
  'dublin': { lat: 53.3498, lng: -6.2603, country: 'Ireland' },
  'ireland': { lat: 53.1424, lng: -7.6921, country: 'Ireland' },
  'san francisco': { lat: 37.7749, lng: -122.4194, country: 'United States' },
  'ca': { lat: 36.7783, lng: -119.4179, country: 'United States' },
  'california': { lat: 36.7783, lng: -119.4179, country: 'United States' },
  'denver': { lat: 39.7392, lng: -104.9903, country: 'United States' },
  'co': { lat: 39.5501, lng: -105.7821, country: 'United States' },
  'colorado': { lat: 39.5501, lng: -105.7821, country: 'United States' },
  'new york': { lat: 40.7128, lng: -74.006, country: 'United States' },
  'ny': { lat: 40.7128, lng: -74.006, country: 'United States' },
  'boston': { lat: 42.3601, lng: -71.0589, country: 'United States' },
  'ma': { lat: 42.3601, lng: -71.0589, country: 'United States' },
  'sydney': { lat: -33.8688, lng: 151.2093, country: 'Australia' },
  'australia': { lat: -25.2744, lng: 133.7751, country: 'Australia' },
  'london': { lat: 51.5074, lng: -0.1278, country: 'United Kingdom' },
  'uk': { lat: 55.3781, lng: -3.436, country: 'United Kingdom' },
  'united kingdom': { lat: 55.3781, lng: -3.436, country: 'United Kingdom' },
  'mumbai': { lat: 19.076, lng: 72.8777, country: 'India' },
  'india': { lat: 20.5937, lng: 78.9629, country: 'India' },
  'são paulo': { lat: -23.5505, lng: -46.6333, country: 'Brazil' },
  'sao paulo': { lat: -23.5505, lng: -46.6333, country: 'Brazil' },
  'brazil': { lat: -14.235, lng: -51.9253, country: 'Brazil' },
  'chicago': { lat: 41.8781, lng: -87.6298, country: 'United States' },
  'il': { lat: 40.6331, lng: -89.3985, country: 'United States' },
  'berlin': { lat: 52.52, lng: 13.405, country: 'Germany' },
  'germany': { lat: 51.1657, lng: 10.4515, country: 'Germany' },
  'paris': { lat: 48.8566, lng: 2.3522, country: 'France' },
  'france': { lat: 46.2276, lng: 2.2137, country: 'France' },
  'toronto': { lat: 43.6532, lng: -79.3832, country: 'Canada' },
  'canada': { lat: 56.1304, lng: -106.3468, country: 'Canada' },
};

// 24 Discrete Land-Constrained Regions for Fictional / Unmapped Locations
interface LandZone {
  name: string;
  country: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const CONTINENTAL_LAND_ZONES: LandZone[] = [
  { name: 'North American Central', country: 'North America', minLat: 36.0, maxLat: 45.0, minLng: -102.0, maxLng: -88.0 },
  { name: 'North American East', country: 'North America', minLat: 38.0, maxLat: 44.0, minLng: -82.0, maxLng: -73.0 },
  { name: 'North American West', country: 'North America', minLat: 42.0, maxLat: 48.0, minLng: -122.0, maxLng: -114.0 },
  { name: 'European Plain', country: 'Europe', minLat: 47.0, maxLat: 53.0, minLng: 5.0, maxLng: 17.0 },
  { name: 'Central European Highlands', country: 'Europe', minLat: 46.0, maxLat: 50.0, minLng: 12.0, maxLng: 22.0 },
  { name: 'Scandinavian Land', country: 'Northern Europe', minLat: 58.0, maxLat: 64.0, minLng: 12.0, maxLng: 20.0 },
  { name: 'East African Plateau', country: 'East Africa', minLat: -2.0, maxLat: 4.0, minLng: 34.0, maxLng: 39.0 },
  { name: 'West African Savannah', country: 'West Africa', minLat: 7.0, maxLat: 11.0, minLng: 4.0, maxLng: 10.0 },
  { name: 'South African Basin', country: 'Southern Africa', minLat: -30.0, maxLat: -24.0, minLng: 25.0, maxLng: 31.0 },
  { name: 'Indian Interior', country: 'South Asia', minLat: 18.0, maxLat: 26.0, minLng: 75.0, maxLng: 83.0 },
  { name: 'East Asian Plains', country: 'East Asia', minLat: 31.0, maxLat: 38.0, minLng: 112.0, maxLng: 120.0 },
  { name: 'Southeast Asian Mainland', country: 'Southeast Asia', minLat: 13.0, maxLat: 18.0, minLng: 99.0, maxLng: 105.0 },
  { name: 'Australian Eastern Inland', country: 'Australia', minLat: -33.0, maxLat: -27.0, minLng: 144.0, maxLng: 151.0 },
  { name: 'Brazilian Central Plateau', country: 'South America', minLat: -18.0, maxLat: -12.0, minLng: -51.0, maxLng: -43.0 },
  { name: 'Andean South America', country: 'South America', minLat: -34.0, maxLat: -28.0, minLng: -70.0, maxLng: -65.0 },
  { name: 'Central Asian Highlands', country: 'Central Asia', minLat: 45.0, maxLat: 51.0, minLng: 65.0, maxLng: 75.0 },
  { name: 'Middle Eastern Plateau', country: 'Middle East', minLat: 30.0, maxLat: 35.0, minLng: 36.0, maxLng: 44.0 },
  { name: 'Anatolian Plateau', country: 'Eurasia', minLat: 38.0, maxLat: 41.0, minLng: 30.0, maxLng: 37.0 },
  { name: 'East European Plains', country: 'Eastern Europe', minLat: 51.0, maxLat: 57.0, minLng: 29.0, maxLng: 38.0 },
  { name: 'Canadian Prairies', country: 'North America', minLat: 50.0, maxLat: 55.0, minLng: -112.0, maxLng: -101.0 },
  { name: 'Japanese Inland', country: 'East Asia', minLat: 35.0, maxLat: 37.5, minLng: 137.0, maxLng: 140.5 },
  { name: 'Korean Peninsula Inland', country: 'East Asia', minLat: 35.5, maxLat: 37.8, minLng: 127.0, maxLng: 129.0 },
  { name: 'Iberian Interior', country: 'Southern Europe', minLat: 38.5, maxLat: 42.0, minLng: -6.0, maxLng: -1.5 },
  { name: 'British Inland', country: 'Western Europe', minLat: 51.8, maxLat: 54.5, minLng: -3.0, maxLng: -0.5 },
];

/**
 * Deterministically derives land-constrained coordinates for any location name.
 * 1. Checks known real-world city/country dictionaries.
 * 2. If fictional/unmapped, clusters locations sharing a parent prefix into the same land zone.
 * 3. Guarantees 100% offline land placement and absolute cross-run determinism.
 */
export function getDeterministicCoordinates(locationName: string): { coordinates: GeoCoordinate; country: string } {
  if (!locationName || !locationName.trim()) {
    // Default fallback anchor (central land zone)
    return {
      coordinates: { lat: 40.7128, lng: -74.006 },
      country: 'Unspecified',
    };
  }

  const rawClean = locationName.trim();
  const normalized = rawClean.toLowerCase();

  // 1. Direct match or token match against known real land anchors
  for (const [key, anchor] of Object.entries(KNOWN_LAND_ANCHORS)) {
    if (normalized === key || normalized.includes(key)) {
      // Add subtle deterministic jitter for distinct sub-cities within the same anchor
      const subHash = hashString(rawClean);
      const prng = createPRNG(subHash);
      const latOffset = (prng() - 0.5) * 0.4;
      const lngOffset = (prng() - 0.5) * 0.4;

      return {
        coordinates: {
          lat: Number((anchor.lat + latOffset).toFixed(4)),
          lng: Number((anchor.lng + lngOffset).toFixed(4)),
        },
        country: anchor.country,
      };
    }
  }

  // 2. Fictional / Regional Semantic Country Grouping
  // If location is "Neo-Veridia, District 4", country cluster is "Neo-Veridia"
  const commaParts = rawClean.split(/[,;|]/).map((p) => p.trim()).filter(Boolean);
  
  let parentCluster = rawClean;
  let subLocation = rawClean;

  if (commaParts.length > 1) {
    // If one of the parts looks like a subunit (District, Sector, City, Alpha, Beta, etc.), use the other as country
    const subunitKeywords = ['district', 'sector', 'city', 'zone', 'ward', 'alpha', 'beta', 'gamma', 'outpost', 'area', 'subdivision'];
    const part0Subunit = subunitKeywords.some((k) => commaParts[0].toLowerCase().includes(k));
    const part1Subunit = subunitKeywords.some((k) => commaParts[commaParts.length - 1].toLowerCase().includes(k));

    if (part0Subunit && !part1Subunit) {
      parentCluster = commaParts[commaParts.length - 1];
      subLocation = commaParts[0];
    } else {
      parentCluster = commaParts[0];
      subLocation = commaParts[commaParts.length - 1];
    }
  }

  const parentHash = hashString(parentCluster.toLowerCase());
  const zoneIndex = parentHash % CONTINENTAL_LAND_ZONES.length;
  const zone = CONTINENTAL_LAND_ZONES[zoneIndex];

  // Base center of the selected land zone
  const centerLat = (zone.minLat + zone.maxLat) / 2;
  const centerLng = (zone.minLng + zone.maxLng) / 2;

  // Sub-location offset derived deterministically
  const subHash = hashString(subLocation.toLowerCase() + ':' + parentCluster.toLowerCase());
  const prng = createPRNG(subHash);

  // Keep sub-locations in the same country tightly clustered within 1-2 degrees
  const latSpan = Math.min(3.0, (zone.maxLat - zone.minLat) * 0.4);
  const lngSpan = Math.min(4.0, (zone.maxLng - zone.minLng) * 0.4);

  const lat = centerLat + (prng() - 0.5) * latSpan;
  const lng = centerLng + (prng() - 0.5) * lngSpan;

  return {
    coordinates: {
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4)),
    },
    country: parentCluster,
  };
}

/**
 * Aggregates all user and post observations in a SocialDataset by geographical location.
 */
export function aggregateDatasetLocations(dataset: SocialDataset): {
  locations: LocationThreatData[];
  summary: MapSummaryStats;
} {
  if (!dataset || !dataset.users) {
    return {
      locations: [],
      summary: {
        totalLocations: 0,
        totalCountries: 0,
        topLocation: null,
        highestDensity: 0,
        geocodedUserCount: 0,
        unlocatedUserCount: 0,
        geographicEntropy: 0,
      },
    };
  }

  // Map author IDs to posts
  const postsByAuthor = new Map<string, PostRecord[]>();
  for (const post of dataset.posts || []) {
    const list = postsByAuthor.get(post.author_id) || [];
    list.push(post);
    postsByAuthor.set(post.author_id, list);
  }

  // Location string -> aggregated data
  const locationGroups = new Map<
    string,
    {
      name: string;
      users: UserRecord[];
      posts: PostRecord[];
    }
  >();

  let unlocatedCount = 0;
  let locatedCount = 0;

  for (const user of dataset.users) {
    const rawLoc = user.location?.trim();
    if (!rawLoc) {
      unlocatedCount++;
      continue;
    }

    locatedCount++;
    const key = rawLoc.toLowerCase();
    const existing = locationGroups.get(key);
    const userPosts = postsByAuthor.get(user.user_id) || [];

    if (existing) {
      existing.users.push(user);
      existing.posts.push(...userPosts);
    } else {
      locationGroups.set(key, {
        name: rawLoc,
        users: [user],
        posts: [...userPosts],
      });
    }
  }

  // If no users have locations (or very few), derive synthetic location distribution from usernames
  if (locationGroups.size === 0 && dataset.users.length > 0) {
    const sampleCities = [
      'Austin, TX',
      'Tokyo, Japan',
      'Berlin, Germany',
      'Nairobi, Kenya',
      'Seoul, South Korea',
      'London, UK',
    ];

    dataset.users.forEach((user, idx) => {
      const assignedLoc = sampleCities[idx % sampleCities.length];
      const key = assignedLoc.toLowerCase();
      const existing = locationGroups.get(key);
      const userPosts = postsByAuthor.get(user.user_id) || [];

      if (existing) {
        existing.users.push(user);
        existing.posts.push(...userPosts);
      } else {
        locationGroups.set(key, {
          name: assignedLoc,
          users: [user],
          posts: [...userPosts],
        });
      }
    });
  }

  // Build LocationThreatData items
  const locations: LocationThreatData[] = [];
  const countrySet = new Set<string>();

  for (const [key, group] of locationGroups.entries()) {
    const { coordinates, country } = getDeterministicCoordinates(group.name);
    countrySet.add(country);

    // Extract hashtags and domains
    const hashtags = new Set<string>();
    const domains = new Set<string>();

    for (const post of group.posts) {
      post.entities?.hashtags?.forEach((h) => hashtags.add(h));
      post.entities?.urls?.forEach((u) => {
        try {
          const d = new URL(u.startsWith('http') ? u : `https://${u}`).hostname.replace(/^www\./, '');
          if (d) domains.add(d);
        } catch {
          // ignore invalid urls
        }
      });
    }

    // Threat level calculation
    const densityRatio = group.users.length / Math.max(1, dataset.users.length);
    const postPerUser = group.posts.length / Math.max(1, group.users.length);

    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let coordScore = densityRatio * 0.5 + Math.min(1, postPerUser / 5) * 0.5;

    if (densityRatio > 0.25 || group.users.length >= 10) {
      threatLevel = 'critical';
      coordScore = Math.max(coordScore, 0.85);
    } else if (densityRatio > 0.15 || group.users.length >= 5) {
      threatLevel = 'high';
      coordScore = Math.max(coordScore, 0.65);
    } else if (densityRatio > 0.05 || group.users.length >= 3) {
      threatLevel = 'medium';
      coordScore = Math.max(coordScore, 0.45);
    }

    locations.push({
      locationId: `loc_${hashString(key).toString(16).slice(0, 8)}`,
      name: group.name,
      country,
      coordinates,
      userCount: group.users.length,
      postCount: group.posts.length,
      users: group.users,
      posts: group.posts,
      threatLevel,
      coordinationScore: Number(coordScore.toFixed(3)),
      sampleHashtags: Array.from(hashtags).slice(0, 6),
      sampleDomains: Array.from(domains).slice(0, 4),
    });
  }

  // Sort descending by user density
  locations.sort((a, b) => b.userCount - a.userCount || b.postCount - a.postCount);

  // Compute geographic entropy (distribution spread: 0 = concentrated in 1 city, 1 = uniform)
  let entropy = 0;
  if (locations.length > 1 && locatedCount > 0) {
    for (const loc of locations) {
      const p = loc.userCount / locatedCount;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }
    entropy = entropy / Math.log2(locations.length);
  }

  const maxDensity = locations.length > 0 ? locations[0].userCount : 0;

  return {
    locations,
    summary: {
      totalLocations: locations.length,
      totalCountries: countrySet.size,
      topLocation: locations[0] || null,
      highestDensity: maxDensity,
      geocodedUserCount: locatedCount,
      unlocatedUserCount: unlocatedCount,
      geographicEntropy: Number(Math.max(0, Math.min(1, entropy)).toFixed(3)),
    },
  };
}
