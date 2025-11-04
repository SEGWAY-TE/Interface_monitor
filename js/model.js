import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const contenedor = document.querySelector('#contenedor3d');
const camera = new THREE.PerspectiveCamera(20, contenedor.clientWidth / contenedor.clientHeight, 5, 250);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    alpha: true,
    antialias: true
});

const gridHelper = new THREE.GridHelper(150, 20, 0xAAAABD, 0x444444);
scene.add(gridHelper);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(contenedor.clientWidth, contenedor.clientHeight);

camera.aspect = contenedor.clientWidth / contenedor.clientHeight;
camera.position.setZ(30);
camera.position.setY(5);
camera.position.setX(15);

renderer.render(scene, camera);

const controls = new OrbitControls(camera, renderer.domElement);

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 2);
directional.position.set(5, 10, 7);
scene.add(directional);

const gltfLoader = new GLTFLoader();
controls.target.set(0, 4, 0);
controls.update();

// VARIABLE PARA ACTIVAR/DESACTIVAR EFECTO RAYOS X
let xrayMode = true; // Cambiar a false para modo normal

let loadedModel;
let meshData = []; // Almacenar información de cada mesh

gltfLoader.load('./models/segway/scene.gltf', (gltfScene) => {
    gltfScene.scene.scale.set(30, 30, 30);
    gltfScene.scene.position.set(0, 1, 0);
    
    loadedModel = gltfScene.scene;
    
    // Recolectar primero todos los meshes
    const meshes = [];
    gltfScene.scene.traverse((child) => {
        if (child.isMesh) {
            meshes.push(child);
        }
    });
    
    // Configurar materiales para cada mesh
    meshes.forEach((mesh) => {
        // Guardar el material original
        const originalMaterial = mesh.material;
        
        // Material base translúcido con efecto de vidrio (modo rayos X)
        const xrayBaseMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
            metalness: 0.1,
            roughness: 0.3,
            transmission: 0.8,
            thickness: 0.5,
            envMapIntensity: 1.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        
        // Wireframe para las aristas brillantes
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        // Crear mesh de wireframe
        const wireframeMesh = new THREE.Mesh(mesh.geometry, wireframeMaterial);
        wireframeMesh.name = 'wireframe'; // Nombre para identificarlo
        
        // Guardar información del mesh
        meshData.push({
            mesh: mesh,
            originalMaterial: originalMaterial,
            xrayMaterial: xrayBaseMaterial,
            wireframeMesh: wireframeMesh
        });
        
        // Aplicar material según el modo actual
        if (xrayMode) {
            mesh.material = xrayBaseMaterial;
            mesh.add(wireframeMesh);
        } else {
            mesh.material = originalMaterial;
        }
    });
    
    scene.add(gltfScene.scene);
}, undefined, (error) => {
    console.error('Error al cargar el modelo:', error);
});

// Función para cambiar entre modo normal y rayos X
function toggleXrayMode(enabled) {
    xrayMode = enabled;
    
    meshData.forEach((data) => {
        if (xrayMode) {
            // Activar modo rayos X
            data.mesh.material = data.xrayMaterial;
            
            // Añadir wireframe si no está
            if (!data.mesh.children.includes(data.wireframeMesh)) {
                data.mesh.add(data.wireframeMesh);
            }
        } else {
            // Activar modo normal
            data.mesh.material = data.originalMaterial;
            
            // Remover wireframe
            if (data.mesh.children.includes(data.wireframeMesh)) {
                data.mesh.remove(data.wireframeMesh);
            }
        }
    });
}

// Ejemplo de uso: Cambiar modo con la tecla 'X'
window.addEventListener('keypress', (e) => {
    if (e.key === 'x' || e.key === 'X') {
        toggleXrayMode(!xrayMode);
        console.log('Modo Rayos X:', xrayMode ? 'Activado' : 'Desactivado');
    }
});

// Manejo de redimensionamiento
window.addEventListener('resize', () => {
    camera.aspect = contenedor.clientWidth / contenedor.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(contenedor.clientWidth, contenedor.clientHeight);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();