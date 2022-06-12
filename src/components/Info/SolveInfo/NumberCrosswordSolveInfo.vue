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
  <h6 class="display-6">Zagonetka</h6>
  <br />
  <span class="tab"></span>
  Brojevna križaljka je predstavljena mrežom unutar koje je svako polje ili barijera
  između brojeva ili prazno polje u koje se mora upisati znamenka. 
  Zadnja aktivna pozicija u mreži
  naznačena je iznad mreže radi lakšeg snalaženja. Veličina mreže može se
  prilagoditi radi bolje vidljivosti.

  <br />
  <br />
  <h6 class="display-6">Pomoćna polja</h6>
  <br />
  <span class="tab"></span>
  Znamenke koja su osjenčane plavom bojom i podebljane otkrivene su kao pomoć rješavaču i ne mogu se mijenjati. 
  <br />
  <br />
  <h6 class="display-6">Rješenje</h6>
  <br />
  <span class="tab"></span>
  Znamenke koja su osjenčane tamnijom ružičastom bojom dio su rješenja koje je opisano prilikom zadavanja zagonetke. 
  <br />
  <br />
  <h6 class="display-6">Brojevi po duljini</h6>
  <br />
  <span class="tab"></span>
  Brojevi su razvrstani po broju znamenki te rastuće unutar skupine brojeva s istim brojem znamenki. 
  U mrežu se smještaju brojevi vodoravno ili okomito ukoliko u odabranom smjeru ima dovoljno mjesta i ako se znamenke poklapaju.   
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
