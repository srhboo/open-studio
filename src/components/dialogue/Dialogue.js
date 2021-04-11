import React, { useState, useEffect } from "react";
import "./Dialogue.css";
import { generateId } from "../../utils/random";
import { db } from "../../index";

const defaultDialogueList = [
  {
    contributor: "Boo",
    message:
      "oh this reminds me of this article I read that's about how American Artist and Legacy Russell are hacking the cultural mainframe for a non-binary future. Would love to know your thoughts on it...",
    dialogueId: "4",
  },
  {
    contributor: "Baudrillard",
    message: "is this a simulacrum",
    dialogueId: "5",
  },
  {
    contributor: "Woodkid",
    message:
      "did I ever tell you that once I was playing Osheaga and I put my hands to the sky and it started a torrential downpour?",
    dialogueId: "6",
  },
  {
    contributor: "Lorem",
    message:
      "Mauris rhoncus odio eget ultrices euismod. Etiam ut rutrum est. Integer dui leo, tincidunt sit amet mauris ut, bibendum aliquet risus. Cras aliquet tincidunt neque id commodo. Nam nec tincidunt libero, quis rhoncus ipsum. Maecenas lacinia, enim vitae sagittis dignissim, leo lacus euismod purus, a vehicula nisi sapien maximus sem. Vivamus ut convallis sem. In quis velit ut tortor finibus ultrices. ",
    dialogueId: "6",
  },
];

// one dialogue stream per one object (photo, note)
export const Dialogue = ({ objectId, roomId, currentUser }) => {
  // consists of one form to add to dialogue
  // and list of preexisting dialogues
  // object is in charge of knowing its dialogue id
  // dialogue is in charge of handling dialogue data
  const [text, updateText] = useState("");
  const [dialogueList, setDialogueList] = useState([]);
  const dialogueRef = db
    .collection("rooms")
    .doc(roomId)
    .collection("objects")
    .doc(objectId)
    .collection("dialogue");

  useEffect(() => {
    const dia = dialogueRef
      .orderBy("timestamp", "asc")
      .onSnapshot((querySnapshot) => {
        const list = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          list.push(data);
        });
        setDialogueList(list);
      });
    return () => dia();
  }, [setDialogueList, dialogueRef, roomId, objectId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dialogueRef
      .add({
        contributor: currentUser,
        message: text,
        timestamp: Date.now(),
      })
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
    updateText("");
  };
  return (
    <div className="dialogue-container">
      <ul className="dialogue-list">
        {dialogueList.map(({ contributor, message }) => (
          <li className="message-container" key={message}>
            {message}
            <span className="dialogue-contributor">
              - {contributor.username}
            </span>
          </li>
        ))}
      </ul>
      <form className="dialogue-form">
        <label>respond:</label>
        <textarea
          className="note-textarea"
          value={text}
          onChange={(e) => updateText(e.target.value)}
        />
        <button type="submit" onClick={handleSubmit}>
          save
        </button>
      </form>
    </div>
  );
};
