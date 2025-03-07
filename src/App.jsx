import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register"; // Página de registro
import CustomerManagement from "./components/CustomerManagement";
import CustomerList from "./components/CustomerList";
import CustomerUpdate from "./components/CustomerUpdate"; // Página de atualização de cliente
import "./App.css"; // Importa o arquivo CSS

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/customer-management" element={<CustomerManagement />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/update/:id" element={<CustomerUpdate />} /> {/* Nova rota */}
      </Routes>
    </Router>
  );
}

export default App;