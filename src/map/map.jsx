import Map from "ol/Map"
import View from "ol/View"

  export const map = new Map({
    target: undefined,
    view: new View({
      projection: "EPSG:4326",
      center: [110.3695, -7.7956],
      zoom: 13,
    })
  })


