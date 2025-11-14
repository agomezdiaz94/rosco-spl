import React, { useEffect, useState, useRef } from "react";
import "../styles/Rosco.css"; // o ./Rosco.css si lo tienes en components
import preguntasData from "../data/preguntas.json";
import logo from "../assets/logo.png";

// sonidos desde public/sounds (ruta absoluta para producción)
const SOUND_CORRECT = "/sounds/correcto.mp3";
const SOUND_INCORRECT = "/sounds/incorrecto.mp3";
const SOUND_PASA = "/sounds/pasapalabra.mp3";

const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Rosco() {
  const [nombre, setNombre] = useState("");
  const [iniciado, setIniciado] = useState(false);

  // preguntas por letra: vamos a generar un array de 26 elementos (A..Z)
  const [preguntas, setPreguntas] = useState([]);
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    // construye preguntas ordenadas A..Z (si tu JSON es array por letra, lo adaptamos)
    // Aquí asumimos que preguntasData es un array con objetos que tienen "letra","pregunta","respuesta"
    if (Array.isArray(preguntasData)) {
      // para cada letra elegimos aleatoriamente una de las preguntas disponibles
      const arr = letras.map((L) => {
        const ops = preguntasData.filter((p) => p.letra.toUpperCase() === L);
        if (ops.length === 0) return { letra: L, pregunta: `No hay pregunta para ${L}`, respuesta: "" };
        return ops[Math.floor(Math.random() * ops.length)];
      });
      setPreguntas(arr);
    } else {
      // si tu preguntas.json es un objeto por clave A:{...}, lo convertimos
      const arr = letras.map((L) => {
        if (preguntasData[L]) return { letra: L, ...preguntasData[L] };
        return { letra: L, pregunta: `No hay pregunta para ${L}`, respuesta: "" };
      });
      setPreguntas(arr);
    }
  }, []);

  useEffect(() => {
    if (!iniciado) return;
    // iniciar cámara (opcional)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          // no bloquear juego si no hay cámara
          console.warn("No se pudo acceder a la cámara:", err);
        });
    }
  }, [iniciado]);

  const playSound = (url) => {
    try {
      const a = new Audio(url);
      a.play().catch(() => {});
    } catch (e) {}
  };

  const handleIniciar = () => {
    if (!nombre.trim()) { alert("Ingresa tu nombre"); return; }
    setIniciado(true);
    setIndice(0);
  };

  const handleResponder = () => {
    if (!preguntas[indice]) return;
    const correcta = preguntas[indice].respuesta?.trim().toLowerCase() || "";
    const dada = respuesta.trim().toLowerCase();
    if (dada === "") return;
    if (dada === "pasapalabra") {
      playSound(SOUND_PASA);
      // dejar la pregunta para más adelante y sólo avanzar índice
    } else if (dada === correcta) {
      playSound(SOUND_CORRECT);
      // podrías marcar como correcta en un array si quieres
    } else {
      playSound(SOUND_INCORRECT);
    }
    setRespuesta("");
    setIndice((i) => (i + 1) % letras.length);
  };

  const handlePasar = () => {
    playSound(SOUND_PASA);
    setIndice((i) => (i + 1) % letras.length);
  };

  return (
    <div className="rosco-app">
      <img src={logo} alt="Logo" className="logo-esquina" />

      {!iniciado ? (
        <div className="inicio-panel">
          <h2>Rosco - Sociedad Punta de Lobos</h2>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
          <button onClick={handleIniciar}>Iniciar</button>
        </div>
      ) : (
        <div className="juego-panel">
          <div className="rosco-wrap">
            <div className="rosco-circle">
              {letras.map((L, idx) => {
                // posición circular simple
                const angle = (idx / letras.length) * Math.PI * 2;
                const r = 140; // radio en px, ajustable
                const x = Math.round(r * Math.cos(angle));
                const y = Math.round(r * Math.sin(angle));
                return (
                  <div
                    key={L}
                    className={`rosco-letter ${idx === indice ? "active" : ""}`}
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                  >
                    {L}
                  </div>
                );
              })}
              {/* cámara circular en el centro */}
              <div className="camera-center">
                <video ref={videoRef} autoPlay muted playsInline className="camera-video" />
              </div>
            </div>
          </div>

          <div className="panel-right">
            <h3>Letra: {letras[indice]}</h3>
            <p className="pregunta-text">{(preguntas[indice] && preguntas[indice].pregunta) || "..."}</p>

            <input
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Escribe tu respuesta o 'pasapalabra'"
              onKeyDown={(e) => e.key === "Enter" && handleResponder()}
            />

            <div style={{ marginTop: 10 }}>
              <button onClick={handleResponder}>Responder</button>
              <button onClick={handlePasar} style={{ marginLeft: 8 }}>
                Pasapalabra
              </button>
              <button onClick={() => setIndice((i) => (i + 1) % letras.length)} style={{ marginLeft: 8 }}>
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
