import "./App.css";
import { Room } from "../room/Room.js";
import { Login } from "../login/Login";

const rooms = [];

function App() {
  return (
    <div className="App">
      {/* <Room /> */}
      <Login />
    </div>
  );
}

export default App;
