<template>
  <section class="lab-page">
    <LabHeader
      lab-number="07"
      title="L7 × 高德地图"
      description="多 GeoJSON 文件叠加与高德地图可视化，支持多选、性能优化与交互体验"
    />
    <div class="lab7-controls">
      <label>GeoJSON Files:</label>
      <div style="display: inline-block; margin-left: 1rem;">
        <label v-for="file in geojsonFiles" :key="file" style="margin-right: 1rem;">
          <input type="checkbox" :value="file" v-model="selectedGeojsonFiles" />
          {{ file }}
        </label>
      </div>
    </div>
    <div v-if="loading" class="lab7-spinner">
      <div class="spinner"></div>
      <div style="text-align:center;margin-top:1rem;">Loading geojson files...</div>
    </div>
    <div v-show="!loading" id="geojson-map" class="map"></div>
    <div id="gaode-map" class="map"></div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import LabHeader from '../components/ui/LabHeader.vue';
import { Scene, GaodeMap, PolygonLayer, LineLayer, PointLayer, Map } from '@antv/l7';
const geojsonMapId = 'geojson-map';
const gaodeMapId = 'gaode-map';
const geojsonFiles = [
  '/data/00.geojson',
  '/data/000.geojson',
  '/data/410000.geojson',
  '/data/410000 (2).geojson'
]
const selectedGeojsonFiles = ref([geojsonFiles[0], geojsonFiles[1], geojsonFiles[2], geojsonFiles[3]])
const loading = ref(false);

let geojsonScene: Scene | null = null;
let gaodeScene: Scene | null = null;

const initGeojsonMap = async () => {
  loading.value = true;
  if (geojsonScene) {
    geojsonScene.destroy();
    geojsonScene = null;
  }
  geojsonScene = new Scene({
    id: geojsonMapId,
    map: new Map({
      center: [105, 36],
      zoom: 3.5,
      style: 'blank'
    })
  });
  geojsonScene.on('loaded', async () => {
    let fitBoundsDone = false;
    for (const file of selectedGeojsonFiles.value) {
      try {
        const res = await fetch(file);
        const geojson = await res.json();
        console.log('[Lab7] Loaded geojson:', file, geojson);
        // Render MultiLineString features as LineLayer, Polygon/MultiPolygon as PolygonLayer
        const lineFeatures = geojson.features.filter((f: any) => f.geometry.type === 'MultiLineString' || f.geometry.type === 'LineString');
        const polygonFeatures = geojson.features.filter((f: any) => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon');
        if (lineFeatures.length) {
          const lineLayer = new LineLayer()
            .source({ type: 'FeatureCollection', features: lineFeatures }, { parser: { type: 'geojson' } })
            .shape('line')
            .color('#3399ff')
            .size(2)
            .style({ opacity: 0.8 });
          geojsonScene!.addLayer(lineLayer);
        }
        if (polygonFeatures.length) {
          const polygonLayer = new PolygonLayer()
            .source({ type: 'FeatureCollection', features: polygonFeatures }, { parser: { type: 'geojson' } })
            .shape('fill')
            .color('#ffb347')
            .style({ opacity: 0.5 });
          geojsonScene!.addLayer(polygonLayer);
        }
        // Fit map to geojson bounds (only for first loaded layer)
        if (!fitBoundsDone) {
          let minLng = 180, minLat = 90, maxLng = -180, maxLat = -90;
          geojson.features.forEach((feature: any) => {
            const coords = feature.geometry.coordinates;
            function processCoords(arr: any) {
              if (typeof arr[0] === 'number') {
                const [lng, lat] = arr;
                minLng = Math.min(minLng, lng);
                maxLng = Math.max(maxLng, lng);
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
              } else {
                arr.forEach(processCoords);
              }
            }
            processCoords(coords);
          });
          const center: [number, number] = [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
          geojsonScene!.setCenter(center);
          const lngSpan = maxLng - minLng;
          const latSpan = maxLat - minLat;
          let zoom = 8;
          if (lngSpan < 1 && latSpan < 1) zoom = 12;
          else if (lngSpan < 5 && latSpan < 5) zoom = 10;
          geojsonScene!.setZoom(zoom);
          fitBoundsDone = true;
        }
      } catch (e) {
        console.error('[Lab7] Failed to load geojson:', file, e);
      }
    }
    loading.value = false;
  });
};

const initGaodeMap = async () => {
  if (gaodeScene) {
    gaodeScene.destroy();
    gaodeScene = null;
  }
  gaodeScene = new Scene({
    id: gaodeMapId,
    map: new GaodeMap({
      style: 'light',
      center: [105, 36],
      zoom: 3.5,
      token: 'd6b8039d10c25a2c55a41e9a88f1523a',
    })
  });
  gaodeScene.on('loaded', async () => {
    const smoke = new PointLayer()
      .source({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [105, 36] }, properties: { name: 'Center' } }]
      }, { parser: { type: 'geojson' } })
      .shape('circle')
      .size(10)
      .color('#ffcc00')
    gaodeScene!.addLayer(smoke);
    try {
      const res = await fetch('/data/china-provinces.json')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const china = await res.json()
      const fill = new PolygonLayer()
        .source(china)
        .shape('fill')
        .color('#3fa7d6')
        .style({ opacity: 0.6 })
      const border = new LineLayer()
        .source(china)
        .shape('line')
        .size(0.8)
        .color('#1b1b1b')
      gaodeScene!.addLayer(fill)
      gaodeScene!.addLayer(border)
      fill.on('click', (e: any) => {
        if (e.feature && e.feature.geometry && e.feature.geometry.coordinates) {
          const coords = e.feature.geometry.coordinates
          let flat: any[] = []
          function flatten(arr: any) {
            if (typeof arr[0] === 'number') flat.push(arr)
            else arr.forEach(flatten)
          }
          flatten(coords)
          let lng = 0, lat = 0
          flat.forEach(([x, y]) => { lng += x; lat += y })
          lng /= flat.length
          lat /= flat.length
          gaodeScene!.setZoomAndCenter(5.2, [lng, lat])
        }
      })
    } catch (e) {
      console.error('[Lab7] failed to load china-provinces.json:', e)
    }
  });
};

onMounted(() => {
  initGeojsonMap();
  initGaodeMap();
});
watch(selectedGeojsonFiles, () => {
  initGeojsonMap();
});

</script>

<style scoped>
    .lab7-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      width: 90vw;
      max-width: 700px;
      margin: 2rem auto;
      background: var(--panel);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      border: 2px dashed var(--border);
      z-index: 10;
    }
    .spinner {
      border: 8px solid var(--border);
      border-top: 8px solid var(--primary);
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  .lab7-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    padding: 1rem 0;
    background: var(--panel);
    z-index: 2;
    position: relative;
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border);
  }
  .map {
    position: relative !important;
    height: 400px !important;
    width: 90vw !important;
    max-width: 700px !important;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    margin: 2rem auto 2rem auto;
    z-index: 1;
    background: var(--bg) !important;
    border: 2px dashed var(--border) !important;
    overflow: hidden;
  }
  #geojson-map {
    margin-bottom: 2rem;
  }
  #gaode-map {
    margin-top: 2rem;
  }
</style>