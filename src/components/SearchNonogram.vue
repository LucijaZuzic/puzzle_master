<script>

import NonogramTable from "./NonogramTable.vue";
export default {
  components: {
    
    NonogramTable,
  },
};
</script>

<template>
  <body class="mybody">
    
    <div class="myrow">
       <h1 class="display-1">Nonogrami</h1>
    </div>
    <div class="myrow">
      <NonogramTable selectMode="single"></NonogramTable>
    </div>
  </body>
</template>

<style scoped></style>
