<script>

import IntegramTable from "./IntegramTable.vue";
export default {
  components: {
    
    IntegramTable,
  },
};
</script>

<template>
  <body class="mybody">
    
    <div class="myrow">
       <h1 class="display-1">Integrami</h1>
    </div>
    <div class="myrow">
      <IntegramTable selectMode="single"></IntegramTable>
    </div>
  </body>
</template>

<style scoped></style>
