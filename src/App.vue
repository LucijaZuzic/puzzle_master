<script>
import Navbar from "./components/Utility/Navbar.vue";
export default {
  components: {
    Navbar,
  },
};
</script>
<template>
  <div style="background-color: white">
    <Navbar></Navbar>
    <va-card
      style="
        background-color: #f4f8fa;
        margin: 20px;
        padding: 20px;
        display: inline-block;
        width: 80%;
      "
    >
      <router-view></router-view>
    </va-card>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;1,700&display=swap");
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  overflow-wrap: anywhere !important;
}
.my_body {
  overflow-wrap: anywhere !important;
}
.my_row {
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
#table_zoom {
  transform-origin: top left;
  float: left;
}
.data_table_overflow {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  max-width: 200px;
}
</style>
