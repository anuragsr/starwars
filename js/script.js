const wc = window.console
, l = console.log.bind(wc)
, cl = console.clear.bind(wc)
, Params = function () {
  return {
    shipSpeed: 0.0002
    , tubeOpacity: 0
    , showFog: true
    , fogDistance: 400
    , helpers: false
    , followCam: false
    , normal: function () { currCam = camera }
    , spline: function () { currCam = splineCamera }
    , rotateCam: function () {
      // rotateCameraAboutPoint(splineCamera, ship.getWorldPosition(), new THREE.Vector3(0, 1, 0), Math.PI / 2, true)
      TweenMax.to(angle, .3, {
        from: "+=" + Math.PI / 2,
        onUpdate: function () {
          // Keep updating in animate() to continuously look at planet
          rotateCameraAboutPoint(
            splineCamera, parent.position, new THREE.Vector3(0, 1, 0),
            this.target.from - angle.current, true, true
          )
          angle.current = this.target.from
        }
      })
    }
    , lookAtPlanet: lookAtPlanet
    , lookAtShip: lookAtShip
    , message: 'Customize here'
    , getState: function () { l(this) }
  }
}

let ctn = $("#three-ctn")
  , w = ctn.width()
  , h = ctn.height()
  , renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  , scene = new THREE.Scene()
  , camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000)
  , splineCamera = new THREE.PerspectiveCamera(35, w / h, 1, 10000)
  , splineCameraHelper = new THREE.CameraHelper(splineCamera)
  , axesHelper = new THREE.AxesHelper(500)
  , controls = new THREE.OrbitControls(camera, renderer.domElement)
  , spotLightMesh = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2),
    new THREE.MeshPhongMaterial({ color: 0xffff00 })
  )
  , spotLight = new THREE.DirectionalLight(0xffffff, 1)
  , lightPos = new THREE.Vector3(500, 350, 500)
  , spotLightMesh2 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2),
    new THREE.MeshPhongMaterial({ color: 0xffff00 })
  )
  , spotLight2 = new THREE.DirectionalLight(0xffffff, 1)
  , lightPos2 = new THREE.Vector3(-500, 350, -500)
  , manager = new THREE.LoadingManager()
  , loaders = {
    texture: new THREE.TextureLoader(manager),
    gltf: new THREE.GLTFLoader(manager),
  }
  , origin = new THREE.Vector3(0, 0, 0)
  , startPos = new THREE.Vector3(0, 0, 500)
  , cameraStartPos = new THREE.Vector3(0, 1300, 0)
  , plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000, 32, 32),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color('pink'), side: THREE.DoubleSide,
      transparent: true, opacity: .1, wireframe: true
    })
  )
  , parent = new THREE.Object3D()
  , parentWireMesh = new THREE.Mesh(
    new THREE.SphereGeometry(15, 20, 20, 0, Math.PI * 2, 0, Math.PI * 2),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color('blue'), side: THREE.DoubleSide,
      transparent: true, opacity: .1, wireframe: true
    })
  )
  , ship
  , shipGroup = new THREE.Group()
  , exhaust, exhaust2, exhaust3
  , exhaustTex
  , planetArr = [
    {
      name: 'endor',
      path: 'assets/endor/',
      pos: new THREE.Vector3(-200, 0, 375),
      side: "left",
      planet: {
        diffuse: { v: 'diffuse_new.jpg', repeat: new THREE.Vector2(2, 2) },
        bump: { v: 'bump_new.jpg', repeat: new THREE.Vector2(2, 2) },
        clouds: { v: 'clouds_new.jpg', repeat: new THREE.Vector2(3, 3), opacity: 1 },
      },
      moon: {
        diffuse: { v: 'moon_new.jpg', repeat: new THREE.Vector2(2, 2) },
        bump: { v: 'moon_new.jpg', repeat: new THREE.Vector2(2, 2) },
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
      name: 'dagobah',
      path: 'assets/dagobah/',
      pos: new THREE.Vector3(-350, 0, 100),    
      side: "left",
      planet: {        
        diffuse: { v: 'diffuse_new.jpg', repeat: new THREE.Vector2(2, 2) },
        bump: { v: 'bump_new.jpg', repeat: new THREE.Vector2(2, 2) },
        clouds: { v: 'clouds_new.jpg', repeat: new THREE.Vector2(1, 1), opacity: .8 },
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
      name: 'geonosis',
      path: 'assets/geonosis/',
      pos: new THREE.Vector3(0, 0, 20),    
      side: "right",
      planet: {        
        diffuse: { v: 'diffuse_new.jpg', repeat: new THREE.Vector2(2, 2) },
        bump: { v: 'bump_new.jpg', repeat: new THREE.Vector2(2, 2) },     
        clouds: { v: 'clouds_new.jpg', repeat: new THREE.Vector2(2, 2), opacity: 1 },
      },
      rings: {
        diffuse: { v: 'rings-txt_new.png', repeat: new THREE.Vector2(2, 2) },
        alpha: { v: 'rings-op3_new.png', repeat: new THREE.Vector2(2, 2) },
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
      name: 'tatooine',
      path: 'assets/tatooine/',
      pos: new THREE.Vector3(300, 0, 200),
      side: "left",
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
      name: 'coruscant',
      path: 'assets/coruscant/',
      pos: new THREE.Vector3(460, 0, -125),        
      side: "right",
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
      pos: new THREE.Vector3(375, 0, -375),    
      side: "left",
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
      name: 'hoth',
      path: 'assets/hoth/',
      pos: new THREE.Vector3(60, 0, -400),
      side: "right",
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
      name: 'yavin',
      path: 'assets/yavin/',
      pos: new THREE.Vector3(-250, 0, -400),
      side: "left",
      planet: {
        diffuse: { v: 'diffuse.jpg', repeat: new THREE.Vector2(3, 3) },
        bump: { v: 'bump.jpg', repeat: new THREE.Vector2(3, 3) },
        clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: .7 },
      },
      moon: {
        diffuse: { v: 'moon.jpg', repeat: new THREE.Vector2(2, 2) },
        bump: { v: 'moonbump.jpg', repeat: new THREE.Vector2(2, 2) },
      },
      info: {
        region: "Outer Rim Territories",
        sector: "Gordian Reach",
        system: "Yavin System",
        diameter: "200,000 km",
        atmosphere: "Uninhabitable",
        terrain: "Gas",
        about: "Yavin was an orange gas giant, nearly 200,000 kilometers in diameter, located in the Outer Rim Territories. It was orbited by twenty-six moons, three of which could sustain humanoid life. One of those moons, Yavin 4, was once home to the ancient Massassi warriors and was used by the Rebel Alliance.",
      },
    }, 
    {
      name: 'yavin-4',
      path: 'assets/yavin-4/',
      pos: new THREE.Vector3(-450, 0, -200),    
      side: null,
      planet: {        
        diffuse: { v: 'diffuse.jpg', repeat: new THREE.Vector2(3, 3) },
        bump: { v: 'diffuse.jpg', repeat: new THREE.Vector2(3, 3) },  
        clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: 1 },
      },
      info: {
        region: "Outer Rim Territories",
        sector: "Gordian Reach",
        system: "Yavin System",
        diameter: "10,200 km",
        atmosphere: "Breathable, Temperate",
        terrain: "Jungles",
        about: "Yavin 4 was the jungle-covered fourth moon in orbit around the red gas giant Yavin. Prior to and during the Galactic Civil War, it hosted the headquarters of the Alliance to Restore the Republic, a group of resistance fighters that opposed the dominant Galactic Empire. Following a major battle that took place around Yavin, the Alliance relocated its headquarters to Hoth.",
      },
    }
  ]
  , closest = { name: "", line: { lineLength: 0 } }
  , starField
  , fraction = 0
  , normal = new THREE.Vector3()
  , tube
  , tubeMesh
  , currCam = splineCamera
  // , currCam = camera
  , params = new Params()
  , angle = { from: Math.PI / 2, current: Math.PI / 2 }
  , lookAtObj = new THREE.Vector3(0, 0, 0)
  , fog = new THREE.Fog(0x000000, 1, params.fogDistance)
  , splineCameraTarget = parent
  , isExecuted = false
  , introSound = new Howl({ src: ['assets/intro.mp3'], loop: true, html5: true })
  , introSoundId
  , spaceSound = new Howl({ src: ['assets/space.mp3'], loop: true, html5: true })
  , entrySound = new Howl({ src: ['assets/entry.mp3'] })
  , exitSound = new Howl({ src: ['assets/exit.mp3'] })
  , initInterval
  , preloaded = false
; 

function init() {
  initScene()
  // initGUI()
  addShip()
  addPlanets()
  addPath()
  addStars()
  addListeners()
}

function initScene() {
  // Renderer settings
  renderer.setClearColor(0x000000, 1)    
  renderer.setSize(w, h)
  $(renderer.domElement).css({
    position: "absolute",
    top: 0, left: 0
  })
  ctn.append(renderer.domElement)

  // Cameras and ambient light
  camera.position.copy(cameraStartPos)
  camera.lookAt(origin)
  scene.add(camera)    
  scene.add(new THREE.AmbientLight(0xffffff, .2))
  
  // Fog
  if (params.showFog) scene.fog = fog  
  
  // Spotlight and representational mesh
  spotLightMesh.position.copy(lightPos)  
  spotLight.position.copy(lightPos)
  scene.add(spotLight)    
  
  spotLightMesh2.position.copy(lightPos2)
  spotLight2.position.copy(lightPos2)
  scene.add(spotLight2)

  // Plane  
  plane.rotation.x = Math.PI / 2
  
  // Helpers
  if (params.helpers) showHelpers()  

  // Parent object for ship, exhaust and splineCamera
  parent.name = "ship"
  parent.add(splineCamera)
  parent.add(shipGroup)
  parent.position.copy(startPos)
  scene.add(parent)
}

function initGUI() {
  let gui = new dat.GUI()
  , op = gui.add(params, 'tubeOpacity', 0, 1)  
  op.onChange(value => {
    tubeMesh.children[0].material.opacity = value
    tubeMesh.children[1].material.opacity = value
  })
  gui.add(params, 'shipSpeed', 0, 0.001)
  
  let f = gui.addFolder('fog')
  f.add(params, 'fogDistance', 100, 5000).onChange(value => { 
    scene.fog.far = value 
  })  
  f.add(params, 'showFog').onChange(value => { 
    if (value) scene.fog = fog
    else scene.fog = null 
  })  
  f.open()

  gui.add(params, 'followCam')
  
  let he = gui.add(params, 'helpers')
  he.onChange(value => { value ? showHelpers() : hideHelpers() })

  gui.add(params, 'normal')
  gui.add(params, 'spline')
  gui.add(params, 'rotateCam')
  gui.add(params, 'lookAtPlanet')
  gui.add(params, 'lookAtShip')
  gui.add(params, 'getState')
  gui.add(params, 'message')
}

function addShip() {  
  exhaust = new SPE.Group({ texture: { value: exhaustTex }, maxParticleCount: 500 })
  exhaust2 = new SPE.Group({ texture: { value: exhaustTex }, maxParticleCount: 500 })
  exhaust3 = new SPE.Group({ texture: { value: exhaustTex }, maxParticleCount: 500 })
  
  // The ship
  ship.scale.multiplyScalar(.0035)
  ship.rotation.z = Math.PI / 2
  shipGroup.add(ship)

  // The 3 exhaust flames
  exhaust.addEmitter(
    new SPE.Emitter({
      maxAge: {
        value: 0.2
      },
      position: {
        value: new THREE.Vector3(0, 0, 0),
        spread: new THREE.Vector3(0, .5, 0)
      },
      acceleration: {
        value: new THREE.Vector3(0, .5, 0),
        spread: new THREE.Vector3(0, .25, 0)
      },
      velocity: {
        value: new THREE.Vector3(0, .25, 0),
        spread: new THREE.Vector3(0, .5, 0)
      },
      color: {
        value: [new THREE.Color(0x72d5d3), new THREE.Color(0x6ef8fb)]
      },
      size: {
        value: 2
      },
      particleCount: 20
    })
  )
  exhaust.mesh.position.z = 4
  exhaust.mesh.rotation.x = Math.PI / 2
  exhaust.material.fog = false
  shipGroup.add(exhaust.mesh)    

  exhaust2.addEmitter(
    new SPE.Emitter({
      maxAge: {
        value: 0.2
      },
      position: {
        value: new THREE.Vector3(0, 0, 0),
        spread: new THREE.Vector3(0, .5, 0)
      },
      acceleration: {
        value: new THREE.Vector3(0, .5, 0),
        spread: new THREE.Vector3(0, .25, 0)
      },
      velocity: {
        value: new THREE.Vector3(0, .25, 0),
        spread: new THREE.Vector3(0, .5, 0)
      },
      color: {
        value: [new THREE.Color(0x72d5d3), new THREE.Color(0x6ef8fb)]
      },
      size: {
        value: 2
      },
      particleCount: 20
    })
  )
  exhaust2.mesh.position.z = 4
  exhaust2.mesh.position.x = .75
  exhaust2.mesh.rotation.x = Math.PI / 2
  exhaust2.material.fog = false
  shipGroup.add(exhaust2.mesh)    

  exhaust3.addEmitter(
    new SPE.Emitter({
      maxAge: {
        value: 0.2
      },
      position: {
        value: new THREE.Vector3(0, 0, 0),
        spread: new THREE.Vector3(0, .5, 0)
      },
      acceleration: {
        value: new THREE.Vector3(0, .5, 0),
        spread: new THREE.Vector3(0, .25, 0)
      },
      velocity: {
        value: new THREE.Vector3(0, .25, 0),
        spread: new THREE.Vector3(0, .5, 0)
      },
      color: {
        value: [new THREE.Color(0x72d5d3), new THREE.Color(0x6ef8fb)]
      },
      size: {
        value: 2
      },
      particleCount: 20
    })
  )
  exhaust3.mesh.position.z = 4
  exhaust3.mesh.position.x = -.75
  exhaust3.mesh.rotation.x = Math.PI / 2
  exhaust3.material.fog = false
  shipGroup.add(exhaust3.mesh)

  setTimeout(() => {
    splineCamera.position.x = -15
    rotateCameraAboutPoint(splineCamera, parent.position, new THREE.Vector3(0, 1, 0), Math.PI / 2, true, true)
    rotateCameraAboutPoint(splineCamera, parent.position, new THREE.Vector3(1, 0, 0), -.3, true, true)   
  }, 50)
}

function addPlanets() { 
  planetArr.forEach((object, idx) => {
    // Planet and clouds
    let planet = object.planet
    , planetGroup = new THREE.Object3D()
    , pl_geo = new THREE.SphereGeometry(20, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2)    
    
    planetGroup.idx = idx
    planetGroup.name = "planet"
    planetGroup.position.copy(object.pos)
    object.planetGroup = planetGroup
    scene.add(planetGroup)

    // Using preloaded textures
    setTexture(planet.diffuse.tex, planet, "diffuse")
    setTexture(planet.bump.tex, planet, "bump")
    setTexture(planet.clouds.tex, planet, "clouds")

    planetGroup.add(
      new THREE.Mesh(pl_geo, new THREE.MeshPhongMaterial({ 
        color: 0xffffff, map: planet.diffuse.tex, bumpMap: planet.bump.tex, bumpScale: .5,
      })
    ))

    let cloudMesh = new THREE.Mesh(
      pl_geo.clone(), new THREE.MeshPhongMaterial({
        color: 0xffffff,
        side: THREE.FrontSide,
        transparent: true,
        opacity: planet.clouds.opacity,
        map: planet.clouds.tex,
        alphaMap: planet.clouds.tex,
      })
    )
    cloudMesh.scale.multiplyScalar(1.02)
    planetGroup.add(cloudMesh)

    // Moons / Rings
    if (object.moon) {
      let moon = object.moon
      , moonDiffuse = new THREE.TextureLoader().load(object.path + moon.diffuse.v)
      , moonBump = moon.bump ? new THREE.TextureLoader().load(object.path + moon.bump.v) : null

      setTexture(moonDiffuse, moon, "diffuse")
      setTexture(moonBump, moon, "bump")

      let moonMesh = new THREE.Mesh(
        new THREE.SphereGeometry(2, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2), 
        new THREE.MeshPhongMaterial({
          color: 0xffffff,
          map: moon.diffuse.tex,
          bumpMap: moon.bump.tex,
          bumpScale: .1,
        })
      )
      moonMesh.position.set(50, 0, 0)
      moonMesh.type = "moon"
      planetGroup.add(moonMesh)
    }
    if (object.rings) {
      let rings = object.rings
      , thetaSegments = 50
      , phiSegments = 2

      // No need to set repeat for ring geometry
      let ringsMesh = new THREE.Mesh(
        new THREE.RingGeometry(0, 60, thetaSegments, phiSegments),
        new THREE.MeshPhongMaterial({
          color: 0xffffff,
          map: rings.diffuse.tex,
          transparent: true,
          opacity: 1,
          alphaMap: rings.alpha.tex,
          side: THREE.DoubleSide
        })
      )
      ringsMesh.position.set(0, 0, 0)
      ringsMesh.rotation.x = Math.PI / 2 - .1
      ringsMesh.rotation.y = -.05
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
      color: 0x88fabc, transparent: true,
      opacity: 0, depthWrite: false
    }))
    line.lineLength = 0
    object.line = line
    scene.add(line)
  })
}

function addPath() {
  // Path that the ship will follow  
  tube = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      startPos,
      new THREE.Vector3(0, 0, 350),
      new THREE.Vector3(-300, 0, 300),
      new THREE.Vector3(-350, 0, 200),
      new THREE.Vector3(-300, 0, 100),
      new THREE.Vector3(50, 0, -50),
      new THREE.Vector3(250, 0, 250),
      new THREE.Vector3(300, 0, 275),
      new THREE.Vector3(400, 0, 0),
      new THREE.Vector3(400, 0, -200),
      new THREE.Vector3(450, 0, -350),
      new THREE.Vector3(400, 0, -450),
      new THREE.Vector3(50, 0, -350),
      new THREE.Vector3(-250, 0, -450),
      new THREE.Vector3(-350, 0, -400),
      new THREE.Vector3(-420, 0, -250),
    ]), 500, 2, 3, false)
  
  tubeMesh = createMultiMaterialObject(
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

function addStars() {
  let starsGeometry = new THREE.Geometry(); // creates new geometry

  for (let i = 0; i < 1000; i++) {
    let star = new THREE.Vector3(
      // changing number will decrease or increase particle density;
      // the smaller the number the more dense the particles
      THREE.Math.randFloatSpread(1500),
      THREE.Math.randFloatSpread(500),
      THREE.Math.randFloatSpread(1500),
    )
    starsGeometry.vertices.push(star)
  }
  starField = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ 
    color: 0xffffff, fog: false,    
    size: 5, sizeAttenuation: false, 
    map: starTex, alphaTest: 0.5, transparent: true
  }))
  scene.add(starField)
}

function lookAtShip() {  
  splineCameraTarget = null
  // l(splineCameraTarget, parent)
  lookAtObj.copy(closest.planetGroup.position)
  let lookAtTween = TweenMax.to(lookAtObj, .4, {
    x: parent.position.x,
    y: parent.position.y,
    z: parent.position.z,
    onUpdate: function () {
      splineCamera.lookAt(new THREE.Vector3(this.target.x, this.target.y, this.target.z))
      // Dynamic value for parent since it is moving
      lookAtTween.updateTo({
        x: parent.position.x,
        y: parent.position.y,
        z: parent.position.z,
      }, false)
    },
    // ease: Linear.easeNone
  })

  new TimelineMax({
    onComplete: function () { 
      splineCameraTarget = parent
      isExecuted = false

      params.shipSpeed = 0.0002
      TweenMax.to($(".ctn-info-pl")[closest.planetGroup.idx], 2, { left: "-35vw", ease: Back.easeIn })
      exitSound.play()
    }
  })
  .add(lookAtTween, "lb0")
  .to(angle, .6, {
    from: Math.PI / 2,
    onUpdate: function () {
      // Keep updating in animate() to continuously look at planet
      rotateCameraAboutPoint(
        splineCamera, parent.position, new THREE.Vector3(0, 1, 0),
        this.target.from - angle.current, true, true
      )
      angle.current = this.target.from
    }
  }, "lb1")
  .to(splineCamera, .6, {
    fov: 35,
    onUpdate: function () { this.target.updateProjectionMatrix() }
  }, "lb1")
}

function lookAtPlanet() {
  params.shipSpeed = 0.00005
  TweenMax.to($(".ctn-info-pl")[closest.planetGroup.idx], 3, { left: 20, ease: Back.easeOut })    
  entrySound.play()

  splineCameraTarget = null
  // l(splineCameraTarget, closest)
  lookAtObj.copy(parent.position)
  let lookAtTween = TweenMax.to(lookAtObj, 1, {
    x: closest.planetGroup.position.x,
    y: closest.planetGroup.position.y,
    z: closest.planetGroup.position.z,
    onUpdate: function () {
      splineCamera.lookAt(new THREE.Vector3(this.target.x, this.target.y, this.target.z))
    }
  })

  new TimelineMax({
    onComplete: function () { 
      splineCameraTarget = closest.planetGroup
      isExecuted = false
      
      if (closest.planetGroup.idx === planetArr.length - 1){
        l("last planet")
        params.shipSpeed = 0
        setTimeout(() => {
          TweenMax.to($(".ctn-info-pl")[closest.planetGroup.idx], 1, { left: "-35vw", ease: Back.easeIn })
          exitSound.play()
          $(".last-msg").fadeIn(2000)
        }, 10000)
      }
    }
  })
  .to(angle, 1, {
    from: closest.side === "left" ? Math.PI : 0,
    onUpdate: function () {
      // Keep updating in animate() to continuously look at planet
      rotateCameraAboutPoint(
        splineCamera, parent.position, new THREE.Vector3(0, 1, 0),
        this.target.from - angle.current, true, true
      )
      angle.current = this.target.from
    }
  }, "lb0")
  .add(lookAtTween, "lb0")
  .to(splineCamera, 1, {
    fov: 45,
    onUpdate: function () { this.target.updateProjectionMatrix() }    
  }, "lb0")
}

function rotateCameraAboutPoint(obj, point, axis, theta, pointIsWorld, lookAt) {
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
  if (lookAt) obj.lookAt(point)
}

function getDistance(from, to) {
  let x0 = from.x, y0 = from.y, z0 = from.z
    , x1 = to.x, y1 = to.y, z1 = to.z

  return Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2) + Math.pow(z1 - z0, 2))
}

function createMultiMaterialObject(geometry, materials) {
  let group = new THREE.Group()
  materials.forEach(material => group.add(new THREE.Mesh(geometry, material)))
  return group
}

function setTexture(tex, pl, type) {
  if (tex) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.copy(pl[type].repeat)
    tex.minFilter = THREE.NearestFilter
  }
}

function showHelpers() {
  scene.add(plane)
  scene.add(splineCameraHelper)
  scene.add(axesHelper)
  scene.add(spotLightMesh)
  scene.add(spotLightMesh2)
  // Wireframe sphere to visualize parent
  parent.add(parentWireMesh)
}

function hideHelpers() {
  scene.remove(plane)
  scene.remove(splineCameraHelper)
  scene.remove(axesHelper)
  scene.remove(spotLightMesh)
  scene.remove(spotLightMesh2)
  parent.remove(parentWireMesh)
}

function animatePlanets() {
  planetArr.forEach(obj => {
    let planetObject = obj.planetGroup
    , children = planetObject.children

    if (children[0]) children[0].rotation.y += .002
    if (children[1]) children[1].rotation.y += .001
    if (children[2] && children[2].type === "moon") {
      rotateCameraAboutPoint(children[2], planetObject.position, new THREE.Vector3(0, 1, 0), 0.01, true)
    }
  })
}

function findNearest() {
  let min = Infinity, oldClosest = closest

  planetArr.forEach(obj => {
    let line = obj.line
    line.geometry.vertices[0] = parent.position
    line.geometry.verticesNeedUpdate = true    
    line.lineLength = getDistance(parent.position, line.geometry.vertices[1])
    
    if (min >= line.lineLength) {
      min = line.lineLength
      closest = obj
    } 
  })

  if (oldClosest.name !== closest.name) {
    l("Closest:", closest.name)
  }

  if (closest.line.lineLength < 100){ // Ship within 100 units of planet
    if (!isExecuted && splineCameraTarget.name === "ship"){
      // l("Focus on:", closest.name)
      // Animate from current lookAt to planet
      lookAtPlanet()
      isExecuted = true
    }
    // splineCameraTarget = closest.planetGroup
  } else if (closest.line.lineLength > 100){ // Ship more than 100 units of planet
    if (!isExecuted && splineCameraTarget.name === "planet") {
      // l("Focus on ship")
      // Animate from current lookAt to ship
      lookAtShip()
      isExecuted = true
    }
    // splineCameraTarget = parent
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
  , path = tube.parameters.path
  , pos = path.getPointAt(t)
  , dir = path.getTangentAt(t)
  , lookAt = path.getPointAt((t + 30 / path.getLength()) % 1).copy(pos).add(dir)

  if (splineCameraTarget) splineCamera.lookAt(splineCameraTarget.position)
  
  parent.position.copy(pos)
  parent.matrix.lookAt(parent.position, lookAt, normal)
  parent.rotation.setFromRotationMatrix(parent.matrix, parent.rotation.order)  
}

function render() {
  try{
    if (params.followCam){
      renderFollowCamera()
      findNearest()
    }
    animatePlanets()
    exhaust.tick(0.005)
    exhaust2.tick(0.005)
    exhaust3.tick(0.005)
    renderer.render(scene, currCam)
  } catch (err){
    l(err)
    TweenLite.ticker.removeEventListener("tick", render)
  }
}

function addListeners(){
  TweenLite.ticker.addEventListener("tick", render)
  window.addEventListener("resize", resize, false)
}

function resize() {
  w = ctn.width()
  h = ctn.height()
  camera.aspect = w / h
  camera.updateProjectionMatrix()

  splineCamera.aspect = w / h
  splineCamera.updateProjectionMatrix()

  renderer.setSize(w, h)
}

function preload(){
  manager.onStart = () => {
    $("#html-ctn").append(Sqrl.Render($("#tpl").text(), { planetArr }))
  }

  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    let perc = Math.round(itemsLoaded / itemsTotal * 100) + '%'
    l(perc)
    $(".bar-inner").css({ width: perc })
  }

  manager.onError = url => {
    l('There was an error loading ' + url)
  }

  manager.onLoad = () => {
    // l(planetArr)
    preloaded = true
    l('Loading complete!')
    $("#start, #skip").show()
    $("#loading").hide()
    init() // -> Everything begins from here
  }
  
  // Planet assets
  planetArr.forEach(pl => {
    loaders.texture.load(pl.path + pl.planet.diffuse.v, tex => {
      tex.name = pl.name + " diffuse texture"
      pl.planet.diffuse.tex = tex
    })
    
    loaders.texture.load(pl.path + pl.planet.bump.v, tex => {
      tex.name = pl.name + " bump texture"
      pl.planet.bump.tex = tex
    })
    
    loaders.texture.load(pl.path + pl.planet.clouds.v, tex => {
      tex.name = pl.name + " clouds texture"
      pl.planet.clouds.tex = tex
    })

    if(pl.moon){
      loaders.texture.load(pl.path + pl.moon.diffuse.v, tex => {
        tex.name = pl.name + " moon diffuse texture"
        pl.moon.diffuse.tex = tex
      })
      
      loaders.texture.load(pl.path + pl.moon.bump.v, tex => {
        tex.name = pl.name + " moon bump texture"
        pl.moon.bump.tex = tex
      })
    }
    
    if(pl.rings){
      loaders.texture.load(pl.path + pl.rings.diffuse.v, tex => {
        tex.name = pl.name + " rings diffuse texture"
        pl.rings.diffuse.tex = tex
      })
      
      loaders.texture.load(pl.path + pl.rings.alpha.v, tex => {
        tex.name = pl.name + " rings alpha texture"
        pl.rings.alpha.tex = tex
      })
    }
  })

  // Ship assets
  loaders.gltf.load('assets/star-destroyer/scene.gltf', gltf => { ship = gltf.scene.children[0] })
  loaders.texture.load('assets/smokeparticle.png', tex => { exhaustTex = tex })
  loaders.texture.load('assets/flare7.png', tex => { starTex = tex })
}

function beginJourney(){  
  clearInterval(initInterval) 
  introSound.fade(1, 0, 1000, introSoundId)
  spaceSound.play()
  $(".start-ctn").fadeOut(() => {
    $("#html-ctn").css({ opacity:.8, width: 0 })
    params.followCam = true
  })
}

$(function(){  
  preload()
  // init()

  let animation = $(".animation")
  , cloned = animation.clone(true)
  
  $("#start, #skip").hide()
  animation.remove()

  $("#start").on("click", () => {
    $("#start").fadeOut()
    cloned.css({ opacity: 1 })
    $(".starwars").append(cloned)
    introSoundId = introSound.play()
    // preload()

    initInterval = setInterval(() => {
      l("Can skip")
      if (preloaded) beginJourney()
    }, 50000)
  })

  $("#skip").on("click", beginJourney)

  $("#replay").on("click", () => {
    params.shipSpeed = 0.0002
    fraction = 0
    $(".last-msg").fadeOut()
  })
})    