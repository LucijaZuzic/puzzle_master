 
<script>
import Navbar from "./Navbar.vue";
import CryptogramTable from "./CryptogramTable.vue";
export default {
  components: {
    Navbar,
    CryptogramTable,
  },
};
</script>

<template>
  <Navbar></Navbar>
  <body class="mybody">
    <div class="myrow">
      <h1 class="display-1">Kriptogrami</h1>
    </div>
    <div class="myrow">
      <CryptogramTable selectMode="single"></CryptogramTable>
    </div>
  </body>
</template>

<style>
</style>
