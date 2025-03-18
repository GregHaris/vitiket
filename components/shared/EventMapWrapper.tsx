'use client';

import { useEffect, useState } from 'react';

import EventMap from './EventMap'; 
import { EventMapProps } from '@/types';

const EventMapWrapper: React.FC<EventMapProps> = ({
  coordinates,
  destinationInfo,
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => {
    setShouldRender(true);
  }, []);

  if (!shouldRender) return null;

  return (
    <EventMap coordinates={coordinates} destinationInfo={destinationInfo} />
  );
};

export default EventMapWrapper;
