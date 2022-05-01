 
<script>
    import { getAuth, onAuthStateChanged } from "firebase/auth"
    import { nonogramsRef } from "../main.js"
    import { nonogramsRecordsRef } from "../main.js"
    import RecordsTable from "./RecordsTable.vue" 
    import { usersRef } from "../main.js"
    export default {
        emits: ["selectedNonograms"],  
        props: ["puzzleList", "selectMode", "start_time", "end_time"], 
        components: {
            RecordsTable
        },
        mounted() {   
            const auth = getAuth()
            onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/firebase.User
                this.user = user
                // ...
            } else {
                // User is signed out
                // ... 
            }
            });
        },
        data() {
            return {
                user: null,
                nonogramsRecordsRef: nonogramsRecordsRef,
                puzzles: [],
                selectedItemsEmitted: [],
                new_item: "",
                new_item_tag: "",
                filterBy: '',
                new_item_exact: false,
                filter: '',
                useCustomFilteringFn: false,
                filters: [],
                filtered: [],
                columns: [],
                sortBy: 'time_created',
                sortingOrder: 'desc',
                perPage: 10,
                currentPage: 1,
                columns: [
                    {key: 'rows', sortable: true},
                    {key: 'columns', sortable: true},
                    {key: 'colors', sortable: true},
                    {key: 'title', sortable: true},
                    {key: 'description', sortable: true},
                    {key: 'source', sortable: true},
                    {key: 'is_public', sortable: true}, 
                    {key: 'author_display_name', sortable: true},
                    {key: 'author_email', sortable: true},
                    {key: 'time_created', sortable: true},
                    {key: 'updater_display_name', sortable: true},
                    {key: 'updater_email', sortable: true},
                    {key: 'last_updated', sortable: true},
                    {key: 'id', sortable: false},
                    {key: 'deletePermission', sortable: false},
                ],
                sortingOrderOptions: [
                    { text: 'Uzlazno', value: 'asc' },
                    { text: 'Silazno', value: 'desc' },
                    { text: 'Bez sortiranja', value: null },
                ], 
            }
        }, 
        methods: {
            filterExact (source) {
                if (this.filter === '') {
                    return true
                }
                return source?.toString?.() === this.filter
            },
            string_to_array(array_string) {
                    if (!array_string) {
                        return []
                    }
                    if (array_string[1] == '[') {
                        let array = array_string.substring(2, array_string.length - 2).split("],[")
                        for (let i = 0; i < array.length; i++) {
                            array[i] = array[i].split(",")
                            for(let j = 0; j < array[i].length; j++) {
                                array[i][j] = parseInt(array[i][j])
                            }
                        }
                        return array
                    } else {
                        let array = array_string.substring(1, array_string.length - 1).split(",")
                        return array
                    }
            },
            fetch_puzzles() {
                this.puzzles = []
                let me = this
                let funct_ref = this.string_to_array 
                nonogramsRef.get().then(function(snapshot) {
                    snapshot.forEach(function(childSnapshot) { 
                        let inList = true
                        if (me.$props.puzzleList) {
                            inList = false
                            for (let i = 0; i < me.$props.puzzleList.length; i++) {
                                if (me.$props.puzzleList[i] == childSnapshot.id) {
                                    inList = true
                                    break
                                }
                            }
                        }
                        if (inList == true) {
                            let solution = funct_ref(childSnapshot.get('solution')) 
                            usersRef.get(childSnapshot.get('author')).then(function(snapshotAuthor) {
                                snapshotAuthor.forEach(function(childSnapshotAuthor) {
                                    let idAuthor = childSnapshotAuthor.id; 
                                    if (idAuthor == childSnapshot.get('author')) { 
                                        usersRef.get(childSnapshot.get('updater')).then(function(snapshotUpdater) {
                                        snapshotUpdater.forEach(function(childSnapshotUpdater) {
                                                let idUpdater = childSnapshotUpdater.id; 
                                                if (idUpdater == childSnapshot.get('updater')) {  
                                                    let newDeletePermission = {granted: false, id: childSnapshot.id}
                                                    if (me.user) {
                                                        newDeletePermission = {granted: childSnapshotAuthor.id == me.user.uid, id: childSnapshot.id}
                                                    }
                                                    me.puzzles.push({
                                                        rows: solution.length,
                                                        columns: solution[0].length,
                                                        colors: childSnapshot.get('colors').length,
                                                        title: childSnapshot.get('title'), 
                                                        description: childSnapshot.get('description'), 
                                                        source: childSnapshot.get('source'), 
                                                        is_public: childSnapshot.get('is_public'), 
                                                        author_display_name: childSnapshotAuthor.get('displayName'), 
                                                        author_email: childSnapshotAuthor.get('email'), 
                                                        time_created: new Date(childSnapshot.get('time_created').seconds * 1000).toLocaleString(), 
                                                        updater_display_name: childSnapshotUpdater.get('displayName'), 
                                                        updater_email: childSnapshotUpdater.get('email'), 
                                                        last_updated: new Date(childSnapshot.get('last_updated').seconds * 1000).toLocaleString(), 
                                                        id: childSnapshot.id, 
                                                        deletePermission: newDeletePermission
                                                    })
                                                }
                                            });
                                        }) 
                                    }
                                });
                            }) 
                        }
                    });
                }) 
            },
            sortByOptions () {
                return this.columns.map(({ key }) => key)
            },
            deletePuzzle(id) {
                nonogramsRef.doc(id).delete().then(() => {
                    this.fetch_puzzles() 
                    this.$forceUpdate()
                })
            }
        },
        created() {
            this.fetch_puzzles()
        },
        computed: {
            customFilteringFn () {
                return this.useCustomFilteringFn ? this.filterExact : undefined
            },
            pages () {
                return (this.perPage && this.perPage !== 0)
                    ? Math.ceil(this.filtered.length / this.perPage)
                    : this.filtered.length
            },
        },
    }
</script>

<template>  
    <div class="myrow">
        <va-input
        class="flex mb-2 md6" style="display: inline-block;margin-left: 2%;margin-top: 2%;width: 25%" 
        placeholder="Unesite pojam za pretragu"
        v-model="filter"
        />  
        <va-checkbox style="display: inline-block;margin-left: 2%;margin-top: 2%" 
        class="flex mb-2 md6"
        label="Traži cijelu riječ"
        v-model="useCustomFilteringFn"
        /> 
        <va-input style="display: inline-block;margin-left: 2%;margin-top: 2%;width: 10%"  
            label="Trenutna stranica"
            class="flex mb-2 md6"
            v-model="currentPage"
            :min="1"
            :max="Math.ceil(this.filtered.length / this.perPage)"
            type="number"
        /> 
        <va-input style="display: inline-block;margin-left: 2%;margin-top: 2%;width: 10%"  
            label="Broj pojmova na stranici"
            class="flex mb-2 md6"
            v-model="perPage"
            :min="1"
            :max="Math.ceil(this.filtered.length)"
            type="number"
        /> 
    </div> 
    <va-data-table 
        :items="puzzles"
        :filter="filter"
        :columns="columns"
        :hoverable="true" 
        :per-page="perPage"
        selectable="selectable"
        :select-mode="selectMode"
        @selectionChange="selectedItemsEmitted = $event.currentSelectedItems;$emit('selectedNonograms', selectedItemsEmitted)"
        :current-page="currentPage"
        v-model:sort-by="sortBy"
        v-model:sorting-order="sortingOrder"
        @filtered="filtered = $event.items" 
        no-data-filtered-html="Pretraga nije dala rezultate." 
        no-data-html="Nema podataka." 
        :filter-method="customFilteringFn" >
        <template #header(id)>Akcije</template>
        <template #header(rows)>Broj redaka</template>
        <template #header(columns)>Broj stupaca</template>
        <template #header(colors)>Broj boja</template>
        <template #header(title)>Naslov zagonetke</template>
        <template #header(description)>Opis zagonetke</template>
        <template #header(author_display_name)>Autor (ime)</template>
        <template #header(author_email)>Autor (email)</template>
        <template #header(updater_display_name)>Zadnji ažurirao (ime)</template>
        <template #header(updater_email)>Zadnji ažurirao (email)</template>
        <template #header(is_public)>Dozvola uređivanja</template> 
        <template #header(source)>Izvor zagonetke</template>
        <template #header(time_created)>Vrijeme kreiranja</template>
        <template #header(last_updated)>Vrijeme zadnje izmjene</template>
        <template #header(deletePermission)>Izbriši</template>
        <template #cell(id)="{ source: id }">
            <router-link v-bind:to="{ name: 'edit_nonogram', params: { id: id }}">
                <va-icon name="mode_edit"/>
            </router-link>
            <router-link v-bind:to="{ name: 'solve_nonogram', params: { id: id }}">
                <va-icon name="play_arrow"/>
            </router-link>
        </template>
        <template #cell(deletePermission)="{ source: deletePermission }"> 
            <va-icon v-if="deletePermission.granted == true" @click="deletePuzzle(deletePermission.id)" name="delete"/>
        </template>
        <template #cell(is_public)="{ source: is_public }"><span v-if="is_public">Svi</span><span v-else>Samo suradnici</span></template>
        <template #bodyAppend>
            <tr>
                <td colspan="12" style="text-align: left">
                    <router-link to="/createnonogram"> 
                        <va-icon color="primary" class="mr-4" name="add_circle"/> Nova zagonetka
                    </router-link>
                </td>
            </tr>
            <tr>
                <td colspan="12" class="table-example--pagination">
                    <va-pagination
                    v-model="currentPage"
                    input
                    :pages="pages"
                    />
                </td>
            </tr>
        </template>
    </va-data-table> 
    <span v-if="!start_time && !end_time && selectMode == 'single'"> 
        <span v-for="item in selectedItemsEmitted" :key="item.id"> 
            <br>
            <h2 class="display-2">Svi rekordi za odabrani nonogram</h2>
            <RecordsTable :dbRef="nonogramsRecordsRef" :puzzleId="selectedItemsEmitted[0].id"></RecordsTable>
            <br>
            <span v-if="user">
                <h2 class="display-2">Moji rekordi za odabrani nonogram</h2>
                <RecordsTable :dbRef="nonogramsRecordsRef" :puzzleId="selectedItemsEmitted[0].id" :userId="user.uid"></RecordsTable>
            </span>
        </span>
    </span>
    <span v-if="start_time && end_time && selectMode == 'single'"> 
        <span v-for="item in selectedItemsEmitted" :key="item.id"> 
            <br>
            <h2 class="display-2">Svi rekordi za odabrani nonogram</h2>
            <RecordsTable :dbRef="nonogramsRecordsRef" :puzzleId="selectedItemsEmitted[0].id" :start_time="start_time" :end_time="end_time"></RecordsTable>
            <br>
            <span v-if="user">
                <h2 class="display-2">Moji rekordi za odabrani nonogram</h2>
                <RecordsTable :dbRef="nonogramsRecordsRef" :puzzleId="selectedItemsEmitted[0].id" :userId="user.uid" :start_time="start_time" :end_time="end_time"></RecordsTable>
            </span>
        </span>
    </span>  
</template>

<style>

  .table-example--pagination {
    text-align: center;
    text-align: -webkit-center;
  }
</style>
