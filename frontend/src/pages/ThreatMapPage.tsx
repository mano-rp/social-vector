import React, { useState, useMemo } from 'react';
import { useDataset } from '../context/DatasetContext';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { MapPin } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { aggregateDatasetLocations, LocationThreatData } from '../utils/geoCoordinates';
import { ThreatMap } from '../components/threat-map/ThreatMap';
import { LocationRankings } from '../components/threat-map/LocationRankings';
import { LocationInspectorDrawer } from '../components/threat-map/LocationInspectorDrawer';

export const ThreatMapPage: React.FC = () => {
  const { activeDataset, activeDatasetMeta, activeDatasetId, isLoadingActiveDataset } = useDataset();
  const navigate = useNavigate();
  const { datasetId } = useParams<{ datasetId: string }>();

  const [selectedLocation, setSelectedLocation] = useState<LocationThreatData | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<LocationThreatData | null>(null);

  const { locations, summary } = useMemo(() => {
    if (!activeDataset) {
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
    return aggregateDatasetLocations(activeDataset);
  }, [activeDataset]);

  if (isLoadingActiveDataset) {
    return <LoadingState message="Computing offline spatial intelligence..." />;
  }

  if (!activeDataset) {
    return (
      <EmptyState
        icon={<MapPin className="w-8 h-8 text-slate-400 dark:text-slate-500" />}
        title="No Dataset Selected"
        description="Select an active dataset to visualize geographic distribution and regional threat density."
        action={
          <Button variant="primary" onClick={() => navigate('/datasets')}>
            Browse Datasets
          </Button>
        }
      />
    );
  }

  const currentDatasetId = activeDatasetId || datasetId || activeDataset.metadata.dataset_id;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Spatial Intelligence
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
            <span>Threat Map</span>
            <Badge variant="blue" size="sm">
              Deterministic Offline GIS
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Geographic distribution of observed personas and regional concentration for{' '}
            <strong className="text-slate-900 dark:text-slate-200">
              {activeDatasetMeta?.scenario?.replace(/_/g, ' ') || activeDataset.metadata.scenario}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
          <div>Locations: <strong className="text-slate-900 dark:text-slate-100">{summary.totalLocations}</strong></div>
          <div>Countries: <strong className="text-slate-900 dark:text-slate-100">{summary.totalCountries}</strong></div>
        </div>
      </div>

      {/* Main Threat Map Canvas */}
      <ThreatMap
        locations={locations}
        selectedLocationId={selectedLocation?.locationId ?? null}
        onSelectLocation={setSelectedLocation}
        hoveredLocationId={hoveredLocation?.locationId ?? null}
        onHoverLocation={setHoveredLocation}
      />

      {/* Detail Layout: Rankings & Location Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={selectedLocation ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <LocationRankings
            locations={locations}
            summary={summary}
            selectedLocationId={selectedLocation?.locationId ?? null}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
          />
        </div>

        {selectedLocation && (
          <div className="lg:col-span-1">
            <LocationInspectorDrawer
              location={selectedLocation}
              datasetId={currentDatasetId}
              onClose={() => setSelectedLocation(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
