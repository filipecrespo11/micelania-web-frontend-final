import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Limpar mensagens ao digitar
    if (errorMessage) setErrorMessage("");
    if (successMessage) setSuccessMessage("");
  };

  const validateForm = () => {
    if (formData.username.length < 3) {
      setErrorMessage("Nome de usuário deve ter pelo menos 3 caracteres");
      return false;
    }
    if (formData.password.length < 6) {
      setErrorMessage("Senha deve ter pelo menos 6 caracteres");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrorMessage("");

    try {
      await axios.post("https://micelania-app.onrender.com/auth/register", formData);
      setSuccessMessage("Usuário registrado com sucesso!");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      const message = error.response?.data?.message || "Erro ao registrar usuário. Tente novamente.";
      setErrorMessage(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1>Registrar Usuário</h1>
      
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Nome de Usuário:</label>
          <input
            id="username"
            type="text"
            name="username"
            placeholder="Mínimo 3 caracteres"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
            minLength="3"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Senha:</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            minLength="6"
          />
        </div>
        
        <button type="submit" disabled={loading} className="primary-btn">
          {loading ? <span className="loading"></span> : "Registrar"}
        </button>
      </form>
      
      <button 
        type="button"
        onClick={() => navigate("/")} 
        className="back-to-login-btn"
        disabled={loading}
      >
        Voltar ao Login
      </button>
    </div>
  );
};

export default Register;
