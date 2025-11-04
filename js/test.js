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

let redLight = document.getElementById('redLight')
let greenLight = document.getElementById('greenLight')

let greenLightRef = ref(db, "green/");
let redLightRef = ref(db, "red/");

// Referencia a la ruta "counter/"
const counterRef = ref(db, "counter/");

// Detectar cuando cambia
redLight.addEventListener("change", () => {
    set(ref(db, 'red/'), redLight.checked)
});
greenLight.addEventListener("change", () => {
    set(ref(db, 'green/'), greenLight.checked)
});


// Escuchar cambios en tiempo real
onValue(counterRef, (snapshot) => {
  const data = snapshot.val();
  document.getElementById("counter").textContent = data;
});

onValue(greenLightRef, (snapshot) => {
  const data = snapshot.val();
  greenLight.checked = data == true;
});

onValue(redLightRef, (snapshot) => {
  const data = snapshot.val();
  redLight.checked = data == true;
});