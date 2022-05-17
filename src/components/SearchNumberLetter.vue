<script>
import Navbar from "./Navbar.vue";
import NumberLetterTable from "./NumberLetterTable.vue";
export default {
  components: {
    Navbar,
    NumberLetterTable,
  },
};
</script>

<template>
  <Navbar></Navbar>
  <body class="mybody">
    <div class="myrow">
      <h1 class="display-1">Isti broj - Isto slovo</h1>
    </div>
    <div class="myrow">
      <NumberLetterTable selectMode="single"></NumberLetterTable>
    </div>
  </body>
</template>

<style></style>
