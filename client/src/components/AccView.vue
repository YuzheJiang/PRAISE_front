<template>
<div class="AccView">
    <div class="row" id="First_row">
      <div class="col-md-6 seperate">
            <div class="row">
                <div class="col-md-6">
                    <label class="labels text">Station:</label>
                </div>
                <div class="col-md-6">
                  <select name="Please select a station"
                  id="filter_option" v-model="Station_code">
                    <option v-for="Station_code in Station_codes"
                          v-bind:key="Station_code.code">
                          {{ Station_code.code }}
                    </option>
                  </select>
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
    <div class="row" id="Fourth_row">
      <div class="col-lg-6 seperate">
        <div class="row">
          <div class="col-md-4 param">
            <div class="col three_col">
                <label class="labels text date">Start Date:</label>
            </div>
            <div class="col three_col">
                <date-picker v-model="start_date" lang="en" id="datetime"
                  type="datetime" valueType="format"
                  format="YYYY-MM-DD HH:mm:ss">
                </date-picker>
            </div>
          </div>
          <div class="col-md-4 param">
            <div class="col three_col">
                <label class="labels text date">End Date:</label>
            </div>
            <div class="col three_col">
                <date-picker v-model="end_date" lang="en" id="datetime"
                  type="datetime" valueType="format"
                  format="YYYY-MM-DD HH:mm:ss">
                </date-picker>
            </div>
          </div>
          <div class="col-md-3 param">
            <div class="col three_col">
                <label class="labels text date">Future Hour:</label>
            </div>
            <div class="col three_col">
              <select id="hour_filter" v-model="Fut_hr">
                <option v-for="Fut_hr in Fut_hrs"
                  v-bind:key="Fut_hr.hour">
                  {{ Fut_hr.hour }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
    <hr>
    <div class="row" id="Fifth_row">
      <div class="col-md-6 seperate">
        <button type="button" class="button btn btn-dark btn-lg text"
                @click="submit1($event)">Submit</button>
      </div>
    </div>
    <hr>
    <div class="row" id="Second_row">
      <div class="col-lg-6 seperate" id='lineChart1'>
        <div class="lineChart_legend" id="legend_1">
        </div>
      </div>
      <div class="col-lg-6" id='lineChart2'>
         <div class="lineChart_legend" id="legend_2">
        </div>
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
            <h6 class="elem" id='IOA_1'>IOA</h6>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <label class="labels text">RMSE:</label>
          </div>
          <div class="col-md-6">
            <h6 class="elem" id='RMSE_1'>RMSE</h6>
          </div>
        </div>
      </div>
      <div class="col-md-6 seperate">
        <div class="row row-1">
            <h6 class="elem" id='IOA_2'>IOA</h6>
        </div>
        <div class="row row-1">
            <h6 class="elem" id='RMSE_2'>RMSE</h6>
        </div>
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
  data() {
    return {
      Station_codes: [
        { code: 'CB_R' },
        { code: 'CL_R' },
        { code: 'CW_A' },
        { code: 'EN_A' },
        { code: 'KC_A' },
        { code: 'KT_A' },
        { code: 'MB_A' },
        { code: 'MKaR' },
        { code: 'SP_A' },
        { code: 'ST_A' },
        { code: 'TC_A' },
        { code: 'TK_A' },
        { code: 'TM_A' },
        { code: 'TP_A' },
        { code: 'TW_A' },
        { code: 'YL_A' },
      ],
      Fut_hrs: [
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
      Fut_hr: '0',
      Station_code: 'CB_R',
      Onsite_code: 'AA',
      start_date: '2017-01-02 21:00:00',
      end_date: '2017-01-03 21:00:00',
      pollutant: 'PM10',
    };
  },
  methods: {
    getLegend() {
      const svg = d3.select('#legend_1')
        .append('svg')
        .attr('width', 130)
        .attr('height', 60);
      const nameData = [{ name: 'CMAQ_data', color: 'lightblue' },
        { name: 'OBS_data', color: 'orange' }];
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
      document.getElementById('RMSE_1').innerHTML = response.data[0].RMSE;
      document.getElementById('IOA_1').innerHTML = response.data[0].IOA;
    },
    getMetricsdata() {
      const path = 'http://127.0.0.1:5000/getMetrics';
      axios.post(path, {
        St_code: this.Station_code,
        pollutant: this.pollutant,
        st_date: this.start_date,
        en_date: this.end_date,
        F_hour: this.Fut_hr,
      })
        .then((res) => {
          this.changeValues(res);
        });
    },
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

      const obsData = response.data.filter(({ data }) => ['Obs_data'].includes(data));
      const cmaqData = response.data.filter(({ data }) => ['CMAQ_data'].includes(data));
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
      // svg.selectAll('.dot')
      //   .data(lineData)
      //   .enter().append('circle') // Uses the enter().append() method
      //   .attr('class', 'dot') // Assign a class for styling
      //   .attr('cx', (d) => xScale(new Date(d.time)))
      //   .attr('cy', (d) => yScale(d.pollutant))
      //   .attr('r', 5);
    },
    submit1() {
      this.renderChart1();
    },
    renderChart1() {
      const path = 'http://127.0.0.1:5000/lineChart1';
      axios.post(path, {
        St_code: this.Station_code,
        pollutant: this.pollutant,
        st_date: this.start_date,
        en_date: this.end_date,
        bs_date: this.base_date,
        F_hour: this.Fut_hr,
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
    EventBus.$on('clicked-event', (selected) => {
      this.pollutant = selected;
    });
    this.renderChart1();
    this.getMetricsdata();
    this.getLegend();
    // this.getLegend();
    // this.drawLineLegend();
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
#Third_row, #Second_row, #First_row, #Fifth_row, #Fourth_row{
  padding: 1% 0;
}
#datetime{
  width: 120px;
  padding-bottom: 3%;
}
#hour_filter{
  margin-left: 13px;
  margin-top: 5px;
  height: 30px;
}
/* tag */
h2 {
  margin : 5% 0 0 0;
}
/* class */
.line {
    fill: none;
    stroke-width: 3;
}
.overlay {
  fill: none;
  pointer-events: all;
}
.dot {
    fill: #ffab00;
    stroke: #fff;
}
.p1{
  text-align: left;
}
.st_dt{
  padding:0%;
}
.date{
  width: 110px;
  text-align: center;
}
.param{
  padding:0%;
}
.lineChart_legend{
  position: absolute;
  margin: 0 0 0 240px;
}
.row-1{
  height: 42px;
}
.elem{
  position: absolute;
  margin-top: 10px;
  margin-left: 20px;
}
</style>
