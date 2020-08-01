<template>
  <div class="row">
      <div class="col-12">
         <div class="row">
           <div class="col-md-3 first_map">
            <h6 id="Future_hour">Future hour:</h6>
          </div>
          <div class="col-md-5 first_map">
            <h4 id='heading_1'>CMAQ Result</h4>
          </div>
          <div class="col-md-4 first_map">
            <p id="legend_name">PM10</p>
            <div class = 'legend' id='legend'></div>
          </div>
        </div>
        <div class='map' id='map_1'></div>
      </div>
      <hr>
      <div class="col-12">
         <h4 id='heading_2'>Our Method Result</h4>
         <div class='map' id='map_2'></div>
      </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import EventBus from '@/eventBus';

export default {
  name: 'mappyview',
  data() {
    return {
      colorData: [{ offset: '0%', color: '#f3e79b' }, { offset: '18.28%', color: '#fac484' },
        { offset: '28.56%', color: '#f8a07e' }, { offset: '42.84%', color: '#eb7f86' },
        { offset: '57.12%', color: '#ce6693' }, { offset: '71.4%', color: '#a059a0' },
        { offset: '100%', color: '#5c53a5' }],
      extent: [0, 80],
      array: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
      index: 12,
      Method1: 'CMAQ',
      Method2: 'Our_Method',
      obStation: null,
      map1: null,
      map2: null,
      flag: false,
      polygon_data: [],
      geodata: null,
    };
  },
  watch: {
    date(newValue, oldValue) {
      this.oldDate = oldValue;
    },
  },
  methods: {
    initMap() {
      this.map1 = L.map('map_1').setView([22.34385, 114.1289], 10);
      this.map2 = L.map('map_2').setView([22.34385, 114.1289], 10);
      L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
        { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>' }).addTo(this.map1);
      L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
        { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>' }).addTo(this.map2);
    },
    drawGrids(data, hr, map) {
      if (map === 'CMAQ') {
        this.mappy = this.map1;
      } else {
        this.mappy = this.map2;
      }
      this.clearLayer();
      let polygon;
      const colors = d3.scaleQuantize()
        .domain(this.extent)
        .range(this.colorData.map((d) => d.color));
      this.geodata = data;
      this.geodata.forEach((l) => {
        const layer = l[hr];
        const val = layer.pollutant.toFixed(2);
        const obsVal = layer.Obs_con;
        if (layer.data === 'Observatory_data') {
          polygon = L.polygon(layer.coord, {
            fillColor: 'red', weight: 0, opacity: 0, fillOpacity: 0.5,
          }).bindTooltip(`${map}: ${val.toString()}\n Obs: ${obsVal.toString()}`);
        } else {
          polygon = L.polygon(layer.coord, {
            fillColor: colors(layer.pollutant), weight: 0, opacity: 0, fillOpacity: 0.5,
          }).bindTooltip(`${map}: ${val.toString()}`);
        }
        polygon.addTo(this.mappy);
        this.polygon_data.push(polygon);
      });
    },
    drawLegend(divID) {
      const xScale = d3.scaleLinear()
        .range([0, 180 - (9 * 2)])
        .domain(this.extent);
      const xAxis = d3.axisBottom(xScale)
        .tickSize(8 * 2)
        .tickValues(this.extent);
      const svg = d3.select(divID)
        .append('svg')
        .attr('width', 180)
        .attr('height', 35);
      const g = svg.append('g').attr('transform', 'translate(3, 5)');
      const defs = svg.append('defs');
      const linearGradient = defs.append('linearGradient').attr('id', 'myGradient');
      linearGradient.selectAll('stop')
        .data(this.colorData)
        .enter().append('stop')
        .attr('offset', (d) => d.offset)
        .attr('stop-color', (d) => d.color);
      g.append('rect')
        .attr('width', 180 - (9 * 2))
        .attr('height', 8)
        .style('fill', 'url(#myGradient)');
      g.append('g')
        .call(xAxis);
    },
    clearLayer() {
      this.polygon_data.forEach((layer) => {
        this.map1.removeLayer(layer);
      });
    },
    checkCondition(pol, hr, nD, oD, map) {
      this.changeName(pol, hr);
      if (oD === nD) {
        this.drawGrids(this.geodata, hr, map);
      } else {
        this.getdata(pol, hr, nD);
      }
    },
    getdata(pol, hr, nD, method) {
      const path = 'http://127.0.0.1:5000/data';
      axios.post(path, {
        Method: method,
        pollutants: pol,
        Date: nD,
        Future_hour: hr,
      })
        .then((res) => {
          if (method === 'CMAQ') {
            console.log(res.data);
            this.drawGrids(res.data, hr, this.Method1);
          } else {
            this.drawGrids(res.data, hr, this.Method2);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    doAnimation(j, pol, nD, oD) {
      let x = j;
      setTimeout(() => {
        if (this.flag === true) {
          const hour = this.array[x];
          this.checkCondition(pol, hour, nD, oD);
          x -= 1;
          if (x >= 0) {
            this.index = x;
            this.doAnimation(x, pol, nD, oD);
          }
        }
      }, 1000);
    },
    changeName(pol, hr) {
      const legName = pol;
      const fhName = 'Future_hour:';
      document.getElementById('legend_name').innerHTML = legName.concat('  Concentration');
      document.getElementById('Future_hour').innerHTML = fhName.concat(hr);
    },
    submitFunc(pol, hr, nD, oD, map) {
      if (this.index === 0) {
        this.index = 12;
      } else {
        this.index = this.array.indexOf(parseInt(hr, 10));
      }
      this.checkCondition(pol, hr, nD, oD, map);
    },
    playFunc(pol, nD, oD) {
      this.flag = true;
      this.doAnimation(this.index, pol, nD, oD);
    },
    stopFunc() {
      this.flag = false;
    },
  },
  mounted() {
    this.initMap();
    this.drawLegend('#legend');
    EventBus.$on('clicked-event', (pollutant, hour, newDate, oldDate) => {
      if (this.geodata === null) {
        this.changeName(pollutant, hour);
        this.getdata(pollutant, hour, newDate, this.Method1);
      } else {
        this.submitFunc(pollutant, hour, newDate, oldDate, this.Method1);
      }
    });
    EventBus.$on('play-event', (pollutant, newDate, oldDate) => {
      this.playFunc(pollutant, newDate, oldDate);
    });
    EventBus.$on('stop-event', () => {
      this.stopFunc();
    });
  },
};
</script>

<style>
/* tags */
/* h4{
  text-align: left;
  margin: 10px 0 0 250px;
  width: 250px;
} */
/* class */
.col-12{
  height: 50vh;
}
.first_map{
  padding: 0;
}
.legend{
  width: 180px;
  margin-left: 45px;
}
/* ids */
#heading_1{
  width: 150px;
  margin: 25px 0 0 95px;
}
#heading_2{
  width: 250px;
  margin: 15px 0 0 195px;
}
#Future_hour{
  text-align: left;
  width: 105px;
  margin: 20px 0 0 5px;
}
#legend_name{
  text-align: left;
  margin: 5px 0 0 47px;
  font-size: 12px;
  width: 150px;
}
#map_1{
  margin: 10px 0 0 10px;
  height: 350px;
  width: 630px;
}
#map_2{
  margin: 50px 0 0 10px;
  height: 350px;
  width: 630px;
}
</style>
