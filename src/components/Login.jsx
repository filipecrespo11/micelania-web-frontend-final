import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css"; // Importa o arquivo CSS

const Login = () => {
  const [username, setUsername] = useState(""); // Estado para o nome de usuário
  const [password, setPassword] = useState(""); // Estado para a senha
  const navigate = useNavigate();

  // Função para lidar com o login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://micelania-app.onrender.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }), // Enviando username e password
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token); // Salvar token no localStorage
        alert("Login bem-sucedido!");
        navigate("/customer-management"); // Redirecionar para a página de gerenciamento de clientes
      } else {
        alert("Login falhou. Verifique suas credenciais.");
      }
    } catch (error) {
      console.error("Erro durante o login:", error);
      alert("Erro durante o login. Tente novamente mais tarde.");
    }
  };

  // Função para redirecionar para a página de registro
  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form className="login-form" onSubmit={handleLogin}>
        <div>
          <label>Nome de Usuário:</label>
          <input
            type="text"
            placeholder="Digite seu nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      
      <button onClick={handleRegisterRedirect} className="register-btn">
        Criar Conta
      </button>
      </form>
    </div>
  );
};

export default Login;