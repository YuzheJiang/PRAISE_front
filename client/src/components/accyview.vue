<template>
  <div class="row">
      <div class="col-12">
        <h4>Observatory station</h4>
        <div class='legend_class' id='legend_obs'></div>
        <div class='row'>
          <div class='col-md-12' id='lineChart1'></div>
        </div>
        <div class='row'>
          <div class="col-md-6" id='RMSE_1'></div>
          <div class="col-md-6" id='IOA_1'></div>
        </div>
      </div>
      <hr>
      <div class="col-12" id='lineChart2'>
        <h4>Onsite station</h4>
        <div class='legend_class' id='legend_on'></div>
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
        { name: nameID, color: 'orange' }];
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
    changeValues(response, rmeseID, ioaID) {
      const rmseName = 'RMSE: '.bold();
      const ioaName = 'IOA: '.bold();
      document.getElementById(rmeseID).innerHTML = rmseName.concat(response.data[0].RMSE);
      document.getElementById(ioaID).innerHTML = ioaName.concat(response.data[0].IOA);
    },
    // getMetricsdata(stCode, pol, sD, eD, FHr, rID, ioID) {
    //   const path = 'http://127.0.0.1:5000/getMetrics';
    //   axios.post(path, {
    //     St_code: stCode,
    //     pollutant: pol,
    //     st_date: sD,
    //     en_date: eD,
    //     F_hour: FHr,
    //   })
    //     .then((res) => {
    //       this.changeValues(res, rID, ioID);
    //     });
    // },
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

      const obsData = response.data[0].line_data.filter(({ data }) => ['Obs_data'].includes(data));
      const cmaqData = response.data[0].line_data.filter(({ data }) => ['CMAQ_data'].includes(data));
      const xScale = d3.scaleTime()
        .domain(d3.extent(obsData, (d) => d3.timeParse('%Y-%m-%d %H:%M:%S')(d.time)))
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(cmaqData, (d) => d.pollutant)])
        .range([height, 0]);

      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale)
          .tickFormat(d3.timeFormat('%m-%d %H:%M'))
          .tickValues(obsData.map((d) => new Date(d.time))))
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
        .y((d) => yScale(d.pollutant))
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
    },
    renderChart1(stCode, pol, sD, eD, FHr) {
      const path = 'http://127.0.0.1:5000/lineChart1';
      axios.post(path, {
        St_code: stCode,
        pollutant: pol,
        st_date: sD,
        en_date: eD,
        F_hour: FHr,
      })
        .then((res) => {
          this.getLineChart('#lineChart1', 'chart1', res);
          this.changeValues(res, 'RMSE_1', 'IOA_1');
        });
      this.getLegend('#legend_obs', 'OBS_data');
    },
    renderChart2() {
      const path = 'http://127.0.0.1:5000/lineChart2';
      axios.post(path, {
        Onsite_code: this.Onsite_code,
      })
        .then((res) => {
          this.getLineChart('#lineChart2', 'chart2', res);
        });
      this.getLegend('#legend_on', 'Onsite_data');
    },
  },
  mounted() {
    EventBus.$on('submit-event', (stationCode, pollutant, startDate, endDate, FutHour) => {
      this.renderChart1(stationCode, pollutant, startDate, endDate, FutHour);
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
