<script> 
  
import Navbar from "./Navbar.vue"

export default {
    components: {
        Navbar
    },
  data() {
    return { 
    }
  }, 
}
</script>

<template>   
  <Navbar></Navbar>    
  <body class="mybody">  
    <div class="myrow"> 
        <h1 class="display-1"> 
            404 
        </h1>
    </div>
    <div class="myrow"> 
        <h4 class="display-4"> 
            Datoteka nije pronađena
        </h4>
    </div>
  </body>
</template>

<style>

</style>
