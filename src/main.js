import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

let elephant = null;
let sampler = null;
let path = null;
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("white");

//models
const gltfLoader = new GLTFLoader();
gltfLoader.load("/static/models/Elephant.glb", (file) => {
	elephant = file.scene.children[0];
	sampler = new MeshSurfaceSampler(elephant).build();
	path = new Path();
	group.add(path.line);
	// elephant.material = new THREE.MeshBasicMaterial({
	// 	// wireframe: true,
	// 	color: 0xff0000,
	// 	transparent: true,
	// 	opacity: 0.05,
	// });
	// elephant.scale.set(0.01, 0.01, 0.01);
	// scene.add(file.scene);
	// samplerLoad(elephant);
});

const group = new THREE.Group();
scene.add(group);

// Objects
// const geometry = new THREE.TorusKnotGeometry(4, 1.3, 100, 16);

// // Materials

// const material = new THREE.MeshBasicMaterial({ wireframe: true });
// material.color = new THREE.Color(0xff0000);

// // Mesh
// const cube = new THREE.Mesh(geometry, material);
// const torusKnot = new THREE.Mesh(geometry);

const palette = [
	new THREE.Color("#FAAD80"),
	new THREE.Color("#FF6767"),
	new THREE.Color("#FF3D68"),
	new THREE.Color("#A73489"),
];

// const vertices = [];
// const colors = [];
const tempPosition = new THREE.Vector3();
// const samplerLoad = (elephant) => {
// 	sampler = new MeshSurfaceSampler(elephant).build();
// 	for (let i = 0; i < 10000; i++) {
// 		sampler.sample(tempPosition);
// 		const color = palette[Math.floor(Math.random() * palette.length)];
// 		colors.push(color.r, color.g, color.b);
// 		vertices.push(tempPosition.x, tempPosition.y, tempPosition.z);
// 	}

// 	const pointsGeometry = new THREE.BufferGeometry();
// 	pointsGeometry.setAttribute(
// 		"position",
// 		new THREE.Float32BufferAttribute(vertices, 3)
// 	);
// 	pointsGeometry.setAttribute(
// 		"color",
// 		new THREE.Float32BufferAttribute(colors, 3)
// 	);
// 	const pointsMaterial = new THREE.PointsMaterial({
// 		size: 3,
// 		alphaTest: 0.2,
// 		vertexColors: true,
// 	});
// 	const points = new THREE.Points(pointsGeometry, pointsMaterial);
// 	group.add(points);
// };

class Path {
	constructor() {
		/* The array with all the vertices of the line */
		this.vertices = [];
		this.colors = [];
		/* The geometry of the line */
		this.geometry = new THREE.BufferGeometry();
		/* The material of the line */
		this.material = new THREE.LineBasicMaterial({
			vertexColors: true,
			transparent: true,
			opacity: 0.5,
		});
		/* The Line object combining the geometry & the material */
		this.line = new THREE.Line(this.geometry, this.material);

		/* Sample the first point of the line */
		sampler.sample(tempPosition);
		this.previousPoint = tempPosition.clone();
	}
	update() {
		/* Variable used to exit the while loop when we find a point */
		let pointFound = false;
		/* Loop while we haven't found a point */
		while (!pointFound) {
			/* Sample a random point */
			sampler.sample(tempPosition);
			const color = palette[Math.floor(Math.random() * palette.length)];

			/* If the new point is less 30 units from the previous point */
			if (tempPosition.distanceTo(this.previousPoint) < 30) {
				/* Add the new point in the vertices array */
				this.vertices.push(tempPosition.x, tempPosition.y, tempPosition.z);
				this.colors.push(color.r, color.g, color.b);
				/* Store the new point vector */
				this.previousPoint = tempPosition.clone();
				/* Exit the loop */
				pointFound = true;
			}
		}
		/* Update the geometry */
		this.geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute(this.vertices, 3)
		);
		this.geometry.setAttribute(
			"color",
			new THREE.Float32BufferAttribute(this.colors, 3)
		);
	}
}

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	45,
	sizes.width / sizes.height,
	0.1,
	1000
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 500;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Update objects
	group.rotation.y = 0.5 * elapsedTime;
	if (path) {
		if (path.vertices.length < 30000) {
			path.update();
		}
	}

	//Update controls
	controls.update();
	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
