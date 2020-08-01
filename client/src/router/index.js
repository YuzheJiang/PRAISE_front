import Vue from 'vue';
import VueRouter from 'vue-router';
// import MapView from '../components/MapView.vue';
import newLayout from '../components/PickerView.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'PickerView',
    component: newLayout,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
