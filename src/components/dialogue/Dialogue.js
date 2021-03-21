import React, { useState } from "react";
import "./Dialogue.css";
import { generateId } from "../../utils/random";

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
export const Dialogue = ({ dialogueList, handleAddMessage }) => {
  // consists of one form to add to dialogue
  // and list of preexisting dialogues
  // object is in charge of knowing its dialogue id
  // dialogue is in charge of handling dialogue data
  const [text, updateText] = useState("");

  //may delete later
  const [list, setList] = useState(defaultDialogueList);

  const fakeHandleAddMessage = (message) => {
    const newDialogue = {
      contributor: "anonymous",
      message,
      dialogueId: generateId(),
    };
    setList([...list, newDialogue]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fakeHandleAddMessage(text);
    updateText("");
  };
  return (
    <div className="dialogue-container">
      <ul className="dialogue-list">
        {list.map(({ dialogueId, contributor, message }) => (
          <li className="message-container" key={dialogueId}>
            {message}
            <span className="dialogue-contributor">- {contributor}</span>
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
