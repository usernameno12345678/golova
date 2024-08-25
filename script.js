// Basic setup for Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true для прозрачного фона
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('model-container').appendChild(renderer.domElement);

let model; // Переменная для хранения модели

// Load the 3D model
const loader = new THREE.GLTFLoader();
loader.load('golova.glb', function (gltf) {
    model = gltf.scene;
    updateModelScale(); // Устанавливаем начальный масштаб модели
    model.position.set(0, 0, 0); // Устанавливаем модель в центр сцены
    scene.add(model);
    animate();
}, undefined, function (error) {
    console.error(error);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 1).normalize();
scene.add(directionalLight);

camera.position.z = 1; // Уменьшаем значение для приближения камеры

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}



// Rotate model based on device orientation
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (event) => {
        const x = event.gamma ? event.gamma / 90 : 0; // Y-axis
        const y = event.beta ? event.beta / 180 : 0; // X-axis
        model.rotation.y = x * 0.2; // Уменьшаем коэффициент для менее активного поворота
        model.rotation.x = y * 0.2; // Уменьшаем коэффициент для менее активного поворота
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    updateModelScale(); // Обновляем масштаб модели при изменении размера окна
    setVh(); // Обновляем переменную vh при изменении размера окна
});

function updateModelScale() {
    if (model) {
        if (window.innerWidth <= 768) {
            model.scale.set(2, 2, 2); // Уменьшаем масштаб модели для мобильных устройств
        } else {
            model.scale.set(2.9, 2.9, 2.9); // Увеличиваем масштаб модели для десктопов
        }
    }
}

// Function to set the CSS variable for viewport height
function setVh() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Initial setting of the CSS variable
setVh();

// Update the CSS variable on resize
window.addEventListener('resize', setVh);
