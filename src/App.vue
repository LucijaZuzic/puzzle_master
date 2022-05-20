<script>
import Navbar from "./components/Navbar.vue";
export default {
  components: {
    Navbar,
  },
};
</script>
<template>
  <div style="background-color: gray;">
  <div style="background-color: white;display: inline-block;max-width: 1000px; min-width: 1000px">
        <Navbar></Navbar>
        <div style="display: inline-block; max-width: 700px; min-width: 700px">
          <router-view></router-view>
        </div>
  </div>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;1,700&display=swap");
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");
#app {
  font-family: Arial, Helvetica, sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  overflow-wrap: none !important;
}
.mybody {
  background-color: white !important;
  display: block;
}
.myrow {
  width: 100%;
  display: inline-block;
  padding: 20px;
}
a,
a:hover,
a:focus,
a:active {
  text-decoration: none;
  color: inherit;
}
#table-to-zoom {
  transform-origin: top left;
  float: left;
}
.mytableforall {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  max-width: 200px;
}
</style>
