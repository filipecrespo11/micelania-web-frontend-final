import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import CameraCapture from "./CameraCapture";
import { Link } from "react-router-dom";

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

  const resizeImage = (base64String, maxWidth = 300, maxHeight = 100) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Redimensionar proporcionalmente
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
        // Remover a redução de qualidade, usando o formato original (PNG para melhor qualidade)
        resolve(canvas.toDataURL("image/png")); // Alterado de "image/jpeg" para "image/png" para manter qualidade
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
      // Redimensionar a imagem sem compressão de qualidade
      signatureImage = await resizeImage(signatureImage, 300, 100);
      console.log("Tamanho do payload após redimensionamento:", JSON.stringify({ ...customer, signature: signatureImage }).length);
    } else if (!customer.signature) {
      setErrorMessage("A assinatura ou foto é obrigatória.");
      return;
    }

    try {
      await axios.put(`https://micelania-app.onrender.com/customers/${id}`, {
        ...customer,
        signature: signatureImage,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Cliente atualizado com sucesso!");
      navigate("/customers");
    } catch (error) {
      setErrorMessage(`Erro ao atualizar cliente: ${error.message}`);
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
    <div>
      <h1>Atualizar Cliente</h1>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div>
        <p><label>Nome:</label></p>
          <input type="text" name="name" value={customer.name} onChange={handleChange} readOnly />
        </div>
        <div>
        <p><label>Email:</label></p>
          <input type="email" name="email" value={customer.email} onChange={handleChange} />
        </div>
        <div>
        <p><label>Telefone:</label></p>
          <input type="tel" name="phone" value={customer.phone} onChange={handleChange} required />
        </div>
        <div>
        <p><label>CPF:</label></p>
          <input type="text" name="cpf" value={customer.cpf} onChange={handleChange} readOnly />
        </div>
        <div>
        <p><label>Data da Compra:</label></p>
          <input type="date" name="purchaseDate" value={customer.purchaseDate} onChange={handleChange} required />
        </div>
        <div>
          <p><label>Data de Devolução:</label></p>
          <input type="date" name="returnDate" value={customer.returnDate} onChange={handleChange} />
        </div>
        <div>
        <p> <label>Observação:</label></p>
          <textarea name="observation" value={customer.observation} onChange={handleChange} />
        </div>
        <div>
          <p><label>Assinatura ou Foto:</label></p>
          <SignatureCanvas
            ref={signatureRef}
            penColor="black"
            canvasProps={{ width: 600, height: 250, className: "signatureCanvas" }}
          />
          <button type="button" onClick={() => signatureRef.current.clear()} style={{ marginTop: "10px" }}>
            Limpar Assinatura
          </button>
          <CameraCapture onCapture={handleCameraCapture} />
          {customer.signature && (
            <div>
              <p>Pré-visualização:</p>
              <img
                src={customer.signature}
                alt="Assinatura/Foto"
                style={{ border: "1px solid #000", width: "300px", height: "100px" }}
              />
            </div>
          )}
        </div>
        <button type="submit">Atualizar Cliente</button>
      </form>

      <Link to="/customers">Ver Lista de Clientes</Link>
    </div>
  );
};

export default CustomerUpdate;