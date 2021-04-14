import { useState } from "react";
import { loginUser } from "../../utils/firebase/firebase-auth";
import "./Login.css";

export const Login = ({ handleLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser({ email, password })
      .then(({ user }) => {
        handleLoginSuccess({ user });
      })
      .catch(({ errorMessage }) => {
        setError(errorMessage);
      });
    setEmail("");
    setPassword("");
  };
  const ErrorMessage = () => <div className="form-error">{error}</div>;
  return (
    <div className="login">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="user-form">
        <label htmlFor="login-email">Email:</label>
        <input
          type="email"
          id="login-email"
          name="login-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="login-pw">Password:</label>
        <input
          type="password"
          id="login-pw"
          name="login-pw"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <ErrorMessage />}
        <button type="submit">login</button>
      </form>
    </div>
  );
};
