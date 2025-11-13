import React, { useEffect, useRef } from "react";

const CameraView = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("No se pudo acceder a la cámara:", err);
      }
    };
    getCamera();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <video ref={videoRef} autoPlay playsInline width="300" height="200" />
    </div>
  );
};

export default CameraView;
