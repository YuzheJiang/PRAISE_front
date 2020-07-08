<template>
<div class="row">
      <div class="col-md-6 border border-dark rounded" id="column_one">
        <div class="row" id="first_row">
          <div class="col-md-6 seperate">
            <div class="row">
              <div class="col-md-6">
                <label class="labels text">Date:</label>
              </div>
              <div class="col-md-6">
                <date-picker v-model="date" lang="en" id="date-picker"
                valueType="format" format="YYYY-MM-DD"></date-picker>
              </div>
            </div>
          </div>
          <div class="col-md-6 seperate">
            <div class="row">
              <div class="col-md-6">
                <label class="labels text">Pollutant:</label>
              </div>
              <div class="col-md-6">
                <select name="Please select a pollutant"
                    id="filter_option" v-model="selected">
                  <option v-for="Pollutant_name in Pollutant_names"
                          v-bind:key="Pollutant_name.name">
                        {{ Pollutant_name.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <hr>
        <div class="row" id="second_row">
          <div class="col-md-6 seperate">
            <div class="row">
              <div class="col-md-6">
                <label class="labels text">Method:</label>
              </div>
              <div class="col-md-6">
                <select name="Please select a pollutant"
                  id="filter_option" v-model="Method_name">
                  <option v-for="Method in Methods" v-bind:key="Method.name">
                        {{ Method.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="row">
              <div class="col-md-6">
                <label class="labels text">Future Hour:</label>
              </div>
              <div class="col-md-6">
                <select name="Please select a pollutant"
                  id="filter_option" v-model="hour">
                  <option v-for="Future_hour in Future_hours" v-bind:key="Future_hour.hour">
                        {{ Future_hour.hour }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
         <hr>
        <div class="row" id="third_row">
            <div class="col-md-6">
              <button type="button" class="button_1 btn btn-dark text"
              @click="getSubmit($event)"> Submit </button>
          </div>
          <div class="col-md-6">
            <button type="button" class="button_2 btn btn-dark text"
            @click="getAnimate($event)"> Animate </button>
          </div>
        </div>
        <hr>
        <h2 id="heading"> </h2>
        <div id="map">
          Here goes the map
        </div>
        <p id='legend_name' class='legend_head'> </p>
        <div id="legend"></div>
    </div>
      <div class="col-md-6 border border-dark rounded">
        <AccView/>
      </div>
    </div>
</template>
<script>
import * as d3 from 'd3';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import AccView from './AccView.vue';

export default {
  name: 'MapView',
  components: {
    AccView,
  },
  data() {
    return {
      Pollutant_names: [
        { name: 'NO2' },
        { name: 'O3' },
        { name: 'PM10' },
        { name: 'PM25' },
        { name: 'SO2' },
      ],
      Future_hours: [
        { hour: '0' },
        { hour: '1' },
        { hour: '2' },
        { hour: '3' },
        { hour: '4' },
        { hour: '5' },
        { hour: '6' },
        { hour: '7' },
        { hour: '8' },
        { hour: '9' },
        { hour: '10' },
        { hour: '11' },
        { hour: '12' },
      ],
      Methods: [
        { name: 'CMAQ' },
        { name: 'Our_method' },
      ],
      selected: 'PM25',
      Method_name: 'CMAQ',
      hour: 0,
      date: null,
      map: null,
      tileLayer: null,
      geodata: [],
      polygon_data: [],
      colorData: [{ offset: '0%', color: '#c4e6c3' }, { offset: '18.28%', color: '#96d2a4' },
        { offset: '28.56%', color: '#6dbc90' }, { offset: '42.84%', color: '#4da284' },
        { offset: '57.12%', color: '#36877a' }, { offset: '71.4%', color: '#266b6e' },
        { offset: '100%', color: '#1d4f60' }],
      extent: [0, 60],
    };
  },
  methods: {
    initMap() {
      this.map = L.map('map').setView([22.34385, 114.1289], 10);
      this.tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
        { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>' });
      this.tileLayer.addTo(this.map);
    },
    changeName() {
      const head = this.Method_name;
      const legName = this.selected;
      document.getElementById('heading').innerHTML = head.concat('  Result');
      document.getElementById('legend_name').innerHTML = legName.concat('  Concentration');
    },
    drawGrids(response) {
      this.clearLayer();
      let polygon;
      const colors = d3.scaleQuantize()
        .domain(this.extent)
        .range(this.colorData.map((d) => d.color));
      this.geodata = response.data;
      this.geodata.forEach((layer) => {
        const val = layer.pollutant;
        polygon = L.polygon(layer.coord, {
          fillColor: colors(layer.pollutant), color: 'grey', weight: 0, opacity: 0, fillOpacity: 0.5,
        }).bindTooltip(val.toString());
        polygon.addTo(this.map);
        this.polygon_data.push(polygon);
      });
    },
    getSubmit() {
      this.changeName();
      const path = 'http://127.0.0.1:5000/data';
      axios.post(path, {
        pollutants: this.selected,
        Result_data: this.result_data,
        Future_hour: this.hour,
        Date: this.date,
      })
        .then((res) => {
          this.drawGrids(res);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    getLegend() {
      const xScale = d3.scaleLinear()
        .range([0, 250 - (9 * 2)])
        .domain(this.extent);
      const xAxis = d3.axisBottom(xScale)
        .tickSize(8 * 2)
        .tickValues(this.extent);
      const svg = d3.select('#legend')
        .append('svg')
        .attr('width', 250)
        .attr('height', 50);
      const g = svg.append('g').attr('transform', 'translate(4, 20)');
      const defs = svg.append('defs');
      const linearGradient = defs.append('linearGradient').attr('id', 'myGradient');
      linearGradient.selectAll('stop')
        .data(this.colorData)
        .enter().append('stop')
        .attr('offset', (d) => d.offset)
        .attr('stop-color', (d) => d.color);
      g.append('rect')
        .attr('width', 250 - (9 * 2))
        .attr('height', 8)
        .style('fill', 'url(#myGradient)');
      g.append('g')
        .call(xAxis);
    },
    clearLayer() {
      this.polygon_data.forEach((layer) => {
        this.map.removeLayer(layer);
      });
    },
    getAnimate() {
      const path = 'http://127.0.0.1:5000/data';
      const array = this.Pollutant_names;
      const interval = 2000;
      array.forEach((el, index) => {
        setTimeout(() => {
          this.selected = el.name;
          axios.post(path, {
            pollutants: this.selected,
          })
            .then((res) => {
              this.drawGrids(res);
            })
            .catch((error) => {
              console.error(error);
            });
        }, index * interval);
      });
    },
    getButtonName(name) {
      this.result_data = name;
    },
  },
  mounted() {
    this.initMap();
    this.getSubmit();
    this.getLegend();
  },
};
</script>
<style>
/* Column 1 */
/* ids */
#first_row, #second_row, #third_row{
  padding: 1% 0 1% 2%;
  text-align: left;
}
#filter_option{
  margin-top: 5%;
}
#date-picker{
  width: 130px;
}
#date{
  padding-top: 4%;
}
#filter {
  padding-top: 5%;
  padding-left: 40%;
}
#map {
  text-align: center;
  height: 450px;
  width: 650px;
  margin: 3% 10%;
}
#legend{
  margin-left: 10%;
  text-align: left;
}
/* tags */
hr{
  margin: 0;
  width: 102%;
}
p{
  text-align: center;
  margin: 2%;
}
.p1{
  width: 430px;
  margin-right: 10px;
  text-align: center;
}
/* class */
.button_1{
  margin: 0 55% ;
  width: 130px;
}
.button_2{
  margin: 0 10%;
  width: 130px;
}
.labels{
  margin-top: 5%;
}
.seperate{
  border-right: 1px solid lightgrey;
}
.text{
  font-weight: bold;
  font-size: 17px;
}
.legend_head{
  padding-left: 11%;
  margin: 0;
  text-align: left;
}
</style>
