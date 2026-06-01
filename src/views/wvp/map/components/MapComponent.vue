<template>
  <div id="mapContainer" ref="mapContainer" style="width: 100%;height: 100%;" />
</template>

<script>
import 'ol/ol.css'
import Map from 'ol/Map'
import OSM from 'ol/source/OSM'
import XYZ from 'ol/source/XYZ'
import VectorSource from 'ol/source/Vector'
import Tile from 'ol/layer/Tile'
import WebGLVectorLayer from 'ol/layer/WebGLVector'
import View from 'ol/View'
import Feature from 'ol/Feature'
import Overlay from 'ol/Overlay'
import { Point } from 'ol/geom'
import { get as getProj } from 'ol/proj'
import { containsCoordinate } from 'ol/extent'
import { defaults as defaultInteractions } from 'ol/interaction'
import { fromLonLat, toLonLat } from './map/TransformLonLat'
import { getUid } from 'ol'
import { getMapConfig } from '@/api/wvp/channel'

const SPRITE_ICON_SRC = '/static/images/gis/sprite.png'

export default {
  name: 'MapComponent',
  data() {
    return {
      olMap: null,
      tileLayer: null,
      overlayId: null,
      mapTileList: [],
      mapTileIndex: 0,
      overlayCounter: 0
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    createFeatureFromData(data) {
      const feature = new Feature(new Point(fromLonLat(data.position)))
      feature.setId(data.id)
      feature.setProperties({ status: data.status, customData: data.data })
      return feature
    },
    init() {
      getMapConfig()
        .then(res => {
          const mapConfigList = res.data || res || []
          if (mapConfigList.length === 0) {
            this.mapTileList.push({
              tilesUrl: 'http://webrd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8',
              coordinateSystem: 'GCJ02',
              name: '高德地图'
            })
          } else {
            this.mapTileList = mapConfigList
          }
          this.initMap()
        })
        .catch(() => {
          this.mapTileList.push({
            tilesUrl: 'http://webrd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8',
            coordinateSystem: 'GCJ02',
            name: '高德地图'
          })
          this.initMap()
        })
    },
    initMap() {
      const tileConfig = this.mapTileList[this.mapTileIndex]
      window.coordinateSystem = tileConfig.coordinateSystem
      const center = fromLonLat(tileConfig.center || [116.41020, 39.915119])
      const view = new View({
        center: center,
        zoom: tileConfig.zoom || 10,
        projection: 'EPSG:3857',
        maxZoom: tileConfig.maxZoom || 18,
        minZoom: tileConfig.minZoom || 3
      })

      if (this.mapTileList.length > 0 && this.mapTileList[this.mapTileIndex].tilesUrl) {
        this.tileLayer = new Tile({
          source: new XYZ({
            projection: getProj('EPSG:3857'),
            wrapX: false,
            tileSize: 256,
            url: this.mapTileList[this.mapTileIndex].tilesUrl
          })
        })
      } else {
        this.tileLayer = new Tile({
          preload: 4,
          source: new OSM()
        })
      }

      this.olMap = new Map({
        interactions: defaultInteractions(),
        target: this.$refs.mapContainer,
        layers: [this.tileLayer],
        view: view,
        controls: []
      })

      this.olMap.once('loadend', () => {
        this.olMap.updateSize()
        this.$emit('loaded')
      })

      this.olMap.on('click', event => {
        const features = {}
        const layers = {}
        this.olMap.forEachFeatureAtPixel(event.pixel, (featureAtPixel, layerAtPixel) => {
          if (layerAtPixel) {
            const ol_uid = 'key' + getUid(layerAtPixel)
            layers[ol_uid] = layerAtPixel
            if (Object.hasOwn(features, ol_uid)) {
              features[ol_uid].push(featureAtPixel)
            } else {
              features[ol_uid] = new Array(featureAtPixel)
            }
          }
        })
        for (const key in layers) {
          if (Object.hasOwn(layers, key)) {
            layers[key].dispatchEvent({
              type: 'click',
              event: event,
              features: features[key],
              outParam: { layersCount: Object.keys(layers).length }
            })
          }
        }
      })

      this.olMap.getView().on('change:resolution', () => {
        this.$emit('zoomChange', this.olMap.getView().getZoom())
      })
    },
    getCenter() {
      return toLonLat(this.olMap.getView().getCenter())
    },
    getZoom() {
      return this.olMap.getView().getZoom()
    },
    getZoomExtent() {
      return [this.olMap.getView().getMinZoom(), this.olMap.getView().getMaxZoom()]
    },
    zoomIn() {
      const zoom = this.olMap.getView().getZoom()
      if (zoom >= this.olMap.getView().getMaxZoom()) return
      this.olMap.getView().animate({ zoom: Math.trunc(zoom) + 1, duration: 600 })
    },
    zoomOut() {
      const zoom = this.olMap.getView().getZoom()
      if (zoom <= this.olMap.getView().getMinZoom()) return
      this.olMap.getView().animate({ zoom: Math.trunc(zoom) - 1, duration: 400 })
    },
    panTo(point, zoom, endCallback) {
      const duration = 1500
      var coordinate = fromLonLat(point)
      if (containsCoordinate(this.olMap.getView().calculateExtent(), coordinate)) {
        this.olMap.getView().setCenter(coordinate)
        if (zoom !== this.olMap.getView().getZoom()) {
          this.olMap.getView().setZoom(zoom)
        }
        if (endCallback) endCallback()
        return
      }
      this.olMap.getView().cancelAnimations()
      this.olMap.getView().animate({ center: coordinate, duration: duration })
      this.olMap.getView().animate(
        { zoom: zoom - 2, duration: duration / 2 },
        { zoom: zoom || this.olMap.getView().getZoom(), duration: duration / 2 }
      )
      if (endCallback) setTimeout(endCallback, duration + 100)
    },
    fit(layer) {
      const extent = layer.getSource().getExtent()
      if (extent) {
        this.olMap.getView().fit(extent, { duration: 600, padding: [100, 100, 100, 100] })
      }
    },
    openInfoBox(position, content, offset) {
      if (this.overlayId !== null) {
        this.closeInfoBox(this.overlayId)
        this.overlayId = null
      }
      const id = 'overlay-' + (++this.overlayCounter)
      const overlay = new Overlay({
        id: id,
        autoPan: true,
        autoPanAnimation: { duration: 250 },
        element: content,
        positioning: 'bottom-center',
        offset: offset,
        position: fromLonLat(position)
      })
      this.olMap.addOverlay(overlay)
      this.overlayId = id
      return id
    },
    closeInfoBox(id) {
      if (!id) return
      const overlay = this.olMap.getOverlayById(id)
      if (overlay) this.olMap.removeOverlay(overlay)
      const element = document.getElementById(id)
      if (element) element.remove()
    },
    addPointLayer(data, clickEvent, option) {
      const vectorLayer = this.createPointLayer(data, clickEvent, option)
      this.olMap.addLayer(vectorLayer)
      return vectorLayer
    },
    createPointLayer(data, clickEvent, option) {
      const features = data.map(d => this.createFeatureFromData(d))
      const maxZoom = (option && option.maxZoom) ? option.maxZoom : this.olMap.getView().getMaxZoom()
      const minZoom = (option && option.minZoom) ? option.minZoom : this.olMap.getView().getMinZoom()
      const source = new VectorSource()
      if (features.length > 0) source.addFeatures(features)
      const vectorLayer = new WebGLVectorLayer({
        source: source,
        maxZoom: maxZoom,
        minZoom: minZoom,
        style: {
          'icon-src': SPRITE_ICON_SRC,
          'icon-width': 120,
          'icon-height': 40,
          'icon-size': [40, 40],
          'icon-anchor': [0.5, 1],
          'icon-offset-origin': 'bottom-left',
          'icon-offset': [
            'match',
            ['get', 'status'],
            'ON', [0, 0],
            'OFF', [40, 0],
            'checked', [80, 0],
            [120, 60]
          ]
        }
      })
      if (clickEvent && typeof clickEvent === 'function') {
        vectorLayer.on('click', (event) => {
          if (event.features && event.features.length > 0) {
            clickEvent(event.features.map(f => f.get('customData') || f.customData))
          }
        })
      }
      return vectorLayer
    },
    addFeature(layer, data) {
      layer.getSource().addFeature(this.createFeatureFromData(data))
    },
    removeLayer(layer) {
      this.olMap.removeLayer(layer)
    },
    clearLayer(layer) {
      layer.getSource().clear(true)
    },
    updatePointLayer(layer, data, postponement) {
      layer.getSource().clear(true)
      if (!data || data.length === 0) return
      const features = data.map(d => this.createFeatureFromData(d))
      layer.getSource().addFeatures(features)
      if (postponement) {
        this.olMap.removeLayer(layer)
        setTimeout(() => { this.olMap.addLayer(layer) }, 100)
      }
      return layer
    },
    hasFeature(layer, id) {
      if (layer.getSource && layer.getSource().getFeatureById(id)) {
        return true
      }
      return false
    },
    refreshLayer(layer) {
      if (layer && layer.getSource && layer.getSource()) {
        layer.getSource().refresh()
      }
    },
    getCoordSys() {
      return this.mapTileList[this.mapTileIndex].coordinateSystem
    },
    coordinateInView(point) {
      return containsCoordinate(this.olMap.getView().calculateExtent(), fromLonLat(point))
    },
    updateMapSize() {
      if (this.olMap) {
        this.olMap.updateSize()
      }
    },
    destroy() {
      if (this.olMap) {
        this.olMap.setTarget(null)
        this.olMap = null
        this.tileLayer = null
      }
    }
  }
}
</script>

<style>
#mapContainer .ol-zoom {
  display: none;
}
</style>
