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
  polja kojima odabrana opcija ne odgovara opciji u rješenju ili kojima slovo
  koje opcija predstavlja ne odgovara slovu koje opcija predstavlja u rješenju.
  Svaki put kada se zagoneta rješava redoslijed slova i opcija se nasumično
  generira.

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

  <h6 class="display-6">Ispuna mreže</h6>
  <br />
  <span class="tab"></span>
  Mreža je unaprijed ispunjena brojevima od 0 (uključivo) do broja uključenih
  slova (isključivo) ili barijerama između pojmova. Mora se naznačiti opcija 1,
  2 ili 3 za svaki broj. Može se i obrisati opciju iz polja.

  <br />
  <br />
  <h6 class="display-6">Slova</h6>
  <br />
  <span class="tab"></span>
  Slova moraju biti jedinstvena i pripadati zadanoj abecedi. Neka slova su
  otkrivena rješavaču na početku rješavanja zagonetke kao dodatna pomoć i nisu
  promjenjiva. Slova koja su predstavljena određenim brojem pojavljuju se u
  mreži kada se upišu.

  <br />
  <br />
  <h6 class="display-6">Zagonetka</h6>
  <br />
  <span class="tab"></span>
  Kriptogram je predstavljen mrežom unutar koje je svako polje ili barijera
  između pojmova ili mora imati zadan broj i opciju. U mreži se na neobrojčana
  polja označena tamnijom ružičastom bojom mora upisati slovo, a za polja koja
  imaju brojeve mora se odrediti opciju. Zadnja aktivna pozicija u mreži
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
