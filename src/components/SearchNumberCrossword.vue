 
<script>

    import { numberCrosswordsRef } from "../main.js"

    export default {
        data() {
            return { 
                puzzles: [],
                new_item: "",
                new_item_tag: "",
                filterBy: '',
                new_item_exact: false,
                filter: '',
                useCustomFilteringFn: false,
                filters: [],
                filtered: [],
                columns: [],
                sortBy: 'username',
                sortingOrder: 'asc',
                perPage: 10,
                currentPage: 1,
                columns: [
                    {key: 'rows', sortable: true},
                    {key: 'columns', sortable: true},
                    {key: 'description', sortable: true},
                    {key: 'source', sortable: true},
                    {key: 'is_public', sortable: true},
                    {key: 'permissions', sortable: true},
                    {key: 'author', sortable: true},
                    {key: 'time_created', sortable: true},
                    {key: 'updater', sortable: true},
                    {key: 'last_updated', sortable: true},
                    {key: 'id', sortable: false},
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
                let result = []
                let funct_ref = this.string_to_array
                numberCrosswordsRef.get().then(function(snapshot) {
                    snapshot.forEach(function(childSnapshot) {
                        let permissions = childSnapshot.get('permissions')
                        let solution = funct_ref(childSnapshot.get('solution'))
                        if (permissions) {
                            permissions = permissions.substring(1, permissions.length - 1)
                        }
                        result.push({
                            rows: solution.length,
                            columns: solution[0].length,
                            description: childSnapshot.get('description'), 
                            source: childSnapshot.get('source'), 
                            is_public: childSnapshot.get('is_public'),
                            permissions: permissions,
                            author: childSnapshot.get('author'), 
                            time_created: new Date(childSnapshot.get('time_created').seconds * 1000), 
                            updater: childSnapshot.get('updater'),
                            last_updated: new Date(childSnapshot.get('last_updated').seconds * 1000), 
                            id: childSnapshot.id, 
                        })
                    });
                }).then(() => {
                    this.puzzles = result
                })
            },
            sortByOptions () {
                return this.columns.map(({ key }) => key)
            },
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
        <template #header(description)>Opis zagonetke</template>
        <template #header(author)>Autor</template>
        <template #header(updater)>Zadnji ažurirao</template>
        <template #header(is_public)>Dozvola uređivanja</template>
        <template #header(permissions)>Suradnici</template>
        <template #header(source)>Izvor zagonetke</template>
        <template #header(time_created)>Vrijeme kreiranja</template>
        <template #header(last_updated)>Vrijeme zadnje izmjene</template>
        <template #cell(id)="{ source: id }">
            <router-link v-bind:to="{ name: 'solve_number_crossword', params: { id: id }}">
            <router-link v-bind:to="{ name: 'edit_number_crossword', params: { id: id }}">
                <va-icon name="mode_edit"/>
            </router-link>
                <va-icon name="play_arrow"/>
            </router-link>
        </template>
        <template #cell(is_public)="{ source: is_public }"><span v-if="is_public">Svi</span><span v-else>Samo suradnici</span></template>
        <template #bodyAppend>
            <tr>
                <td colspan="11" style="text-align: left">
                    <router-link to="/createNumberCrossword"> 
                        <va-icon color="primary" class="mr-4" name="add_circle"/> Nova zagonetka
                    </router-link>
                </td>
            </tr>
            <tr>
                <td colspan="11" class="table-example--pagination">
                    <va-pagination
                    v-model="currentPage"
                    input
                    :pages="pages"
                    />
                </td>
            </tr>
        </template>
    </va-data-table>
</template>

<style>

  .table-example--pagination {
    text-align: center;
    text-align: -webkit-center;
  }
</style>
