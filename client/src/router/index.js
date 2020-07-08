import Vue from 'vue';
import VueRouter from 'vue-router';
import MapView from '../components/MapView.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'MapView',
    component: MapView,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
