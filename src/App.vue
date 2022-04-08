<script setup>

</script>

<template>
  <header>
    <va-navbar color="primary" class="mb-2">
      <template #left>
        <va-navbar-item>
          <router-link  to="/searchnonogram">
            Nonogrami
          </router-link>
        </va-navbar-item>
        <va-navbar-item><router-link to="/createintegram">Integram</router-link></va-navbar-item>  
         <va-navbar-item>
          <router-link v-bind:to="{ name: 'solve_integram', params: { id: 'integram1' }}">
            Riješi integram
          </router-link>
        </va-navbar-item>  
        <va-navbar-item>
          <router-link  to="/searchnumbercrossword">
            Brojevne križaljke
          </router-link>
        </va-navbar-item>
      </template>
      <template #center>
        <va-navbar-item>Center</va-navbar-item>
      </template>
      <template #right>
        <va-navbar-item>Right</va-navbar-item>
      </template>
    </va-navbar>
  </header> 
  <body class="mybody">
    <router-view></router-view>
  </body>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;1,700&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
#app {
    font-family: Arial, Helvetica, sans-serif !important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
  .mybody {
    font-family: Arial, Helvetica, sans-serif !important;
    margin-left: 5%;
    margin-right: 5%;
  }
  .myrow {
    width: 100%;
    display: inline-block;
    padding-top: 1%;
  }
  a, a:hover, a:focus, a:active {
      text-decoration: none;
      color: inherit;
}
</style>
