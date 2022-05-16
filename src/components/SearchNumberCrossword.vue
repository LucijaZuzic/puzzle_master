 
<script>
    import Navbar from './Navbar.vue'
    import NumberCrosswordTable from "./NumberCrosswordTable.vue"
    export default {
        components: {
            Navbar,
            NumberCrosswordTable
        },
    }
</script>

<template> 
  <Navbar></Navbar>
  <body class="mybody"> 
    <div class="myrow">
      <h1 class="display-1">Brojevne križaljke</h1>
    </div>
    <div class="myrow">
      <NumberCrosswordTable  selectMode="single"></NumberCrosswordTable> 
    </div>
  </body>
</template>

<style>
</style>
