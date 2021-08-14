import { storage } from "../../index";

export const uploadFileTo = ({ creator, filename, file, resolve, reject }) => {
  const storageRef = storage.ref();
  const root = creator === "anonymous" ? "anonymous" : `creators/${creator}`;
  const ref = storageRef.child(`${root}/${filename}`);

  const uploadTask = ref.put(file);
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
    },
    (error) => {
      // Handle unsuccessful uploads
      reject(error);
    },
    () => {
      // Handle successful uploads on complete
      // For instance, get the download URL: https://firebasestorage.googleapis.com/...
      resolve(uploadTask.snapshot.ref.getDownloadURL());
    }
  );
  return uploadTask;
};
