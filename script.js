// Basic setup for Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(14, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding; // Корректная обработка цветов
renderer.physicallyCorrectLights = true; // Физически корректное освещение
document.getElementById('model-container').appendChild(renderer.domElement);

let model;
let isModelMinimized = false;

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
loader.load('golova_model.glb', function (gltf) {
    if (model) {
        scene.remove(model); // Удаляем старую модель
    }
    model = gltf.scene;
    updateModelScale();
    scene.add(model);
    animate();
    console.log("Model loaded");

    document.getElementById('model-container').addEventListener('click', onModelClick);
    document.getElementById('model-container').addEventListener('touchend', onModelTouch);
}, undefined, function (error) {
    console.error(error);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 6); // Уменьшенная интенсивность
scene.add(ambientLight);


const pointLight1 = new THREE.PointLight(0xFFD5AE, 10, 100); // цвет, интенсивность, дальность
pointLight1.position.set(5, 10, 5); // Устанавливаем позицию света
scene.add(pointLight1);

// const pointLight2 = new THREE.PointLight(0xFFE0B7, 50, 1); // цвет, интенсивность, дальность
// pointLight2.position.set(1, 1, 1); // Устанавливаем позицию света
// scene.add(pointLight2);


const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Уменьшенная интенсивность
directionalLight.position.set(0, 1, 1).normalize();
scene.add(directionalLight);

camera.position.z = 10;

function animate() {
    requestAnimationFrame(animate);
    if (model) {
        model.rotation.y += (targetRotationY - model.rotation.y) * smoothFactor;
        model.rotation.x += (targetRotationX - model.rotation.x) * smoothFactor;
    }
    renderer.render(scene, camera);
}

// Variables for touch handling
let isTouching = false;
let lastTouchX = 0;
let lastTouchY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
const rotationSpeed = 0.002;
const smoothFactor = 0.1;

// Rotate model based on mouse movement (desktop)
document.addEventListener('mousemove', (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = (event.clientY / window.innerHeight) * 2 - 1;
    targetRotationY = x * 0.2;
    targetRotationX = y * 0.2;
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
        targetRotationY += deltaX * rotationSpeed;
        targetRotationX += deltaY * rotationSpeed;
        lastTouchX = touchX;
        lastTouchY = touchY;
    }
});

document.addEventListener('touchend', (event) => {
    isTouching = false;
    if (event.changedTouches.length > 0) {
        const touchX = event.changedTouches[0].clientX;
        const touchY = event.changedTouches[0].clientY;
        targetRotationY = (touchX / window.innerWidth - 0.5) * Math.PI * 0.12;
        targetRotationX = (touchY / window.innerHeight - 0.5) * Math.PI * 0.12;
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    updateModelScale();
    setVh();
    if (isModelMinimized) {
        gsap.to(model.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0 });
        gsap.to(model.position, { x: 0, y: -0.95, z: 0, duration: 0 });
    }
    console.log("Window resized");
});

function updateModelScale() {
    if (model) {
        if (window.innerWidth <= 768) {
            model.scale.set(4, 4, 4);
            model.position.set(0, -0.5, 0);
        } else {
            model.scale.set(5, 5, 5);
            model.position.set(0, 0, 0);
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

    console.log('Intersects:', intersects);

    if (intersects.length > 0) {
        const firstIntersectedObject = intersects[0].object;
        console.log('First intersected object:', firstIntersectedObject);
        if (firstIntersectedObject.name === 'head002') {
            toggleModelState();
            return;
        }
    }
}

document.addEventListener('mousedown', onDocumentMouseDown, false);

function toggleModelState() {
    const textContainer = document.getElementById('text-container');
    const slider = document.getElementById('slider');

    if (isModelMinimized) {
        if (window.innerWidth <= 768) {
            gsap.to(model.scale, { x: 4, y: 4, z: 4, duration: 0.6 });
            gsap.to(model.position, { x: 0, y: -0.5, z: 0, duration: 0.6 });
            gsap.to(model.rotation, { x: 0, duration: 0.6 });
            targetRotationX = 0;
            targetRotationY = 0;
        } else {
            gsap.to(model.scale, { x: 5, y: 5, z: 5, duration: 0.6 });
            gsap.to(model.position, { x: 0, y: 0, z: 0, duration: 0.6 });
            gsap.to(model.rotation, { x: 0, duration: 0.6 });
        }
        textContainer.classList.remove('hidden');
        slider.classList.add('hidden');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#ffffff');
        document.body.style.backgroundColor = '#ffffff';
        isModelMinimized = false;
    } else {
        gsap.to(model.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.6 });
        gsap.to(model.position, { x: 0, y: -1, z: 0, duration: 0.6 });
        textContainer.classList.add('hidden');
        slider.classList.remove('hidden');
        const backgroundColor = slides[currentSlide].getAttribute('data-bg-color');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', backgroundColor);
        document.body.style.backgroundColor = backgroundColor;
        isModelMinimized = true;
    }
    console.log(`Model minimized: ${isModelMinimized}`);
}

// Slider functionality
const slider = document.getElementById('slider');
const slides = slider.getElementsByClassName('slide');
let currentSlide = 0;

// Функция для перемешивания массива
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Меняем элементы местами
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function showSlide(index) {
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove('active');
    }
    slides[index].classList.add('active');

    const backgroundColor = slides[index].getAttribute('data-bg-color');
    if (backgroundColor) {
        document.querySelector('meta[name="theme-color"]').setAttribute('content', backgroundColor);
        document.body.style.backgroundColor = backgroundColor;
    } else {
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#ffffff');
        document.body.style.backgroundColor = '#ffffff';
    }
}

// Укажите индекс первого слайда, который должен оставаться на месте
const firstSlideIndex = 0; // Измените на нужный индекс, если необходимо
const firstSlide = slides[firstSlideIndex];

// Перемешиваем остальные слайды
const slidesArray = Array.from(slides).filter((_, index) => index !== firstSlideIndex); // Исключаем первый слайд
shuffleArray(slidesArray); // Перемешиваем массив

// Переставляем слайды в DOM в случайном порядке, добавляя первый слайд в начало
slider.innerHTML = ''; // Очищаем контейнер
slider.appendChild(firstSlide); // Добавляем первый слайд
slidesArray.forEach(slide => {
    slider.appendChild(slide); // Перемещаем каждый оставшийся слайд в конец контейнера
});

showSlide(currentSlide);

slider.addEventListener('click', function(event) {
    const rect = slider.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    if (clickX < rect.width / 2) {
        currentSlide = (currentSlide === 0) ? slides.length - 1 : currentSlide - 1;
    } else {
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
