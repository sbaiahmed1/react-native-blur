import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';

import { NATIVE_GLASS } from '@/ui/glass-support';
import { useTheme } from '@/ui/theme';

const FILTERS = [
  {
    label: 'Coffee',
    ios: 'cup.and.saucer.fill',
    md: 'local_cafe',
    place: 'Harbor Coffee',
    detail: '4 min walk, open until 18:00',
  },
  {
    label: 'Parks',
    ios: 'tree.fill',
    md: 'park',
    place: 'Riverside Park',
    detail: '9 min walk, open all day',
  },
  {
    label: 'Transit',
    ios: 'tram.fill',
    md: 'tram',
    place: 'Central Station',
    detail: '6 min walk, next tram in 3 min',
  },
] as const;

const ZOOM = { min: 1, max: 1.75, step: 0.25 };

const LIGHT_MAP = {
  land: '#ECE8DF',
  park: '#B7DDB0',
  water: '#9CCBF2',
  road: '#FFFFFF',
};
const DARK_MAP = {
  land: '#1D2026',
  park: '#1F3A2B',
  water: '#183553',
  road: '#3A3F48',
};

/** A city map drawn in views, tilted like a real map. */
function MapLayer({ zoom }: { zoom: number }) {
  const t = useTheme();
  const c = t.dark ? DARK_MAP : LIGHT_MAP;
  return (
    <View
      style={[
        styles.layer,
        {
          backgroundColor: c.land,
          transform: [{ rotate: '-14deg' }, { scale: zoom }],
        },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.park, { backgroundColor: c.park }]} />
      <View style={[styles.water, { backgroundColor: c.water }]} />
      {[30, 58].map((top) => (
        <View
          key={`h${top}`}
          style={[styles.minorH, { top: `${top}%`, backgroundColor: c.road }]}
        />
      ))}
      {[34, 70].map((left) => (
        <View
          key={`v${left}`}
          style={[styles.minorV, { left: `${left}%`, backgroundColor: c.road }]}
        />
      ))}
      <View style={[styles.majorH, { backgroundColor: c.road }]} />
      <View style={[styles.majorV, { backgroundColor: c.road }]} />
      <View style={[styles.routeH, { backgroundColor: t.colors.accent }]} />
      <View style={[styles.routeV, { backgroundColor: t.colors.accent }]} />
      <View style={[styles.pin, { backgroundColor: t.colors.accent }]} />
    </View>
  );
}

/** Glass map controls: filter chips, a zoom pill and a place card over a drawn map. */
export function MapHero() {
  const t = useTheme();
  const [filter, setFilter] = useState(0);
  const [zoom, setZoom] = useState(1.25);
  const place = FILTERS[filter] ?? FILTERS[0];
  const zoomBy = (by: number) =>
    setZoom((z) => Math.min(ZOOM.max, Math.max(ZOOM.min, z + by)));
  return (
    <View style={styles.map}>
      <MapLayer zoom={zoom} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chips}
        contentContainerStyle={styles.chipRow}
      >
        {FILTERS.map((f, i) => {
          const selected = filter === i;
          // The blur fallback dilutes the tint, so white only reads on native glass.
          let color = selected ? t.colors.accent : t.colors.text;
          if (selected && NATIVE_GLASS) color = '#FFFFFF';
          return (
            <LiquidGlassView
              key={f.label}
              glassType="regular"
              glassTintColor={selected ? t.colors.accent : undefined}
              style={styles.chip}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={f.label}
                accessibilityState={{ selected }}
                onPress={() => setFilter(i)}
                style={styles.chipPress}
              >
                <SymbolView
                  name={{ ios: f.ios, android: f.md, web: f.md } as never}
                  size={14}
                  tintColor={color}
                />
                <Text style={[t.font.footnote, styles.bold, { color }]}>
                  {f.label}
                </Text>
              </Pressable>
            </LiquidGlassView>
          );
        })}
      </ScrollView>
      <LiquidGlassView glassType="regular" style={styles.zoom}>
        {[
          { label: 'Zoom in', ios: 'plus', md: 'add', by: ZOOM.step },
          { label: 'Zoom out', ios: 'minus', md: 'remove', by: -ZOOM.step },
        ].map((b) => {
          const disabled = b.by > 0 ? zoom >= ZOOM.max : zoom <= ZOOM.min;
          return (
            <Pressable
              key={b.label}
              accessibilityRole="button"
              accessibilityLabel={b.label}
              accessibilityState={{ disabled }}
              disabled={disabled}
              onPress={() => zoomBy(b.by)}
              style={styles.zoomPress}
            >
              <SymbolView
                name={{ ios: b.ios, android: b.md, web: b.md } as never}
                size={18}
                tintColor={disabled ? t.colors.textMuted : t.colors.text}
              />
            </Pressable>
          );
        })}
      </LiquidGlassView>
      <LiquidGlassView glassType="regular" style={styles.place}>
        <View
          style={[styles.badge, { backgroundColor: t.colors.accent }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <SymbolView
            name={{ ios: place.ios, android: place.md, web: place.md } as never}
            size={18}
            tintColor="#FFFFFF"
          />
        </View>
        <View style={styles.grow}>
          <Text style={[t.font.headline, { color: t.colors.text }]}>
            {place.place}
          </Text>
          <Text style={[t.font.footnote, { color: t.colors.text }]}>
            {place.detail}
          </Text>
        </View>
      </LiquidGlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { height: 340, borderRadius: 28, overflow: 'hidden' },
  layer: {
    position: 'absolute',
    left: '-30%',
    top: '-30%',
    width: '160%',
    height: '160%',
  },
  park: {
    position: 'absolute',
    left: '38%',
    top: '32%',
    width: '12%',
    height: '12%',
    borderRadius: 12,
  },
  water: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '64%',
    height: '10%',
  },
  minorH: { position: 'absolute', left: 0, right: 0, height: 5 },
  minorV: { position: 'absolute', top: 0, bottom: 0, width: 5 },
  majorH: { position: 'absolute', left: 0, right: 0, top: '47%', height: 12 },
  majorV: { position: 'absolute', top: 0, bottom: 0, left: '55%', width: 12 },
  routeH: {
    position: 'absolute',
    left: '36%',
    width: '19.5%',
    top: '47%',
    marginTop: 3,
    height: 6,
    borderRadius: 3,
  },
  routeV: {
    position: 'absolute',
    left: '55%',
    marginLeft: 3,
    width: 6,
    top: '36%',
    height: '11.5%',
    borderRadius: 3,
  },
  pin: {
    position: 'absolute',
    left: '55%',
    top: '36%',
    width: 20,
    height: 20,
    marginLeft: -4,
    marginTop: -10,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  chips: { position: 'absolute', top: 14, left: 0, right: 0 },
  chipRow: { paddingHorizontal: 14, gap: 8 },
  chip: { height: 36, borderRadius: 18, overflow: 'hidden' },
  chipPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
  },
  bold: { fontWeight: '600' },
  zoom: {
    position: 'absolute',
    right: 14,
    top: 96,
    width: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  zoomPress: { height: 48, alignItems: 'center', justifyContent: 'center' },
  place: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  grow: { flex: 1 },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
