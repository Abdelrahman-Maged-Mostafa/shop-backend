/*eslint-disable*/
// import mapboxgl from 'https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.js';
const locations = JSON.parse(document.getElementById('map').dataset.locations);

console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiYWJkZWxyYWhtYW4tbWFnZWQiLCJhIjoiY2x6dGwwOHp4MDg0cTJtczY0djd3cXc1dCJ9.DNBw4AUuka-qZCCuQ1-NPw';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9',
  projection: 'globe', // Display the map as a globe, since satellite-v9 defaults to Mercator
  zoom: 1,
  center: [30, 15],
});
