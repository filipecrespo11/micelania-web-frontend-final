import { useState, useRef } from "react";
import { cpf as cpfValidator } from "cpf-cnpj-validator";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import { Link, useNavigate } from "react-router-dom";
import logoBase64 from "./logoBase64";

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
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const signatureRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formatação especial para CPF
    if (name === "cpf") {
      const cpfValue = value.replace(/\D/g, ""); // Remove caracteres não numéricos
      const formattedCpf = cpfValue
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
      setNewCustomer({ ...newCustomer, [name]: formattedCpf });
    } else {
      setNewCustomer({ ...newCustomer, [name]: value });
    }
    
    // Limpar mensagem de erro ao digitar
    if (errorMessage) setErrorMessage("");
  };

  const handleClearSignature = () => {
    signatureRef.current.clear();
    setNewCustomer({ ...newCustomer, signature: "" });
  };

  // Função para compressão WebP + Base64
  const compressToWebP = (base64String, quality = 0.3, maxWidth = 300, maxHeight = 200) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calcular dimensões mantendo proporção
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Garantir dimensões válidas
        width = Math.max(80, Math.round(width));
        height = Math.max(60, Math.round(height));

        canvas.width = width;
        canvas.height = height;

        // Desenhar com qualidade otimizada
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Tentar WebP primeiro
        let compressedResult = canvas.toDataURL('image/webp', quality);
        
        // Fallback para JPEG se WebP não suportado
        if (compressedResult === 'data:image/png;base64,' || compressedResult.startsWith('data:image/png')) {
          console.log('WebP não suportado, usando JPEG');
          compressedResult = canvas.toDataURL('image/jpeg', quality);
        }

        console.log(`Compressão WebP/JPEG: ${base64String.length} → ${compressedResult.length} chars (${Math.round((1 - compressedResult.length/base64String.length) * 100)}% redução)`);
        
        // Se ainda muito grande, reduzir qualidade
        if (compressedResult.length > 6000) {
          const lowerQuality = Math.max(0.1, quality - 0.15);
          const reducedResult = canvas.toDataURL('image/webp', lowerQuality) !== 'data:image/png;base64,' 
            ? canvas.toDataURL('image/webp', lowerQuality)
            : canvas.toDataURL('image/jpeg', lowerQuality);
            
          resolve(reducedResult.length < compressedResult.length ? reducedResult : compressedResult);
        } else {
          resolve(compressedResult);
        }
      };
    });
  };

  const addCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Validação do CPF
    if (!cpfValidator.isValid(newCustomer.cpf.replace(/\D/g, ""))) {
      setErrorMessage("CPF inválido. Verifique os números digitados.");
      setLoading(false);
      return;
    }

    // Verificar se a assinatura foi feita
    if (signatureRef.current.isEmpty()) {
      setErrorMessage("Por favor, faça a assinatura antes de continuar.");
      setLoading(false);
      return;
    }

    // Aplicar compressão WebP na assinatura
    let signatureImage = signatureRef.current.toDataURL();
    signatureImage = await compressToWebP(signatureImage, 0.3);
    
    // Verificar tamanho total e forçar redução adicional se necessário
    let tempPayload = JSON.stringify({ 
      ...newCustomer, 
      signature: signatureImage,
      cpf: newCustomer.cpf.replace(/\D/g, "") 
    });
    
    if (tempPayload.length > 25000) { // 25KB limite absoluto
      signatureImage = await compressToWebP(signatureImage, 0.15, 200, 120);
      tempPayload = JSON.stringify({ 
        ...newCustomer, 
        signature: signatureImage,
        cpf: newCustomer.cpf.replace(/\D/g, "") 
      });
      
      // Último recurso: compressão máxima
      if (tempPayload.length > 25000) {
        signatureImage = await compressToWebP(signatureImage, 0.1, 150, 100);
      }
    }
    
    console.log("Tamanho da assinatura WebP comprimida:", signatureImage.length);
    
    const customerData = { 
      ...newCustomer, 
      signature: signatureImage,
      cpf: newCustomer.cpf.replace(/\D/g, "") // Remove formatação do CPF para envio
    };

    const finalPayloadSize = JSON.stringify(customerData).length;
    console.log("Tamanho total do payload:", finalPayloadSize);

    try {
      const response = await axios.post(
        "https://micelania-app.onrender.com/customers",
        customerData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 201) {
        setSuccessMessage("Cliente adicionado com sucesso!");
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
        handleClearSignature();
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      if (error.response?.status === 413) {
        setErrorMessage("Erro: A assinatura é muito grande. Tente fazer uma assinatura menor ou mais simples.");
      } else {
        const message = error.response?.data?.message || `Erro ao adicionar cliente: ${error.message}`;
        setErrorMessage(message);
      }
      console.error("Erro detalhado:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <img src={logoBase64} alt="Micelânea" className="logo" />
          <h2 style={{ margin: 0 }}>Gerenciamento de Clientes</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/customers" className="btn-primary action-btn">📋 Ver Lista</Link>
          <button 
            onClick={handleLogout} 
            className="back-to-login-btn"
            style={{ width: 'auto', padding: '8px 16px', margin: '0' }}
          >
            🚪 Sair
          </button>
        </div>
      </header>
      
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <form onSubmit={addCustomer} className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Nome:</label>
            <input
              id="name"
              type="text"
              name="name"
              value={newCustomer.name}
              onChange={handleChange}
              required
              placeholder="Digite o nome completo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cpf">CPF:</label>
            <input
              id="cpf"
              type="text"
              name="cpf"
              value={newCustomer.cpf}
              onChange={handleChange}
              required
              placeholder="Digite o CPF"
              maxLength="14"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              name="email"
              value={newCustomer.email}
              onChange={handleChange}
              placeholder="Digite o email (opcional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telefone:</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={newCustomer.phone}
              onChange={handleChange}
              required
              placeholder="Digite o telefone"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="purchaseDate">Data da Compra:</label>
            <input
              id="purchaseDate"
              type="date"
              name="purchaseDate"
              value={newCustomer.purchaseDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="returnDate">Data de Devolução:</label>
            <input
              id="returnDate"
              type="date"
              name="returnDate"
              value={newCustomer.returnDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha do Cartão:</label>
            <input
              id="password"
              type="password"
              name="password"
              value={newCustomer.password}
              onChange={handleChange}
              placeholder="Digite a senha do cartão"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="observation">Observação:</label>
          <textarea
            id="observation"
            name="observation"
            value={newCustomer.observation}
            onChange={handleChange}
            placeholder="Digite observações adicionais"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Assinatura:</label>
          <SignatureCanvas
            ref={signatureRef}
            penColor="black"
            canvasProps={{ 
              width: 500, 
              height: 200, 
              className: "signatureCanvas",
              style: { border: "2px dashed #ccc", borderRadius: "8px" }
            }}
          />
          <button 
            type="button" 
            onClick={handleClearSignature}
            style={{ width: "auto", padding: "8px 16px", marginTop: "10px" }}
          >
            Limpar Assinatura
          </button>
        </div>

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? <span className="loading"></span> : "Adicionar Cliente"}
        </button>
      </form>
    </div>
  );
};

export default CustomerManagement;