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
  <h6 class="display-6">Označi greške</h6>
  <br />
  <span class="tab"></span>
  Ukoliko korisnik želi da se označavaju greške, crvenom bojom će se naznačiti
  polja kojima   kojima slovo
  koje broj predstavlja ne odgovara slovu koje broj predstavlja u rješenju.
  Svaki put kada se zagoneta rješava redoslijed slova   se nasumično
  generira.

  <br />
  <br />

  <h6 class="display-6">Prikaži rješenje</h6>
  <br />

  <span class="tab"></span>
  Ukoliko odaberemo da se rješenje prikaže, neće se spremiti rekord pri
  rješavanju. Rekord je vrijeme provedeno u rješavanju, a neće se spremiti ako se
  nismo prijavili u sustav.
  
  <br />
  <br />

  <h6 class="display-6">Slova</h6>
  <br />

  <span class="tab"></span>
  Slova moraju biti jedinstvena i pripadati zadanoj abecedi.  Slova koja su predstavljena određenim brojem pojavljuju se 
  u mreži kada se upišu.
 
  <br />
  <br />
  <h6 class="display-6">Zagonetka</h6>
  <br />
  <span class="tab"></span>
  Zagonetka tipa Isti broj - isto slovo je predstavljena mrežom unutar koje je svako polje ili barijera
  između pojmova ili ima unaprijed zadan broj. Zadnja aktivna pozicija u mreži
  naznačena je iznad mreže radi lakšeg snalaženja. Veličina mreže može se
  prilagoditi radi bolje vidljivosti.

  <br />
  <br />
  <h6 class="display-6">Podaci o zagonetci</h6>
  <br />
  <span class="tab"></span>
  Zagonetka ima naslov zbog identifikacije, opis koji pomaže prilikom rješavanja
  te izvor koji omogućava da se priznaju zasluge originalnom autoru ukoliko se
  prepisuje tuđu zagonetku u sustav. Izborno je uz zagonetku dodati i sliku koja
  uz opis pruža dodatnu pomoć prilikom rješavanja. 
  <br />
  <br />
  <h6 class="display-6">Autor i posljednja izmjena</h6>
  <br /> 
  <span class="tab"></span>
  Vidljivo je kada je zagonetka prvi put stvorena i kada je posljednji put uređivana.
  Vidljivo je tko je autor zagonetke i tko ju je posljednji uređivao 
  ukoliko je profil tog korisnika javan ili ako ste prijatelji.
 
</template>

<style scoped>
.tab {
  display: inline-block;
  margin-left: 40px;
}
</style>
