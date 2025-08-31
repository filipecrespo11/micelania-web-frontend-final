import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoBase64 from "./logoBase64";  

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Função para lidar com o login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("https://micelania-app.onrender.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        navigate("/customer-management");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Login falhou. Verifique suas credenciais.");
      }
    } catch (error) {
      console.error("Erro durante o login:", error);
      setErrorMessage("Erro de conexão. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Função para redirecionar para a página de registro
  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <div className="login-container">
      <img src={logoBase64} alt="Logotipo da empresa" className="logo" />
      <h1>Login</h1>
      
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      
      <form className="login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Nome de Usuário:</label>
          <input
            id="username"
            type="text"
            placeholder="Digite seu nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Senha:</label>
          <input
            id="password"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" disabled={loading} className="primary-btn">
          {loading ? <span className="loading"></span> : "Entrar"}
        </button>
      
        <button 
          type="button" 
          onClick={handleRegisterRedirect} 
          className="register-btn"
          disabled={loading}
        >
          Criar Conta
        </button>
      </form>
    </div>
  );
};

export default Login;