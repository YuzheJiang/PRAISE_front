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
            <p id="legend_name"></p>
            <div class = 'legend' id='legend'></div>
          </div>
        </div>
        <div class='map' id='map_1'></div>
      </div>
      <hr>
      <div class="col-12">
        <div class="row">
          <div class="col-md-3 second_map"></div>
          <div class="col-md-5 second_map">
            <h4 id='heading_2'>Our_Method Result</h4>
          </div>
          <div class="col-md-4 second_map">
            <p>Error Type</p>
            <div class = 'legend' id='legend_2'></div>
          </div>
        </div>
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
  name: 'MapView',
  data() {
    return {
      colorData: [{ offset: '0%', color: '#ffffff' }, { offset: '18.28%', color: '#edf8fb' },
        { offset: '28.56%', color: '#ccece6' }, { offset: '42.84%', color: '#99d8c9' },
        { offset: '57.12%', color: '#66c2a4' }, { offset: '71.4%', color: '#2ca25f' },
        { offset: '100%', color: '#006d2c' }],
      extent: [0, 80],
      array: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
      index: 12,
      obStation: null,
      map1: null,
      map2: null,
      flag: false,
      polygon_data_1: [],
      polygon_data_2: [],
      geodata: null,
      mapdata: null,
      obs_data: null,
    };
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
    drawGrids(map) {
      const path = 'http://127.0.0.1:5000/gridData';
      axios.get(path)
        .then((res) => {
          let polygon;
          this.geodata = res.data;
          this.geodata.forEach((layer) => {
            polygon = L.polygon(layer.coord, {
              color: 'lightgrey',
              opacity: 0.0,
              x: layer.x,
              y: layer.y,
            });
            if (map === 'CMAQ') {
              polygon.addTo(this.map1);
              this.polygon_data_1.push(polygon);
            } else {
              polygon.addTo(this.map2);
              this.polygon_data_2.push(polygon);
            }
          });
        })
        .catch((error) => {
          console.error(error);
        });
    },
    obsData(pollutant, newDate) {
      const path = 'http://127.0.0.1:5000/obsData';
      axios.post(path, {
        pollutants: pollutant,
        Date: newDate,
      })
        .then((res) => {
          this.obs_data = res.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    getData(pollutant, hour, newDate) {
      this.obsData(pollutant, newDate);
      const path = 'http://127.0.0.1:5000/dummyData';
      axios.post(path, {
        pollutants: pollutant,
        Date: newDate,
      })
        .then((res) => {
          this.colorMap(res.data, pollutant, hour);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    colorMap(data, pollutant, hour) {
      this.clearColor();
      this.changeName(pollutant, hour);
      let polygonData = null;
      const colors = d3.scaleQuantize()
        .domain(this.extent)
        .range(this.colorData.map((d) => d.color));
      const methods = ['CMAQ', 'Our_method'];
      this.mapdata = data;
      let newData = null;
      methods.forEach((el) => {
        let m = 0;
        const name = el;
        if (name === 'CMAQ') {
          polygonData = this.polygon_data_1;
          newData = this.mapdata.CMAQ[hour];
        } else {
          polygonData = this.polygon_data_2;
          newData = this.mapdata.Our_method[hour];
        }
        for (let i = 0; i < 41; i += 1) {
          for (let j = 0; j < 64; j += 1) {
            const index = j + m;
            const val = newData[i][j].toFixed(2);
            polygonData[index].setStyle({
              fillColor: null, color: colors(val), fillOpacity: 0.4,
            }).bindTooltip(`${name}: ${val.toString()}`);
          }
          m += 64;
        }
        this.obs_data[hour].forEach((element) => {
          const value = newData[element.y][element.x].toFixed(2);
          polygonData.forEach((layer) => {
            if (element.x === layer.options.x && element.y === layer.options.y) {
              const error = (value - element.Pollutant.toFixed(2)).toFixed(2);
              if (element.Pollutant.toFixed(2) > value) {
                layer.setStyle({
                  fillColor: 'red', color: 'yellow', fillOpacity: 0.5,
                }).bindTooltip(`${name}: ${value.toString()} OBS:
        ${element.Pollutant.toFixed(2).toString()} <br>Error: ${error}`);
              } else {
                layer.setStyle({
                  fillColor: 'red', color: 'blue', fillOpacity: 0.5,
                }).bindTooltip(`${name}: ${value.toString()} OBS:
        ${element.Pollutant.toFixed(2).toString()} <br>Error: ${error}`);
              }
            }
          });
        });
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
    drawLegend2(divID) {
      const svg = d3.select(divID)
        .append('svg')
        .attr('width', 150)
        .attr('height', 60);
      const nameData = [{ name: 'OverEst_error', color: 'yellow' },
        { name: 'UnderEst_error', color: 'blue' }];
      nameData.forEach((l, i) => {
        const g = svg.append('g').attr('transform', `translate(4, ${(i * 20) + 5})`);
        g.append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .style('fill', l.color)
          .style('opacity', 0.5);
        g.append('text')
          .attr('x', 125)
          .attr('y', 10)
          .attr('text-anchor', 'end')
          .style('text-transform', 'capitalize')
          .text(l.name);
      });
    },
    clearColor() {
      this.polygon_data_1.forEach((element) => {
        element.setStyle({ fillColor: null });
      });
    },
    checkCondition(pol, olPol, hr, nD, oD) {
      this.changeName(pol, hr);
      if (oD === nD && olPol === pol) {
        this.colorMap(this.mapdata, pol, hr);
      } else {
        this.getData(pol, hr, nD);
      }
    },
    doAnimation(j, pol, olPol, nD, oD) {
      let x = j;
      setTimeout(() => {
        if (this.flag === true) {
          const hour = this.array[x];
          this.checkCondition(pol, olPol, hour, nD, oD);
          x -= 1;
          if (x >= 0) {
            this.index = x;
            this.doAnimation(x, pol, olPol, nD, oD);
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
    submitFunc(pol, olPol, hr, nD, oD) {
      if (this.index === 0) {
        this.index = 12;
      } else {
        this.index = this.array.indexOf(parseInt(hr, 10));
      }
      this.checkCondition(pol, olPol, hr, nD, oD);
    },
    playFunc(pol, olPol, nD, oD) {
      this.flag = true;
      this.doAnimation(this.index, pol, olPol, nD, oD);
    },
    stopFunc() {
      this.flag = false;
    },
  },
  mounted() {
    this.initMap();
    this.drawLegend('#legend');
    this.drawLegend2('#legend_2');
    this.drawGrids('CMAQ');
    this.drawGrids('Our_Method');
    EventBus.$on('clicked-event', (pollutant, oldPollutant, hour, newDate, oldDate) => {
      if (this.mapdata === null) {
        this.getData(pollutant, hour, newDate);
      } else {
        this.submitFunc(pollutant, oldPollutant, hour, newDate, oldDate);
      }
    });
    EventBus.$on('play-event', (pollutant, oldPollutant, newDate, oldDate) => {
      this.playFunc(pollutant, oldPollutant, newDate, oldDate);
    });
    EventBus.$on('stop-event', () => {
      this.stopFunc();
    });
  },
};
</script>

<style>
/* tags */
/* class */
.col-12{
  height: 50vh;
}
.first_map,.second_map{
  padding: 0;
}
.legend{
  width: 180px;
  height: 30px;
  margin-left: 45px;
}
/* ids */
#heading_1, #heading_2{
  width: 250px;
  margin: 25px 0 0 45px;
}
/* #heading_2{
  width: 250px;
  margin: 15px 0 0 195px;
} */
#Future_hour{
  text-align: left;
  width: 105px;
  margin: 20px 0 0 5px;
}
#legend_name{
  text-align: left;
  margin: 5px 0 0 47px;
  font-size: 12px;
  width: 250px;
}
#map_1, #map_2{
  margin: 10px 0 0 10px;
  height: 350px;
  width: 630px;
}
/* #map_2{
  margin: 50px 0 0 10px;
  height: 350px;
  width: 630px;
} */
</style>
