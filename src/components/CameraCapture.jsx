import { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import PropTypes from "prop-types";

const CameraCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const videoConstraints = {
    width: 640, // Reduzindo a resolução inicial
    height: 480,
    facingMode: "user",
  };

  const activateCamera = () => {
    setCameraActive(true);
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot({ width: 300, height: 100, quality: 0.7 }); // Reduzindo ao capturar
    setImgSrc(imageSrc);
    if (onCapture) {
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  const retake = () => {
    setImgSrc(null);
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
            screenshotQuality={0.7} // Reduzindo a qualidade diretamente no WebCam
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
                <button onClick={() => onCapture(imgSrc)} style={{ padding: "10px 20px" }}>
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