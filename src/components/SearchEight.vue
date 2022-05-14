 
<script>
    import Navbar from './Navbar.vue'
    import EightTable from "./EightTable.vue"
    export default {
        components: {
            Navbar,
            EightTable
        },
    }
</script>

<template> 
  <Navbar></Navbar>    
  <body class="mybody"> 
      <h1 class="display-1">Osmosmjerke</h1>
      <EightTable  selectMode="single"></EightTable> 
  </body>
</template>

<style>
</style>
