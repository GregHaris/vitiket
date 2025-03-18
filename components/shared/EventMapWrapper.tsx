'use client';

import { FC, useEffect, useState } from 'react';

import { EventMapProps } from '@/types';
import EventMap from './EventMap';

const EventMapWrapper: FC<EventMapProps> = ({
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
