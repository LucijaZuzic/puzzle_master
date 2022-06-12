<script>
export default {
  data() {
    return {};
  },
  components: {},
  methods: {},
};
</script>

<template>
  <h6 class="display-6"> 
   Uvod
  </h6>
  <br /> 
    <span class="tab"></span> Zagonetka tipa isti broj isto slovo je vrsta križaljke u kojoj je za sva
  polja, osim onih koja predstavljaju barijeru, zadan broj. Svaki broj zamjenjuje jedan znak
na poljima u križaljci. Isti broj uvijek označava isti znak.
    
  <br />
  <br />

  <h6 class="display-6">Slova</h6>
  <br />
  <span class="tab"></span>   Različiti brojevi nikada neće označavati isti znak. Svi znakovi abecede
  ne moraju se pojaviti u poljima, odnosno ne moraju nužno imati broj koji ih
  označava.
  <!--Svaki znak
    koji se pojavljuje kao jedna od tri opcije za neki broj biti će iskorišten 
    u poljima barem jednom.-->
  Dostupni su znakovi osnovnog latiničnog pisma i hrvatski dijakritički i
  složeni znakovi.
  <br />
  <br /> 
  <h6 class="display-6">
    <va-icon size="medium" color="#FA8072" name="contrast"></va-icon>&nbsp;
    Dio rješenja
  </h6>
  <br />

  <span class="tab"></span>
  Može se tamnijom ružičastom bojom osjenčati određeno polje te ga tako označiti kao dio rješenja, odnosno pojma koji je opisan prilikom zadavanja zagonetke.  

  <br />
  <br />

  <h6 class="display-6">
    <va-icon size="medium" name="border_clear"></va-icon>&nbsp; Iscrtkano
  </h6>
  <br />

  <span class="tab"></span>
  Za polja se može naznačiti da se na gornjem, donjem, lijevom ili desnom bridu
  nalazi granica između riječi u složenom pojmu koja je označena iscrtkanom
  linijom. Takva oznaka neizbježno utječe i na susjedna polja, pa ju je nemoguće
  zadati ako polje nema susjeda u odabranom smjeru ili ako je susjed u odabranom
  smjeru barijera.

  <br />
  <br />

  <h6 class="display-6">
    <va-icon size="medium" color="#000000" name="contrast"></va-icon>&nbsp;
    Barijera
  </h6>
  <br />

  <span class="tab"></span>Prazna polja, odnosno barijere koje označavaju
  granice između uzastopnih pojmova u istom retku ili stupcu, ispunjena su crnom
  bojom.
</template>

<style scoped>
.tab {
  display: inline-block;
  margin-left: 40px;
}
</style>
