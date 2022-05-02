<script> 
import { initialsRef } from "../main.js"
import { usersRef } from "../main.js"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from './Navbar.vue'
import { ref, uploadBytes, getDownloadURL, getMetadata, deleteObject } from "firebase/storage"
import { projectStorage } from "../main.js" 


export default {
  components: {
    Navbar
  },  
  data() {
    return {
        word_warning: '',
        word: "",
        image: null,
        imageURL: "",
        user: null,
        title: "",  
        is_public: false,
        author: "",
        authorUserRecord: {displayName: "", email: ""},
        updater: "",
        updaterUserRecord: {displayName: "", email: ""},
        permissions: [],
        permissionsUserRecords: [],
        collaborator: "",
        rows: 15,
        columns: 11,
        mode_x: -1,
        mode_y: -1,
        words_by_dir: [[],[],[],[],[],[],[],[]],
        warning: true,
        source: "",  
        time_created: '',
        last_updated: '',
        is_special: [], 
        alphabet: ["A", "B", "C", "Č", "Ć", "D", "Đ", "Ǆ", "E", "F", "G", "H", "I", "J", "K", "L", "Ǉ", "M", "N", "Ǌ", "O", "P", "R", "S", "Š", "T", "U", "V", "W", "X", "Y", "Z", "Ž"],
        description: '',
    }
  },
  methods: {
        image_uploaded() { 
            this.image = document.getElementById("fileinput").files[0] 
            this.imageURL = URL.createObjectURL(this.image) 
        }, 
        click_file() { 
            document.getElementById("fileinput").click();  
        },
      getPicture() {
        if (this.image == null) {
            this.imageURL = "" 
            return
        }
        if (this.image && this.image.name == undefined) {    
                var reference = ref(projectStorage, this.image)
                // Get the download URL 
                getDownloadURL(reference)
                .then((url) => {
                    this.imageURL = url
                })
                .catch((error) => { 
                }); 
        } else {   
            let comp_url = URL.createObjectURL(this.image)
            this.imageURL = comp_url
        } 
    },
      getAuthorUserRecord() { 
        let some_id = this.author
        let newRecord = {}
        usersRef.get(some_id).then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                let id = childSnapshot.id; 
                if (id == some_id) {
                    newRecord = {displayName: childSnapshot.get('displayName'), email: childSnapshot.get('email')}
                }
            });
        }).then(() => { 
            this.authorUserRecord = newRecord
        }) 
    },
      getUpdaterUserRecord() { 
        let some_id = this.updater
        let newRecord = {}
        usersRef.get(some_id).then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                let id = childSnapshot.id; 
                if (id == some_id) {
                    newRecord = {displayName: childSnapshot.get('displayName'), email: childSnapshot.get('email')}
                }
            });
        }).then(() => { 
            this.updaterUserRecord = newRecord
        }) 
      },
      getCollaboratorUserRecord() { 
          this.permissionsUserRecords = []
          for (let i = 0; i < this.permissions.length; i++) {
            let some_id = this.permissions[i]
            let newRecord = {}
            usersRef.get(some_id).then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    let id = childSnapshot.id; 
                    if (id == some_id) {
                        newRecord = {displayName: childSnapshot.get('displayName'), email: childSnapshot.get('email')}
                    }
                });
            }).then(() => { 
                this.permissionsUserRecords.push(newRecord)
            }) 
          }  
      }, 
      checkIdentity() {
        this.permission_to_edit_visibility = false
        if (this.author == this.user.uid) {
            this.permission_to_edit_visibility = true
            return
        } 
        let is_collaborator = false
        for (let i = 0; i < this.permissions.length; i++) {
            if (this.permissions[i] == this.user.uid) {
                is_collaborator = true
                break
            }
        }
        if (is_collaborator == true) {
            this.permission_to_edit_visibility = false
            return
        } else {
            if (this.is_public == true) {
                this.permission_to_edit_visibility = false
                return
            } else {
                this.new_async(this.$refs.permission.show(), 1000).then(() => {this.$router.push("/searchinitial")})  
            }
        }  
      },
      checkIfUserExists() {  
          let email = this.collaborator
          let found = false
          let uid = ""
          let displayName = ""
          if (this.user.email == email) {
              this.$refs.me_collaborator.show()
          } else { 
            usersRef.get().then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    let some_email = childSnapshot.get("email"); 
                    if (email == some_email) {
                        found = true
                        uid = childSnapshot.id
                        displayName = childSnapshot.get("displayName")
                    }
                });
            }).then(() => {  
                if (found == true) {
                    let duplicate = false
                    for (let i = 0; i < this.permissions.length; i++) {  
                        if (this.permissions[i] == uid) {
                            duplicate = true
                            break
                        }
                    } 
                    if (duplicate == true) {
                        this.$refs.duplicate_collaborator.show()
                    } else {
                        this.permissions.push(uid)
                        this.permissionsUserRecords.push({"displayName": displayName, "email": email})
                    }
                } else {
                    this.$refs.no_collaborator.show()
                }
            })  
          }
      }, 
      initialize() {
          this.rows = parseInt(this.rows)
          this.columns = parseInt(this.columns) 
          let oldsolution = []
          let oldisspecial = [] 
          let maxcol = this.columns
          let maxrow = this.rows
          if (this.solution) {
               oldsolution = this.solution
               oldisspecial = this.is_special
               if (oldsolution.length > maxrow) {
                   maxrow = oldsolution.length
               }
               if (oldsolution[0].length > maxcol) {
                   maxcol = oldsolution[0].length
               }
          }
          this.solution = []
          this.is_special = [] 
          this.solution = []
          for (let i = 0; i < maxrow; i++) {
              let solution_row = []
              let special_row = [] 
              for (let j = 0; j < maxcol; j++) {
                    if (oldsolution[i]) {
                        if (oldsolution[i].length > j) {
                            solution_row.push(oldsolution[i][j])
                            special_row.push(oldisspecial[i][j])
                         } else {
                            solution_row.push('')
                            special_row.push(0)
                         }
                    }  else {
                        solution_row.push('')
                        special_row.push(0)
                     }
              }
              this.solution.push(solution_row)
              this.is_special.push(special_row)
               for (let j = 0; j < maxcol; j++) {
                if (oldsolution[i]) {
                    if (oldsolution[i].length > j) {
                        this.solution[i][j] = oldsolution[i][j]
                        this.is_special[i][j] = oldisspecial[i][j]
                     }
                }
              }
          }  
        for (let i = 0; i < this.solution.length; i++) {
            for (let j = 0; j < this.solution[i].length; j++) {
                this.solution[i][j] = ''
            }
        }
        let old_words = this.words_by_dir 
        this.words_by_dir = [[],[],[],[],[],[],[],[]]
        for (let i = 0; i < old_words.length; i++) {
            for (let j = 0; j < old_words[i].length; j++) {
                let dirs = this.get_dirxy(i)
                this.place_word(old_words[i][j][0], old_words[i][j][1], old_words[i][j][2], dirs[0], dirs[1], false)
            }
        }
        this.check_full()
      }, 
      reset() {
          let new_special = []
          let new_values = []
           for (let i = 0; i < this.rows; i++) {
              let special_row = []
              let solution_row = []
               for (let j = 0; j < this.columns; j++) {
                special_row.push(0)
                solution_row.push('')
               }
              new_special.push(special_row)
              new_values.push(solution_row)
           }
          this.is_special = new_special
          this.solution = new_values
          this.words_by_dir = [[],[],[],[],[],[],[],[]]
      },
      
      count_special() {
          for (let i = 0; i < this.is_special.length; i++) {
              for (let j = 0; j < this.is_special[i].length; j++) {
                  if (this.is_special[i][j]) {
                      return true
                  }
              }
          }
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
                        if (!this.alphabet.includes(array[i][j][0])) {
                            array[i][j] = parseInt(array[i][j]) 
                        }
                    }
                }
                return array
            } else {
                let array = array_string.substring(1, array_string.length - 1).split(",")
                return array
            }
      }, 
      fetch_puzzle() {
        let params_id= this.$route.params.id
        let string_solution = []
        let string_is_special = []
        let string_words_by_dir = [[],[],[],[],[],[],[],[]]
        let string_title = ""
        let string_description = ""
        let string_image = ""
        let string_author = ""
        let string_updater = ""
        let string_is_public = false
        let string_permissions = []
        let string_source = ""
        let string_time_created = ""
        let string_last_updated = ""
        let found = false
        let funct_ref = this.string_to_array
        initialsRef.get(params_id).then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                let id = childSnapshot.id;
                if (id == params_id) {
                    string_solution = funct_ref(childSnapshot.get('solution'))
                    string_is_special = funct_ref(childSnapshot.get('is_special'))
                    string_words_by_dir[0] = funct_ref(childSnapshot.get('dir1'))
                    string_words_by_dir[1] = funct_ref(childSnapshot.get('dir2'))
                    string_words_by_dir[2] = funct_ref(childSnapshot.get('dir3'))
                    string_words_by_dir[3] = funct_ref(childSnapshot.get('dir4'))
                    string_words_by_dir[4] = funct_ref(childSnapshot.get('dir5'))
                    string_words_by_dir[5] = funct_ref(childSnapshot.get('dir6'))
                    string_words_by_dir[6] = funct_ref(childSnapshot.get('dir7'))
                    string_words_by_dir[7] = funct_ref(childSnapshot.get('dir8')) 
                    string_title = childSnapshot.get('title')
                    string_description = childSnapshot.get('description')
                    string_image = childSnapshot.get('image')
                    string_author = childSnapshot.get('author')
                    string_updater= childSnapshot.get('updater')
                    string_is_public = childSnapshot.get('is_public')
                    string_permissions = childSnapshot.get('permissions')
                    string_source = childSnapshot.get('source')
                    string_time_created = new Date(childSnapshot.get('time_created').seconds * 1000)
                    string_last_updated = new Date(childSnapshot.get('last_updated').seconds * 1000)
                    found = true
                }
            });
        }).then(() => {
            if (found) {
                this.solution = string_solution
                this.is_special = string_is_special 
                this.words_by_dir = string_words_by_dir  
                this.title = string_title
                this.description = string_description
                this.image = string_image 
                this.oldimage = this.image
                this.author = string_author
                this.getAuthorUserRecord()
                this.updater = string_updater
                this.getUpdaterUserRecord()
                this.is_public = string_is_public
                this.permissions = string_permissions
                this.getCollaboratorUserRecord()
                this.checkIdentity()
                this.source = string_source
                this.time_created = string_time_created
                this.last_updated = string_last_updated
                this.rows = this.solution.length
                this.columns = this.solution[0].length
                this.initialize()
                this.getPicture()
                this.$forceUpdate()
            } else {
                this.new_async(this.$refs.no_puzzle.show(), 1000).then(() => {this.$router.push("/searchinitial")})  
            }
        })
      },
      array_to_string(array) {
          let string = "["
          for (let i = 0; i < array.length; i++) {
              if (i != 0) {
                  string += ","
              }
              string += "[" + array[i].toString() + "]"
          }
          return string + "]"
      },  
      check_word() {
          this.word_warning = ''
          this.word = this.word.toUpperCase()
          for (let i = 0; i < this.word.length; i++) {
              if (!this.alphabet.includes(this.word[i])) {
                  if (this.word_warning != '') {
                    this.word_warning += ' '
                  }
                  this.word_warning += (i + 1) + ". slovo riječi " + this.word + " (" + this.word[i] + ") nije dio abecede."
              }
          }
      },
      check_start(x, y, show_warning) {
        for (let i = 0; i < this.words_by_dir.length; i++) {
            for (let j = 0; j < this.words_by_dir[i].length; j++) {
                if (this.words_by_dir[i][j][0] == x && this.words_by_dir[i][j][1] == y) {
                    if (show_warning == true) {
                        this.$refs.collision_start.show()
                    }
                    return true
                }
            }
        }
        return false
      },
      check_dir(x, y, new_word, dirx, diry, show_warning) {
          for (let letter_number = 0; letter_number < new_word.length; letter_number++) {   
              let x_new = x + letter_number * dirx  
              let y_new = y + letter_number * diry
              if (x_new < 0 || x_new >= this.columns) {
                  if (show_warning) {
                    this.$refs.collision_fit.show()
                  }
                  return false
              }
              if (y_new < 0 || y_new >= this.rows) {
                  if (show_warning) {
                    this.$refs.collision_fit.show()
                  }
                  return false
              }
              if (this.solution[y_new][x_new] != '' && this.solution[y_new][x_new] != new_word[letter_number]) {
                  if (show_warning) {
                    this.$refs.collision_letter.show()
                  }
                  return false
              }
          }
          return true
      }, 
      get_dirxy(dir) {
          let dirx = -2
          let diry = -2
          if (dir < 3) {
              dirx = -1
              diry = dir - 1
          }
          if (dir == 3) { 
              dirx = 0
              diry = -1
          }
          if (dir == 4) { 
              dirx = 0
              diry = 1
          }
          if (dir > 4) {
              dirx = 1
              diry = dir - 6
          }
          return [dirx, diry]
      },
      get_dir(dirx, diry) {
          if (dirx == -1) {
              return diry + 1
          }
          if (dirx == 0) {
              if (diry == -1) {
                  return 3
              }
              if (diry == 1) {
                  return 4
              }
          }
          if (dirx == 1) {
              return diry + 6
          }
      },
      add_word(x, y, new_word, dirx, diry) {
          for (let letter_number = 0; letter_number < new_word.length; letter_number++) {   
              let x_new = x + letter_number * dirx  
              let y_new = y + letter_number * diry
              this.solution[y_new][x_new] = new_word[letter_number]
          }
          this.words_by_dir[this.get_dir(dirx, diry)].push([x, y, new_word])
          this.words_by_dir[this.get_dir(dirx, diry)].sort(this.sortFunction)
      },
        sortFunction(a, b) {
            if (a[2] === b[2]) {
                if (a[1] === b[1]) {
                    if (a[0] === b[0]) {
                        return 0;
                    }
                    else {
                        return (a[0] < b[0]) ? -1 : 1;
                    }
                }
                else {
                    return (a[1] < b[1]) ? -1 : 1;
                }
            }
            else {
                return (a[2] < b[2]) ? -1 : 1;
            }
        },
      place_word(x, y, new_word, dirx, diry, show_warning) {
        if (!new_word) {
            return
        }
        if (new_word.length == 0) {
            return
        }
        if (dirx == -2 || diry == -2) {
            this.is_special[y][x] = (this.is_special[y][x] + 1) % 2
            return
        }
        if (this.word_warning == '' || !show_warning) {
            //if (this.check_start(x, y, show_warning) == false) {
                if (this.check_dir(x, y, new_word, dirx, diry, show_warning) == true) {
                    this.add_word(x, y, new_word, dirx, diry)
                    let number_of_words = 0
                    let number_of_dirs = 0;
                    for (let i = 0; i < this.words_by_dir.length; i++) {
                        if (this.words_by_dir[i].length != 0) {
                            number_of_words += this.words_by_dir[i].length
                            number_of_dirs++
                        }
                    }
                    this.page_length = Math.ceil(number_of_words / number_of_dirs)
                    this.check_full()
                }
            //}
        } 
        this.$forceUpdate()
      },
      remove_word(i, j) {
        this.words_by_dir[i].splice(j, 1)
        let old_words = this.words_by_dir
        this.reset()  
        for (let i = 0; i < old_words.length; i++) {
            for (let j = 0; j < old_words[i].length; j++) {
                let dirs = this.get_dirxy(i)
                this.add_word(old_words[i][j][0], old_words[i][j][1], old_words[i][j][2], dirs[0], dirs[1])
            }
        }
        this.check_full()
        this.$forceUpdate()
      }, 
      check_full() {
          this.warning = false
          for (let i = 0; i < this.rows; i++) {
              for (let j = 0; j < this.columns; j++) {
                  if (this.solution[i][j] == '') {
                      this.warning = true 
                  }
              }
          } 
      },
    store() {
        let params_id= this.$route.params.id
        let datetime = new Date()
        let funct_ref = this.array_to_string
        let newsolution = []
        let newspecial = []
        for (let i = 0; i < this.rows; i++) {
            newsolution.push([])
            newspecial.push([])
            for (let j = 0; j < this.columns; j++) {
            newsolution[i].push(this.solution[i][j])
            newspecial[i].push(this.is_special[i][j])
            }
        }
        initialsRef.doc(params_id).update({
                solution: funct_ref(newsolution),
                is_special: funct_ref(newspecial),
                dir1: funct_ref(this.words_by_dir[0]),
                dir2: funct_ref(this.words_by_dir[1]),
                dir3: funct_ref(this.words_by_dir[2]),
                dir4: funct_ref(this.words_by_dir[3]),
                dir5: funct_ref(this.words_by_dir[4]),
                dir6: funct_ref(this.words_by_dir[5]),
                dir7: funct_ref(this.words_by_dir[6]),
                dir8: funct_ref(this.words_by_dir[7]),
                title: this.title,
                description: this.description,
                image: "",
                author: this.author,
                updater: this.user.uid,
                is_public: this.is_public,
                permissions: this.permissions,
                source: this.source,
                time_created: this.time_created,
                last_updated: datetime,
        }).then((docRef) => { 
            if (this.image && this.image.name == undefined) {    
                initialsRef.doc(params_id).update({
                    solution: funct_ref(newsolution),
                    is_special: funct_ref(newspecial),
                    dir1: funct_ref(this.words_by_dir[0]),
                    dir2: funct_ref(this.words_by_dir[1]),
                    dir3: funct_ref(this.words_by_dir[2]),
                    dir4: funct_ref(this.words_by_dir[3]),
                    dir5: funct_ref(this.words_by_dir[4]),
                    dir6: funct_ref(this.words_by_dir[5]),
                    dir7: funct_ref(this.words_by_dir[6]),
                    dir8: funct_ref(this.words_by_dir[7]),
                    title: this.title,
                    description: this.description,
                    image: this.image,
                    author: this.author,
                    updater: this.user.uid,
                    is_public: this.is_public,
                    permissions: this.permissions,
                    source: this.source,
                    time_created: this.time_created,
                    last_updated: datetime,
                }).then(() => {this.new_async(this.$refs.store_success.show(), 1000).then(() => {this.$router.push("/searchinitial")}) })
            } else {    
                if (this.oldimage) {
                    let oldRef = ref(projectStorage, this.oldimage);
                    // Delete the file
                    deleteObject(oldRef).then(() => {
                    // File deleted successfully
                    }).catch((error) => {
                    // Uh-oh, an error occurred!
                    });
                } 
                let exstension = this.image.name.split('.')[this.image.name.split('.').length - 1]
                const reference = 'initial/' + params_id + "."  + exstension; 
                const storageRef = ref(projectStorage, reference);
                    const metadata = {
                    contentType: 'image/' + exstension
                };
                // 'file' comes from the Blob or File API 
                uploadBytes(storageRef, this.image, metadata).then((snapshot) => {  
                })
                .catch((error) => {  
                }).then(() => {
                    let imageLocation = reference 
                    initialsRef.doc(params_id).update({
                        solution: funct_ref(newsolution),
                        is_special: funct_ref(newspecial),
                        dir1: funct_ref(this.words_by_dir[0]),
                        dir2: funct_ref(this.words_by_dir[1]),
                        dir3: funct_ref(this.words_by_dir[2]),
                        dir4: funct_ref(this.words_by_dir[3]),
                        dir5: funct_ref(this.words_by_dir[4]),
                        dir6: funct_ref(this.words_by_dir[5]),
                        dir7: funct_ref(this.words_by_dir[6]),
                        dir8: funct_ref(this.words_by_dir[7]),
                        title: this.title,
                        description: this.description,
                        image: imageLocation,
                        author: this.author,
                        updater: this.user.uid,
                        is_public: this.is_public,
                        permissions: this.permissions,
                        source: this.source,
                        time_created: this.time_created,
                        last_updated: datetime,
                    }).then(() => {this.new_async(this.$refs.store_success.show(), 1000).then(() => {this.$router.push("/searchinitial")}) })
                })
            }
        }) 
    },
    duplicate() { 
        let datetime = new Date()
        let funct_ref = this.array_to_string 
        let newsolution = []
        let newspecial = [] 
        for (let i = 0; i < this.rows; i++) {
            newsolution.push([])
            newspecial.push([]) 
            for (let j = 0; j < this.columns; j++) {
            newsolution[i].push(this.solution[i][j])
            newspecial[i].push(this.is_special[i][j]) 
            }
        }
        let newPermissions = []
        let authorAdded = false
        if (this.author == this.user.uid) {
            authorAdded = true
        }
        for (let i = 0; i < this.permissions; i++) {
            if (this.permissions[i] != this.user.uid) {
                newPermissions.push(this.permissions[i])
                if (this.permissions[i] == this.author) {
                    authorAdded = true
                }
            }
        }
        if (authorAdded == false) {
            newPermissions.push(this.author)
        }
        initialsRef.add({
                solution: funct_ref(newsolution),
                is_special: funct_ref(newspecial),
                dir1: funct_ref(this.words_by_dir[0]),
                dir2: funct_ref(this.words_by_dir[1]),
                dir3: funct_ref(this.words_by_dir[2]),
                dir4: funct_ref(this.words_by_dir[3]),
                dir5: funct_ref(this.words_by_dir[4]),
                dir6: funct_ref(this.words_by_dir[5]),
                dir7: funct_ref(this.words_by_dir[6]),
                dir8: funct_ref(this.words_by_dir[7]),
                title: this.title,
                description: this.description,
                image: "",
                author: this.user.uid,
                updater: this.user.uid,
                is_public: this.is_public,
                permissions: newPermissions,
                source: this.source,
                time_created: datetime,
                last_updated: datetime,
        }).then((docRef) => { 
            let some_id = docRef.id  
            if (this.image && this.image.name == undefined) {     
                var old_reference = ref(projectStorage, this.image) 
                let exstension = ""
                // Get metadata properties
                getMetadata(old_reference)
                .then((metadata) => {
                    // Metadata now contains the metadata for 'images/forest.jpg'
                    exstension =metadata.contentType.split('/')[1]
                })
                .catch((error) => {
                    // Uh-oh, an error occurred!
                }); 
                const reference = 'initial/' + some_id + "."  + exstension; 
                const storageRef = ref(projectStorage, reference);
                    const metadata = {
                    contentType: 'image/' + exstension
                };
                // 'file' comes from the Blob or File API 
                uploadBytes(storageRef, this.image, metadata).then((snapshot) => {  
                })
                .catch((error) => {  
                }).then(() => {
                    let imageLocation = reference 
                    initialsRef.doc(some_id).update({
                        solution: funct_ref(newsolution),
                        is_special: funct_ref(newspecial),
                        dir1: funct_ref(this.words_by_dir[0]),
                        dir2: funct_ref(this.words_by_dir[1]),
                        dir3: funct_ref(this.words_by_dir[2]),
                        dir4: funct_ref(this.words_by_dir[3]),
                        dir5: funct_ref(this.words_by_dir[4]),
                        dir6: funct_ref(this.words_by_dir[5]),
                        dir7: funct_ref(this.words_by_dir[6]),
                        dir8: funct_ref(this.words_by_dir[7]),
                        title: this.title,
                        description: this.description,
                        image: imageLocation,
                        author: this.user.uid,
                        updater: this.user.uid,
                        is_public: this.is_public,
                        permissions: newPermissions,
                        source: this.source,
                        time_created: datetime,
                        last_updated: datetime,
                    }).then(() => {this.new_async(this.$refs.duplicate_success.show(), 1000).then(() => {this.$router.push("/searchinitial")}) })
                })
            } else {   
                let exstension = this.image.name.split('.')[this.image.name.split('.').length - 1]
                const reference = 'initial/' + some_id + "."  + exstension; 
                const storageRef = ref(projectStorage, reference);
                    const metadata = {
                    contentType: 'image/' + exstension
                };
                // 'file' comes from the Blob or File API 
                uploadBytes(storageRef, this.image, metadata).then((snapshot) => {  
                })
                .catch((error) => {  
                }).then(() => {
                    let imageLocation = reference 
                    initialsRef.doc(some_id).update({
                        solution: funct_ref(newsolution),
                        is_special: funct_ref(newspecial),
                        dir1: funct_ref(this.words_by_dir[0]),
                        dir2: funct_ref(this.words_by_dir[1]),
                        dir3: funct_ref(this.words_by_dir[2]),
                        dir4: funct_ref(this.words_by_dir[3]),
                        dir5: funct_ref(this.words_by_dir[4]),
                        dir6: funct_ref(this.words_by_dir[5]),
                        dir7: funct_ref(this.words_by_dir[6]),
                        dir8: funct_ref(this.words_by_dir[7]),
                        title: this.title,
                        description: this.description,
                        image: imageLocation,
                        author: this.user.uid,
                        updater: this.user.uid,
                        is_public: this.is_public,
                        permissions: newPermissions,
                        source: this.source,
                        time_created: datetime,
                        last_updated: datetime,
                    }).then(() => {this.new_async(this.$refs.duplicate_success.show(), 1000).then(() => {this.$router.push("/searchinitial")}) })
                })
            }
        }) 
    }, 
    remove_dir(i) {
        this.words_by_dir[i] = []
        let old_words = this.words_by_dir
        this.reset()  
        for (let i = 0; i < old_words.length; i++) {
            for (let j = 0; j < old_words[i].length; j++) {
                let dirs = this.get_dirxy(i)
                this.add_word(old_words[i][j][0], old_words[i][j][1], old_words[i][j][2], dirs[0], dirs[1])
            }
        }
        this.check_full()
        this.$forceUpdate()
    },
    delay(operation, delay) {
        return new Promise(resolve => {
            setTimeout(() => {
            resolve(operation);
            }, delay);
        });
    },
    async new_async(operation, delay) {
        await this.delay(operation, delay);
    }
  },
  beforeMount() {
      this.initialize() 
      this.fetch_puzzle()
  }, 
  beforeUpdate() {
      this.initialize() 
  },  
  created() { 
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        this.$router.go()
      }
    )
  },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User 
        this.user = user
        // ...
      } else {
        // User is signed out
        // ...
        this.new_async(this.$refs.no_user.show(), 1000).then(() => {this.$router.push("/login")}) 
      }
    })
  }, 
  computed: {
  }
}
</script>

<template>
  <Navbar></Navbar>
  <body class="mybody">
    <div class="myrow">
        <va-slider v-model="rows" @focusout="initialize()" :min="1" :max="50" track-label-visible>
            <template #label>
                <span>Broj redaka</span>
            </template>
            <template #append>
                <va-input type="number" v-model="rows" @focusout="initialize()" :min="1" :max="50"/>
            </template>
        </va-slider>
    </div> 
    <br>
    <div class="myrow">
        <va-slider v-model="columns" @focusout="initialize()" :min="1" :max="50" track-label-visible>
            <template #label>
                <span>Broj stupaca</span>
            </template>
            <template #append>
                <va-input type="number" v-model="columns" @focusout="initialize()" :min="1" :max="50" />
            </template>
        </va-slider>
    </div>  
    <div class="myrow">  
        <va-button style="margin-left: 1%;margin-top: 1%" @click="mode_x=-1;mode_y=-1">&#8598;</va-button> 
        <va-button style="margin-left: 1%;margin-top: 1%" @click="mode_x=-1;mode_y=0">&#8592;</va-button> 
        <va-button style="margin-left: 1%;margin-top: 1%" @click="mode_x=-1;mode_y=1">&#8601;</va-button> 
        <va-button style="margin-left: 1%;margin-top: 1%" @click="mode_x=0;mode_y=-1">&#8593;</va-button>  
        <va-button style="margin-left: 1%;margin-top: 1%" @click="mode_x=0;mode_y=1">&#8595;</va-button> 
        <va-button style="margin-left: 1%;margin-top: 1%" @click="mode_x=1;mode_y=-1">&#8599;</va-button> 
        <va-button style="margin-left: 1%;margin-top: 1%" @click="mode_x=1;mode_y=0">&#8594;</va-button> 
        <va-button style="margin-left: 1%;margin-top: 1%" @click="mode_x=1;mode_y=1">&#8600;</va-button> 
        <va-button @click="mode_x=-2;mode_y=-2" style="background-color: salmon;margin-left: 1%;margin-top: 1%">Dio rješenja</va-button>  
        <va-button style="margin-left: 1%;margin-top: 1%" @click="reset()">Resetiraj</va-button>
    </div>
    <br>
    <div class="myrow">  
        <va-button style="margin-left: 1%;margin-top: 1%" @click="word+='Ǆ'">Ǆ</va-button> 
        <va-button style="margin-left: 1%;margin-top: 1%" @click="word+='Ǉ'">Ǉ</va-button> 
        <va-button style="margin-left: 1%;margin-top: 1%" @click="word+='Ǌ'">Ǌ</va-button>  
        <va-input style="display: inline-block;margin-left: 1%;margin-top: 1%" type="text" v-model="word" placeholder="Nova riječ" label="Dodaj riječ" @focusout="check_word()"/>
        <br><br>
        <va-alert v-if="word_warning!=''" color="warning" :title="'Neka slova u riječi ne pripadaju abecedi'" center class="mb-4">
            {{word_warning}}
        </va-alert>  
        <va-alert v-if="warning" color="warning" :title="'Nisu unesena sva slova'" center class="mb-4">
            Morate unesti dovoljno riječi u osmosmjerku tako da sva polja budu definirana barem pomoću jedne riječi.
        </va-alert> 
    </div>   
    <div class="myrow">  
        <table class="words_table">
            <tr v-for="i in (rows)" v-bind:key="i">
                <td v-for="j in (columns)" v-bind:key="j" @click="place_word(j-1,i-1,word,mode_x,mode_y,true)" 
                :class="{help: check_start(j - 1, i - 1, false), special: is_special[i - 1][j - 1]}">
                    {{solution[i - 1][j - 1]}}
                </td>
            </tr>
        </table> 
    </div>   
    <div class="myrow" v-if="count_special()">
        Rješenje: 
        <span v-for="i in (rows)" v-bind:key="i">
            <span v-for="j in (columns)" v-bind:key="j">
                <va-chip outline square style="margin-left:5px" v-if="is_special[i - 1][j - 1]">
                    {{solution[i - 1][j - 1]}}
                </va-chip>
            </span>
        </span>
    </div> 
    <div class="myrow">
        <span v-for="(words_in_dir, i) in words_by_dir" v-bind:key="i">
            <va-chip outline v-if="words_in_dir.length > 0" style="margin-left: 2%;margin-top: 2%">
                <va-chip v-if="i == 0" oncontextmenu="return false;" @click.right="remove_dir(i)">&#8598;</va-chip> 
                <va-chip v-if="i == 1" oncontextmenu="return false;" @click.right="remove_dir(i)">&#8592;</va-chip> 
                <va-chip v-if="i == 2" oncontextmenu="return false;" @click.right="remove_dir(i)">&#8601;</va-chip> 
                <va-chip v-if="i == 3" oncontextmenu="return false;" @click.right="remove_dir(i)">&#8593;</va-chip>  
                <va-chip v-if="i == 4" oncontextmenu="return false;" @click.right="remove_dir(i)">&#8595;</va-chip> 
                <va-chip v-if="i == 5" oncontextmenu="return false;" @click.right="remove_dir(i)">&#8599;</va-chip> 
                <va-chip v-if="i == 6" oncontextmenu="return false;" @click.right="remove_dir(i)">&#8594;</va-chip> 
                <va-chip v-if="i == 7" oncontextmenu="return false;" @click.right="remove_dir(i)">&#8600;</va-chip> 
                <va-list fit v-for="page_number in Math.ceil(words_in_dir.length / page_length)" v-bind:key="page_number">
                    <va-list-item v-for="j in Math.min(words_in_dir.length, page_number * page_length) - ((page_number - 1) * page_length)" v-bind:key="j">
                        <span oncontextmenu="return false;"  @click.right="remove_word(i, (page_number - 1) * page_length + j - 1)">
                            {{words_in_dir[(page_number - 1) * page_length + j - 1][2]}}&nbsp;({{words_in_dir[(page_number - 1) * page_length + j - 1][1]+1}},{{words_in_dir[(page_number - 1) * page_length + j - 1][0]+1}})
                        </span>
                    </va-list-item> 
                </va-list>
            </va-chip>
        </span>
    </div>   
    <div class="myrow">
            <va-button style="display:inline-block;overflow-wrap:anywhere" @click="click_file()">   
                    <span v-if="this.imageURL != ''">
                        {{this.imageURL}}</span><span  v-else>Odaberi sliku
                    </span>
            </va-button>  
            <input file-types="image/*" type="file" id="fileinput" style="display: none;visibility: hidden;width:0%"  @input="image_uploaded()"/> 
    </div>  
    <div class="myrow" v-if="image">
        <img id='img' :src="imageURL"  alt="No image" style="width:50%">
    </div>  
    <div class="myrow" v-if="!image">
        <va-alert style="white-space: pre-wrap;" color="warning" title="Prazna slika" center class="mb-4">
            Niste dodali sliku uz zagonetku.
        </va-alert> 
    </div>  
    <div class="myrow">
        <va-input
            class="mb-4"
            v-model="title"
            type="text"
            label="Naslov zagonetke" 
        />
        <va-input
            class="mb-4"
            v-model="description"
            type="textarea"
            label="Opis zagonetke"
            :min-rows="3"
            :max-rows="5"
        />
        <va-input
            class="mb-4"
            v-model="source"
            type="textarea"
            label="Izvor zagonetke"
            :min-rows="3"
            :max-rows="5"
        />
    </div>
    <div class="myrow"> 
        <va-chip style="margin-left: 1%;margin-top: 1%">Autor zagonetke: {{authorUserRecord.displayName}} ({{authorUserRecord.email}})</va-chip>  
        <va-chip style="margin-left: 1%;margin-top: 1%">Vrijeme kreiranja: {{time_created.toLocaleString()}}</va-chip>  
        <br>
        <va-chip style="margin-left: 1%;margin-top: 1%">Zadnji ažurirao: {{updaterUserRecord.displayName}} ({{updaterUserRecord.email}})</va-chip>  
        <va-chip style="margin-left: 1%;margin-top: 1%">Vrijeme zadnje izmjene: {{last_updated.toLocaleString()}}</va-chip>
    </div> 
    <div class="myrow"> 
        Dozvola uređivanja
        <va-switch style="display: inline-block;margin-left: 1%;margin-top: 1%" v-model="is_public" true-inner-label="Svi" false-inner-label="Samo suradnici" class="mr-4" /> 
        <va-input style="display: inline-block;margin-left: 1%;margin-top: 1%" type="text" v-model="collaborator" placeholder="Email adresa" label="Email adresa suradnika">
            <template #append> 
                <va-icon @click="checkIfUserExists();$forceUpdate()" color="primary" class="mr-4" name="add_circle"/>   
            </template>
        </va-input> 
    </div>
    <div class="myrow">  
            Suradnici: 
            <va-chip style="display: inline-block;margin-left: 1%;margin-top: 1%" 
            v-for="(permission, i) in permissionsUserRecords" :key="i">
                <va-icon style="display: inline-block" @click="permissions.splice(i,1)" name="clear" class="mr-2"/>
                {{permission.displayName}} ({{permission.email}})
            </va-chip> 
    </div>  
    <div class="myrow" v-if="!warning && image">
        <va-button @click="store()">Izmijeni postojeću zagonetku</va-button>&nbsp;
        <va-button @click="duplicate()">Spremi izmjene kao novu zagonetku</va-button>
    </div>    
    <va-modal ref="collision_start" hide-default-actions message="Nova riječ ne može započeti na istom polju kao već dodana riječ." stateful />
    <va-modal ref="collision_fit" hide-default-actions message="Nova riječ ne može započeti na odabranom polju jer u odabranom smjeru nema dovoljno polja." stateful />
    <va-modal ref="collision_letter" hide-default-actions message="Nova riječ ne može započeti na odabranom polju jer su u odabranom smjeru neka polja već popunjena." stateful />

    <va-modal ref="no_puzzle" hide-default-actions message="Ne postoji zagonetka s tim brojem." stateful />
    <va-modal ref="no_user" hide-default-actions message="Ne možete uređivati zagonetku jer niste prijavljeni." stateful />
    <va-modal ref="permission" hide-default-actions message="Ne možete uređivati zagonetku jer niste autor niti suradnik." stateful />
    <va-modal ref="duplicate_success" hide-default-actions message="Nova zagonetka je uspješno spremljena." stateful />
    <va-modal ref="store_success" hide-default-actions message="Postojeća zagonetka je uspješno izmijenjena." stateful />

    <va-modal ref="no_collaborator" hide-default-actions message="Ne možete dodati suradnika jer ne postoji korisnik s tom email adresom." stateful />
    <va-modal ref="me_collaborator" hide-default-actions message="Ne možete dodati samog sebe kao suradnika." stateful />
    <va-modal ref="duplicate_collaborator" hide-default-actions message="Ne možete dodati istu osobu kao suradnika dvaput." stateful />
  </body>
</template>

<style scoped>
.words_table { 
    display: inline-table;
    border: 1px solid black;
    border-collapse: collapse
}
.words_table tr {
    border: 1px solid black;
    border-collapse: collapse
}
.words_table td {
    border: 1px solid black;
    width: 24px;
    height: 24px;
    text-align: center;
    vertical-align: middle;
    border-collapse: collapse
}
.black {
    background-color: black;
}
.special {
    background-color: salmon;
}


.help {
    font-weight: bold;
    background-color: #90beee;
} 

</style>