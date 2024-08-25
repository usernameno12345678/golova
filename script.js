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

camera.position.z = 1; // Уменьшаем значение для приближения камеры

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Rotate model based on mouse movement
document.addEventListener('mousemove', (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = (event.clientY / window.innerHeight) * 2 - 1;
    scene.rotation.y = x * 0.2; // Уменьшаем коэффициент для менее активного поворота
    scene.rotation.x = y * 0.2; // Уменьшаем коэффициент для менее активного поворота
    console.log(`Mouse move: x=${x}, y=${y}`);
});

// Rotate model based on device orientation
if (window.DeviceOrientationEvent) {
    console.log("DeviceOrientationEvent supported");

    const requestPermissionButton = document.getElementById('requestPermissionButton');
    requestPermissionButton.addEventListener('click', () => {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                        requestPermissionButton.style.display = 'none'; // Скрываем кнопку после получения разрешения
                    } else {
                        console.log("Permission to access device orientation was denied");
                    }
                })
                .catch(console.error);
        } else {
            // Для других устройств
            window.addEventListener('deviceorientation', handleOrientation);
            requestPermissionButton.style.display = 'none'; // Скрываем кнопку для устройств, не требующих разрешения
        }
    });
} else {
    console.log("DeviceOrientationEvent not supported");
}

function handleOrientation(event) {
    console.log("Device orientation event fired");
    if (model) {
        const gamma = event.gamma ? event.gamma : 0; // Y-axis
        const beta = event.beta ? event.beta : 0; // X-axis
        model.rotation.y = THREE.Math.degToRad(gamma) * 0.2; // Уменьшаем коэффициент для менее активного поворота
        model.rotation.x = THREE.Math.degToRad(beta) * 0.2; // Уменьшаем коэффициент для менее активного поворота
        console.log(`Device orientation: gamma=${gamma}, beta=${beta}`);
    } else {
        console.log("Model not loaded yet");
    }
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
            model.scale.set(2, 2, 2); // Уменьшаем масштаб модели для мобильных устройств
        } else {
            model.scale.set(2.9, 2.9, 2.9); // Увеличиваем масштаб модели для десктопов
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
