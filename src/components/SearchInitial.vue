 
<script>
    import Navbar from './Navbar.vue'
    import InitialTable from "./InitialTable.vue"
    export default {
        components: {
            Navbar,
            InitialTable
        },
    }
</script>

<template> 
  <Navbar></Navbar>
  <body class="mybody"> 
      <h1 class="display-1">Inicijalne osmosmjerke</h1>
      <InitialTable  selectMode="single"></InitialTable> 
  </body>
</template>

<style>
</style>
