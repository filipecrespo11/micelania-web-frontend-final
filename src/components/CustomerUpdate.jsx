import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import CameraCapture from "./CameraCapture";
import { Link } from "react-router-dom";
import logoBase64 from "./logoBase64";

const CustomerUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    purchaseDate: "",
    returnDate: "",
    observation: "",
    signature: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const signatureRef = useRef(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await axios.get(`https://micelania-app.onrender.com/customers/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = response.data;
        setCustomer({
          ...data,
          purchaseDate: data.purchaseDate ? data.purchaseDate.split("T")[0] : "",
          returnDate: data.returnDate ? data.returnDate.split("T")[0] : "",
        });
      } catch (error) {
        console.error("Erro ao buscar cliente:", error);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer({ ...customer, [name]: value });
  };

  const resizeImage = (base64String, maxWidth = 200, maxHeight = 80) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Redimensionar proporcionalmente com tamanhos menores
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        // Usar JPEG com qualidade baixa para reduzir drasticamente o tamanho
        resolve(canvas.toDataURL("image/jpeg", 0.3)); // Qualidade 30% para máxima compressão
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let signatureImage = customer.signature;
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      signatureImage = signatureRef.current.toDataURL();
    }

    if (signatureImage) {
      // Redimensionar a imagem com compressão agressiva
      signatureImage = await resizeImage(signatureImage, 200, 80);
      
      // Verificar o tamanho e reduzir mais se necessário
      let payloadSize = JSON.stringify({ ...customer, signature: signatureImage }).length;
      console.log("Tamanho do payload após primeira compressão:", payloadSize);
      
      // Se ainda estiver muito grande, reduzir ainda mais
      if (payloadSize > 80000) { // 80KB
        signatureImage = await resizeImage(signatureImage, 150, 60);
        payloadSize = JSON.stringify({ ...customer, signature: signatureImage }).length;
        console.log("Tamanho do payload após segunda compressão:", payloadSize);
        
        // Se ainda estiver muito grande, usar compressão máxima
        if (payloadSize > 80000) {
          signatureImage = await resizeImage(signatureImage, 120, 50);
          console.log("Tamanho final após compressão máxima:", JSON.stringify({ ...customer, signature: signatureImage }).length);
        }
      }
      
    } else if (!customer.signature) {
      setErrorMessage("A assinatura ou foto é obrigatória.");
      return;
    }

    try {
      const payload = { ...customer, signature: signatureImage };
      console.log("Enviando payload com tamanho:", JSON.stringify(payload).length);
      
      await axios.put(`https://micelania-app.onrender.com/customers/${id}`, payload, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
      });
      alert("Cliente atualizado com sucesso!");
      navigate("/customers");
    } catch (error) {
      if (error.response?.status === 413) {
        setErrorMessage("Erro: A imagem é muito grande. Tente capturar uma assinatura menor ou use uma foto de menor resolução.");
      } else {
        setErrorMessage(`Erro ao atualizar cliente: ${error.message}`);
      }
      console.error(error);
    }
  };

  const handleCameraCapture = (imageSrc) => {
    setCustomer((prevCustomer) => ({
      ...prevCustomer,
      signature: imageSrc,
    }));
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  return (
    <div className="app-container">
      <header>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <img src={logoBase64} alt="Micelânea" className="logo" />
          <h1>Atualizar Cliente</h1>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/customers">
            <button className="primary-btn">📋 VER LISTA</button>
          </Link>
          <button 
            onClick={() => navigate("/")} 
            className="secondary-btn"
          >
            🚪 SAIR
          </button>
        </div>
      </header>
      
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Nome:</label>
            <input
              id="name"
              type="text"
              name="name"
              value={customer.name}
              onChange={handleChange}
              readOnly
              style={{ backgroundColor: "#f8f9fa", color: "#6c757d" }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cpf">CPF:</label>
            <input
              id="cpf"
              type="text"
              name="cpf"
              value={customer.cpf}
              onChange={handleChange}
              readOnly
              style={{ backgroundColor: "#f8f9fa", color: "#6c757d" }}
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
              value={customer.email}
              onChange={handleChange}
              placeholder="Digite o email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telefone:</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={customer.phone}
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
              value={customer.purchaseDate}
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
              value={customer.returnDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="observation">Observação:</label>
          <textarea
            id="observation"
            name="observation"
            value={customer.observation}
            onChange={handleChange}
            placeholder="Digite observações adicionais"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Assinatura ou Foto:</label>
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
            onClick={() => signatureRef.current.clear()}
            style={{ 
              width: "auto", 
              padding: "8px 16px", 
              marginTop: "10px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Limpar Assinatura
          </button>
          
          <CameraCapture onCapture={handleCameraCapture} />
          
          {customer.signature && (
            <div style={{ marginTop: "15px" }}>
              <p style={{ fontWeight: "600", marginBottom: "10px" }}>Pré-visualização:</p>
              <img
                src={customer.signature}
                alt="Assinatura/Foto"
                className="image-preview"
                style={{ maxWidth: "300px", height: "auto" }}
              />
            </div>
          )}
        </div>

        <button type="submit" className="primary-btn">
          Atualizar Cliente
        </button>
      </form>
    </div>
  );
};

export default CustomerUpdate;