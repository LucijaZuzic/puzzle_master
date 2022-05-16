 
<script>
import Navbar from "./Navbar.vue";
import EightTable from "./EightTable.vue";
export default {
  components: {
    Navbar,
    EightTable,
  },
};
</script>

<template>
  <Navbar></Navbar>
  <body class="mybody">
    <div class="myrow">
      <h1 class="display-1">Osmosmjerke</h1>
    </div>
    <div class="myrow">
      <EightTable selectMode="single"></EightTable>
    </div>
  </body>
</template>

<style>
</style>
