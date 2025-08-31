import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import CustomerManagement from "./components/CustomerManagement";
import CustomerList from "./components/CustomerList";
import CustomerUpdate from "./components/CustomerUpdate";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/customer-management" 
          element={
            <ProtectedRoute>
              <CustomerManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customers" 
          element={
            <ProtectedRoute>
              <CustomerList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customers/update/:id" 
          element={
            <ProtectedRoute>
              <CustomerUpdate />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;