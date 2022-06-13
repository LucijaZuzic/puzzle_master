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
  <h6 class="display-6">Dimenzije</h6>
  <br />
  <span class="tab"></span>
  Integramu zadajemo broj kategorija, vrijednosti i uputa. Kategorija i
  vrijednosti ima između 3 i 5, a uputa između 5 i 10.
  <br />
  <br />
  <h6 class="display-6">Upute</h6>
  <br />

  <span class="tab"></span>
  Upute su dane prilikom zadavanja zagonetke i omogućavaju povezivanje
  vrijednosti kategorije s određenim pojmom.
  <br />
  <br />

  <h6 class="display-6">Kategorije</h6>
  <br />

  <span class="tab"></span>
  U tablici unosimo naslove za svaku kategoriju i u redcima unosimo vrijednosti
  koje svaki pojam poprima za svaku kategoriju. Umjesto teksta određena
  kategorija može biti predstavljena slikom.

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

  <h6 class="display-6">Podaci o zagonetci</h6>
  <br />
  <span class="tab"></span>
  Obvezno je zagonetci navesti naslov zbog identifikacije, opis koji pomaže
  prilikom rješavanja te izvor koji omogućava da se priznaju zasluge originalnom
  autoru ukoliko se prepisuje tuđu zagonetku u sustav.

  <br />
  <br />
  <h6 class="display-6">Vidljivost</h6>
  <br />
  <span class="tab"></span>
  Prilikom izmjene ili prvog upisa zagonetke, može se dodati suradnika. Ukoliko
  želimo dopustiti bilo kome da uređuje zagonetku, a ne samo suradnicima, možemo
  označiti da je zagonetka javna.

  <br />
  <br />
  <h6 class="display-6">Dozvola uređivanja</h6>
  <br />
  <span class="tab"></span>
  Samo originalni autor može izmijeniti vidljivost zagonetke i dodavati
  suradnike. Ne može se dodati korisnika kao suradnika na zagonetci ukoliko
  niste prijatelji u sustavu.

  <br />
  <br />
  <h6 class="display-6">Udvostručavanje zagonetke</h6>
  <br />
  <span class="tab"></span>
  Ako je zagonetka vidljiva, može ju se udvostručiti i uređivati kopiju bez
  promjene originala. Kao autor kopije biti će upisan onaj tko je izradio
  kopiju, a ne autor originala. Kao vrijeme kreiranja kopije biti će upisano
  vrijeme kada je izrađena kopija, a ne vrijeme kada je izrađen original.
</template>

<style scoped>
.tab {
  display: inline-block;
  margin-left: 40px;
}
</style>
