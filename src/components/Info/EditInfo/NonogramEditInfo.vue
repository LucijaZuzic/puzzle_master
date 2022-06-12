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
  Zagonetci zadajemo broj redaka, stupaca i broj boja. Maksimalni broj redaka je
  50, a isto vrijedi i za stupce i za boje.
  <br />
  <br />

  <h6 class="display-6">Boje</h6>
  <br />

  <span class="tab"></span> Možemo odabrati popis boja, ali prva na popisu
  uvijek je bijela koja služi dodavanju praznina između segmenata određene boje. Nasumično se
  odabiru nove boje kada povećamo broj boja. 
  <br />
  <br />

  <h6 class="display-6">Način bojanja</h6>
  <br />

  <span class="tab"></span>
  Možemo odabrati hoćemo li vršiti
  ispunu segmenta ili jedno po jedno polje. Ukoliko koristimo uređaj koji
  podržava gestu prelaska mišem, možemo bojati na taj način, ali tada ne možemo
  bojati po segmentu. Možemo i odjednom obrisati sve ćelije koje smo
  ispunili ili obrisati samo ćelije koje smo ispunili trenutno korištenom bojom.
  <br />
  <br />
  <h6 class="display-6">Zagonetka</h6>
  <br />
  <span class="tab"></span>
  Zagonetka je predstavljena mrežom unutar koje je svako polje ili bijelo ili
  ispunjeno bojom. Automatski se generira popis segmenata određene boje u redku
  ili stupcu. Zadnja aktivna pozicija u mreži naznačena je iznad mreže radi
  lakšeg snalaženja. Veličina mreže može se prilagoditi radi bolje vidljivosti.

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
