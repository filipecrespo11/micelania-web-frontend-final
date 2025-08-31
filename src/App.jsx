import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import CustomerManagement from "./components/CustomerManagement";
import CustomerList from "./components/CustomerList";
import CustomerUpdate from "./components/CustomerUpdate";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Componente para páginas não encontradas
const NotFound = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '4rem', margin: '0' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', margin: '20px 0' }}>Página não encontrada</h2>
      <p style={{ fontSize: '1rem', marginBottom: '30px' }}>A página que você está procurando não existe.</p>
      <button 
        onClick={() => window.location.href = '/'}
        style={{
          padding: '15px 30px',
          fontSize: '1rem',
          backgroundColor: 'white',
          color: '#1e3c72',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Voltar ao Login
      </button>
    </div>
  );
};

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
        {/* Rota catch-all para 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;