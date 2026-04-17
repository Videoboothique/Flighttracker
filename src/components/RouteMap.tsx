import MapView, { Marker, Polyline } from 'react-native-maps';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { NETHERLANDS_REGION } from '../constants/defaults';
import { colors, radii } from '../constants/theme';
import { Place } from '../types';

type RouteMapProps = {
  places: Place[];
  height?: number;
};

export function RouteMap({ places, height = 260 }: RouteMapProps) {
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (places.length > 1) {
      mapRef.current.fitToCoordinates(
        places.map((place) => ({
          latitude: place.latitude,
          longitude: place.longitude,
        })),
        { edgePadding: { top: 70, right: 70, bottom: 70, left: 70 }, animated: true },
      );
      return;
    }

    if (places.length === 1) {
      mapRef.current.animateToRegion(
        {
          latitude: places[0].latitude,
          longitude: places[0].longitude,
          latitudeDelta: 0.35,
          longitudeDelta: 0.35,
        },
        350,
      );
    }
  }, [places]);

  return (
    <View style={[styles.wrapper, { height }]}>
      <MapView ref={mapRef} style={styles.map} initialRegion={NETHERLANDS_REGION}>
        {places.map((place, index) => (
          <Marker
            key={`${place.id}-${index}`}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.name}
            description={place.province}
          />
        ))}
        {places.length > 1 ? (
          <Polyline
            coordinates={places.map((place) => ({
              latitude: place.latitude,
              longitude: place.longitude,
            }))}
            strokeColor={colors.mapLine}
            strokeWidth={4}
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
