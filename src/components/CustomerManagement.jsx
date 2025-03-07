import { useState, useRef } from "react";
import { cpf as cpfValidator } from "cpf-cnpj-validator"; // Biblioteca para validação de CPF
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import { Link } from "react-router-dom";

const CustomerManagement = () => {
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    purchaseDate: "",
    delivery: false,
    returnDate: "",
    password: "",
    observation: "",
    signature: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const signatureRef = useRef(null);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({ ...newCustomer, [name]: value });
  };

  const handleClearSignature = () => {
    signatureRef.current.clear();
    setNewCustomer({ ...newCustomer, signature: "" });
  };

  const addCustomer = async (e) => {
    e.preventDefault();

    if (!cpfValidator.isValid(newCustomer.cpf)) {
      setErrorMessage("CPF inválido.");
      return;
    }

    const signatureImage = signatureRef.current.isEmpty()
      ? ""
      : signatureRef.current.toDataURL();
    const customerData = { ...newCustomer, signature: signatureImage };

    try {
      const response = await axios.post(
        "https://micelania-app.onrender.com/customers",
        customerData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (response.status === 201) {
        alert("Cliente adicionado com sucesso!");
        setNewCustomer({
          name: "",
          email: "",
          phone: "",
          cpf: "",
          purchaseDate: "",
          delivery: false,
          returnDate: "",
          password: "",
          observation: "",
          signature: "",
        });
        setErrorMessage("");
        handleClearSignature();
      }
    } catch (error) {
      setErrorMessage("Erro ao adicionar cliente: " + error.message);
    }
  };

  return (
    <div >
      <h1>Gerenciamento de Clientes </h1><Link to="/customers">Ver Lista de Clientes</Link>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
      <form onSubmit={addCustomer}>
        <div>
          <label>Nome:</label>
          <input
            type="text"
            name="name"
            value={newCustomer.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={newCustomer.email}
            onChange={handleChange}
            
          />
        </div>
        <div>
          <label>Telefone:</label>
          <input
            type="tel"
            name="phone"
            value={newCustomer.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>CPF:</label>
          <input
            type="text"
            name="cpf"
            value={newCustomer.cpf}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Data da Compra:</label>
          <input
            type="date"
            name="purchaseDate"
            value={newCustomer.purchaseDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Data de Devolução:</label>
          <input
            type="date"
            name="returnDate"
            value={newCustomer.returnDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            name="password"
            value={newCustomer.password}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Observação:</label>
          <textarea
            name="observation"
            value={newCustomer.observation}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Assinatura:</label>
          <SignatureCanvas
            ref={signatureRef}
            penColor="black"
            canvasProps={{ width: 500, height: 200, className: "signatureCanvas" }}
          />
          <button type="button" onClick={handleClearSignature}>
            Limpar Assinatura
          </button>
        </div>
        <button type="submit">Adicionar Cliente</button>
      </form>
      <Link to="/customers">Ver Lista de Clientes</Link>
    </div>
  );
};

export default CustomerManagement;