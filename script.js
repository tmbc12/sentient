let container;
let camera, scene, renderer;
let uniforms;

let loader = new THREE.TextureLoader();
let texture, _500;

loader.crossOrigin = ""; // Handle cross-origin requests properly

loader.load(
  'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/noise.png',
  (tex) => {
    texture = tex;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    
    loader.load(
      'https://i.ibb.co/3Wj2D3R/Frame-427322079-1.png',  
      (tex) => {
        _500 = tex;
        init();
        animate();
      }
    );
  }
);

function init() {
  container = document.getElementById('container');

  camera = new THREE.Camera();
  camera.position.z = 1;

  scene = new THREE.Scene();

  var geometry = new THREE.PlaneBufferGeometry(2, 2);

  uniforms = {
    u_time: { type: "f", value: 1.0 },
    u_resolution: { type: "v2", value: new THREE.Vector2() },
    u_pxaspect: { type: 'f', value: window.devicePixelRatio },
    u_noise: { type: "t", value: texture },
    u_text500: { type: "t", value: _500 },
    u_mouse: { type: "v2", value: new THREE.Vector2() }
  };

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent
  });

  material.extensions.derivatives = true;

  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);

  container.appendChild(renderer.domElement);

  // Create an h1 element
  const heading = document.createElement('h1');
  heading.textContent = 'Coming Soon !';

  // Apply CSS styling to center the heading horizontally and vertically
  heading.style.position = 'absolute';
  heading.style.top = '90%';
  heading.style.left = '50%';
  heading.style.transform = 'translate(-50%, -50%)';
  heading.style.color = 'white';

  // Append the h1 element to the container
  container.appendChild(heading);

  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);

  document.addEventListener('mousemove', e => {
    uniforms.u_mouse.value.x = (e.clientX / window.innerWidth) * 2 - 1;
    uniforms.u_mouse.value.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
}

function onWindowResize(event) {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = renderer.domElement.width;
  uniforms.u_resolution.value.y = renderer.domElement.height;
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

let capturer = new CCapture({
  verbose: true,
  framerate: 60,
  // motionBlurFrames: 4,
  quality: 90,
  format: 'webm',
  workersPath: 'js/'
});

let capturing = false;

isCapturing = function (val) {
  if (val === false && window.capturing === true) {
    capturer.stop();
    capturer.save();
  } else if (val === true && window.capturing === false) {
    capturer.start();
  }
  capturing = val;
};
toggleCapture = function () {
  isCapturing(!capturing);
};

window.addEventListener('keyup', function (e) {if (e.keyCode == 68) toggleCapture();});

function render() {
  uniforms.u_time.value += 0.05;
  renderer.render(scene, camera);

  if (capturing) {
    capturer.capture(renderer.domElement);
  }
}
