import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./components/auth/Register";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/register" element={<Register setUser={setUser} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
