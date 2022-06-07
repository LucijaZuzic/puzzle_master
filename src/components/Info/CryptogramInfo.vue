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
    <h4 class="display-4" style="text-align: center; vertical-align: middle;"><va-icon size="large" name="multiple_stop"></va-icon>&nbsp;Kriptogrami</h4> 
    <br/>
    <span>
        <span class="tab"></span>Kriptogram je vrsta križaljke u kojoj je za sva polja, osim onih koja čine glavni ključ, zadan broj. 

        Za svaki broj postoje tri opcije, odnosno tri slova koja on zamjenjuje na različitim poljima u križaljci.

        Isti broj ne označava uvijek isto slovo, već uvijek označava jednu od tri moguće opcije.

        <br/>
        <br/>
  	    
        Tri opcije za svaki broj uvijek su tri različita slova. 

        Različiti brojevi nikada neće označavati isto slovo. 

        Sva slova abecede ne moraju se pojaviti u poljima, odnosno ne moraju nužno imati broj koji ih označava.

        Svako slovo koje se pojavljuje kao jedna od tri opcije za neki broj biti će iskorišteno u poljima barem jednom.

        <br/>
        <br/>

        Zadatak rješavača je otkriti koji broj označava koja tri slova te za svako polje u križaljci odrediti koja se od tri opcije, 
        odnosno tri slova, koristi na određenom polju umjesto upisanog broja.

        <br/>
        <br/>

        <h6 class="display-6"><va-icon size="medium" name="visibility"></va-icon>&nbsp;Otkrivena slova</h6>
        <br/>
 
        <span class="tab"></span>Kao pomoć pri rješavanju, neke od tri opcije za neke od brojeva mogu biti unaprijed zadane, 
        odnosno otkrivene rješavaču i vidljive na početku rješavanja zagonetke. 
        
        <br/>
        <br/>

        <h6 class="display-6"><va-icon size="medium" color="#FA8072" name="contrast"></va-icon>&nbsp;Pomoćni ključ (osjenčano)</h6>
        <br/>
 
        <span class="tab"></span>Polja koja su osjenčana tamnijom ružičastom bojom pozadine označavaju pomoćni ključ
        i za pojmove koji se nalaze u tim poljima zadan je opis kao dodatna pomoć pri rješavanju.

        <br/>
        <br/>

        <h6 class="display-6"><va-icon size="medium" color="#fdefef" name="contrast"></va-icon>&nbsp;Glavni ključ (neobrojčeno)</h6>
        <br/> 

        <span class="tab"></span>Polja koja su osjenčana svjetlijom ružičastom bojom pozadine i nemaju zadane brojeve 
        čine glavni ključ, odnosno rješenje koje je opisano prilikom zadavanja zagonetke. 

        <br/>
        <br/>

        <h6 class="display-6"><va-icon size="medium" name="border_clear"></va-icon>&nbsp;Iscrtkano</h6>
        <br/>
 
        <span class="tab"></span>Iscrtkani su bridovi polja u križaljci gdje se nalaze granice riječi u složenim pojmovima.

        <br/>
        <br/>

        <h6 class="display-6"><va-icon size="medium" color="#000000" name="contrast"></va-icon>&nbsp;Barijera</h6>
        <br/>
 
        <span class="tab"></span>Prazna polja, odnosno barijere između pojmova u istom retku ili stupcu, ispunjena su crnom bojom. 
    </span>
</template>

<style scoped>
    .tab {
        display: inline-block;
        margin-left: 40px;
    }
</style>
