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

  const resizeImage = (base64String, maxWidth = 300, maxHeight = 100, quality = 0.7) => {
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
        // Converter para JPEG com qualidade reduzida
        resolve(canvas.toDataURL("image/jpeg", quality));
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
      // Redimensionar e comprimir a imagem antes de enviar
      signatureImage = await resizeImage(signatureImage, 300, 100, 0.7); // Ajuste a qualidade (0.1 a 1.0)
      console.log("Tamanho do payload após compressão:", JSON.stringify({ ...customer, signature: signatureImage }).length);
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
          <label>Nome:</label>
          <input type="text" name="name" value={customer.name} onChange={handleChange} readOnly />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={customer.email} onChange={handleChange} />
        </div>
        <div>
          <label>Telefone:</label>
          <input type="tel" name="phone" value={customer.phone} onChange={handleChange} required />
        </div>
        <div>
          <label>CPF:</label>
          <input type="text" name="cpf" value={customer.cpf} onChange={handleChange} readOnly />
        </div>
        <div>
          <label>Data da Compra:</label>
          <input type="date" name="purchaseDate" value={customer.purchaseDate} onChange={handleChange} required />
        </div>
        <div>
          <label>Data de Devolução:</label>
          <input type="date" name="returnDate" value={customer.returnDate} onChange={handleChange} />
        </div>
        <div>
          <label>Observação:</label>
          <textarea name="observation" value={customer.observation} onChange={handleChange} />
        </div>
        <div>
          <label>Assinatura ou Foto:</label>
          <SignatureCanvas
            ref={signatureRef}
            penColor="black"
            canvasProps={{ width: 500, height: 200, className: "signatureCanvas" }}
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