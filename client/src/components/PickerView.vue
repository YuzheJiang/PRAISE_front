<template>
  <div class="row">
      <div class="col-md-3 border border-dark rounded column_class">
        <div class="row">
          <div class="col-12" style="height: 50vh;">
            <div class="row">
                <label class="text_1">Input for Map</label>
            </div>
            <div class="row" id='first_row'>
              <div class="col-md-6 seperate">
                <label class="labels text">Date:</label>
              </div>
              <div class="col-md-6">
                <date-picker v-model="new_date" lang="en" id="date"
                    type="datetime" valueType="format"
                    format="YYYY-MM-DD HH:mm:ss">
                </date-picker>
              </div>
            </div>
            <div class="row" id='second_row'>
              <div class="col-md-6 seperate">
                <label class="labels text">Pollutant:</label>
              </div>
              <div class="col-md-6">
                <select name="Please select a pollutant"
                    id="filter_option" v-model="pollutant">
                    <option v-for="Pollutant_name in Pollutant_names"
                            v-bind:key="Pollutant_name.name">
                        {{ Pollutant_name.name }}
                    </option>
                </select>
              </div>
            </div>
            <div class="row" id='third_row'>
              <div class="col-md-6 seperate">
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
            <hr>
            <div class="row" id="fourth_row" style="height:80px;">
              <div class="col-md-6 seperate">
                <button type="button" class="button_1 btn btn-dark text"
                  @click="submitButton1($event)"> Submit
                </button>
              </div>
              <div class="col-md-6">
                <div class="row">
                  <p>Animate</p>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <button type="button" class="button_2 btn btn-dark btn-sm text"
                      @click="playButton($event)">Play
                    </button>
                  </div>
                  <div class="col-md-6">
                    <button type="button" class="button_3 btn btn-dark btn-sm text"
                    @click="stopButton($event)">Stop</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr>
          <div class="col-12" style="height: 50vh;">
            <div class="row">
              <label class="text_1">Input for LineChart</label>
            </div>
            <div class="row" id='first_row'>
              <div class="col-md-6 seperate">
                <label class="labels text">Start Date:</label>
              </div>
              <div class="col-md-6">
                <date-picker v-model="start_date" lang="en" id="date"
                  type="datetime" valueType="format"
                  format="YYYY-MM-DD HH:mm:ss">
                </date-picker>
              </div>
            </div>
            <div class="row" id='second_row'>
              <div class="col-md-6 seperate">
                <label class="labels text">End Date:</label>
              </div>
              <div class="col-md-6">
                <date-picker v-model="end_date" lang="en" id="date"
                  type="datetime" valueType="format"
                  format="YYYY-MM-DD HH:mm:ss">
                </date-picker>
              </div>
            </div>
            <div class="row" id='third_row'>
              <div class="col-md-6 seperate">
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
            <div class="row" id='fourth_row'>
              <div class="col-md-6 seperate">
                <label class="labels text">Future Hour:</label>
              </div>
              <div class="col-md-6">
                <select name="Please select a pollutant"
                  id="filter_option" v-model="F_hr">
                  <option v-for="Future_hour in Future_hours" v-bind:key="Future_hour.hour">
                    {{ Future_hour.hour }}
                  </option>
                </select>
              </div>
            </div>
            <hr>
            <div class="row" id="fourth_row">
              <button type="button" class="button_4 btn btn-dark text"
                @click="submitButton2($event)"> Submit
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-5 border border-dark rounded column_class">
          <mappyview/>
      </div>
      <div class="col-md-4 border border-dark rounded column_class">
          <accyview/>
      </div>
  </div>
</template>
<script>
import EventBus from '@/eventBus';
import mappyview from './mappyview.vue';
import accyview from './accyview.vue';

export default {
  name: 'PickerView',
  components: {
    mappyview,
    accyview,
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
      hour: '0',
      F_hr: '0',
      Station_code: 'CB_R',
      start_date: '2017-01-02 21:00:00',
      end_date: '2017-01-03 21:00:00',
      pollutant: 'PM10',
      new_date: '2017-01-02 21:00:00',
      old_date: '2017-01-02 21:00:00',
    };
  },
  watch: {
    new_date(newValue, oldValue) {
      this.old_date = oldValue;
    },
  },
  methods: {
    submitButton1() {
      EventBus.$emit('clicked-event', this.pollutant, this.hour, this.new_date, this.old_date);
    },
    playButton() {
      EventBus.$emit('play-event', this.pollutant, this.new_date, this.old_date);
    },
    stopButton() {
      EventBus.$emit('stop-event');
    },
    submitButton2() {
      console.log('You clicked me!!');
      EventBus.$emit('submit-event', this.pollutant);
    },
  },
  mounted() {
    EventBus.$emit('clicked-event', this.pollutant, this.hour, this.new_date, this.old_date);
    EventBus.$emit('submit-event', this.Station_code, this.pollutant, this.start_date, this.end_date, this.F_hr);
  },
};
</script>
<style>
/* tags */
hr{
  margin: 0;
  width: 102%;
  background-color: darkgrey;
}
p{
  font-weight: bold;
  margin: 0 70px;
}
/* class */
.text{
  font-weight: bold;
  font-size: 17px;
}
.text_1{
    margin: 10px 110px;
    font-weight: bold;
    font-size: 20px;
}
.seperate{
  border-right: 1px solid lightgrey;
}
.button_1{
  margin: 10% 0 0 20% ;
  width: 110px;
}
.button_2{
  margin: 0 0 3% 8%;
  padding-bottom: 3%;
  width: 60px;
}
.button_3{
  margin: 0 10% 3% 0;
  padding-top: 5%;
  padding-bottom: 3%;
  width: 60px;
}
.button_4{
  margin: 3% 25% 3% 30% ;
  width: 130px;
}
.labels{
  margin-top: 5%;
}
.col-md-6{
    padding: 8px 15px;
}
.column_class{
    height: 100vh;
}
/* id */
#first_row,#second_row,#third_row,#fourth_row{
  padding: 1% 0 1% 2%;
  text-align: left;
}
#date{
  padding-top: 4%;
  width: 173px;
}
#filter_option{
  margin-top: 5%;
  width: 70px;
}
</style>
