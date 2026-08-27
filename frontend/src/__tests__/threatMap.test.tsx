import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import {
  getDeterministicCoordinates,
  aggregateDatasetLocations,
  LocationThreatData,
} from '../utils/geoCoordinates';
import { projectLatLngToXY } from '../components/threat-map/worldMapData';
import { ThreatMap } from '../components/threat-map/ThreatMap';
import { LocationRankings } from '../components/threat-map/LocationRankings';
import { LocationInspectorDrawer } from '../components/threat-map/LocationInspectorDrawer';
import { SocialDataset } from '../types/dataset';

describe('Deterministic Offline Geo System', () => {
  it('deterministically resolves known real cities to canonical land coordinates', () => {
    const tokyo1 = getDeterministicCoordinates('Tokyo, Japan');
    const tokyo2 = getDeterministicCoordinates('Tokyo, Japan');

    expect(tokyo1.country).toBe('Japan');
    expect(tokyo1.coordinates.lat).toBeCloseTo(35.6762, 0);
    expect(tokyo1.coordinates.lng).toBeCloseTo(139.6503, 0);
    expect(tokyo1.coordinates).toEqual(tokyo2.coordinates);

    const nairobi = getDeterministicCoordinates('Nairobi, Kenya');
    expect(nairobi.country).toBe('Kenya');
    expect(nairobi.coordinates.lat).toBeCloseTo(-1.2921, 0);
    expect(nairobi.coordinates.lng).toBeCloseTo(36.8219, 0);
  });

  it('deterministically clusters fictional locations sharing parent country on land', () => {
    const locA = getDeterministicCoordinates('Neo-Veridia, District Alpha');
    const locB = getDeterministicCoordinates('Neo-Veridia, District Beta');
    const locARepeat = getDeterministicCoordinates('Neo-Veridia, District Alpha');

    // Deterministic repeatability
    expect(locA.coordinates).toEqual(locARepeat.coordinates);

    // Both are on valid land coordinates
    expect(locA.coordinates.lat).toBeGreaterThan(-85);
    expect(locA.coordinates.lat).toBeLessThan(85);
    expect(locA.coordinates.lng).toBeGreaterThan(-180);
    expect(locA.coordinates.lng).toBeLessThan(180);

    // Semantic country grouping: distance between sub-locations in same country is small (clustered)
    const latDiff = Math.abs(locA.coordinates.lat - locB.coordinates.lat);
    const lngDiff = Math.abs(locA.coordinates.lng - locB.coordinates.lng);
    expect(latDiff).toBeLessThan(15);
    expect(lngDiff).toBeLessThan(15);
  });

  it('projects lat/lng to SVG viewport coordinates correctly', () => {
    // Center of map: lat=0, lng=0 -> x=500, y=250
    const center = projectLatLngToXY(0, 0, 1000, 500);
    expect(center.x).toBe(500);
    expect(center.y).toBe(250);

    // Top-left: lat=90, lng=-180 -> x=0, y=0 (clamped lat=85 -> y ~ 13.89)
    const northWest = projectLatLngToXY(85, -180, 1000, 500);
    expect(northWest.x).toBe(0);
    expect(northWest.y).toBeCloseTo(13.89, 1);
  });
});

describe('Dataset Location Aggregation', () => {
  const sampleDataset: SocialDataset = {
    metadata: {
      dataset_id: 'ds_test_spatial',
      schema_version: '1.0.0',
      generator_name: 'SocialVector',
      generator_version: '0.1.0',
      scenario: 'extreme_information_operation',
      seed: 42,
      created_at: '2026-08-28T00:00:00Z',
      parameters: {},
      statistics: { total_users: 3, total_posts: 4 },
    },
    users: [
      {
        user_id: 'u1',
        username: 'analyst_01',
        display_name: 'Analyst One',
        bio: 'Bio 1',
        created_at: '2026-08-28T00:00:00Z',
        location: 'Tokyo, Japan',
        metrics: { followers_count: 100, following_count: 50, posts_count: 2, listed_count: 0 },
        verified: false,
        account_type: 'individual',
        language: 'en',
        device_client: 'Web Client',
        custom_attributes: {},
      },
      {
        user_id: 'u2',
        username: 'analyst_02',
        display_name: 'Analyst Two',
        bio: 'Bio 2',
        created_at: '2026-08-28T00:00:00Z',
        location: 'Tokyo, Japan',
        metrics: { followers_count: 200, following_count: 50, posts_count: 1, listed_count: 0 },
        verified: false,
        account_type: 'individual',
        language: 'en',
        device_client: 'Web Client',
        custom_attributes: {},
      },
      {
        user_id: 'u3',
        username: 'operative_03',
        display_name: 'Operative Three',
        bio: 'Bio 3',
        created_at: '2026-08-28T00:00:00Z',
        location: 'Nairobi, Kenya',
        metrics: { followers_count: 500, following_count: 10, posts_count: 1, listed_count: 0 },
        verified: true,
        account_type: 'individual',
        language: 'en',
        device_client: 'Twitter Web App',
        custom_attributes: {},
      },
    ],
    posts: [
      {
        post_id: 'p1',
        author_id: 'u1',
        created_at: '2026-08-28T00:01:00Z',
        content: 'Post 1 from Tokyo #intel',
        language: 'en',
        entities: { hashtags: ['intel'], mentions: [], urls: ['https://source.org/report'], media_urls: [] },
        metrics: { likes_count: 5, reposts_count: 2, replies_count: 1, quotes_count: 0, impressions_count: 100 },
      },
      {
        post_id: 'p2',
        author_id: 'u1',
        created_at: '2026-08-28T00:02:00Z',
        content: 'Post 2 from Tokyo #breaking',
        language: 'en',
        entities: { hashtags: ['breaking'], mentions: [], urls: [], media_urls: [] },
        metrics: { likes_count: 1, reposts_count: 0, replies_count: 0, quotes_count: 0, impressions_count: 50 },
      },
      {
        post_id: 'p3',
        author_id: 'u2',
        created_at: '2026-08-28T00:03:00Z',
        content: 'Post 3 from Tokyo #intel',
        language: 'en',
        entities: { hashtags: ['intel'], mentions: [], urls: [], media_urls: [] },
        metrics: { likes_count: 3, reposts_count: 1, replies_count: 0, quotes_count: 0, impressions_count: 80 },
      },
      {
        post_id: 'p4',
        author_id: 'u3',
        created_at: '2026-08-28T00:04:00Z',
        content: 'Post 4 from Nairobi',
        language: 'en',
        entities: { hashtags: [], mentions: [], urls: [], media_urls: [] },
        metrics: { likes_count: 10, reposts_count: 5, replies_count: 2, quotes_count: 0, impressions_count: 300 },
      },
    ],
  };

  it('aggregates dataset locations, users, and post metrics accurately', () => {
    const { locations, summary } = aggregateDatasetLocations(sampleDataset);

    expect(locations.length).toBe(2);
    expect(summary.totalLocations).toBe(2);
    expect(summary.totalCountries).toBe(2);
    expect(summary.topLocation?.name).toBe('Tokyo, Japan');
    expect(summary.topLocation?.userCount).toBe(2);
    expect(summary.topLocation?.postCount).toBe(3);
    expect(summary.topLocation?.sampleHashtags).toContain('intel');
    expect(summary.topLocation?.sampleDomains).toContain('source.org');
  });
});

describe('ThreatMap UI Components', () => {
  const dummyLocations: LocationThreatData[] = [
    {
      locationId: 'loc_tokyo',
      name: 'Tokyo, Japan',
      country: 'Japan',
      coordinates: { lat: 35.6762, lng: 139.6503 },
      userCount: 15,
      postCount: 52,
      users: [],
      posts: [],
      threatLevel: 'critical',
      coordinationScore: 0.88,
      sampleHashtags: ['cyber', 'ops'],
      sampleDomains: ['disinfo-node.org'],
    },
    {
      locationId: 'loc_austin',
      name: 'Austin, TX',
      country: 'United States',
      coordinates: { lat: 30.2672, lng: -97.7431 },
      userCount: 4,
      postCount: 12,
      users: [],
      posts: [],
      threatLevel: 'medium',
      coordinationScore: 0.45,
      sampleHashtags: ['tech'],
      sampleDomains: [],
    },
  ];

  it('renders ThreatMap canvas, legend, and controls', () => {
    const handleSelect = vi.fn();
    render(
      <ThreatMap
        locations={dummyLocations}
        selectedLocationId={null}
        onSelectLocation={handleSelect}
      />
    );

    expect(screen.getByTitle('Zoom In')).toBeDefined();
    expect(screen.getByTitle('Zoom Out')).toBeDefined();
    expect(screen.getByTitle('Reset View')).toBeDefined();
    expect(screen.getByText('High Density / Threat')).toBeDefined();
  });

  it('renders LocationRankings and allows sorting and selecting', () => {
    const handleSelect = vi.fn();
    render(
      <LocationRankings
        locations={dummyLocations}
        summary={{
          totalLocations: 2,
          totalCountries: 2,
          topLocation: dummyLocations[0],
          highestDensity: 15,
          geocodedUserCount: 19,
          unlocatedUserCount: 0,
          geographicEntropy: 0.65,
        }}
        selectedLocationId={null}
        onSelectLocation={handleSelect}
      />
    );

    expect(screen.getAllByText('Tokyo, Japan').length).toBeGreaterThan(0);
    expect(screen.getByText('Austin, TX')).toBeDefined();

    // Click on Tokyo row in the list
    const rows = screen.getAllByText('Tokyo, Japan');
    fireEvent.click(rows[rows.length - 1]);
    expect(handleSelect).toHaveBeenCalledWith(dummyLocations[0]);
  });

  it('renders LocationInspectorDrawer with accounts and post tabs', () => {
    const handleClose = vi.fn();
    render(
      <BrowserRouter>
        <LocationInspectorDrawer
          location={dummyLocations[0]}
          datasetId="ds_test"
          onClose={handleClose}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Tokyo, Japan')).toBeDefined();
    expect(screen.getByText('CRITICAL')).toBeDefined();
    expect(screen.getByText('Accounts (0)')).toBeDefined();
    expect(screen.getByText('Posts (0)')).toBeDefined();
  });
});
