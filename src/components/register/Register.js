import firebase from "firebase/app";
import { useEffect, useState } from "react";
import { createUser } from "../../utils/firebase/firebase-auth";
import "../login/Login.css";

export const Register = ({ handleRegisterSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    createUser({ email, password, username })
      .then(({ user }) => {
        handleRegisterSuccess({ user });
      })
      .catch((error) => {
        const { errorMessage } = error;
        setError(errorMessage);
      });
    setEmail("");
    setPassword("");
  };
  const ErrorMessage = () => <div className="form-error">{error}</div>;
  return (
    <div className="register">
      <h1>register</h1>
      <form onSubmit={handleSubmit} className="user-form">
        <label htmlFor="register-email">Username:</label>
        <input
          type="text"
          id="register-username"
          name="register-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="register-email">Email:</label>
        <input
          type="email"
          id="register-email"
          name="register-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="register-pw">Password:</label>
        <input
          type="password"
          id="register-pw"
          name="register-pw"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <ErrorMessage />}
        <button type="submit">register</button>
      </form>
    </div>
  );
};
