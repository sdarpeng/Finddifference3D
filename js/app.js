import { OrbitControls } from "./vendor/three/OrbitControls.js"; //新的版本只能使用module方式引用，用脚本方式引用无效；

let rendererL, canvasL, sceneL, cameraL, orbitL, MeshL;
let rendererR, canvasR, sceneR, cameraR, orbitR, MeshR;
var mouseSwitch;
var raycasterL = new THREE.Raycaster();
var raycasterR = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var mouseHelperL = new THREE.Mesh(
  new THREE.BoxBufferGeometry(1, 1, 10),
  new THREE.MeshNormalMaterial()
);
var mouseHelperR = new THREE.Mesh(
  new THREE.BoxBufferGeometry(1, 1, 10),
  new THREE.MeshNormalMaterial()
);
var position = new THREE.Vector3();
var orientation = new THREE.Euler();
var intersectionL = {
  intersects: false,
  point: new THREE.Vector3(),
  normal: new THREE.Vector3()
};

var intersectionR = {
  intersects: false,
  point: new THREE.Vector3(),
  normal: new THREE.Vector3()
};
var lineL, lineR;
//var timeLeft = 100；
//window.mouseSwitch = mouseSwitch;

function main() {
  canvasL = document.querySelector("#frameL");
  canvasR = document.querySelector("#frameR");
  canvasL.addEventListener("mouseover", onMouseOverL);
  canvasR.addEventListener("mouseover", onMouseOverR);
  sceneL = new THREE.Scene();
  sceneR = new THREE.Scene();
  var textureloader = new THREE.TextureLoader();
  //sceneL.background = textureloader.load(
  //  "https://threejsfundamentals.org/threejs/resources/images/daikanyama.jpg"
  //);
  //sceneR.background = new THREE.Color(0xffff00);
  //scene.background = new THREE.Color(0x00aabb);
  createRenderer();
  createCamera();
  creatControl();
  createLight();
  createObject();
  render();

  window.addEventListener("resize", onWindowResize);
  canvasL.addEventListener("mousemove", onTouchMove);
  canvasL.addEventListener("touchmove", onTouchMove);
  canvasR.addEventListener("mousemove", onTouchMove);
  canvasR.addEventListener("touchmove", onTouchMove);
  var moved = false;

  orbitL.addEventListener("change", function () {
    moved = true;
  });

  orbitR.addEventListener("change", function () {
    moved = true;
  });

  window.addEventListener(
    "mousedown",
    function () {
      moved = false;
    },
    false
  );

  window.addEventListener("mouseup", function () {
    checkIntersection();
    if (!moved && intersectionL.intersects) shoot();
  });

  //requestAnimationFrame(); //函数里的参数不能为空，必须要指定渲染器，且跟WebVR不兼容，这里不再使用；
}

function onWindowResize() {
  cameraL.aspect = canvasL.clientWidth / canvasL.clientHeight;
  cameraR.aspect = canvasR.clientWidth / canvasR.clientHeight;
  cameraL.updateProjectionMatrix(); // update the camera's frustum
  cameraR.updateProjectionMatrix();
  rendererL.setSize(canvasL.clientWidth, canvasL.clientHeight);
  rendererR.setSize(canvasR.clientWidth, canvasR.clientHeight);
}

function onMouseOverL() {
  mouseSwitch = 0;
  //console.log("into L" + mouseSwitch);
}

function onMouseOverR() {
  mouseSwitch = 1;
  //console.log("into R" + mouseSwitch);
}

function createRenderer() {
  rendererL = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  rendererR = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  rendererL.setPixelRatio(window.devicePixelRatio);
  rendererL.setSize(canvasL.clientWidth, canvasL.clientHeight); //只有window才拥有innerWidth和innerHeight，其他节点只有clientWidth和clientHeight；
  canvasL.appendChild(rendererL.domElement); //要将渲染器指定给父节点，才会渲染；
  rendererL.shadowMap.enabled = true;
  rendererL.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  rendererR.setPixelRatio(window.devicePixcelRatio);
  rendererR.setSize(canvasR.clientWidth, canvasR.clientHeight);
  canvasR.appendChild(rendererR.domElement);
  rendererR.shadowMap.enabled = true;
  rendererR.shadowMap.type = THREE.PCFSoftShadowMap;
}

function createCamera() {
  const aspectL = canvasL.clientWidth / canvasL.clientHeight;
  const aspectR = canvasR.clientWidth / canvasR.clientHeight;
  cameraL = new THREE.PerspectiveCamera(50, aspectL, 1, 3000);
  cameraR = new THREE.PerspectiveCamera(50, aspectR, 1, 3000);
  cameraR.position.set(50, 100, 300);
  cameraL.position.set(50, 100, 300);
  //scene.add(camera);  相机跟场景同级，不能添加到场景；
}

function creatControl() {
  orbitL = new OrbitControls(cameraL, canvasL); //操作这个相机，借助这个dom元素；
  orbitR = new OrbitControls(cameraR, canvasR);
  orbitR.enableDamping = true;
  orbitR.DampingFactor = 0.05;
  orbitL.enableDamping = true;
  orbitL.dampingFactor = 0.05; //不同版本的orbitcontrol算法不一样；新版本效果好到想哭；
  //orbit.update(); // 一旦开启了damping，必须要在动画loop里添加controls.update()，否则会产生错乱；
  //scene.add(orbit); //orbit操控器不需要添加到场景中，只有助手型操控器才需要添加；
}

function createLight() {
  const light1 = new THREE.DirectionalLight(0xffffff, 0.3);
  const hemi1 = new THREE.AmbientLight(0xffffff, 0.2);
  const spot1 = new THREE.SpotLight(0xffeecc, 1);
  const light2 = new THREE.DirectionalLight(0xffffff, 0.3);
  const hemi2 = new THREE.AmbientLight(0xffffff, 0.2);
  const spot2 = new THREE.SpotLight(0xffccee, 1);
  spot1.position.set(50, 500, 20);
  spot2.position.set(50, 500, 20);
  spot1.castShadow = true;
  //Set up shadow properties for the light
  spot1.shadow.mapSize.width = 512; // default
  spot1.shadow.mapSize.height = 512; // default
  spot1.shadow.camera.near = 0.5; // default
  spot1.shadow.camera.far = 10000; // default
  light1.position.set(10, 10, 10);
  light1.rotation.x = Math.PI / 4;
  sceneL.add(light1, hemi1, spot1);
  sceneR.add(light2, hemi2, spot2);
}

function createObject() {
  const hlp = new THREE.GridHelper(1000, 10);

  const cube = new THREE.BoxBufferGeometry(100, 100, 100);
  const sphere = new THREE.SphereBufferGeometry(50, 10, 10);
  const plane = new THREE.PlaneBufferGeometry(600, 300);
  const textureloader = new THREE.TextureLoader();
  const texture = textureloader.load("./texture/0008118278376986_b.jpg");
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    flatShading: true
  });

  const material2 = new THREE.MeshPhongMaterial({
    map: texture,
    flatShading: true
  });

  const material1 = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    flatShading: true
  });
  MeshL = new THREE.Mesh(cube, material);
  MeshR = new THREE.Mesh(sphere, material2);
  //MeshL.position.set(0, 50, 0);
  MeshL.castShadow = true;

  var geometryL = new THREE.BufferGeometry();
  geometryL.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);

  lineL = new THREE.Line(geometryL, new THREE.LineBasicMaterial());

  var geometryR = new THREE.BufferGeometry();
  geometryR.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);

  lineR = new THREE.Line(geometryR, new THREE.LineBasicMaterial());

  sceneL.add(hlp, MeshL, mouseHelperL, lineL);
  sceneR.add(MeshR, mouseHelperR, lineR);
}

function onTouchMove(event) {
  var x, y;

  if (event.changedTouches) {
    x = event.changedTouches[0].pageX;
    y = event.changedTouches[0].pageY;
  } else {
    x = event.clientX;
    y = event.clientY;
  }
  if (mouseSwitch === 0) {
    mouse.x = (x / canvasL.clientWidth) * 2 - 1;
  } else {
    mouse.x = (x / canvasR.clientWidth - 2) * 2 + 1;
  }

  //mouse.x = -1;
  mouse.y = -(y / window.innerHeight) * 2 + 1;

  checkIntersection();
}

function checkIntersection() {
  var p, n, positions;

  if (mouseSwitch === 0) {
    if (!MeshL) return;

    raycasterL.setFromCamera(mouse, cameraL);
    var intersectsL = raycasterL.intersectObjects([MeshL]);

    if (intersectsL.length > 0) {
      p = intersectsL[0].point;
      mouseHelperL.position.copy(p);
      intersectionL.point.copy(p);

      //n = intersectsL[0].face.normal.clone();
      n = cameraL.getWorldDirection();
      //n.transformDirection(MeshL.matrixWorld);
      n.multiplyScalar(10);
      n.add(intersectsL[0].point);

      intersectionL.normal.copy(intersectsL[0].face.normal);
      mouseHelperL.lookAt(n);

      positions = lineL.geometry.attributes.position;
      positions.setXYZ(0, p.x, p.y, p.z);
      positions.setXYZ(1, n.x, n.y, n.z);
      positions.needsUpdate = true;

      intersectionL.intersects = true;
    } else {
      intersectionL.intersects = false;
    }
  } else {
    if (!MeshR) return;
    raycasterR.setFromCamera(mouse, cameraR);

    var intersectsR = raycasterR.intersectObjects([MeshR]);

    if (intersectsR.length > 0) {
      p = intersectsR[0].point;
      mouseHelperR.position.copy(p);
      intersectionR.point.copy(p);

      //n = intersectsR[0].face.normal.clone();
      n = cameraR.getWorldDirection();
      console.log(n);
      //n.transformDirection(MeshR.matrixWorld);
      n.multiplyScalar(30);
      n.add(intersectsR[0].point);

      intersectionR.normal.copy(intersectsR[0].face.normal);
      mouseHelperR.lookAt(n);

      positions = lineR.geometry.attributes.position;
      positions.setXYZ(0, p.x, p.y, p.z);
      positions.setXYZ(1, n.x, n.y, n.z);
      positions.needsUpdate = true;

      intersectionR.intersects = true;
    } else {
      intersectionR.intersects = false;
    }
  }
}

function update() {
  //MeshL.rotation.x += Math.PI / 72;
  //MeshL.rotation.y += Math.PI / 72;
  const v1 = cameraL.position;
  const v2 = cameraR.position;
  if (mouseSwitch === 0) {
    v2.copy(v1);
  } else {
    v1.copy(v2);
  }
}

function render() {
  //renderer.render(scene, camera);
  rendererL.setAnimationLoop(() => {
    update();
    orbitL.update();
    orbitR.update();
    rendererL.render(sceneL, cameraL); //渲染场景，采用这个相机；
    rendererR.render(sceneR, cameraR);
  });
}

main();
