const l = console.log.bind(window.console)

let container = document.getElementById('container')
, w = container.clientWidth
, h = container.clientHeight
, renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
, scene = new THREE.Scene()
, camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000)
, controls = new THREE.OrbitControls(camera, renderer.domElement)
, manager = new THREE.LoadingManager()
, loaders = {
  gltf: new THREE.GLTFLoader(manager),
  texture: new THREE.TextureLoader(manager)
}
, ship
, shipGroup = new THREE.Group()
, exhaust, exhaust2, exhaust3
, exhaustTex
, starField
, starTex

function initScene() {
  renderer.setClearColor(0x000000, 1)
  renderer.setSize(w, h)
  container.appendChild(renderer.domElement)

  camera.position.set(0, 4, 9)
  camera.lookAt(0, 0, 0)
  scene.add(camera)

  scene.add(new THREE.AmbientLight(0xffffff, 0.4))

  let spotLight = new THREE.DirectionalLight(0xffffff, 1)
  spotLight.position.set(100, 100, 100)
  scene.add(spotLight)

  let spotLight2 = new THREE.DirectionalLight(0xffffff, 0.8)
  spotLight2.position.set(-100, 50, -100)
  scene.add(spotLight2)

  controls.enableDamping = true
  controls.dampingFactor = 0.05
}

function addShip() {
  ship.scale.multiplyScalar(0.0035)
  ship.rotation.z = Math.PI / 2
  shipGroup.add(ship)
  shipGroup.position.set(0, 0, 0)
  scene.add(shipGroup)
}

function createEngineFlame(offsetX) {
  let group = new SPE.Group({
    texture: { value: exhaustTex },
    maxParticleCount: 400,
    blending: THREE.AdditiveBlending
  })

  group.addEmitter(
    new SPE.Emitter({
      maxAge: {
        value: 0.5,
        spread: 0.15
      },
      position: {
        value: new THREE.Vector3(0, 0, 0),
        spread: new THREE.Vector3(0.1, 0.1, 0)
      },
      acceleration: {
        value: new THREE.Vector3(0, 1.2, 0),
        spread: new THREE.Vector3(0.15, 0.3, 0.15)
      },
      velocity: {
        value: new THREE.Vector3(0, 3.5, 0),
        spread: new THREE.Vector3(0.2, 1, 0.2)
      },
      color: {
        value: [
          new THREE.Color(0x8fc1ff),
          new THREE.Color(0x2f6fff),
          new THREE.Color(0x0a1a6b)
        ]
      },
      opacity: {
        value: [1, 0.5, 0]
      },
      size: {
        value: [3, 1.2, 0.1]
      },
      particleCount: 40
    })
  )

  group.mesh.position.set(offsetX, 0, 3.7)
  group.mesh.rotation.x = Math.PI / 2
  group.material.fog = false
  shipGroup.add(group.mesh)

  return group
}

function addExhaust() {
  exhaust = createEngineFlame(0)
  exhaust2 = createEngineFlame(0.75)
  exhaust3 = createEngineFlame(-0.75)
}

function render() {
  try {
    controls.update()
    exhaust.tick(0.005)
    exhaust2.tick(0.005)
    exhaust3.tick(0.005)
    renderer.render(scene, camera)
  } catch (err) {
    l(err)
    cancelAnimationFrame(animId)
  }
}

function animate() {
  animId = requestAnimationFrame(animate)
  render()
}

function resize() {
  w = container.clientWidth
  h = container.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

function preload() {
  manager.onStart = () => {
    l('Loading assets...')
  }

  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    let perc = Math.round(itemsLoaded / itemsTotal * 100)
    l(perc + '%')
  }

  manager.onError = url => {
    l('Error loading ' + url)
  }

  manager.onLoad = () => {
    l('All assets loaded!')
    initScene()
    addShip()
    addExhaust()
    animate()
  }

  // Load ship
  loaders.gltf.load('assets/star-destroyer/scene.gltf', gltf => {
    ship = gltf.scene.children[0]
  })

  // Load exhaust texture
  loaders.texture.load('assets/smokeparticle.png', tex => {
    exhaustTex = tex
  })
}

window.addEventListener('resize', resize, false)
window.addEventListener('load', preload, false)
