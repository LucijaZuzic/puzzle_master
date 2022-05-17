<script>

import NumberCrosswordTable from "./NumberCrosswordTable.vue";
export default {
  components: {
    
    NumberCrosswordTable,
  },
};
</script>

<template>
  <body class="mybody">
    
    <div class="myrow">
      <h1 class="display-1">Brojevne križaljke</h1>
    </div>
    <div class="myrow">
      <NumberCrosswordTable selectMode="single"></NumberCrosswordTable>
    </div>
  </body>
</template>

<style></style>
