<template>
  <div class="lab8-container">
    <LabHeader
      labNumber="8"
      title="实验 8：L7符号可视化"
      description="AntV L7 地图符号可视化实验，点位符号、标签、映射与交互"
    />
    <div class="lab8-main">
      <!-- 左侧控制面板 -->
      <aside class="lab8-sidebar">
        <h3>类别筛选</h3>
        <div v-for="cat in categories" :key="cat">
          <label>
            <input type="checkbox" v-model="selectedCategories" :value="cat" />
            {{ cat }}
          </label>
        </div>
        <hr />
        <div>
          <label><input type="checkbox" v-model="showIconLayer" /> 显示图标层</label>
        </div>
        <div>
          <label><input type="checkbox" v-model="showTextLayer" /> 显示文字层</label>
        </div>
        <div>
          <label><input type="checkbox" v-model="enableSizeMapping" /> 启用 size 映射</label>
        </div>
        <hr />
        <div v-if="selectedFeature">
          <h4>点位详情</h4>
          <ul>
            <li>名称：{{ selectedFeature.name }}</li>
            <li>类别：{{ selectedFeature.category }}</li>
            <li>热度/值：{{ selectedFeature.value }}</li>
            <li>经度：{{ selectedFeature.lng }}</li>
            <li>纬度：{{ selectedFeature.lat }}</li>
          </ul>
        </div>
      </aside>
      <!-- 右侧地图区 -->
      <section class="lab8-map-section">
        <div id="lab8-map" class="lab8-map"></div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import LabHeader from '../components/ui/LabHeader.vue'
import { Scene, PointLayer, LayerPopup } from '@antv/l7'
import { GaodeMap } from '@antv/l7-maps'

const mapCenter = [113.65, 34.76]
const mapZoom = 13
const mapStyle = 'light'
const amapToken = import.meta.env.VITE_AMAP_TOKEN

const rawData = ref([])
const filteredData = ref([])
const categories = ref([])
const selectedCategories = ref([])
const showIconLayer = ref(true)
const showTextLayer = ref(true)
const enableSizeMapping = ref(true)
const selectedFeature = ref(null)

let scene = null
let iconLayer = null
let textLayer = null

// 图标映射（本地 PNG）
const categoryIcons = {
  study: '/icons/study.png',
  sports: '/icons/sports.png',
  food: '/icons/food.png',
  teaching: '/icons/teaching.png',
  admin: '/icons/admin.png',
  dorm: '/icons/dorm.png',
  service: '/icons/service.png',
  lab: '/icons/lab.png',
}

// 颜色映射
const categoryColors = {
  study: '#4F8EFF',
  sports: '#FFB300',
  food: '#FF5B5B',
  teaching: '#00B96B',
  admin: '#8E44AD',
  dorm: '#2D9CDB',
  service: '#F2994A',
  lab: '#27AE60',
}

// 加载数据
async function loadData() {
  const res = await fetch('/data/lab8_poi.json')
  const data = await res.json()
  rawData.value = data
  // 提取类别
  categories.value = [...new Set(data.map(d => d.category))]
  selectedCategories.value = [...categories.value]
  filterData()
  console.log('raw:', rawData.value.length, rawData.value[0])
}

function filterData() {
  filteredData.value = rawData.value.filter(d => selectedCategories.value.includes(d.category))
  console.log('filtered:', filteredData.value.length)
  updateLayers()
  fitToData()
}

// 监听筛选
watch(selectedCategories, filterData)
// 监听映射/显示开关，更新图层
watch([showIconLayer, showTextLayer, enableSizeMapping], () => {
  updateLayers()
})

function updateLayers() {
  if (!scene) return
  // 图标层
  if (iconLayer) {
    iconLayer.source(filteredData.value, {
      parser: { type: 'json', x: 'lng', y: 'lat' }
    })
    iconLayer.size(enableSizeMapping.value ? ['value', [6, 24]] : 12)
    iconLayer.color('category', c => categoryColors[c] || '#5B8FF9')
    // 图标 shape
    if (useIcons.value) {
      iconLayer.shape('category', categories.value)
    } else {
      iconLayer.shape('circle')
    }
    iconLayer.active(true)
    iconLayer.style({ opacity: 0.9, stroke: '#fff', strokeWidth: 1 })
    if (showIconLayer.value) {
      iconLayer.show()
    } else {
      iconLayer.hide()
    }
  }
  // 文字层
  if (textLayer) {
    textLayer.source(filteredData.value, {
      parser: { type: 'json', x: 'lng', y: 'lat' }
    })
    textLayer.shape('name', 'text')
    textLayer.size(12)
    textLayer.color('#222')
    textLayer.style({
      textOffset: [0, 16],
      textAnchor: 'top',
      padding: [2, 2],
      stroke: '#fff',
      strokeWidth: 2
    })
    if (showTextLayer.value) {
      textLayer.show()
    } else {
      textLayer.hide()
    }
  }
}

// 自动定位到数据
function fitToData() {
  if (!scene || !filteredData.value.length) return
  let minLng = 180, minLat = 90, maxLng = -180, maxLat = -90
  filteredData.value.forEach(d => {
    minLng = Math.min(minLng, d.lng)
    maxLng = Math.max(maxLng, d.lng)
    minLat = Math.min(minLat, d.lat)
    maxLat = Math.max(maxLat, d.lat)
  })
  if (minLng < maxLng && minLat < maxLat) {
    if (scene.fitBounds) {
      scene.fitBounds([[minLng, minLat], [maxLng, maxLat]])
    } else {
      scene.setCenter([(minLng + maxLng) / 2, (minLat + maxLat) / 2])
      scene.setZoom(13)
    }
  }
}

const useIcons = ref(true)
onMounted(async () => {
  await loadData()
  scene = new Scene({
    id: 'lab8-map',
    map: new GaodeMap({
      style: mapStyle,
      center: mapCenter,
      zoom: mapZoom,
      token: amapToken,
      pitch: 0
    })
  })
  scene.on('loaded', () => {
    // 注册本地图标
    Object.entries(categoryIcons).forEach(([cat, url]) => {
      scene.addImage(cat, url)
    })
    // 图标层
    iconLayer = new PointLayer({ name: 'iconLayer' })
      .source(filteredData.value, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('category', categories.value)
      .size(enableSizeMapping.value ? ['value', [6, 24]] : 12)
      .color('category', c => categoryColors[c] || '#5B8FF9')
      .active(true)
      .style({ opacity: 0.9, stroke: '#fff', strokeWidth: 1 })
    // 交互
    iconLayer.on('click', e => {
      selectedFeature.value = e.feature
    })
    // hover tooltip
    scene.addLayer(iconLayer)
    new LayerPopup({
      items: [
        {
          layer: iconLayer,
          fields: [
            { field: 'name', formatField: '名称' },
            { field: 'category', formatField: '类别' },
            { field: 'value', formatField: '热度/值' }
          ]
        }
      ]
    }).addTo(scene)
    // 文字层
    textLayer = new PointLayer({ name: 'textLayer' })
      .source(filteredData.value, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('name', 'text')
      .size(12)
      .color('#222')
      .style({
        textOffset: [0, 16],
        textAnchor: 'top',
        padding: [2, 2],
        stroke: '#fff',
        strokeWidth: 2
      })
    scene.addLayer(textLayer)
    updateLayers()
    fitToData()
  })
})

onBeforeUnmount(() => {
  if (scene) {
    scene.destroy()
    scene = null
    iconLayer = null
    textLayer = null
  }
})
</script>

<style scoped>

.lab8-container {
  background: var(--bg);
  min-height: 100vh;
}
.lab8-main {
  display: flex;
  flex-direction: row;
  height: calc(100vh - 64px);
}
.lab8-sidebar {
  width: 260px;
  background: var(--panel);
  color: var(--text);
  padding: 20px 16px;
  border-right: 1px solid var(--border);
  overflow-y: auto;
  box-shadow: var(--shadow-sm);
}
.lab8-sidebar h3,
.lab8-sidebar h4 {
  color: var(--text);
}
.lab8-sidebar label {
  color: var(--text-secondary);
}
.lab8-map-section {
  flex: 1;
  position: relative;
}
.lab8-map {
  width: 100%;
  height: 70vh;
  min-height: 500px;
  border-radius: var(--radius-lg);
  margin: 24px 16px;
  box-shadow: var(--shadow-lg);
  background: var(--panel);
  border: 2px dashed var(--border);
}
.lab8-map-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70vh;
  min-height: 500px;
  color: #c00;
  font-size: 1.2em;
  background: var(--panel);
  border-radius: var(--radius-lg);
  margin: 24px 16px;
  box-shadow: var(--shadow-lg);
  border: 2px dashed var(--border);
}
</style>
