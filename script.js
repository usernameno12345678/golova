// Basic setup for Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000); // Уменьшенное поле зрения
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
    console.log("Model loaded");
}, undefined, function (error) {
    console.error(error);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 1).normalize();
scene.add(directionalLight);

camera.position.z = 4; // Уменьшаем значение для приближения камеры

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Variables for touch handling
let isTouching = false;
let lastTouchX = 0;
let lastTouchY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
const rotationSpeed = 0.002; // Уменьшенная скорость вращения для мобильных устройств
const smoothFactor = 0.1; // Коэффициент плавности

// Rotate model based on mouse movement (desktop)
document.addEventListener('mousemove', (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = (event.clientY / window.innerHeight) * 2 - 1;
    scene.rotation.y = x * 0.2; // Коэффициент для активного поворота на компьютере
    scene.rotation.x = y * 0.2; // Коэффициент для активного поворота на компьютере
    console.log(`Mouse move: x=${x}, y=${y}`);
});

// Rotate model based on touch movement (mobile)
document.addEventListener('touchstart', (event) => {
    isTouching = true;
    lastTouchX = event.touches[0].clientX;
    lastTouchY = event.touches[0].clientY;
});

document.addEventListener('touchmove', (event) => {
    if (isTouching) {
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        const deltaX = touchX - lastTouchX;
        const deltaY = touchY - lastTouchY;
        targetRotationY += deltaX * rotationSpeed; // Уменьшенная скорость вращения для мобильных устройств
        targetRotationX += deltaY * rotationSpeed; // Уменьшенная скорость вращения для мобильных устройств
        lastTouchX = touchX;
        lastTouchY = touchY;
    }
});

document.addEventListener('touchend', (event) => {
    isTouching = false;
    if (event.changedTouches.length > 0) {
        const touchX = event.changedTouches[0].clientX;
        const touchY = event.changedTouches[0].clientY;
        targetRotationY = (touchX / window.innerWidth - 0.5) * Math.PI * 0.12; // Уменьшенный коэффициент для менее активного поворота на мобильных устройствах
        targetRotationX = (touchY / window.innerHeight - 0.5) * Math.PI * 0.12; // Уменьшенный коэффициент для менее активного поворота на мобильных устройствах
    }
});

// Smooth rotation animation
function animate() {
    requestAnimationFrame(animate);
    if (model) {
        model.rotation.y += (targetRotationY - model.rotation.y) * smoothFactor; // Плавная анимация поворота по Y
        model.rotation.x += (targetRotationX - model.rotation.x) * smoothFactor; // Плавная анимация поворота по X
    }
    renderer.render(scene, camera);
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
    console.log("Window resized");
});

function updateModelScale() {
    if (model) {
        if (window.innerWidth <= 768) {
            model.scale.set(4, 4, 4); // Увеличиваем масштаб модели для мобильных устройств
        } else {
            model.scale.set(5, 5, 5); // Увеличиваем масштаб модели для десктопов
        }
        console.log("Model scale updated");
    } else {
        console.log("Model not loaded yet");
    }
}

// Function to set the CSS variable for viewport height
function setVh() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    console.log("Viewport height set");
}

// Initial setting of the CSS variable
setVh();

// Update the CSS variable on resize
window.addEventListener('resize', setVh);
