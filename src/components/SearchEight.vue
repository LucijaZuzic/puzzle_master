<script>

import EightTable from "./EightTable.vue";
export default {
  components: {
    
    EightTable,
  },
};
</script>

<template>
  <body class="mybody">
    
    <div class="myrow">
       <h1 class="display-1">Osmosmjerke</h1>
    </div>
    <div class="myrow">
      <EightTable selectMode="single"></EightTable>
    </div>
  </body>
</template>

<style scoped></style>
