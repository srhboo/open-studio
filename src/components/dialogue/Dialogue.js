import React, { useState, useEffect } from "react";
import "./Dialogue.css";
import { db } from "../../index";

// one dialogue stream per one object (photo, note)
export const Dialogue = ({
  objectId,
  roomId,
  currentUser = { username: "anonymous", auid: "666" },
}) => {
  // consists of one form to add to dialogue
  // and list of preexisting dialogues
  // object is in charge of knowing its dialogue id
  // dialogue is in charge of handling dialogue data
  const [text, updateText] = useState("");
  const [dialogueList, setDialogueList] = useState([]);
  useEffect(() => {
    // defining part of this query outside of useEffect results in infinite loop update
    const dia = db
      .collection("rooms")
      .doc(roomId)
      .collection("objects")
      .doc(objectId)
      .collection("dialogue")
      .orderBy("timestamp", "asc")
      .onSnapshot((querySnapshot) => {
        console.log("dialogue snapshot");
        const list = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          list.push(data);
        });
        setDialogueList(list);
      });
    return () => dia();
  }, [roomId, objectId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    db.collection("rooms")
      .doc(roomId)
      .collection("objects")
      .doc(objectId)
      .collection("dialogue")
      .add({
        contributor: currentUser,
        message: text,
        timestamp: Date.now(),
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
        <label style={{ alignSelf: "flex-start" }}>respond:</label>
        <textarea
          className="note-textarea"
          value={text}
          onChange={(e) => updateText(e.target.value)}
          style={{ marginBottom: "1rem" }}
        />
        <button type="submit" onClick={handleSubmit}>
          save
        </button>
      </form>
    </div>
  );
};
