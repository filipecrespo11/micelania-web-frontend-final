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
        const response = await axios.get(`https://micelania-app.onrender.com/customers/${id}`);
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

  // Função para compressão WebP + Base64 (85% de redução)
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

        // Desenhar com alta qualidade
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
        
        // Se ainda muito grande, reduzir qualidade progressivamente
        if (compressedResult.length > 6000) {
          const lowerQuality = Math.max(0.1, quality - 0.15);
          console.log(`Aplicando qualidade menor: ${lowerQuality}`);
          
          const reducedResult = canvas.toDataURL('image/webp', lowerQuality) !== 'data:image/png;base64,' 
            ? canvas.toDataURL('image/webp', lowerQuality)
            : canvas.toDataURL('image/jpeg', lowerQuality);
            
          if (reducedResult.length > 8000) {
            // Última tentativa: reduzir dimensões
            canvas.width = Math.round(width * 0.7);
            canvas.height = Math.round(height * 0.7);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const finalResult = canvas.toDataURL('image/webp', 0.2) !== 'data:image/png;base64,' 
              ? canvas.toDataURL('image/webp', 0.2)
              : canvas.toDataURL('image/jpeg', 0.2);
            
            resolve(finalResult);
          } else {
            resolve(reducedResult.length < compressedResult.length ? reducedResult : compressedResult);
          }
        } else {
          resolve(compressedResult);
        }
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
      // Aplicar compressão WebP para reduzir 85% do tamanho
      signatureImage = await compressToWebP(signatureImage, 0.3);
      
      // Verificar tamanho total do payload
      let customerDataWithSignature = { ...customer, signature: signatureImage };
      let payloadSize = JSON.stringify(customerDataWithSignature).length;
      console.log("Tamanho do payload com WebP:", payloadSize);
      
      // Se ainda muito grande, aplicar compressão mais agressiva
      if (payloadSize > 25000) {
        signatureImage = await compressToWebP(signatureImage, 0.15, 200, 120);
        customerDataWithSignature = { ...customer, signature: signatureImage };
        payloadSize = JSON.stringify(customerDataWithSignature).length;
        console.log("Tamanho após compressão agressiva:", payloadSize);
      }
      
      // Última tentativa de compressão se ainda muito grande
      if (payloadSize > 30000) {
        signatureImage = await compressToWebP(signatureImage, 0.1, 150, 100);
        customerDataWithSignature = { ...customer, signature: signatureImage };
        payloadSize = JSON.stringify(customerDataWithSignature).length;
        console.log("Tamanho após compressão final:", payloadSize);
      }
      
    } else if (!customer.signature) {
      setErrorMessage("A assinatura ou foto é obrigatória.");
      return;
    }

    try {
      // Debug detalhado do payload ANTES da limpeza
      console.log("=== ANÁLISE DETALHADA DO PAYLOAD ===");
      Object.keys(customer).forEach(key => {
        const value = customer[key];
        const size = JSON.stringify(value).length;
        console.log(`${key}: ${size} caracteres`);
        if (size > 500) {
          console.log(`  ⚠️ CAMPO GRANDE: ${key} = ${size} chars`);
          if (typeof value === 'string' && size > 1000) {
            console.log(`  📝 Conteúdo: ${value.substring(0, 100)}...`);
          }
        }
      });
      
      // Preparar dados finais com validação de tamanho
      let finalCustomerData = { ...customer };
      
      // Remover campos desnecessários que podem estar ocupando espaço
      delete finalCustomerData._id;
      delete finalCustomerData.__v;
      delete finalCustomerData.createdAt;
      delete finalCustomerData.updatedAt;
      delete finalCustomerData.password; // Nunca enviar senha
      delete finalCustomerData.purchaseHistory; // Histórico pode ser muito grande
      delete finalCustomerData.delivery;
      delete finalCustomerData.notes;
      delete finalCustomerData.status;
      delete finalCustomerData.category;
      delete finalCustomerData.tags;
      
      console.log("🧹 Campos removidos: password, purchaseHistory, delivery, etc.");
      
      // Limitar tamanho de campos de texto drasticamente
      if (finalCustomerData.observation && finalCustomerData.observation.length > 100) {
        finalCustomerData.observation = finalCustomerData.observation.substring(0, 100);
        console.log("✂️ Observação truncada para 100 caracteres");
      }
      
      // Verificar se há outros campos grandes e limitá-los MUITO mais
      Object.keys(finalCustomerData).forEach(key => {
        if (typeof finalCustomerData[key] === 'string' && finalCustomerData[key].length > 500) {
          console.log(`✂️ Campo ${key} muito grande (${finalCustomerData[key].length} chars), truncando para 100...`);
          finalCustomerData[key] = finalCustomerData[key].substring(0, 100);
        }
      });
      
      // Criar payload apenas com campos permitidos para atualização
      const allowedFields = {
        name: finalCustomerData.name || "",
        email: finalCustomerData.email || "",
        phone: finalCustomerData.phone || "",
        cpf: finalCustomerData.cpf || "",
        purchaseDate: finalCustomerData.purchaseDate || "",
        returnDate: finalCustomerData.returnDate || "",
        observation: (finalCustomerData.observation || "").substring(0, 100),
        signature: signatureImage || ""
      };
      
      console.log("📋 Usando apenas campos permitidos para atualização");
      
      const finalSize = JSON.stringify(allowedFields).length;
      console.log("📦 Enviando payload limpo com tamanho:", finalSize);
      
      // Última verificação de segurança
      if (finalSize > 15000) { // Limite ainda mais restritivo
        console.log("🚨 Payload ainda grande, aplicando limpeza extrema:", finalSize);
        
        // Limpeza ultra agressiva
        const ultraCleanPayload = {
          name: (allowedFields.name || "").substring(0, 30),
          email: (allowedFields.email || "").substring(0, 40),
          phone: (allowedFields.phone || "").substring(0, 15),
          cpf: (allowedFields.cpf || "").substring(0, 11),
          purchaseDate: allowedFields.purchaseDate || "",
          returnDate: allowedFields.returnDate || "",
          observation: (allowedFields.observation || "").substring(0, 30),
          signature: signatureImage || "hex:1x1:00"
        };
        
        const ultraSize = JSON.stringify(ultraCleanPayload).length;
        console.log("📦 Payload ultra limpo final:", ultraSize);
        
        await axios.put(`https://micelania-app.onrender.com/customers/${id}`, ultraCleanPayload, {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        await axios.put(`https://micelania-app.onrender.com/customers/${id}`, allowedFields, {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
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

  const handleCameraCapture = async (imageSrc) => {
    // Comprimir a imagem da câmera usando WebP
    const webpCompressed = await compressToWebP(imageSrc, 0.2, 250, 150);
    console.log("Foto da câmera comprimida WebP:", webpCompressed.length);
    
    setCustomer((prevCustomer) => ({
      ...prevCustomer,
      signature: webpCompressed,
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
                style={{ 
                  maxWidth: "300px", 
                  height: "auto",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#f9f9f9"
                }}
              />
              <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                📦 Imagem WebP comprimida: {customer.signature.length} chars
              </p>
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