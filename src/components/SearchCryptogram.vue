 
<script>
    import Navbar from './Navbar.vue'
    import CryptogramTable from "./CryptogramTable.vue"
    export default {
        components: {
            Navbar,
            CryptogramTable
        },
    }
</script>

<template> 
  <Navbar></Navbar>   
  <body class="mybody"> 
      <h1 class="display-1">Kriptogrami</h1>
      <CryptogramTable selectMode="single"></CryptogramTable> 
  </body>
</template>

<style>
</style>
