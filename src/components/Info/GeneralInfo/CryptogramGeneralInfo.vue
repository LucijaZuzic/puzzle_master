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
  <h6 class="display-6">Uvod</h6>
  <br />
  <span class="tab"></span>Kriptogram je vrsta križaljke u kojoj je za sva
  polja, osim onih koja predstavljaju glavni ključ ili barijeru, zadan broj. Za
  svaki broj postoje tri opcije, odnosno tri znaka koja on zamjenjuje na
  različitim poljima u križaljci. Isti broj ne označava uvijek isti znak, već
  uvijek označava jednu od tri moguće opcije.

  <br />
  <br />

  <h6 class="display-6">Slova</h6>
  <br />
  <span class="tab"></span> Tri opcije za svaki broj uvijek su tri različita
  znaka. Različiti brojevi nikada neće označavati isti znak. Svi znakovi abecede
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
    <va-icon size="medium" name="visibility"></va-icon>&nbsp; Otkrivena slova
  </h6>
  <br />

  <span class="tab"></span>Kao pomoć pri rješavanju, neke od tri opcije za neke
  od brojeva mogu biti unaprijed zadane, odnosno otkrivene rješavaču i vidljive
  na početku rješavanja zagonetke.

  <br />
  <br />

  <h6 class="display-6">
    <va-icon size="medium" color="#FA8072" name="contrast"></va-icon>&nbsp;
    Pomoćni ključ (osjenčano)
  </h6>
  <br />

  <span class="tab"></span> Može se tamnijom ružičastom bojom osjenčati određeno
  polje kriptograma te ga tako označiti kao pomoćni ključ koji predstavlja pojam
  koji je opisan prilikom zadavanja zagonetke i koji pomaže u rješavanju tako
  što otkriva određeni broj znakova, odnosno opcija za brojeve, ukoliko ga se
  odgonetne.

  <br />
  <br />

  <h6 class="display-6">
    <va-icon size="medium" color="#fdefef" name="contrast"></va-icon>&nbsp;
    Glavni ključ (neobrojčeno)
  </h6>
  <br />

  <span class="tab"></span>
  Može se svjetlijom ružičastom bojom osjenčati određeno polje kriptograma i
  ukloniti mu broj te ga tako označiti kao glavni ključ koji predstavlja pojam
  koji je opisan prilikom zadavanja zagonetke. Njega se može odgonetnuti samo
  ako se odgonetne pojmove koji se s njime sijeku vodoravno ili okomito, pa je
  to ujedno i glavni zadatak rješavača.

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
