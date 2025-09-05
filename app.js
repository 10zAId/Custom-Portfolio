import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 13;

const scene = new THREE.Scene();
let butterfly, mixer;

const loader = new GLTFLoader();
loader.load(
    './ulysses_butterfly.glb',
    (gltf) => {
        butterfly = gltf.scene;

        // flip + scale
        butterfly.rotation.y = Math.PI;
        butterfly.scale.set(0.5, 0.5, 0.5);

        scene.add(butterfly);

        mixer = new THREE.AnimationMixer(butterfly);
        if (gltf.animations?.length) mixer.clipAction(gltf.animations[0]).play();
    },
    undefined,
    (err) => console.error(err)
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// lights
scene.add(new THREE.AmbientLight(0xffffff, 1.3));
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(5, 5, 5);
scene.add(topLight);

// section keyframes
const arrPositionModel = [
    { id: 'banner', position: { x: 1.1, y: -0.48, z: 0 }, rotation: { x: 0, y: -1.5, z: 0 } },
    { id: 'About', position: { x: -1, y: 0, z: -5 }, rotation: { x: 0, y: Math.PI - 1, z: 0 } },
    { id: 'Skills', position: { x: 2, y: 0, z: -5 }, rotation: { x: 0, y: Math.PI + 1, z: 0 } },
    { id: 'Contact', position: { x: 10, y: 5, z: -10 }, rotation: { x: 0, y: Math.PI, z: 0 } },
];


function lerp(a, b, t) {
    return a + (b - a) * t;
}

function updateModelOnScroll() {
    if (!butterfly) return;

    let scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);

    const sectionCount = arrPositionModel.length - 1;
    let rawIndex = scrollPercent * sectionCount;

    const i = Math.floor(rawIndex);
    const t = rawIndex - i;

    const start = arrPositionModel[i];
    const end = arrPositionModel[i + 1] || start;

    // interpolate position
    butterfly.position.x = lerp(start.position.x, end.position.x, t);
    butterfly.position.y = lerp(start.position.y, end.position.y, t);
    butterfly.position.z = lerp(start.position.z, end.position.z, t);

    // interpolate rotation
    butterfly.rotation.x = lerp(start.rotation.x, end.rotation.x, t);
    butterfly.rotation.y = lerp(start.rotation.y, end.rotation.y, t);
    butterfly.rotation.z = lerp(start.rotation.z, end.rotation.z, t);
}


// render loop
function render() {
    requestAnimationFrame(render);
    if (mixer) mixer.update(0.02);
    updateModelOnScroll();
    renderer.render(scene, camera);
}
render();

// responsive
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
