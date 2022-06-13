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
  polja kojima odabrana vrijednost kategorije za pojam ne odgovara rješenju.
  Svaki put kada se zagonetka rješava redoslijed kategorija i pojmova se
  nasumično generira.

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

  <h6 class="display-6">Upute</h6>
  <br />

  <span class="tab"></span>
  Upute su dane prilikom zadavanja zagonetke i omogućavaju povezivanje
  vrijednosti kategorije s određenim pojmom.

  <br />
  <br />

  <h6 class="display-6">Pomoćna tablica</h6>
  <br />

  <span class="tab"></span>
  U pomoćnu tablicu upisujemo kvačicu u polja gdje se križaju vrijednosti koje
  dvije kategorije poprimaju za isti pojam. Upisujemo križić ako je nemoguće da
  za pojam jedna kategorija poprimi jednu, a druga kategorija drugu vrijednost.
  Ako nismo sigurni, upisuje se upitnik. Jedna kategorija poprima točno jednu
  vrijednost za svaki pojam. Više pojmova nema istu vrijednost za istu
  kategoriju.

  <br />
  <br />

  <h6 class="display-6">Kategorije</h6>
  <br />

  <span class="tab"></span>
  Prema pomoćnoj tablici, gdje su prikazane kvačice, križići ili upitnici,
  generira se još jedna tablica gdje su pod naslovom kategorije u svakom stupcu
  prikazane vrijednosti ili kratice za pojam koji je predstavljen retkom.

  <br />
  <br />

  <h6 class="display-6">Slike</h6>
  <br />

  <span class="tab"></span>
  Slike koje zamjenjuju pojmove u određenim kategorijama biti će zasebno
  prikazane i označene kraticom koja se sastoji od broja kategorije i slova A,
  B, C, D ili E koje označava broj slike unutar kategorije.
  <br />
  <br />

  <h6 class="display-6">Kratice</h6>
  <br />

  <span class="tab"></span>
  Riječi dulje od 20 znakova biti će prikazane kraticom koja se sastoji od broja
  kategorije i slova A, B, C, D ili E koje označava broj pojma unutar
  kategorije.

  <br />
  <br />
  <h6 class="display-6">Podaci o zagonetci</h6>
  <br />
  <span class="tab"></span>
  Zagonetka ima naslov zbog identifikacije, opis koji pomaže prilikom rješavanja
  te izvor koji omogućava da se priznaju zasluge originalnom autoru ukoliko se
  prepisuje tuđu zagonetku u sustav.
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
