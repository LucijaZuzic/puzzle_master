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
  polja koja je korisnik ispunio netočnim slovom smještanjem riječi s popisa
  pojmova u mrežu.

  <br />
  <br />

  <h6 class="display-6">Prikaži rješenje</h6>
  <br />

  <span class="tab"></span>
  Ukoliko odaberemo da se rješenje prikaže, neće se spremiti rekord pri
  rješavanju. Rekord je vrijeme provedeno u rješavanju, a neće se spremiti ako
  se nismo prijavili u sustav.

  <br />
  <br />
  <h6 class="display-6">Zagonetka</h6>
  <br />
  <span class="tab"></span>
  Inicijalna osmosmjerka je predstavljena mrežom unutar koje je samo polje koje
  je početno slovo neke riječi unaprijed ispunjeno slovima zadane abecede.  Mora
  se ispuniti ostala polja smještanjem riječi s popisa pojmova u mrežu. Zadnja
  aktivna pozicija u mreži naznačena je iznad mreže radi lakšeg snalaženja.
  Veličina mreže može se prilagoditi radi bolje vidljivosti.

  <br />
  <br />
  <h6 class="display-6">Rješenje</h6>
  <br />
  <span class="tab"></span>
  Polja koja su posebno označena tvore rješenje redom kako se pojavljuju u
  mreži, slijeva nadesno po recima počevši od vrha prema dnu.
  <br />
  <br />
  <h6 class="display-6">Riječi po smjerovima</h6>
  <br />
  <span class="tab"></span>
  Rješavač odabranu riječ postavlja u zagonetku u jednom od osam smjerova koji
  je unaprijed zadan ukoliko ima dovoljno slobodnih mjesta i ako se slova u
  poljima poklapaju. Riječi se mogu dodavati samo počevši od nekog od početnih
  slova koja su označena plavom bojom pozadine i podebljana. Korisnik može
  poništiti postavljanje svih riječi, svih riječi u jednom smjeru ili samo jedne
  riječi.

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
  Vidljivo je kada je zagonetka prvi put stvorena i kada je posljednji put
  uređivana. Vidljivo je tko je autor zagonetke i tko ju je posljednji uređivao
  ukoliko je profil tog korisnika javan ili ako ste prijatelji.
</template>

<style scoped>
.tab {
  display: inline-block;
  margin-left: 40px;
}
</style>
