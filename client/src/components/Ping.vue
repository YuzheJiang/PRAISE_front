<template>
<div id="app" class="container-fluid">
  <div class="row">
    <div class="col-lg-6">
      <div class="text-center">
        <button type="button" class="btn btn-primary btn-1" id="cmaq">CMAQ</button>
        <button type="button" class="btn btn-primary btn-2" id="our">Our Method</button>
      </div>

      <div class="row">
        <label for="formControlRange" class='label_date'></label>
        <input type="range" class="form-control-range" id="formControlRange">
      </div>

      <div class="row">
        <div class="col-lg-6" id="label_1_input">
          <label id="label_1" class='label_text'>Future Hour :</label>
          <input type="hours" class="form-control" id="time_in_hour" placeholder="Enter hour">
        </div>
        <div class="col-lg-6" id="button_2_input">
          <button type="button" class="btn btn-primary btn-3" id="animate">Animate</button>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-6" id="label_2_input">
          <label id="label_2" class='label_text'>Station :</label>
          <input type="code" class="form-control" id="st_code" placeholder="Enter station">
        </div>
        <div class="col-lg-6" id="label_3_input">
          <label id="label_3" class='label_text'>On-site place :</label>
          <input type="code" class="form-control" id="on_code" placeholder="Enter onsite">
        </div>
      </div>

      <div class="row">
        <div class="col-lg-6" id="Line_chart_1">
          <p>Line chart 1</p>
        </div>
        <div class="col-lg-6" id="Line_chart_2">
          <p>Line chart 2</p>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-6" id="label_4_input">
          <label id="label_4" class='label_text'>IOA :</label>
          <input type="code" class="form-control" id="IOA_value" placeholder="IOA">
        </div>
        <div class="col-lg-6" id="label_5_input">
          <input type="code" class="form-control" id="IOA_value" placeholder="IOA">
        </div>
      </div>

      <div class="row">
        <div class="col-lg-6" id="label_6_input">
          <label id="label_5" class='label_text'>RMSE :</label>
          <input type="code" class="form-control" id="RMSE_value" placeholder="IOA">
        </div>
        <div class="col-lg-6" id="label_6_input">
          <input type="code" class="form-control" id="RMSE_value" placeholder="IOA">
        </div>
      </div>
    </div>
    <div class="col-lg-6">
      <div id="filter">
        <label id="label_6" class='filter_value'>Pollutant:</label>
        <select name="Please select a pollutant" @change="onchange()"
              class="filter_option" v-model="selected">
          <option>NO2</option>
          <option>O3</option>
          <option>PM10</option>
          <option>PM25</option>
         <option>SO2</option>
        </select>
    </div>
      <div id="map">
        <p>Here goes the map</p>
      </div>
    </div>
  </div>
</div>
</template>
<script>
import * as d3 from 'd3';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

export default {
  data() {
    return {
      selected: 'PM25',
      map: null,
      tileLayer: null,
      geodata: [],
    };
  },
  methods: {
    // onchange() {
    //   console.log(this.selected);
    // },
    getdata() {
      const colors = d3.scaleQuantize()
        .domain([0, 25])
        .range(['#c4e6c3', '#96d2a4', '#6dbc90', '#4da284', '#36877a', '#266b6e', '#1d4f60']);
      const path = 'http://localhost:5000/data';
      axios.get(path)
        .then((res) => {
          this.geodata = res.data;
          this.geodata.forEach((layer) => {
            const val = layer.PM25;
            L.polygon(layer.coord, {
              fillColor: colors(layer.PM25), color: 'grey', weight: 1, opacity: 0, fillOpacity: 0.5,
            }).bindTooltip(val.toString()).addTo(this.map);
          });
        })
        .catch((error) => {
          console.error(error);
        });
    },
    initMap() {
      this.map = L.map('map').setView([22.34385, 114.1289], 10);
      this.tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
        { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>' });
      this.tileLayer.addTo(this.map);
    },
  },
  mounted() {
    this.initMap();
    this.getdata();
  },
};
</script>
<style>
#cmaq,
#our {
  margin-top: 30px;
  margin-right: 10px;
  margin-left: 60px;
  width: 150px;
}

#label_1,
#time_in_hour {
  margin-top: 10px;
  margin-left: 20px;
  padding-left: 1%;
  padding-right: 1%;
}

.form-control {
  width: 130px;
}

#animate {
  margin-top: 10px;
  margin-left: 40px;
}

#Line_chart_1,
#Line_chart_2 {
  margin-top: 40px;
  text-align: center;
  height: 350px;
}

.label_text,
.form-control {
  display: inline;
  text-align: center;
  margin-top: 30px;
  margin-left: 20px;
}

.label_date,
.form-control-range {
  display: inline;
  text-align: center;
  margin-top: 20px;
  margin-left: 20px;
}

#map {
  height: 600px;
  width: 700px;
  margin-top: 100px;
  margin-left: 60px;
  text-align: center;
}

#filter{
  height: 10px;
  width: 10px;
  margin-top: 10px;
  margin-left: 500px;
  text-align: center;
}

</style>
