<script>

import InitialTable from "./InitialTable.vue";
export default {
  components: {
    
    InitialTable,
  },
};
</script>

<template>
  <body class="mybody">
    
    <div class="myrow">
      <h1 class="display-1">Inicijalne osmosmjerke</h1>
    </div>
    <div class="myrow">
      <InitialTable selectMode="single"></InitialTable>
    </div>
  </body>
</template>

<style></style>
