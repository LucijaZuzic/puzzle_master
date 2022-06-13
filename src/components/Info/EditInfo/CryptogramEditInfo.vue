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
  Kriptogramu zadajemo broj redaka, broj stupaca i broj uključenih slova.
  Maksimalni broj redaka je 50, a isto vrijedi i za stupce. Maksimalni broj
  slova je 11 jer moraju postojati točno tri jedinstvene i ispunjene opcije
  slova za svaki broj u kriptogramu, a u podržanoj abecedi dostupno je 34 znaka.
  <br />
  <br />
  <h6 class="display-6">Nasumično generiranje</h6>
  <br />
  <span class="tab"></span>
  Vrijednosti koje se mogu nasumično generirati su slova uključena u kriptogram,
  brojevi u kriptogramu koji predstavljaju jedan od tri moguća znaka te opcije
  koje određuju koji se od tri znaka prikazuje u određenom polju. Može se
  odabrati da se naznačene vrijednost, umjesto generiranja, izbrišu.

  <br />
  <br />
  <h6 class="display-6">Opcije generiranja</h6>
  <br />
  <span class="tab"></span>
  Prilikom generiranja vrijednosti može se odabrati nadopunu samo praznih
  vrijednosti ili promjenu upisanih vrijednosti. Dodatno se može kontrolirati
  barijere između pojmova, odnosno polja ispunjena crnom bojom. Može se odabrati
  da se barijere između pojmova zadrže ili da se generiraju nove.
  <span class="tab"></span>
  <br />
  <br />
  <h6 class="display-6">Ispuna mreže</h6>
  <br />
  <span class="tab"></span>
  Mreža se može ispuniti brojevima od 0 (uključivo) do broja uključenih slova
  (isključivo) ili barijerama između pojmova. Mora se naznačiti opcija 1, 2 ili
  3 za svaki broj. Može se i obrisati broj ili opciju ili označiti da se u polju
  nalazi barijera. Može se tamnijom ili svjetlijom ružičastom bojom osjenčati
  određeno polje kriptograma i označiti ga kao glavni ili pomoćni ključ ili
  polju dodati iscrtkani brid.

  <br />
  <br />
  <h6 class="display-6">Slova</h6>
  <br />
  <span class="tab"></span>
  Slova moraju biti jedinstvena i pripadati zadanoj abecedi. Može se
  kontrolirati koja su slova otkrivena rješavaču na početku rješavanja zagonetke
  kao dodatna pomoć.

  <br />
  <br />
  <h6 class="display-6">Zagonetka</h6>
  <br />
  <span class="tab"></span>
  Kriptogram je predstavljen mrežom unutar koje je svako polje ili barijera
  između pojmova ili mora imati zadan broj i opciju. Zadnja aktivna pozicija u
  mreži naznačena je iznad mreže radi lakšeg snalaženja. Veličina mreže može se
  prilagoditi radi bolje vidljivosti.

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
