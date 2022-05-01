 
<script>
    import Navbar from './Navbar.vue'
    import NonogramTable from "./NonogramTable.vue"
    export default {
        components: {
            Navbar,
            NonogramTable
        },
    }
</script>

<template> 
  <Navbar></Navbar>
  <body class="mybody"> 
      <h1 class="display-1">Nonogrami</h1>
      <NonogramTable selectMode="single"></NonogramTable> 
  </body>
</template>

<style>
</style>
