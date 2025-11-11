// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAHcsmgVpiXSeMSjR16OHV2vzVo3tWH_WY",
    authDomain: "segway-te.firebaseapp.com",
    databaseURL: "https://segway-te-default-rtdb.firebaseio.com",
    projectId: "segway-te",
    storageBucket: "segway-te.firebasestorage.app",
    messagingSenderId: "998713359720",
    appId: "1:998713359720:web:67316e513464d67a1b6add"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
import {getDatabase, ref, child, get, set, update, remove, onValue} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

const db  = getDatabase();

let motorLeft = document.getElementById('motorLeft')
let motorRight = document.getElementById('motorRight')

let motorRightRef = ref(db, "motorRightBool/");
let motorLeftRef = ref(db, "motorLeftBool/");


let motorLeftPWM = document.getElementById('PWMLeft')
let motorRightPWM = document.getElementById('PWMRight')

let PWMRightRef = ref(db, "motorRightPWM/");
let PWMLeftRef = ref(db, "motorLeftPWM/");

// Referencia a la ruta del sensor de distancia
const distanceSensor = ref(db, "distanceSensor/");

// Detectar cuando cambia
motorRight.addEventListener("change", () => {
    set(ref(db, 'motorRightBool/'), motorRight.checked)
});
motorLeft.addEventListener("change", () => {
    set(ref(db, 'motorLeftBool/'), motorLeft.checked)
});

motorLeftPWM.addEventListener("change", () => {
  const pwmValue = Number(motorLeftPWM.value); // convierte el valor a número
  set(PWMLeftRef, pwmValue); // guarda el nuevo valor en Firebase
});

motorRightPWM.addEventListener("change", () => {
  const pwmValue = Number(motorRightPWM.value); // convierte el valor a número
  set(PWMRightRef, pwmValue); // guarda el nuevo valor en Firebase
});


// Escuchar cambios en tiempo real
onValue(distanceSensor, (snapshot) => {
  const data = snapshot.val();
  document.getElementById("countDistance").textContent = data;
});

onValue(motorLeftRef, (snapshot) => {
  const data = snapshot.val();
  motorLeft.checked = data == true;
});

onValue(motorRightRef, (snapshot) => {
  const data = snapshot.val();
  motorRight.checked = data == true;
});

onValue(PWMRightRef, (snapshot) => {
  const data = snapshot.val();
  motorRightPWM.value = Number(data);
});

onValue(PWMLeftRef, (snapshot) => {
  const data = snapshot.val();
  motorLeftPWM.value = Number(data);
});

// Cambiar Valores de Giroscopio

let vx_indicator = document.getElementById('vx');
let vy_indicator = document.getElementById('vy');
let vz_indicator = document.getElementById('vz');

let jw_indicator = document.getElementById('jw');
let pt_indicator = document.getElementById('pt');
let rll_indicator = document.getElementById('rll');

let bttnPWM = document.getElementById('TestSensors');




// Función para generar un número aleatorio entre -100 y 100
function randomValue() {
  return (Math.random() * 4 - 2).toFixed(2);
}

function formatValue(num) {
  const sign = num < 0 ? "-" : "";
  num = Math.abs(num).toFixed(2); // siempre 2 decimales
  const [intPart, decPart] = num.split(".");
  const paddedInt = intPart.padStart(2, "0"); // agrega ceros a la izquierda
  return `${sign}${paddedInt}.${decPart}`;
}

// Función para establecer todos los indicadores a un valor dado
function setIndicators(vx, vy, vz, jw, pt, rll) {
  vx_indicator.textContent = formatValue(vx);
  vy_indicator.textContent = formatValue(vy);
  vz_indicator.textContent = formatValue(vz);
  jw_indicator.textContent = formatValue(jw);
  pt_indicator.textContent = formatValue(pt);
  rll_indicator.textContent = formatValue(rll);
}

// --- Lógica del botón ---
bttnPWM.addEventListener("mousedown", () => {
  // Cada 300 ms actualiza con valores aleatorios
  const interval = setInterval(() => {
    setIndicators(
      randomValue() + 1,
      randomValue() + 1,
      randomValue() + 1,
      randomValue()*4 + 90,
      randomValue()*4 + 60,
      randomValue()*4
    );
  }, 1000);

  // Después de 5 segundos, detener y reiniciar a cero
  setTimeout(() => {
    clearInterval(interval);
    setIndicators(0, 0, 0, 0, 0, 0);
  }, 10000);
});

bttnPWM.addEventListener("touchstart", () => {
  bttnPWM.dispatchEvent(new Event("mousedown"));
});








function updateDate() {
  const dateElement = document.getElementById("Date");
  const now = new Date();

  const options = { weekday: 'long', month: 'short', day: '2-digit', year: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', options);
  
  const time = now.toLocaleTimeString('en-US', { hour12: false });
  
  // Reorganiza el formato a "Monday, Oct 13 2025 14:23:17"
  const [weekday, month, day, year] = formattedDate.replace(',', '').split(' ');
  dateElement.textContent = `${weekday}, ${month} ${day} ${year} ${time}`;
}

updateDate();
setInterval(updateDate, 1000);



const startTime = Date.now();

function updateRuntime() {
  const runtimeElement = document.getElementById("Runtime");
  const elapsed = Math.floor((Date.now() - startTime) / 1000);

  const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');

  runtimeElement.textContent = `Runtime: ${hours}:${minutes}:${seconds}`;
}

setInterval(updateRuntime, 1000);
updateRuntime();



// --- Variables globales ---
const terminalBody = document.getElementById("terminal-body");
const MAX_LINES = 8;
let messages = [];
let displayList = [];

// --- Renderizar líneas ---
function renderLines() {
  terminalBody.innerHTML = "";
  displayList.forEach(text => {
    const div = document.createElement("div");
    div.className = "serial-line";
    div.textContent = text;
    terminalBody.appendChild(div);
  });
}

// --- Cargar mensajes desde Firebase ---
async function loadMessages() {
  try {
    const snapshot = await get(ref(db, "Terminal"));

    if (snapshot.exists()) {
      const data = snapshot.val();
      // Ordenar por clave numérica para asegurar orden 1..15
      messages = Object.keys(data)
        .sort((a, b) => Number(a) - Number(b))
        .map(k => data[k]);
      startTerminal();
    } else {
      console.warn("No se encontraron mensajes en Firebase");
    }
  } catch (error) {
    console.error("Error al cargar mensajes:", error);
  }
}

// --- Mensaje aleatorio ---
function getRandomMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
}

// --- Simular flujo de terminal ---
function startTerminal() {
  // Inicia con 8 mensajes
  for (let i = 0; i < MAX_LINES; i++) displayList.push(getRandomMessage());
  renderLines();

  // Cada 3 segundos reemplaza uno
  setInterval(() => {
    displayList.push(getRandomMessage());
    if (displayList.length > MAX_LINES) displayList.shift();
    renderLines();
  }, 3000);
}

// --- Ejecutar ---
loadMessages();