<script>
export default {
  methods: {
    sendFriendRequest(me, other) {
      friendRequestsRef.add({
        sender: me,
        receiver: other,
      });
    },
    getAuthorUserRecord() {
      let some_id = this.author;
      let newRecord = { displayName: "Skriveno", email: "skriveno" };
      let me = this.user.uid;
      usersRef.get(some_id).then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          let id = childSnapshot.id;
          if (id == some_id) {
            let visibility = childSnapshot.get("visible");
            if (visibility == true || me == id) {
              newRecord = {
                displayName: childSnapshot.get("displayName"),
                email: childSnapshot.get("email"),
              };
            }
            friendsRef
              .get()
              .then(function (snapshotUser) {
                snapshotUser.forEach(function (childSnapshotUser) {
                  let id1 = childSnapshotUser.get("user1");
                  let id2 = childSnapshotUser.get("user2");
                  if (
                    (id1 == me && id2 == other) ||
                    (id2 == me && id1 == other)
                  ) {
                    newRecord = {
                      displayName: childSnapshot.get("displayName"),
                      email: childSnapshot.get("email"),
                    };
                  }
                });
              })
              .then(() => {
                this.authorUserRecord = newRecord;
              });
          }
        });
      });
    },
    getUpdaterUserRecord() {
      let some_id = this.updater;
      let newRecord = { displayName: "Skriveno", email: "skriveno" };
      let me = this.user.uid;
      usersRef.get(some_id).then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          let id = childSnapshot.id;
          if (id == some_id) {
            let visibility = childSnapshot.get("visible");
            if (visibility == true || me == id) {
              newRecord = {
                displayName: childSnapshot.get("displayName"),
                email: childSnapshot.get("email"),
              };
            }
            friendsRef
              .get()
              .then(function (snapshotUser) {
                snapshotUser.forEach(function (childSnapshotUser) {
                  let id1 = childSnapshotUser.get("user1");
                  let id2 = childSnapshotUser.get("user2");
                  if (
                    (id1 == me && id2 == other) ||
                    (id2 == me && id1 == other)
                  ) {
                    newRecord = {
                      displayName: childSnapshot.get("displayName"),
                      email: childSnapshot.get("email"),
                    };
                  }
                });
              })
              .then(() => {
                this.updaterUserRecord = newRecord;
              });
          }
        });
      });
    },
    getCollaboratorUserRecord() {
      this.permissionsUserRecords = [];
      for (let i = 0; i < this.permissions.length; i++) {
        let some_id = this.permissions[i];
        let newRecord = { displayName: "Skriveno", email: "skriveno" };
        usersRef.get(some_id).then(function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            let id = childSnapshot.id;
            if (id == some_id) {
              let visibility = childSnapshot.get("visible");
              if (visibility == true || me == id) {
                newRecord = {
                  displayName: childSnapshot.get("displayName"),
                  email: childSnapshot.get("email"),
                };
              }
              friendsRef
                .get()
                .then(function (snapshotUser) {
                  snapshotUser.forEach(function (childSnapshotUser) {
                    let id1 = childSnapshotUser.get("user1");
                    let id2 = childSnapshotUser.get("user2");
                    if (
                      (id1 == me && id2 == other) ||
                      (id2 == me && id1 == other)
                    ) {
                      newRecord = {
                        displayName: childSnapshot.get("displayName"),
                        email: childSnapshot.get("email"),
                      };
                    }
                  });
                })
                .then(() => {
                  this.permissionsUserRecords.push(newRecord);
                });
            }
          });
        });
      }
    },
    removeFriend(me, other) {
      friendsRef
        .get()
        .then(function (snapshotUser) {
          snapshotUser.forEach(function (childSnapshotUser) {
            let idDoc = childSnapshotUser.id;
            let id1 = childSnapshotUser.get("user1");
            let id2 = childSnapshotUser.get("user2");
            if ((id1 == me && id2 == other) || (id2 == me && id1 == other)) {
              friendsRef.doc(idDoc).delete();
            }
          });
        })
        .then(() => {});
    },
    
    checkIfRequestIsSent(me, other) {
      let areFriends = me == other;
      friendRequestsRef
        .get()
        .then(function (snapshotUser) {
          snapshotUser.forEach(function (childSnapshotUser) {
            let id1 = childSnapshotUser.get("sender");
            let id2 = childSnapshotUser.get("receiver");
            if ((id1 == me && id2 == other) || (id2 == me && id1 == other)) {
              areFriends = true;
            }
          });
        })
        .then(() => {
          return areFriends;
        });
    },
  },
  data() {},
  components: {},
};
</script>

<template></template>

<style>
</style>
