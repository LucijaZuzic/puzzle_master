 
<script>
    import Navbar from './Navbar.vue'
    import NumberLetterTable from "./NumberLetterTable.vue"
    export default {
        components: {
            Navbar,
            NumberLetterTable
        },
    }
</script>

<template> 
  <Navbar></Navbar>
  <body class="mybody"> 
      <h1 class="display-1">Isti broj - Isto slovo</h1>
      <NumberLetterTable selectMode="single"></NumberLetterTable> 
  </body>
</template>

<style>
</style>
