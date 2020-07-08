<template>
<div class="AccView">
    <div class="row" id="First_row">
      <div class="col-md-6 seperate">
        <div class="row">
          <div class="col-md-6">
            <label class="labels text">Station:</label>
          </div>
          <div class="col-md-6">
            <input class="user_input form-control"
            @keyup.enter = "renderChart1()" v-model="Station_code"
            id="Station_Code" placeholder="Enter Station">
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="row">
          <div class="col-md-6">
            <label class="labels text">On-site:</label>
          </div>
          <div class="col-md-6">
            <input class="user_input form-control"
            @keyup.enter = "renderChart2()" v-model="Onsite_code"
            id="Onsite_Code" placeholder="Enter On-site">
          </div>
        </div>
      </div>
    </div>
    <hr>
    <div class="row" id="Second_row">
      <div class="col-lg-6 seperate" id='lineChart1'>
      </div>
      <div class="col-lg-6" id='lineChart2'>
      </div>
    </div>
    <hr>
    <div class="row" id="Third_row">
      <div class="col-md-6 seperate">
        <div class="row">
          <div class="col-md-6">
            <label class="labels text">IOA:</label>
          </div>
          <div class="col-md-6">
            <p>IOA</p>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <label class="labels text">RMSE:</label>
          </div>
          <div class="col-md-6">
            <p>RMSE</p>
          </div>
        </div>
      </div>
      <div class="col-md-6 seperate">
        <div class="row">
            <p class="p1">IOA</p>
        </div>
        <div class="row">
            <p class="p1">RMSE</p>
        </div>
      </div>
    </div>
</div>
</template>
<script>
import * as d3 from 'd3';
import axios from 'axios';

export default {
  name: 'AccView',
  data() {
    return {
      Station_code: 'AA',
      Onsite_code: 'AA',
    };
  },
  methods: {
    getLineChart(divID, svgID, response) {
      d3.select(`#${svgID}`).remove();
      const margin = {
        top: 30, right: 20, bottom: 60, left: 30,
      };
      const width = 400 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;

      const svg = d3.select(divID).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('id', svgID)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      const n = 21;

      const xScale = d3.scaleLinear()
        .domain([0, n - 1])
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0]);

      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

      svg.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(yScale));

      const lineData = response.data;

      const line = d3.line()
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.y))
        .curve(d3.curveMonotoneX);
      svg.append('path')
        .datum(lineData)
        .attr('class', 'line')
        .attr('d', line);
      svg.selectAll('.dot')
        .data(lineData)
        .enter().append('circle') // Uses the enter().append() method
        .attr('class', 'dot') // Assign a class for styling
        .attr('cx', (d, i) => xScale(i))
        .attr('cy', (d) => yScale(d.y))
        .attr('r', 5);
    },
    renderChart1() {
      const path = 'http://127.0.0.1:5000/lineChart1';
      axios.post(path, {
        St_code: this.Station_code,
      })
        .then((res) => {
          this.getLineChart('#lineChart1', 'chart1', res);
        });
    },
    renderChart2() {
      const path = 'http://127.0.0.1:5000/lineChart2';
      axios.post(path, {
        Onsite_code: this.Onsite_code,
      })
        .then((res) => {
          this.getLineChart('#lineChart2', 'chart2', res);
        });
    },
  },
  mounted() {
    this.renderChart1();
    this.renderChart2();
  },
};
</script>
<style>
/* Column 2 */
/* ids */
#lineChart1, #lineChart2 {
  height: 500px;
  text-align: center;
}
#Third_row, #Second_row, #First_row{
  padding: 5% 0;
}
/* tag */
h2 {
  margin : 5% 0 0 0;
}
/* class */
.line {
    fill: none;
    stroke: #ffab00;
    stroke-width: 3;
}
.overlay {
  fill: none;
  pointer-events: all;
}
/* Style the dots by assigning a fill and stroke */
.dot {
    fill: #ffab00;
    stroke: #fff;
}
</style>
