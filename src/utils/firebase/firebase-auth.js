import firebase from "firebase/app";
import "firebase/auth";

import { db } from "../../index";

export const createUser = ({ email, password, username }) => {
  const checkIfUsernameExists = db
    .collection("usernames")
    .doc(username)
    .get()
    .then((doc) => {
      if (doc.exists) {
        throw new Error("Username already exists");
      }
      return username;
    });
  const createWithPwAuth = () =>
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return user;
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  return checkIfUsernameExists
    .then(() => createWithPwAuth())
    .then((user) => {
      const { email, uid } = user;
      const userToAdd = { username, auid: uid, webMonPointer: null };
      const addToDb = db.collection("users").doc(email).set(userToAdd);
      const recordUsername = db
        .collection("usernames")
        .doc(username)
        .set({ email, auid: uid });
      return Promise.all([userToAdd, addToDb, recordUsername]);
    })
    .then(([user]) => {
      return { user };
    })
    .catch((error) => {
      const errorMessage = error.message;
      return Promise.reject({ errorMessage });
    });
};

export const subscribeToUserRecord = ({ email, handleUpdate }) => {
  return db
    .collection("users")
    .doc(email)
    .onSnapshot((doc) => {
      if (doc.exists) {
        const { username, webMonPointer, auid } = doc.data();
        handleUpdate({ user: { username, webMonPointer, auid, email } });
      }
    });
};

export const getUserRecord = ({ email }) => {
  return db
    .collection("users")
    .doc(email)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const { username, webMonPointer, auid } = doc.data();
        return { user: { username, webMonPointer, auid, email } };
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

export const updateUserRecord = ({ email, toUpdate }) => {
  return db
    .collection("users")
    .doc(email)
    .update({ ...toUpdate })
    .catch(() => {
      console.log("Error updating");
    });
};

export const subscribeToUserRooms = ({ email, setRooms }) => {
  return db
    .collection("rooms")
    .where("creatorId", "==", email)
    .onSnapshot((querySnapshot) => {
      const userRooms = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userRooms.push({ ...data, roomId: doc.id });
      });
      setRooms(userRooms);
    });
};

export const getNeighbourRooms = ({ currentUser }) => {
  const ref =
    currentUser && currentUser.email
      ? db
          .collection("rooms")
          .limit(20)
          .where("creatorId", "!=", currentUser.email)
      : db.collection("rooms").limit(20);
  return ref.get().then((querySnapshot) => {
    const neighbourRooms = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      neighbourRooms.push({ ...data, roomId: doc.id });
    });
    return neighbourRooms;
  });
};

export const createRoom = ({ email, auid, roomName, description }) => {
  return db
    .collection("rooms")
    .add({
      centerpieceId: "",
      creatorAuid: auid,
      creatorId: email,
      description,
      roomName,
    })
    .then((doc) => doc.id)
    .catch(() => {
      console.log("Error updating");
    });
};

export const deleteRoom = ({ roomId }) => {
  const room = db.collection("rooms").doc(roomId);
  return new Promise((resolve, reject) => {
    deleteAllObjects({ roomId })
      .then(() => room.delete())
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject();
      });
  });
};

export const deleteAllDialogue = ({ objectId, roomId }) => {
  console.log("deleting dialogue");
  const dialogue = db
    .collection("rooms")
    .doc(roomId)
    .collection("objects")
    .doc(objectId)
    .collection("dialogue");

  return dialogue
    .get()
    .then((querySnapshot) => {
      const dialogueToDelete = [];
      querySnapshot.forEach((doc) => {
        dialogueToDelete.push(doc.id);
      });
      return Promise.all(
        dialogueToDelete.map((id) => {
          return new Promise((resolve, reject) => {
            dialogue
              .doc(id)
              .delete()
              .then(() => {
                resolve();
              })
              .catch(() => reject());
          });
        })
      );
    })
    .catch((error) => {
      console.log("Error deleting dialogue", error);
    });
};

export const createImageObject = ({ roomId, url }) => {
  const objectsRef = db.collection("rooms").doc(roomId).collection("objects");
  console.log(roomId, url);
  return objectsRef
    .add({
      type: "image",
      url,
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
};

export const createCenterpiece = ({ roomId, url }) => {
  return createImageObject({ roomId, url })
    .then((docRef) => {
      console.log(docRef.id);
      const roomRef = db.collection("rooms").doc(roomId);
      return roomRef.update({ centerpieceId: docRef.id });
    })
    .catch((error) => {
      console.log(error);
    });
};

export const deleteAllObjects = ({ roomId }) => {
  console.log("deleting objects");
  const objects = db.collection("rooms").doc(roomId).collection("objects");

  return new Promise((resolve, reject) => {
    objects
      .get()
      .then((querySnapshot) => {
        const objectsToDelete = [];
        querySnapshot.forEach((doc) => {
          objectsToDelete.push({ objectId: doc.id, roomId });
        });
        return objectsToDelete;
      })
      .then((objectsToDelete) =>
        Promise.all(
          objectsToDelete.map(({ roomId, objectId }) =>
            deleteAllDialogue({ roomId, objectId }).then(() =>
              objects.doc(objectId).delete()
            )
          )
        )
          .then(() => {
            resolve();
          })
          .catch(() => {
            reject();
          })
      )
      .catch((error) => {
        console.log("Error deleting objects", error);
      });
  });
};

export const loginUser = ({ email, password }) => {
  return firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => getUserRecord({ email }))
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage =
        errorCode === "auth/user-not-found"
          ? "Hmmm doesn't seem you've registered with this email yet."
          : "Error";
      return Promise.reject({ errorCode, errorMessage });
    });
};

export const logoutUser = () => {
  return firebase
    .auth()
    .signOut()
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      return Promise.reject({ errorCode, errorMessage });
    });
};

export const checkCurrentUser = () => {
  return firebase.auth().currentUser;
};

export const setUpAuthObserver = ({ onSignedIn, onSignedOut }) => {
  return firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      onSignedIn({ user });
    } else {
      onSignedOut();
    }
  });
};
