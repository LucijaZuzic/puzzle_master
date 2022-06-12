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
  polja kojima odabrana boja ne odgovara boji u rješenju. 

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

  <h6 class="display-6">Bojanje</h6>
  <br />

  
  <span class="tab"></span>Možemo odabrati boju sa unaprijed zadanog popisa i odabrati hoćemo li vršiti ispunu segmenta ili jedno po jedno polje.
  Ukoliko koristimo uređaj koji podržava gestu prelaska mišem, možemo bojati na taj način, ali tada ne možemo bojati po segmentu.
   <br />
  <br />

  <h6 class="display-6">Brisanje</h6>
  <br />
  
  <span class="tab"></span>
  Na popisu je uvijek prvo bijela boja koja služi za brisanje ispunjenih ćelija. Možemo i odjednom obrisati sve ćelije koje smo ispunili ili 
  obrisati samo ćelije koje smo ispunili trenutno korištenom bojom.
<br />
  <br />
  <h6 class="display-6">Zagonetka</h6>
  <br />
  <span class="tab"></span>
  Zagonetka je predstavljena mrežom unutar koje je svako polje ili bijelo ili ispunjeno bojom.
  Zadatak rješavača je ispuniti mrežu tako da odgovara zadanom popisu  segmenata određene boje u redku ili stupcu.
   Zadnja aktivna pozicija u
  mreži naznačena je iznad mreže radi lakšeg snalaženja. Veličina mreže može se
  prilagoditi radi bolje vidljivosti.

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
