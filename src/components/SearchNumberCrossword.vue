 
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
      <h1 class="display-1">Brojevne križaljke</h1>
      <NumberCrosswordTable  selectMode="single"></NumberCrosswordTable> 
  </body>
</template>

<style>
</style>
