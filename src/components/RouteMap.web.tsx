import 'leaflet/dist/leaflet.css';
import React, { CSSProperties, useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { NETHERLANDS_REGION } from '../constants/defaults';
import { colors, radii } from '../constants/theme';
import { Place } from '../types';

type RouteMapProps = {
  places: Place[];
  height?: number;
};

function FitMapBounds({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    if (places.length > 1) {
      map.fitBounds(
        places.map((place) => [place.latitude, place.longitude] as [number, number]),
        { padding: [40, 40] },
      );
      return;
    }

    if (places.length === 1) {
      map.setView([places[0].latitude, places[0].longitude], 10);
      return;
    }

    map.setView([NETHERLANDS_REGION.latitude, NETHERLANDS_REGION.longitude], 7);
  }, [map, places]);

  return null;
}

export function RouteMap({ places, height = 260 }: RouteMapProps) {
  const LeafletMapContainer = MapContainer as React.ComponentType<any>;
  const LeafletTileLayer = TileLayer as React.ComponentType<any>;
  const LeafletCircleMarker = CircleMarker as React.ComponentType<any>;
  const LeafletPolyline = Polyline as React.ComponentType<any>;

  const center = useMemo<[number, number]>(() => {
    if (places.length === 1) {
      return [places[0].latitude, places[0].longitude];
    }

    return [NETHERLANDS_REGION.latitude, NETHERLANDS_REGION.longitude];
  }, [places]);

  const wrapperStyle: CSSProperties = {
    height,
    width: '100%',
    overflow: 'hidden',
    borderRadius: radii.lg,
    border: `1px solid ${colors.border}`,
  };

  const mapStyle: CSSProperties = {
    height: '100%',
    width: '100%',
  };

  return (
    <View>
      <div style={wrapperStyle}>
        <LeafletMapContainer center={center} zoom={7} style={mapStyle} scrollWheelZoom>
          <LeafletTileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-bijdragers'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitMapBounds places={places} />
          {places.map((place, index) => (
            <LeafletCircleMarker
              key={`${place.id}-${index}`}
              center={[place.latitude, place.longitude]}
              radius={9}
              pathOptions={{
                color: colors.mapLine,
                fillColor: colors.primary,
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <strong>{place.name}</strong>
                <br />
                {place.province ?? 'Nederland'}
              </Popup>
            </LeafletCircleMarker>
          ))}
          {places.length > 1 ? (
            <LeafletPolyline
              positions={places.map((place) => [place.latitude, place.longitude] as [number, number])}
              pathOptions={{ color: colors.mapLine, weight: 4 }}
            />
          ) : null}
        </LeafletMapContainer>
      </div>
      <Text style={{ marginTop: 8, color: colors.textMuted, fontSize: 14 }}>
        Kaartlaag: OpenStreetMap
      </Text>
    </View>
  );
}
