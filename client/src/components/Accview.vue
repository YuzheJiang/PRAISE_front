<template>
  <div class="row">
      <div class="col-12">
        <h4>AQ Monitoring station</h4>
        <div class='legend_class' id='legend_obs'></div>
        <div class='row'>
          <div class='col-md-12' id='lineChart1'></div>
        </div>
        <div class='row'>
          <div class="col-md-3" id='RMSE_1'></div>
          <div class="col-md-3 seperate" id='IOA_1'></div>
          <div class="col-md-3" id='RMSE_2'></div>
          <div class="col-md-3" id='IOA_2'></div>
        </div>
      </div>
      <hr>
      <div class="col-12">
        <h4>Onsite station</h4>
        <div class='legend_class' id='legend_on'></div>
        <div class='row'>
          <div class='col-md-12' id='lineChart2'></div>
        </div>
        <div class='row'>
          <div class="col-md-3" id='RMSE_1_on'></div>
          <div class="col-md-3 seperate" id='IOA_1_on'></div>
          <div class="col-md-3" id='RMSE_2_on'></div>
          <div class="col-md-3" id='IOA_2_on'></div>
        </div>
      </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import axios from 'axios';
import EventBus from '@/eventBus';

export default {
  name: 'AccView',
  methods: {
    getLegend(divID, nameID) {
      const svg = d3.select(divID)
        .append('svg')
        .attr('width', 130)
        .attr('height', 60);
      const nameData = [{ name: 'CMAQ_data', color: 'lightblue' },
        { name: '  Our_data', color: 'pink' }, { name: nameID, color: 'orange' }];
      nameData.forEach((l, i) => {
        const g = svg.append('g').attr('transform', `translate(4, ${(i * 20) + 5})`);
        g.append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .style('fill', l.color);
        g.append('text')
          .attr('x', 110)
          .attr('y', 10)
          .attr('text-anchor', 'end')
          .style('text-transform', 'capitalize')
          .text(l.name);
      });
    },
    changeValues(response) {
      const rmseName = 'RMSE_CM: ';
      const ioaName = 'IOA_CM: ';
      const rmseName2 = 'RMSE_OM: ';
      const ioaName2 = 'IOA_OM: ';
      document.getElementById('RMSE_1').innerHTML = rmseName.concat(response.data[0].RMSE).fontsize(2);
      document.getElementById('IOA_1').innerHTML = ioaName.concat(response.data[0].IOA).fontsize(2);
      document.getElementById('RMSE_2').innerHTML = rmseName2.concat(response.data[0].RMSE_our).fontsize(2);
      document.getElementById('IOA_2').innerHTML = ioaName2.concat(response.data[0].IOA_our).fontsize(2);
<<<<<<< HEAD:client/src/components/Accview.vue
    },
    changeValues2(response) {
      const rmseName = 'RMSE_CM: ';
      const ioaName = 'IOA_CM: ';
      const rmseName2 = 'RMSE_OM: ';
      const ioaName2 = 'IOA_OM: ';
      document.getElementById('RMSE_1_on').innerHTML = rmseName.concat(response.data[0].RMSE).fontsize(2);
      document.getElementById('IOA_1_on').innerHTML = ioaName.concat(response.data[0].IOA).fontsize(2);
      document.getElementById('RMSE_2_on').innerHTML = rmseName2.concat(response.data[0].RMSE_our).fontsize(2);
      document.getElementById('IOA_2_on').innerHTML = ioaName2.concat(response.data[0].IOA_our).fontsize(2);
=======
>>>>>>> 357517f21ba1e7500995d786f6f80f3273603e33:client/src/components/accyview.vue
    },
    getLineChart(divID, svgID, response) {
      d3.select(`#${svgID}`).remove();
      const margin = {
        top: 30, right: 10, bottom: 70, left: 25,
      };
      const width = 500 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const svg = d3.select(divID).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('id', svgID)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const obsData = response.data[0].line_data.filter(({ data }) => ['station_data'].includes(data));
      const cmaqData = response.data[0].line_data.filter(({ data }) => ['CMAQ_data'].includes(data));
      const ourData = response.data[0].line_data.filter(({ data }) => ['Our_method_data'].includes(data));
      const xScale = d3.scaleTime()
        .domain(d3.extent(obsData, (d) => d3.timeParse('%Y-%m-%d %H:%M:%S')(d.time)))
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(cmaqData, (d) => d.Pollutant)])
        .range([height, 0]);
      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale)
          .ticks(12)
          .tickFormat(d3.timeFormat('%m-%d %H:%M')))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', () => 'rotate(-65)');
      svg.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(yScale));
      const line = d3.line()
        .x((d) => xScale(new Date(d.time)))
        .y((d) => yScale(d.Pollutant))
        .curve(d3.curveMonotoneX);
      svg.append('path')
        .datum(obsData)
        .attr('class', 'line')
        .attr('d', line)
        .attr('stroke', 'orange');
      svg.append('path')
        .datum(cmaqData)
        .attr('class', 'line')
        .attr('d', line)
        .attr('stroke', 'lightblue');
      svg.append('path')
        .datum(ourData)
        .attr('class', 'line')
        .attr('d', line)
        .attr('stroke', 'pink');
    },
    renderChart1(stCode, onCode, pol, sD, eD, FHr) {
      const path = 'http://127.0.0.1:5000/lineChart1';
      axios.post(path, {
        St_code: stCode,
        Onsite_code: onCode,
        pollutant: pol,
        st_date: sD,
        en_date: eD,
        F_hour: FHr,
      })
        .then((res) => {
          this.getLineChart('#lineChart1', 'chart1', res);
          this.changeValues(res);
        });
    },
    renderChart2(stCode, onCode, pol, sD, eD, FHr) {
      const path = 'http://127.0.0.1:5000/lineChart2';
      axios.post(path, {
        St_code: stCode,
        Onsite_code: onCode,
        pollutant: pol,
        st_date: sD,
        en_date: eD,
        F_hour: FHr,
      })
        .then((res) => {
          this.getLineChart('#lineChart2', 'chart2', res);
          this.changeValues2(res);
        });
<<<<<<< HEAD:client/src/components/Accview.vue
=======
      // this.getLegend('#legend_on', 'Onsite_data');
>>>>>>> 357517f21ba1e7500995d786f6f80f3273603e33:client/src/components/accyview.vue
    },
  },
  mounted() {
    this.getLegend('#legend_obs', 'OBS_data');
<<<<<<< HEAD:client/src/components/Accview.vue
    this.getLegend('#legend_on', 'Onsite_data');
    EventBus.$on('submit-event', (stationCode, onsiteCode, pollutant, startDate, endDate, FutHour) => {
      this.renderChart1(stationCode, onsiteCode, pollutant, startDate, endDate, FutHour);
      this.renderChart2(stationCode, onsiteCode, pollutant, startDate, endDate, FutHour);
=======
    EventBus.$on('submit-event', (stationCode, pollutant, startDate, endDate, FutHour) => {
      this.renderChart1(stationCode, pollutant, startDate, endDate, FutHour);
>>>>>>> 357517f21ba1e7500995d786f6f80f3273603e33:client/src/components/accyview.vue
    });
  },
};
</script>

<style>
/* tags */
h4{
  text-align: center;
  position: absolute;
  width: 250px;
  margin: 10px 50px 0 125px;
}
hr{
  width: 100px;
}
/* class */
.col-12{
    height: 50vh;
}
.line {
  fill: none;
  stroke-width: 3;
}
.legend_class{
  width: 130px;
  height: 50px;
  position: absolute;
  margin: 5px 0 0 390px;
}
.metrics{
  position: absolute;
  width: 100px;
  height: 20px;
  margin: 408px 0 0 0;
}
/* ids */

</style>
