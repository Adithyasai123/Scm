import { useQuery } from '@tanstack/react-query';
import { masterdataApi } from '@/api/masterdata.api';
import { useState } from 'react';

export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: () => masterdataApi.getZones(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useZoneBasedCircles(zoneId: number | null) {
  return useQuery({
    queryKey: ['circles', 'zone', zoneId],
    queryFn: () => masterdataApi.getZoneBasedCircles(String(zoneId!)),
    enabled: zoneId !== null && zoneId >= 0,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCircles() {
  return useQuery({
    queryKey: ['circles'],
    queryFn: () => masterdataApi.getCircles(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSSAs(circleId: number | null) {
  return useQuery({
    queryKey: ['ssas', circleId],
    queryFn: () => masterdataApi.getSSAs(String(circleId!)),
    enabled: circleId !== null && circleId > 0,
    staleTime: 10 * 60 * 1000,
  });
}

export function useZoneCircleSSA() {
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [selectedCircle, setSelectedCircle] = useState<number | null>(null);
  const [selectedSSA, setSelectedSSA] = useState<number | null>(null);

  const zones = useZones();
  const allCircles = useCircles();
  const zoneBasedCircles = useZoneBasedCircles(selectedZone);
  const circles = (selectedZone !== null && selectedZone !== undefined && selectedZone > 0) ? zoneBasedCircles : allCircles;
  const ssas = useSSAs(selectedCircle);

  const selectZone = (zoneId: number | null) => {
    setSelectedZone(zoneId);
    setSelectedCircle(null);
    setSelectedSSA(null);
  };

  const selectCircle = (circleId: number | null) => {
    setSelectedCircle(circleId);
    setSelectedSSA(null);
  };

  return {
    zones,
    circles,
    ssas,
    selectedZone,
    selectedCircle,
    selectedSSA,
    selectZone,
    selectCircle,
    setSelectedSSA,
  };
}
