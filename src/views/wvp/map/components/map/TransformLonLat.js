import { fromLonLat as projFromLonLat, toLonLat as projToLonLat } from 'ol/proj'
import gcoord from 'gcoord'

// Depends on window.coordinateSystem being set by MapComponent.initMap().
// Supports single map instance per page; multiple instances would need a different approach.

export function fromLonLat(coordinate) {
  if (window.coordinateSystem === 'GCJ02') {
    return projFromLonLat(gcoord.transform(coordinate, gcoord.WGS84, gcoord.GCJ02))
  } else {
    return projFromLonLat(coordinate)
  }
}

export function toLonLat(coordinate) {
  if (window.coordinateSystem === 'GCJ02') {
    return gcoord.transform(projToLonLat(coordinate), gcoord.GCJ02, gcoord.WGS84)
  } else {
    return projToLonLat(coordinate)
  }
}
