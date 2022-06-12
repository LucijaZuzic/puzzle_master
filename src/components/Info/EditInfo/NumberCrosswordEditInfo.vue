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
  Zagonetci zadajemo broj redaka i stupaca.
  Maksimalni broj redaka je 50, a isto vrijedi i za stupce.
  <br />
  <br /> 
  <h6 class="display-6">Ispuna mreže</h6>
  <br />
  <span class="tab"></span>
  Mreža se može ispuniti znamenkama od 0  do 9
  ili barijerama između brojeva. Može se i obrisati znamenku
   ili označiti da se u polju
  nalazi barijera. Može se tamnijom ružičastom bojom osjenčati
  određeno polje zagonetke i označiti ga kao dio rješenja ili
  ga osjenčati plavom bojom i podebljati te prikazati kao pomoć rješavaču. 
  <br />
  <br />
  <h6 class="display-6">Nasumično generiranje</h6>
  <br />
    <span class="tab"></span>
  Može se nasumično generirati znamenke i barijere.
  Prilikom generiranja vrijednosti može se odabrati nadopunu samo praznih
  vrijednosti ili promjenu upisanih vrijednosti. Dodatno se može kontrolirati
  barijere između pojmova, odnosno polja ispunjena crnom bojom. Može se odabrati
  da se barijere između pojmova zadrže ili da se generiraju nove.

  <br />
  <br /> 
  <h6 class="display-6">Zagonetka</h6>
  <br />
  <span class="tab"></span>
  Zagonetka je predstavljena mrežom unutar koje je svako polje ili barijera
  između brojeva ili mora imati znamenku. Zadnja aktivna pozicija u
  mreži naznačena je iznad mreže radi lakšeg snalaženja. Veličina mreže može se
  prilagoditi radi bolje vidljivosti.

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
  Automatski se generira popis kako se upisuju znamenke i barijer u mrežu. Broj ne može započeti znamenkom 0,
   pa ju nije dozvoljeno upisati u prvi redak, prvi stupac niti neposredno nakon barijere u retku ili stupcu, osim
   ako i iduće polje nije barijera.  
  <br />
  <br />
  <h6 class="display-6">Podaci o zagonetci</h6>
  <br />
  <span class="tab"></span>
  Obvezno je zagonetci navesti naslov zbog identifikacije, opis koji pomaže
  prilikom rješavanja te izvor koji omogućava da se priznaju zasluge originalnom
  autoru ukoliko se prepisuje tuđu zagonetku u sustav. Izborno je uz zagonetku
  dodati i sliku koja uz opis pruža dodatnu pomoć prilikom rješavanja.

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
