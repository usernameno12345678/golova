// Basic setup for Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000); // Уменьшенное поле зрения
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true для прозрачного фона
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('model-container').appendChild(renderer.domElement);

let model; // Переменная для хранения модели
let isModelMinimized = false; // Флаг для отслеживания состояния модели

// Lazy loading images with blur-up effect
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('.lazy');

    lazyImages.forEach(image => {
        image.addEventListener('load', () => {
            image.classList.add('lazy-loaded');
        });
    });
});

// Load the 3D model
const loader = new THREE.GLTFLoader();
loader.load('golova.glb', function (gltf) {
    model = gltf.scene;
    updateModelScale(); // Устанавливаем начальный масштаб модели
    scene.add(model);
    animate();
    console.log("Model loaded");

    // Добавляем обработчик клика на контейнер модели
    document.getElementById('model-container').addEventListener('click', onModelClick);
    document.getElementById('model-container').addEventListener('touchend', onModelTouch);
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
    if (model) {
        model.rotation.y += (targetRotationY - model.rotation.y) * smoothFactor; // Плавная анимация поворота по Y
        model.rotation.x += (targetRotationX - model.rotation.x) * smoothFactor; // Плавная анимация поворота по X
    }
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
    targetRotationY = x * 0.2; // Коэффициент для активного поворота на компьютере
    targetRotationX = y * 0.2; // Коэффициент для активного поворота на компьютере
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
    if (isModelMinimized) {
        gsap.to(model.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0 });
        gsap.to(model.position, { x: 0, y: -0.95, z: 0, duration: 0 }); // Опускаем модель вниз
    }
    console.log("Window resized");
});

function updateModelScale() {
    if (model) {
        if (window.innerWidth <= 768) {
            model.scale.set(4, 4, 4); // Увеличиваем масштаб модели для мобильных устройств
            model.position.set(0, -0.5, 0); // Опускаем модель чуть ниже для мобильных устройств
        } else {
            model.scale.set(5, 5, 5); // Увеличиваем масштаб модели для десктопов
            model.position.set(0, 0, 0); // Позиция для десктопов
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

// Function to handle model click
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onDocumentMouseDown(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    console.log('Intersects:', intersects); // Debug log

    if (intersects.length > 0) {
        const firstIntersectedObject = intersects[0].object;
        console.log('First intersected object:', firstIntersectedObject); // Debug log
        // Упростим проверку, чтобы убедиться, что клик по модели обрабатывается
        if (firstIntersectedObject.name === 'Data_GEO_ellie_head_002') {
            // Обработка клика по модели
            toggleModelState();
            return; // Прекращаем дальнейшую обработку события
        }
    }
}

document.addEventListener('mousedown', onDocumentMouseDown, false);

function toggleModelState() {
    const textContainer = document.getElementById('text-container');
    const slider = document.getElementById('slider');

    if (isModelMinimized) {
        // Возвращаем модель в исходное состояние
        if (window.innerWidth <= 768) {
            gsap.to(model.scale, { x: 4, y: 4, z: 4, duration: 0.6 }); // Возвращаем масштаб для мобильных устройств
            gsap.to(model.position, { x: 0, y: -0.5, z: 0, duration: 0.6 }); // Возвращаем позицию для мобильных устройств
            gsap.to(model.rotation, { x: 0, duration: 0.6 }); // Возвращаем поворот модели
            targetRotationX = 0; // Сбрасываем поворот по X
            targetRotationY = 0; // Сбрасываем поворот по Y
        } else {
            gsap.to(model.scale, { x: 5, y: 5, z: 5, duration: 0.6 }); // Возвращаем масштаб для десктопов
            gsap.to(model.position, { x: 0, y: 0, z: 0, duration: 0.6 }); // Возвращаем позицию для десктопов
            gsap.to(model.rotation, { x: 0, duration: 0.6 }); // Возвращаем поворот модели
        }
        textContainer.classList.remove('hidden');
        slider.classList.add('hidden');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#ffffff'); // Устанавливаем белый цвет статус-бара
        isModelMinimized = false;
    } else {
        // Уменьшаем и перемещаем модель вниз экрана
        gsap.to(model.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.6 }); // Делаем модель меньше
        gsap.to(model.position, { x: 0, y: -0.95, z: 0, duration: 0.6 }); // Опускаем модель вниз
        textContainer.classList.add('hidden');
        slider.classList.remove('hidden');
        const backgroundColor = slides[currentSlide].getAttribute('data-bg-color');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', backgroundColor); // Устанавливаем цвет статус-бара по текущему слайду
        isModelMinimized = true;
    }
    console.log(`Model minimized: ${isModelMinimized}`);
}

// Slider functionality
const slider = document.getElementById('slider');
const slides = slider.getElementsByClassName('slide');
let currentSlide = 0;

function showSlide(index) {
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove('active');
    }
    slides[index].classList.add('active');

    // Устанавливаем цвет фона для статус-бара
    const backgroundColor = slides[index].getAttribute('data-bg-color');
    if (backgroundColor) {
        document.querySelector('meta[name="theme-color"]').setAttribute('content', backgroundColor);
    } else {
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#ffffff'); // Устанавливаем цвет по умолчанию
    }
}

showSlide(currentSlide);

slider.addEventListener('click', function(event) {
    const rect = slider.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    if (clickX < rect.width / 2) {
        // Clicked on the left side, go to previous slide
        currentSlide = (currentSlide === 0) ? slides.length - 1 : currentSlide - 1;
    } else {
        // Clicked on the right side, go to next slide
        currentSlide = (currentSlide === slides.length - 1) ? 0 : currentSlide + 1;
    }
    showSlide(currentSlide);
});

// Initial setting of the bottom padding
setBottomPadding();

// Update the bottom padding on resize
window.addEventListener('resize', setBottomPadding);

// Добавляем обработчик клика на контейнер модели
document.getElementById('model-container').addEventListener('click', onModelClick);

// Добавляем обработчик касания для мобильных устройств
document.getElementById('model-container').addEventListener('touchend', onModelTouch);