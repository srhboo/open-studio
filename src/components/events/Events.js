import React, { useEffect, useState, useRef } from "react";
import {
  socketSubmitChat,
  setSocketOnChat,
  socket,
} from "../../utils/socketio";
import "./events.css";

export const Events = ({ roomId }) => {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const eventsScrollRef = useRef(null);

  const handleSubmitChat = (e) => {
    e.preventDefault();
    socketSubmitChat({ message, roomId });
    setMessage("");
  };

  useEffect(() => {
    const handleReceiveChat = ({ message, name }) => {
      console.log("got in events");
      setEvents([...events, { message, name }]);
      eventsScrollRef.current.scrollTop = eventsScrollRef.current.scrollHeight;
    };
    setSocketOnChat(handleReceiveChat);
    // TODO: why does chat not work when logged in
    return () => {
      socket.removeAllListeners("chat message");
    };
  }, [events]);

  return (
    <div className="events-log-container">
      <ul className="events-list" ref={eventsScrollRef}>
        {events.map((event, i) => (
          <li
            className="event-list-item"
            key={`${event.name}${event.message}${i}`}
          >{`${event.name}: ${event.message}`}</li>
        ))}
      </ul>
      <form id="send-mchat-form" onSubmit={handleSubmitChat}>
        <input
          type="text"
          name="chat"
          className="chat-input"
          autoComplete="off"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="send-chat-button" type="submit">
          send
        </button>
      </form>
    </div>
  );
};
