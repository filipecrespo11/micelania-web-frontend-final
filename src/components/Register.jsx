import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://micelania-app.onrender.com/auth/register", formData);
      alert("Usuário registrado com sucesso!");
      navigate("/");
    } catch (error) {
      alert("Erro ao registrar usuário. Tente novamente.");
      console.error(error);
    }
  };

  return (
    <div className="register-container">
      <h1>Registrar Usuário</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Registrar</button>
      </form>
      <button onClick={() => navigate("/")} className="back-to-login-btn">
        Voltar ao Login
      </button>
    </div>
  );
};

export default Register;
