import { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import PropTypes from "prop-types";

const CameraCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const videoConstraints = {
    width: 640, // Resolução melhor para qualidade
    height: 480,
    facingMode: "user",
  };

  // Função para compressão WebP da câmera
  const compressToWebP = (base64Image, quality = 0.25) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Image;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Redimensionar mantendo proporção (máximo 250x200)
        let { width, height } = img;
        const maxWidth = 250;
        const maxHeight = 200;
        
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

        canvas.width = width;
        canvas.height = height;

        // Desenhar com qualidade otimizada
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(img, 0, 0, width, height);

        // Tentar WebP primeiro
        let compressedResult = canvas.toDataURL('image/webp', quality);
        
        // Fallback para JPEG se WebP não suportado
        if (compressedResult === 'data:image/png;base64,' || compressedResult.startsWith('data:image/png')) {
          console.log('WebP não suportado na câmera, usando JPEG');
          compressedResult = canvas.toDataURL('image/jpeg', quality);
        }

        console.log(`Câmera WebP/JPEG: ${base64Image.length} → ${compressedResult.length} chars (${Math.round((1 - compressedResult.length/base64Image.length) * 100)}% redução)`);
        
        resolve(compressedResult);
      };
    });
  };

  const activateCamera = () => {
    setCameraActive(true);
  };

  const capture = useCallback(async () => {
    // Capturar em boa resolução para depois comprimir
    const rawImage = webcamRef.current.getScreenshot({ 
      width: 640, 
      height: 480, 
      quality: 0.8 
    });
    
    // Comprimir usando WebP
    const compressedImage = await compressToWebP(rawImage);
    console.log("Tamanho da imagem capturada WebP:", compressedImage.length);
    
    // Apenas definir a imagem, não chamar onCapture ainda
    setImgSrc(compressedImage);
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const saveImage = () => {
    if (imgSrc && onCapture) {
      onCapture(imgSrc);
    }
  };

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      {!cameraActive ? (
        <button
          onClick={activateCamera}
          style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "3px" }}
        >
          Ativar Câmera
        </button>
      ) : (
        <>
          <Webcam
            audio={false}
            height={480}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={640}
            videoConstraints={videoConstraints}
            screenshotQuality={0.8} // Qualidade boa para depois comprimir
          />
          <div style={{ marginTop: "10px" }}>
            {!imgSrc ? (
              <button onClick={capture} style={{ padding: "10px 20px", marginRight: "10px" }}>
                Capturar Foto
              </button>
            ) : (
              <>
                <img src={imgSrc} alt="Captura da câmera" style={{ maxWidth: "100%", margin: "10px 0" }} />
                <button onClick={retake} style={{ padding: "10px 20px", marginRight: "10px" }}>
                  Refazer
                </button>
                <button onClick={saveImage} style={{ padding: "10px 20px" }}>
                  Salvar
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

CameraCapture.propTypes = {
  onCapture: PropTypes.func.isRequired,
};

export default CameraCapture;