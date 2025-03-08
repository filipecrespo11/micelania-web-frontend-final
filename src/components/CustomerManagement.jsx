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
    <div className="app-container" >
      <a><p><h2>Gerenciamento</h2></p><p><h2> de Clientes</h2></p></a><Link to="/customers">Ver Lista de Clientes</Link>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
      <form onSubmit={addCustomer}>
        <div>
          <p><label>Nome:</label></p>
          <input
            type="text"
            name="name"
            value={newCustomer.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <p><label>Email:</label></p>
          <input
            type="email"
            name="email"
            value={newCustomer.email}
            onChange={handleChange}
            
          />
        </div>
        <div>
        <p> <label>Telefone:</label></p>
          <input
            type="tel"
            name="phone"
            value={newCustomer.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <p><label>CPF:</label></p>
          <input
            type="text"
            name="cpf"
            value={newCustomer.cpf}
            onChange={handleChange}
            required
          />
        </div>
        <div>
        <p><label>Data da Compra:</label></p>
          <input
            type="date"
            name="purchaseDate"
            value={newCustomer.purchaseDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
        <p><label>Data de Devolução:</label></p>
          <input
            type="date"
            name="returnDate"
            value={newCustomer.returnDate}
            onChange={handleChange}
          />
        </div>
        <div>
        <p><label>Senha:</label></p>
          <input
            type="password"
            name="password"
            value={newCustomer.password}
            onChange={handleChange}
          />
        </div>
        <div>
        <p><label>Observação:</label></p>
          <textarea
            name="observation"
            value={newCustomer.observation}
            onChange={handleChange}
          />
        </div>
        <div>
        <p><label>Assinatura:</label></p>
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