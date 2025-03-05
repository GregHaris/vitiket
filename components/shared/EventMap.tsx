'use client';

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  PlaceDataProvider,
  PlaceOverview,
  PlaceDirectionsButton,
  IconButton,
} from '@googlemaps/extended-component-library/react';
import { OverlayLayout as TOverlayLayout } from '@googlemaps/extended-component-library/overlay_layout.js';

import { EventMapProps } from '@/types';

const containerStyle = {
  width: '100%',
  height: '400px',
};

export default function EventMap({
  coordinates,
  destinationName,
}: EventMapProps) {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

  const [lat, lng] = coordinates.split(',').map(Number);
  const center = useMemo(() => ({ lat, lng }), [lat, lng]);

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="relative">
        {/* Google Map */}
        <Map
          mapId="VITIKET_MAP_ID"
          style={containerStyle}
          defaultCenter={center}
          defaultZoom={14}
        >
          {/* Advanced Marker */}
          <AdvancedMarker
            position={center}
            clickable={true}
            title={destinationName}
          >
            <Pin
              background={'#EA4335'}
              glyphColor={'#FFF'}
              borderColor={'#EA4335'}
            />
          </AdvancedMarker>
        </Map>
      </div>
    </APIProvider>
  );
}
