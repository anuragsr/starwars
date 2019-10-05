/* eslint-disable no-undef */
const wc = window.console
const l = console.log.bind(wc)
const cl = console.clear.bind(wc)
const wn = console.warn.bind(wc)
const rotateCameraAboutPoint = (obj, point, axis, theta, pointIsWorld, type) => {
  // obj - your object (THREE.Object3D or derived)
  // point - the point of rotation (THREE.Vector3)
  // axis - the axis of rotation (normalized THREE.Vector3)
  // theta - radian value of rotation
  // pointIsWorld - boolean indicating the point is in world coordinates (default = false)
  pointIsWorld = !!pointIsWorld

  if (pointIsWorld) {
    obj.parent.localToWorld(obj.position); // compensate for world coordinate
  }

  obj.position.sub(point); // remove the offset
  obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
  obj.position.add(point); // re-add the offset

  if (pointIsWorld) {
    obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
  }

  obj.rotateOnAxis(axis, theta); // rotate the OBJECT
  if (type === "camera") obj.lookAt(point)
}
const getDistance = (from, to) => {
  let x0 = from.x, y0 = from.y, z0 = from.z  
  , x1 = to.x, y1 = to.y, z1 = to.z

  return Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2) + Math.pow(z1 - z0, 2))
}
const setTexture = (tex, pl, type) => {
  if (tex) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.copy(pl[type].repeat)
    tex.minFilter = THREE.NearestFilter
  }
}

THREE.SceneUtils = {
  createMultiMaterialObject: (geometry, materials) => {
    let group = new THREE.Group()
    materials.forEach(material => group.add(new THREE.Mesh(geometry, material)))
    return group
  },
  detach: (child, parent, scene) => {
    wn('THREE.SceneUtils: detach() has been deprecated. Use scene.attach( child ) instead.')
    scene.attach(child)
  },
  attach: (child, scene, parent) => {
    wn('THREE.SceneUtils: attach() has been deprecated. Use parent.attach( child ) instead.')
    parent.attach(child)
  }
}

let ctn = document.getElementById("three-ctn")
, w = ctn.clientWidth
, h = ctn.clientHeight
, camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000)
, splineCamera = new THREE.PerspectiveCamera(45, w / h, 1, 10000)
, splineCameraHelper = new THREE.CameraHelper(splineCamera)
, axesHelper = new THREE.AxesHelper(500)
, renderer = new THREE.WebGLRenderer({ antialias: true })
, controls = new THREE.OrbitControls(camera, renderer.domElement)
, scene = new THREE.Scene()
, gltfLoader = new THREE.GLTFLoader()
, origin = new THREE.Vector3(0, 0, 0)
, startPos = new THREE.Vector3(0, 0, 500)
, cameraStartPos = new THREE.Vector3(0, 1300, 0)
, parent = new THREE.Object3D()
, ship
, planetArr = [
  {
    name: 'dagobah',
    path: 'assets/dagobah/',
    pos: new THREE.Vector3(-200, 0, 350),
    planet: {        
      diffuse: { v: 'diffuse.jpg', repeat: new THREE.Vector2(2, 2) },
      clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(1, 1), opacity: .8 },
    },
    info: {
      region: "Outer Rim Territories",
      sector: "Sluis sector",
      system: "Dagobah System",
      diameter: "14,410 km",
      atmosphere: "Violent lightning storms, dense fog. Periods of torrential rainfalls.",
      terrain: "Swamp, Bogs, Wetlands, Dry uplands",
      about: "Dagobah was a planet in the Dagobah system, and one of the purest places in the galaxy within the Force. A remote world of swamps and forests, it served as a refuge for Jedi Grand Master Yoda during his exile after the destruction of the Jedi Order. Luke Skywalker received advanced training in the ways of the Force under Jedi Master Yoda on Dagobah, and it was later the place of Yoda's death and transformation into the Force.",
    },
  }, 
  {
    name: 'endor',
    path: 'assets/endor/',
    pos: new THREE.Vector3(-300, 0, 100),    
    planet: {
      diffuse: { v: 'diffuse.jpg', repeat: new THREE.Vector2(2, 2) },
      bump: { v: 'bump.jpg', repeat: new THREE.Vector2(2, 2) },     
      clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(3, 3), opacity: 1 },
    },
    moon: {
      diffuse: { v: 'moon.jpg', repeat: new THREE.Vector2(2, 2) },
      bump: { v: 'moon.jpg', repeat: new THREE.Vector2(2, 2) },
    },
    info: {
      region: "Outer Rim Territories",
      sector: "Moddell sector",
      system: "Endor System",
      diameter: "4,900 km",
      atmosphere: "Breathable",
      terrain: "Forests, Savannas, Mountains",
      about: "Endor (also known as the Forest Moon of Endor or the Sanctuary Moon) was a small forested moon that orbited the Outer Rim planet of the same name and was the homeworld of the sentient Dulok, Ewok, and Yuzzum species, as well as the semi-sentient Gorax and Wistie races.",
    },
  },
  {
    name: 'geonosis',
    path: 'assets/geonosis/',
    pos: new THREE.Vector3(0, 0, 50),    
    planet: {        
      diffuse: { v: 'diffuse.jpg', repeat: new THREE.Vector2(2, 2) },
      bump: { v: 'bump.jpg', repeat: new THREE.Vector2(2, 2) },     
      clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: 1 },
    },
    rings: {
      diffuse: { v: 'rings-txt.png', repeat: new THREE.Vector2(2, 2) },
      alpha: { v: 'rings-op3.png', repeat: new THREE.Vector2(2, 2) },
    },
    info: {
      region: "Outer Rim Territories",
      sector: "Arkanis sector",
      system: "Geonosis System",
      diameter: "11,370 km",
      atmosphere: "Breathable, Arid Desert",
      terrain: "Deserts, Mesas, Mountains",
      about: "Geonosis, referred to as Geonosia by some natives, was the desert home planet of the Geonosians. It was the Confederacy of Independent Systems' first capital and hosted its major battle droid foundries. It was the site of the Battle of Geonosis, the opening conflict of the Clone Wars, as well as the subsequent invasion by the Galactic Republic.",
    },
  },
  {
    name: 'hoth',
    path: 'assets/hoth/',
    pos: new THREE.Vector3(250, 0, 50),        
    planet: {        
      diffuse: { v: 'diffuse.jpg', repeat: new THREE.Vector2(2, 2) },
      bump: { v: 'diffuse.jpg', repeat: new THREE.Vector2(2, 2) },     
      clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: .8 },
    },
    info: {
      region: "Outer Rim Territories",
      sector: "Anoat sector",
      system: "Hoth System",
      diameter: "7,200 km",
      atmosphere: "Breathable, Frigid",
      terrain: "Frozen ice plains, glaciers, mountains",
      about: "Hoth was a remote, icy planet that was the sixth planet in the star system of the same name. It notably hosted Echo Base, the temporary headquarters of the Alliance to Restore the Republic, until the Galactic Empire located the Rebels, initiating a major confrontation known as the Battle of Hoth.",
    },
  },
  {
    name: 'corsucant',
    path: 'assets/corsucant/',
    pos: new THREE.Vector3(475, 0, -125),        
    planet: {        
      diffuse: { v: 'diffuse2.jpg', repeat: new THREE.Vector2(2, 2) },
      bump: { v: 'kj2.jpg', repeat: new THREE.Vector2(2, 2) },     
      clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: 1 },
    },
    info: {
      region: "Core Worlds",
      sector: "Corusca sector",
      system: "Coruscant System",
      diameter: "12,240 km",
      atmosphere: "Breathable, Temperate (artificial)",
      terrain: "Ecumenopolis",
      about: "Coruscant, also known as Imperial Center during the rule of the Galactic Empire, was an ecumenopolis—a city-covered planet, collectively known as Galactic City—in the Coruscant system of the Core Worlds. Noted for its cosmopolitan culture and towering skyscrapers, Coruscant's population consisted of approximately one trillion citizens hailing from a vast array of both humanoid and alien species.",
    },
  },
  {
    name: 'naboo',
    path: 'assets/naboo/',
    pos: new THREE.Vector3(250, 0, -300),    
    planet: {        
      diffuse: { v: 'diffuse2.jpg', repeat: new THREE.Vector2(5, 5) },
      bump: { v: 'dryleave.jpg', repeat: new THREE.Vector2(5, 5) },     
      clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: 1 },
    },
    moon: {
      diffuse: { v: 'moon.jpg', repeat: new THREE.Vector2(2, 2) },
      bump: { v: 'moonbump.jpg', repeat: new THREE.Vector2(2, 2) },
    },
    info: {
      region: "Mid Rim",
      sector: "Chommell sector",
      system: "Naboo System",
      diameter: "12,120 km",
      atmosphere: "Oxygen Mix, Temperate",
      terrain: "Rolling grassy plains, Swamps, Grassy hills. Forests, Mountains",
      about: "Naboo was a planet that was the sector capital of the Chommell sector in the Mid Rim, near the border with the Outer Rim Territories. The planet had an unusual plasma core, and its surface was a largely unspoiled world with large plains, swamps and seas.",
    },
  }, 
  {
    name: 'tattooine',
    path: 'assets/tattooine/',
    pos: new THREE.Vector3(-100, 0, -350),    
    planet: {        
      diffuse: { v: 'diffuse2.jpg', repeat: new THREE.Vector2(3, 3) },
      bump: { v: 'bump2.jpg', repeat: new THREE.Vector2(3, 3) },     
      clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: 1 },
    },
    moon: {
      diffuse: { v: 'moon.jpg', repeat: new THREE.Vector2(2, 2) },
      bump: { v: 'moonbump.jpg', repeat: new THREE.Vector2(2, 2) },
    },
    info: {
      region: "Outer Rim Territories",
      sector: "Arkanis sector",
      system: "Tatoo System",
      diameter: "10,465 km",
      atmosphere: "Breathable",
      terrain: "Canyons, Desert, Mountains, Rocky bluffs",
      about: "Tatooine was a sparsely inhabited circumbinary desert planet located in the galaxy's Outer Rim Territories. It was the homeworld to the influential Anakin and Luke Skywalker, who would go on to shape galactic history. Part of a binary star system, the planet was oppressed by scorching suns, resulting in the world lacking the necessary surface water to sustain large populations.",
    },
  }, 
  {
    name: 'yavin',
    path: 'assets/yavin/',
    pos: new THREE.Vector3(-400, 0, -250),    
    planet: {        
      diffuse: { v: 'diffuse.jpg', repeat: new THREE.Vector2(3, 3) },
      bump: { v: 'bump.jpg', repeat: new THREE.Vector2(3, 3) },     
      clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: .7 },
    },
    info: {
      region: "Outer Rim Territories",
      sector: "Gordian Reach",
      system: "Yavin System",
      diameter: "200,000 km",
      atmosphere: "Uninhabitable",
      terrain: "Gas",
      about: "Yavin was an orange gas giant, nearly 200,000 kilometers in diameter,[4] located in the Outer Rim Territories.[1] It was orbited by twenty-six moons,[2] three of which could sustain humanoid life.[4] One of those moons, Yavin 4, was once home to the ancient Massassi warriors[1] and was used by the Rebel Alliance.[6]",
    },
  }, 
  {
    name: 'yavin-4',
    path: 'assets/yavin-4/',
    pos: new THREE.Vector3(-350, 0, 0),    
    planet: {        
      diffuse: { v: 'diffuse.jpg', repeat: new THREE.Vector2(3, 3) },
      bump: { v: 'diffuse.jpg', repeat: new THREE.Vector2(3, 3) },  
      clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: 1 },
    },
    moon: {
      diffuse: { v: 'moon.jpg', repeat: new THREE.Vector2(2, 2) },
      bump: { v: 'moonbump.jpg', repeat: new THREE.Vector2(2, 2) },
    },
    info: {
      region: "Outer Rim Territories",
      sector: "Gordian Reach",
      system: "Yavin System",
      diameter: "10,200 km",
      atmosphere: "Breathable, Temperate",
      terrain: "Jungles",
      about: "Yavin 4 was the jungle-covered fourth moon in orbit around the red gas giant Yavin. Prior to and during the Galactic Civil War, it hosted the headquarters of the Alliance to Restore the Republic, a group of resistance fighters that opposed the dominant Galactic Empire.[2] Following a major battle that took place around Yavin,[5] the Alliance relocated its headquarters to Hoth.[12]",
    },
  }
]
, plObjArr = []
, lineArr = []
, closest = { name: "" }
, fraction = 0
, normal = new THREE.Vector3()
, tube
, tubeMesh
// , currCam = splineCamera
, currCam = camera
, Params = function () {
  this.message = 'Customize here'
  this.shipSpeed = 0.0001
  this.tubeOpacity = 0.2
  this.helpers = true
  this.followCam = false
  this.getState = function () { l(this) }
  this.normal = function () { currCam = camera }
  this.spline = function () { currCam = splineCamera }
  this.rotateCam = function () {
    // Keep updating in animate() to continuously look at planet
    rotateCameraAboutPoint(splineCamera, ship.getWorldPosition(), new THREE.Vector3(0, 1, 0), Math.PI / 2, true, "camera")
  }
}
, params = new Params()

function init() {
  initScene()
  initGUI()
  addShip()
  addPlanets()
  addPath()
}

function initScene(){
  // Renderer settings
  renderer.setClearColor('#000000')    
  renderer.setSize(w, h)
  renderer.domElement.style.position = "absolute"
  renderer.domElement.style.top = renderer.domElement.style.left = 0
  ctn.appendChild(renderer.domElement)

  // Cameras and ambient light
  camera.position.copy(cameraStartPos)
  camera.lookAt(origin)
  scene.add(camera)    
  scene.add(new THREE.AmbientLight(0xffffff, .2))
  
  // Spotlight and representational mesh
  let spotLightMesh = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2),
    new THREE.MeshPhongMaterial({ color: 0xffff00 })
  )
  , lightPos = new THREE.Vector3(500, 350, 500)
  , spotLight = new THREE.DirectionalLight(0xffffff, 1)
  
  spotLightMesh.position.copy(lightPos)
  scene.add(spotLightMesh)  
  spotLight.position.copy(lightPos)
  scene.add(spotLight)
  
  let spotLightMesh2 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2),
    new THREE.MeshPhongMaterial({ color: 0xffff00 })
  )
  , lightPos2 = new THREE.Vector3(-500, 350, -500)
  , spotLight2 = new THREE.DirectionalLight(0xffffff, 1)
  
  spotLightMesh2.position.copy(lightPos2)
  scene.add(spotLightMesh2)  
  spotLight2.position.copy(lightPos2)
  scene.add(spotLight2)

  // Plane and axes helper
  let plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000, 32, 32),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color('pink'), side: THREE.DoubleSide,
      transparent: true, opacity: .1, wireframe: true
    })
  )
  plane.rotation.x = Math.PI / 2
  scene.add(plane)
  
  // Helpers
  scene.add(splineCameraHelper)
  scene.add(axesHelper)
}

function initGUI(){
  let gui = new dat.GUI()
  , op = gui.add(params, 'tubeOpacity', 0, 1)  
  op.onChange(value => {
    tubeMesh.children[0].material.opacity = value
    tubeMesh.children[1].material.opacity = value
  })

  gui.add(params, 'shipSpeed', 0, 0.001)
  gui.add(params, 'followCam')
  
  let he = gui.add(params, 'helpers')
  he.onChange(value => {
    if(value){
      scene.add(splineCameraHelper)
      scene.add(axesHelper)
    } else{
      scene.remove(splineCameraHelper)
      scene.remove(axesHelper)
    }
  })

  gui.add(params, 'normal')
  gui.add(params, 'spline')
  gui.add(params, 'rotateCam')
  gui.add(params, 'message')
  gui.add(params, 'getState')
}

function addShip() {
  gltfLoader.load('assets/start-destroyer/scene.gltf',    
    gltf => {
      ship = gltf.scene.children[0]
      ship.scale.set(.005, .005, .005)
      ship.rotation.z = Math.PI / 2

      // let shipGroup = new THREE.Group()
      // shipGroup.add(ship)
      parent.add(ship)

      splineCamera.position.x = 15
      rotateCameraAboutPoint(splineCamera, ship.position, new THREE.Vector3(0, 1, 0), 3 * Math.PI / 2, false, "camera")
      rotateCameraAboutPoint(splineCamera, ship.position, new THREE.Vector3(1, 0, 0), -.2, false, "camera")  
      
      // gltf.animations; // Array<THREE.AnimationClip>
      // gltf.scene; // THREE.Scene
      // gltf.scenes; // Array<THREE.Scene>
      // gltf.cameras; // Array<THREE.Camera>
      // gltf.asset; // Object
    },
    xhr => l((xhr.loaded / xhr.total * 100) + '% loaded'),
    error => l('An error happened', error)
  )

  // Wireframe sphere to visualize parent
  parent.add(new THREE.Mesh(
    new THREE.SphereGeometry(15, 20, 20, 0, Math.PI * 2, 0, Math.PI * 2),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color('blue'), side: THREE.DoubleSide,
      transparent: true, opacity: .1, wireframe: true
    })
  ))

  // // Cone for ship (replace by actual model)
  // ship = new THREE.Mesh(
  //   new THREE.ConeGeometry(2, 10, 16), 
  //   new THREE.MeshPhongMaterial({ color: 0x00ff00 })
  // )
  // ship.rotation.x = -Math.PI / 2
  // ship.position.y = 5
  // parent.add(ship)

  // // Set splineCamera to always look at ship, and rotate around it
  // splineCamera.position.x = 20
  // rotateCameraAboutPoint(splineCamera, ship.position, new THREE.Vector3(0, 1, 0), 3 * Math.PI / 2, false)
  // rotateCameraAboutPoint(splineCamera, ship.position, new THREE.Vector3(1, 0, 0), -.8, false)  
  
  parent.add(splineCamera)
  parent.position.set(0, 0, 500)
  scene.add(parent)
}

function addPlanets() { 
  planetArr.forEach(object => {
    // Dummy Planet
    // let mesh = new THREE.Mesh(
    //   new THREE.SphereGeometry(20, 16, 16, 0, Math.PI * 2, 0, Math.PI * 2),
    //   new THREE.MeshPhongMaterial({ color: 0x00ff00 })
    // )
    // mesh.position.copy(object.pos)
    // scene.add(mesh)

    // Planet and clouds
    let planet = object.planet
    , planetGroup = new THREE.Object3D()
    , pl_geo = new THREE.SphereGeometry(20, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2)
    , diffuse = new THREE.TextureLoader().load(object.path + planet.diffuse.v)
    , bump = planet.bump ? new THREE.TextureLoader().load(object.path + planet.bump.v) : null
    , specular = planet.specular ? new THREE.TextureLoader().load(object.path + planet.specular.v) : null    
    , clouds = new THREE.TextureLoader().load(object.path + planet.clouds.v)
    
    setTexture(diffuse, planet, "diffuse")
    setTexture(bump, planet, "bump")
    setTexture(specular, planet, "specular")
    setTexture(clouds, planet, "clouds")

    planetGroup.add(
      new THREE.Mesh(pl_geo, new THREE.MeshPhongMaterial({ 
        color: 0xffffff, map: diffuse,
        specularMap: specular, bumpMap: bump, bumpScale: .1,
      })
    ))

    let cloudMesh = new THREE.Mesh(
      pl_geo.clone(), new THREE.MeshPhongMaterial({
        color: 0xffffff,
        side: THREE.FrontSide,
        transparent: true,
        opacity: planet.clouds.opacity,
        map: clouds,
        alphaMap: clouds,
      })
    )
    cloudMesh.scale.multiplyScalar(1.02)
    planetGroup.add(cloudMesh)

    planetGroup.position.copy(object.pos)
    plObjArr.push(planetGroup)
    scene.add(planetGroup)

    // Moons / Rings
    if (object.moon) {
      let moon = object.moon
      , moonDiffuse = new THREE.TextureLoader().load(object.path + moon.diffuse.v)
      , moonBump = moon.bump ? new THREE.TextureLoader().load(object.path + moon.bump.v) : null

      setTexture(moonDiffuse, moon, "diffuse")
      setTexture(moonBump, moon, "bump")

      let moonMesh = new THREE.Mesh(
        new THREE.SphereGeometry(4, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2), 
        new THREE.MeshPhongMaterial({
          color: 0xffffff,
          map: moonDiffuse,
          bumpMap: moonBump,
          bumpScale: .1,
        })
      )
      moonMesh.position.set(50, 0, 0)
      moonMesh.type = "moon"
      planetGroup.add(moonMesh)
    }
    if (object.rings) {
      let rings = object.rings
      , ringsDiffuse = new THREE.TextureLoader().load(object.path + rings.diffuse.v)      
      , ringsAlpha = rings.alpha ? new THREE.TextureLoader().load(object.path + rings.alpha.v) : null      
      , thetaSegments = 50
      , phiSegments = 2

      // No need to set repeat for ring geometry
      let ringsMesh = new THREE.Mesh(
        new THREE.RingGeometry(0, 60, thetaSegments, phiSegments),
        new THREE.MeshPhongMaterial({
          color: 0xffffff,
          map: ringsDiffuse,
          transparent: true,
          opacity: 1,
          alphaMap: ringsAlpha,
          side: THREE.DoubleSide
        })
      )
      ringsMesh.position.set(0, 0, 0)
      ringsMesh.rotation.x = Math.PI / 2 + .1
      ringsMesh.rotation.y = .05
      ringsMesh.type = "rings"

      planetGroup.add(ringsMesh)
    }

    // Line representing distance from ship
    let line_geo = new THREE.Geometry()
    line_geo.vertices.push(
      new THREE.Vector3(parent.position.x, parent.position.y, parent.position.z),
      new THREE.Vector3(object.pos.x, object.pos.y, object.pos.z),
    )
    let line = new THREE.Line(line_geo, new THREE.LineBasicMaterial({ 
      color: 0x88fabc, transparent: true, opacity: 0
    }))
    line.lineLength = 0
    lineArr.push(line)
    scene.add(line)
  }) 
}

function addPath(){
  // Path that the ship will follow  
  tube = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      startPos,
      new THREE.Vector3(0, 0, 350),
      new THREE.Vector3(-300, 0, 300),
      new THREE.Vector3(-400, 0, 200),
      new THREE.Vector3(-350, 0, 100),
      new THREE.Vector3(-200, 0, 50),
      new THREE.Vector3(50, 0, 100),
      new THREE.Vector3(250, 0, 0),
      new THREE.Vector3(400, 0, 0),
      new THREE.Vector3(450, 0, -100),
      new THREE.Vector3(350, 0, -250),
      new THREE.Vector3(250, 0, -350),
      new THREE.Vector3(150, 0, -300),
      new THREE.Vector3(0, 0, -250),
      new THREE.Vector3(-100, 0, -300),
      new THREE.Vector3(-200, 0, -400),
      new THREE.Vector3(-350, 0, -350),
      new THREE.Vector3(-450, 0, -250),
      new THREE.Vector3(-350, 0, -50),
    ]), 500, 2, 3, false)
  
  tubeMesh = THREE.SceneUtils.createMultiMaterialObject(
    tube,
    [
      new THREE.MeshLambertMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide,
        opacity: params.tubeOpacity,
        depthWrite: false,
        transparent: true
      }),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: params.tubeOpacity,
        wireframe: true,
        depthWrite: false,
        transparent: true
      })
    ]
  )

  scene.add(tubeMesh)
}

function animatePlanets(){
  plObjArr.forEach(planetObject => {
    let children = planetObject.children
    if (children[0]) children[0].rotation.y += .002
    if (children[1]) children[1].rotation.y += .001

    if (children[2] && children[2].type === "moon") {
      rotateCameraAboutPoint(children[2], planetObject.position, new THREE.Vector3(0, 1, 0), 0.01, true)
    }
  })
}

function findNearest() {
  let min = Infinity, oldClosest = closest

  lineArr.forEach((line, i) => {
    line.geometry.vertices[0] = parent.position
    line.geometry.verticesNeedUpdate = true    
    line.lineLength = getDistance(parent.position, line.geometry.vertices[1])
    
    if (min >= line.lineLength) {
      min = line.lineLength
      closest = planetArr[i]
    } 
  })

  if (oldClosest.name !== closest.name) {
    l("Closest:", closest.name)
  }
}

function renderFollowCamera() {
  // Magic that follows the ship
  
  // For time based
  // let time = Date.now() 
  // , looptime = 100 * 1000
  // , t = (time % looptime) / looptime
  
  // For fraction based
  fraction += params.shipSpeed
  if (fraction >= 1) fraction = 0

  let t = fraction
  , pos = tube.parameters.path.getPointAt(t)
  , dir = tube.parameters.path.getTangentAt(t)
  , lookAt = tube.parameters.path.getPointAt((t + 30 / tube.parameters.path.getLength()) % 1).copy(pos).add(dir)

  parent.position.copy(pos)
  splineCamera.lookAt(parent.position)
  parent.matrix.lookAt(parent.position, lookAt, normal)
  parent.rotation.setFromRotationMatrix(parent.matrix, parent.rotation.order)  
}

function render() {
  params.followCam && renderFollowCamera()
  findNearest()
  animatePlanets()

  renderer.render(scene, currCam)
}

function animate() {
  render()
  requestAnimationFrame(animate)
}

init()
animate()