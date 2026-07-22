import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Rentals from "./Pages/Rentals";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import LandlordDashboard from "./Pages/LandlordDashboard";
import CompleteProfile from "./Pages/CompleteProfile";  

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/rentals" element={<Rentals />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<LandlordDashboard />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
