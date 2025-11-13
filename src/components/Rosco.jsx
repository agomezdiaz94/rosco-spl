import React, { useState, useEffect, useRef } from "react";
import "./index.css";

const Rosco = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [respuesta, setRespuesta] = useState("");
  const [letras, setLetras] = useState([]);
  const [letraActual, setLetraActual] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [finalizado, setFinalizado] = useState(false);
  const [enJuego, setEnJuego] = useState(false);

  const videoRef = useRef(null);
  const startSound = useRef(null);
  const correctSound = useRef(null);
  const wrongSound = useRef(null);
  const endSound = useRef(null);

  useEffect(() => {
    fetch("/preguntas.json")
      .then((res) => res.json())
      .then((data) => {
        setPreguntas(data);
        const uniqueLetters = [...new Set(data.map((p) => p.letra))];
        setLetras(uniqueLetters);
      })
      .catch((err) => console.error("Error al cargar preguntas:", err));
  }, []);

  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
    }
  };

  const iniciarJuego = () => {
    if (!preguntas.length) return;
    setEnJuego(true);
    setFinalizado(false);
    setAciertos(0);
    setErrores(0);
    startSound.current.play();
    iniciarCamara();
    siguientePregunta();
  };

  const siguientePregunta = () => {
    if (preguntas.length === 0) return;
    const random = preguntas[Math.floor(Math.random() * preguntas.length)];
    setPreguntaActual(random);
    setLetraActual(random.letra);
    setRespuesta("");
  };

  const verificarRespuesta = () => {
    if (!preguntaActual) return;

    const correcta =
      respuesta.trim().toLowerCase() ===
      preguntaActual.respuesta.trim().toLowerCase();

    if (correcta) {
      correctSound.current.play();
      setAciertos((prev) => prev + 1);
    } else {
      wrongSound.current.play();
      setErrores((prev) => prev + 1);
    }

    const restantes = preguntas.filter((p) => p !== preguntaActual);
    if (restantes.length === 0) {
      setFinalizado(true);
      setEnJuego(false);
      endSound.current.play();
      return;
    }
    setPreguntas(restantes);
    siguientePregunta();
  };

  return (
    <div className="rosco-container">
      {/* Logo */}
      <img src="/logo.png" alt="Logo SPL" className="logo-spl" />

      {/* Cámara en el centro */}
      <div className="camera-container">
        <video ref={videoRef} autoPlay playsInline className="camera-view" />
      </div>

      {/* Rosco */}
      <div className="rosco">
        {letras.map((letra, index) => (
          <div
            key={letra}
            className={`letra ${
              letra === letraActual ? "activa" : ""
            } letra-${index}`}
          >
            {letra}
          </div>
        ))}
      </div>

      {/* Panel de juego */}
      <div className="panel">
        {!enJuego && !finalizado && (
          <button onClick={iniciarJuego} className="btn-iniciar">
            Iniciar Juego
          </button>
        )}

        {enJuego && preguntaActual && (
          <div className="pregunta-panel">
            <p>{preguntaActual.pregunta}</p>
            <input
              type="text"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Tu respuesta"
            />
            <button onClick={verificarRespuesta}>Responder</button>
          </div>
        )}

        {finalizado && (
          <div className="resultado">
            <h2>Juego Finalizado</h2>
            <p>✅ Aciertos: {aciertos}</p>
            <p>❌ Errores: {errores}</p>
            <button onClick={iniciarJuego}>Reiniciar</button>
          </div>
        )}
      </div>

      {/* Sonidos */}
      <audio ref={startSound} src="/sounds/start.mp3" />
      <audio ref={correctSound} src="/sounds/correct.mp3" />
      <audio ref={wrongSound} src="/sounds/wrong.mp3" />
      <audio ref={endSound} src="/sounds/end.mp3" />
    </div>
  );
};

export default Rosco;
