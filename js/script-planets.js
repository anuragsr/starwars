/* eslint-disable no-undef */
var l = console.log.bind(window.console)

window.onload = function(){  
  var w = document.getElementById("three-ctn").clientWidth
  , h = document.getElementById("three-ctn").clientHeight
  , cityModel
  , camera = new THREE.PerspectiveCamera( 45, w / h, 1, 10000 )
  , renderer = new THREE.WebGLRenderer({ antialias: true })
  , controls = new THREE.OrbitControls(camera, renderer.domElement)
  , scene = new THREE.Scene()
  , mtlLoader = new THREE.MTLLoader()
  , objLoader = new THREE.OBJLoader()
  , theta = 0
  , planetArr = [
    {
      name: 'dagobah',
      path: 'assets/dagobah/',
      position: new THREE.Vector3(0, 0, -10),
      planet: {        
        diffuse: { v: 'diffuse.jpg', repeat: new THREE.Vector2(2, 2) },
        // bump: { v: 'bump.jpg', repeat: new THREE.Vector2(2, 2) },     
        clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(1, 1), opacity: .8 },
      }
    }, {
      name: 'endor',
      path: 'assets/endor/',
      position: new THREE.Vector3(-10, 0, -10),
      planet: {        
        diffuse: { v: 'diffuse.jpg', repeat: new THREE.Vector2(2, 2) },
        bump: { v: 'bump.jpg', repeat: new THREE.Vector2(2, 2) },     
        // specular: { v: 'specular.jpg', repeat: new THREE.Vector2(2, 2) },     
        clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(3, 3), opacity: 1 },
      },
      moon: {
        diffuse: { v: 'moon.jpg', repeat: new THREE.Vector2(2, 2) },
        bump: { v: 'moon.jpg', repeat: new THREE.Vector2(2, 2) },
      }
    }, {
      name: 'geonosis',
      path: 'assets/geonosis/',
      position: new THREE.Vector3(10, 0, -10),
      planet: {        
        diffuse: { v: 'diffuse.jpg', repeat: new THREE.Vector2(2, 2) },
        bump: { v: 'bump.jpg', repeat: new THREE.Vector2(2, 2) },     
        // specular: { v: 'specular.jpg', repeat: new THREE.Vector2(2, 2) },     
        clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: 1 },
      },
      rings: {
        diffuse: { v: 'rings-txt.png', repeat: new THREE.Vector2(2, 2) },
        bump: { v: 'rings-txt.png', repeat: new THREE.Vector2(2, 2) },
        // alpha: { v: 'rings-opi.jpg', repeat: new THREE.Vector2(2, 2) },
        // alpha: { v: 'rings-op.jpg', repeat: new THREE.Vector2(2, 2) },
        // alpha: { v: 'rings-op2.png', repeat: new THREE.Vector2(2, 2) },
        alpha: { v: 'rings-op3.png', repeat: new THREE.Vector2(2, 2) },
      }
    }, {
      name: 'hoth',
      path: 'assets/hoth/',
      position: new THREE.Vector3(0, 10, -10),
      planet: {        
        diffuse: { v: 'diffuse.jpg', repeat: new THREE.Vector2(2, 2) },
        bump: { v: 'diffuse.jpg', repeat: new THREE.Vector2(2, 2) },     
        // specular: { v: 'specular.jpg', repeat: new THREE.Vector2(2, 2) },     
        clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: .8 },
      }
    }, {
      name: 'corsucant',
      path: 'assets/corsucant/',
      position: new THREE.Vector3(0, -10, -10),
      planet: {        
        // diffuse: { v: 'diffuse.jpg', repeat: new THREE.Vector2(2, 2) },
        diffuse: { v: 'diffuse2.jpg', repeat: new THREE.Vector2(2, 2) },
        // bump: { v: 'kj.jpg', repeat: new THREE.Vector2(2, 2) },     
        bump: { v: 'kj2.jpg', repeat: new THREE.Vector2(2, 2) },     
        // specular: { v: 'specular.jpg', repeat: new THREE.Vector2(2, 2) },     
        clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: 1 },
      }
    }, {
      name: 'naboo',
      path: 'assets/naboo/',
      position: new THREE.Vector3(0, -10, -10),
      planet: {        
        diffuse: { v: 'diffuse2.jpg', repeat: new THREE.Vector2(5, 5) },
        // diffuse: { v: 'diffuse2.jpg', repeat: new THREE.Vector2(2, 2) },
        // bump: { v: 'kj.jpg', repeat: new THREE.Vector2(2, 2) },     
        bump: { v: 'dryleave.jpg', repeat: new THREE.Vector2(5, 5) },     
        // specular: { v: 'specular.jpg', repeat: new THREE.Vector2(2, 2) },     
        clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: 1 },
      },
      moon: {
        diffuse: { v: 'moon.jpg', repeat: new THREE.Vector2(2, 2) },
        bump: { v: 'moonbump.jpg', repeat: new THREE.Vector2(2, 2) },
      }
    }, {
      name: 'tattooine',
      path: 'assets/tattooine/',
      position: new THREE.Vector3(0, -10, -10),
      planet: {        
        diffuse: { v: 'diffuse2.jpg', repeat: new THREE.Vector2(3, 3) },
        // diffuse: { v: 'diffuse2.jpg', repeat: new THREE.Vector2(2, 2) },
        // bump: { v: 'kj.jpg', repeat: new THREE.Vector2(2, 2) },     
        bump: { v: 'bump2.jpg', repeat: new THREE.Vector2(3, 3) },     
        // specular: { v: 'specular.jpg', repeat: new THREE.Vector2(2, 2) },     
        clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: 1 },
      },
      moon: {
        diffuse: { v: 'moon.jpg', repeat: new THREE.Vector2(2, 2) },
        bump: { v: 'moonbump.jpg', repeat: new THREE.Vector2(2, 2) },
      }
    }, {
      name: 'yavin',
      path: 'assets/yavin/',
      position: new THREE.Vector3(0, -10, -10),
      planet: {        
        diffuse: { v: 'diffuse.jpg', repeat: new THREE.Vector2(3, 3) },
        // diffuse: { v: 'diffuse2.jpg', repeat: new THREE.Vector2(2, 2) },
        // bump: { v: 'kj.jpg', repeat: new THREE.Vector2(2, 2) },     
        bump: { v: 'bump.jpg', repeat: new THREE.Vector2(3, 3) },     
        // specular: { v: 'specular.jpg', repeat: new THREE.Vector2(2, 2) },     
        clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: .7 },
      }
    }, {
      name: 'yavin-4',
      path: 'assets/yavin-4/',
      position: new THREE.Vector3(0, -10, -10),
      planet: {        
        diffuse: { v: 'diffuse.jpg', repeat: new THREE.Vector2(3, 3) },
        // diffuse: { v: 'diffuse2.jpg', repeat: new THREE.Vector2(2, 2) },
        bump: { v: 'diffuse.jpg', repeat: new THREE.Vector2(3, 3) },     
        // bump: { v: 'bump.jpg', repeat: new THREE.Vector2(3, 3) },     
        // specular: { v: 'specular.jpg', repeat: new THREE.Vector2(2, 2) },     
        clouds: { v: 'clouds.jpg', repeat: new THREE.Vector2(2, 2), opacity: 1 },
      },
      moon: {
        diffuse: { v: 'moon.jpg', repeat: new THREE.Vector2(2, 2) },
        bump: { v: 'moonbump.jpg', repeat: new THREE.Vector2(2, 2) },
      }
    }
  ]
  , plObjArr = []
  ;

  initScene()
  // addObjects(planetArr[0])
  addObjects(planetArr[1])
  // addObjects(planetArr[2])
  // addObjects(planetArr[3])
  // addObjects(planetArr[4])
  // addObjects(planetArr[5])
  // addObjects(planetArr[6])
  // addObjects(planetArr[7])
  // addObjects(planetArr[8])
  // addShip()
  render()
  animate()

  function initScene(){
    renderer.setClearColor('#000000')    
    renderer.setSize(w, h);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = renderer.domElement.style.left = 0;

    // For testing the scene 
    document.getElementById("three-ctn").appendChild(renderer.domElement);

    //Set Camera
    camera.position.z = 25

    scene.add( camera );
    var ambient = new THREE.AmbientLight( 0xffffff, .2 )
    scene.add( ambient );

    var spotLight = new THREE.DirectionalLight(0xffffff);
    spotLight.position.set(350, 350, 150);    
    spotLight.intensity = 2;
    scene.add(spotLight);
    
    // loadFromFile({...pathArr[0]})
  }

  function loadFromFile({path, meshObj, meshMtl}) {
    mtlLoader.setPath( path );
    mtlLoader.load( meshMtl,  materials => {
      l(materials)
      materials.preload()
      objLoader.setMaterials( materials );
      objLoader.setPath( path );
      objLoader.load( meshObj,  mesh => {
        l(mesh)     
        // mesh.traverse(function (child) {
        //   if (child instanceof THREE.Mesh) {
        //     child.material = new THREE.MeshPhongMaterial({
        //         color:     0x996633, 
        //         specular:  0x050505,
        //         shininess: 100,
        //         // map:       texture,
        //         side:      THREE.DoubleSide
        //     })
        //   }
        // })
        // scene.add(mesh)

        mesh.children.forEach(curr => {          
          var cl = curr.clone() 
          // var cl = curr
          // if(
          //   curr.name === "Endor" 
          //    // curr.name === "Clouds"
          //   // || curr.name === "moon"
          //   // || curr.name === "atmos"
          //   // || curr.name === "clouds"
          // ){          
            l(cl)
            var tx1 = new THREE.TextureLoader().load(path + 'clouds.jpg')
            var mat1 = cl.material
            mat1.bumpMap = tx1;         
            mat1.bumpScale = .05;
            mat1.bumpMap.wrapS = mat1.bumpMap.wrapT = THREE.RepeatWrapping;
            mat1.bumpMap.repeat.set( 1, 1 );
            mat1.bumpMap.minFilter = THREE.NearestFilter;

            // mat1.map.wrapS = mat1.map.wrapT = THREE.RepeatWrapping;
            // mat1.map.repeat.set( 2, 2 );
            // mat1.map.minFilter = THREE.NearestFilter;

            // cl.scale.x = cl.scale.y = cl.scale.z = .5;
            scene.add( cl )

            var tx = new THREE.TextureLoader().load(path + 'cl-s.jpg')
            // var tx = new THREE.TextureLoader().load(path + 'dagobah-clouds.jpg')
            
            var mat = new THREE.MeshPhongMaterial({
              color:0xffffff,
              side: THREE.FrontSide,
              transparent: true,
              // bumpScale: 0.01,
              opacity: .7,
              map:tx,
              alphaMap: tx,
              // bumpMap: tx
            })

            mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
            mat.map.repeat.set( 2, 1 );
            // mat.depthWrite = false;
            mat.map.minFilter = THREE.NearestFilter;
            cloudsMesh = new THREE.Mesh(curr.geometry, mat)
            cloudsMesh.scale.x = cloudsMesh.scale.y = cloudsMesh.scale.z = 1.03;
            scene.add( cloudsMesh )
            l(cloudsMesh.material)
            cloudsMesh.position.set(7, 0 ,0)
            cl.position.set(7, 0 ,0)
            plarr.push(cl)
          // }
        })

        meshModel = mesh  
        // mesh.scale.x = mesh.scale.y = mesh.scale.z = .007;
        // scene.add( mesh )
        // camera.lookAt(meshModel.position)
        animate()

      }, pr => { //l(pr) 
      }, err => { l(err) 
      })
    })
  }

  function addObjects(object) {
    let planet = object.planet
    , parent = new THREE.Object3D()
    , diffuse = new THREE.TextureLoader().load(object.path + planet.diffuse.v)
    , clouds = new THREE.TextureLoader().load(object.path + planet.clouds.v)
    , bump = planet.bump ? new THREE.TextureLoader().load(object.path + planet.bump.v) : null
    , specular = planet.specular ? new THREE.TextureLoader().load(object.path + planet.specular.v) : null
    , geometry = new THREE.SphereGeometry(5, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2)
    , material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: diffuse,
      bumpScale: .1,
      bumpMap: bump,
      specularMap: specular
    })
    , cloudMaterial = new THREE.MeshPhongMaterial({
      color:0xffffff,
      side: THREE.FrontSide,
      transparent: true,
      opacity: planet.clouds.opacity,
      map: clouds,
      alphaMap: clouds,
    })

    // parent.position.set(-10, 0, 0)
    // parent.position.copy(object.position)
    plObjArr.push(parent)
    scene.add(parent)

    if(diffuse){
      diffuse.wrapS = diffuse.wrapT = THREE.RepeatWrapping
      diffuse.repeat.copy( planet.diffuse.repeat )
      diffuse.minFilter = THREE.NearestFilter
    }

    if(bump){
      bump.wrapS = bump.wrapT = THREE.RepeatWrapping
      bump.repeat.copy( planet.bump.repeat )
      bump.minFilter = THREE.NearestFilter
    }    

    if(specular){
      specular.wrapS = specular.wrapT = THREE.RepeatWrapping
      specular.repeat.copy( planet.specular.repeat )
      specular.minFilter = THREE.NearestFilter
    }

    if(clouds){
      clouds.wrapS = clouds.wrapT = THREE.RepeatWrapping
      clouds.repeat.copy( planet.clouds.repeat )
      clouds.minFilter = THREE.NearestFilter
    }

    let mesh = new THREE.Mesh(geometry, material)
    parent.add(mesh)

    let cloudMesh = new THREE.Mesh(geometry.clone(), cloudMaterial)    
    cloudMesh.scale.multiplyScalar(1.02)
    parent.add(cloudMesh)

    if(object.moon){
      let moon = object.moon
      , moonDiffuse = new THREE.TextureLoader().load(object.path + moon.diffuse.v)
      , moonBump = moon.bump ? new THREE.TextureLoader().load(object.path + moon.bump.v) : null
      // , clouds = new THREE.TextureLoader().load(object.path + planet.clouds.v)
      // , specular = planet.specular ? new THREE.TextureLoader().load(object.path + planet.specular.v) : null
      , moonGeo = new THREE.SphereGeometry(1, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2)
      , moonMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: moonDiffuse,
        bumpScale: .1,
        bumpMap: moonBump,
      })

      if(moonDiffuse){      
        moonDiffuse.wrapS = moonDiffuse.wrapT = THREE.RepeatWrapping
        moonDiffuse.repeat.copy( moon.diffuse.repeat )
        moonDiffuse.minFilter = THREE.NearestFilter
      }

      if(moonBump){      
        moonBump.wrapS = moonBump.wrapT = THREE.RepeatWrapping
        moonBump.repeat.copy( moon.bump.repeat )
        moonBump.minFilter = THREE.NearestFilter
      }   
      
      let moonMesh = new THREE.Mesh(moonGeo, moonMat)    
      moonMesh.position.set(10, 0, 0)          
      moonMesh.type = "moon"

      parent.add(moonMesh)
    }

    if(object.rings){
      let rings = object.rings
      , ringsDiffuse = new THREE.TextureLoader().load(object.path + rings.diffuse.v)
      , ringsBump = rings.bump ? new THREE.TextureLoader().load(object.path + rings.bump.v) : null
      , ringsAlpha = rings.alpha ? new THREE.TextureLoader().load(object.path + rings.alpha.v) : null
      // , clouds = new THREE.TextureLoader().load(object.path + planet.clouds.v)
      // , specular = planet.specular ? new THREE.TextureLoader().load(object.path + planet.specular.v) : null
      // , ringsGeo = new THREE.SphereGeometry(1, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2)
      , thetaSegments = 50
      , phiSegments = 2
      , ringsGeo = new THREE.RingGeometry( 0, 12, thetaSegments, phiSegments )
      , ringsMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: ringsDiffuse,
        transparent: true,
        opacity: 1,
        alphaMap: ringsAlpha,
        bumpScale: .1,
        bumpMap: ringsAlpha,
        side: THREE.DoubleSide
      })

      l(ringsGeo)
      l(ringsMat)
      // NO need to set repeat for ring geometry
      
      // if(ringsDiffuse){      
      //   ringsDiffuse.wrapS = ringsDiffuse.wrapT = THREE.RepeatWrapping
      //   ringsDiffuse.repeat.copy( rings.diffuse.repeat )
      //   ringsDiffuse.minFilter = THREE.NearestFilter
      // }

      // if(ringsBump){      
      //   ringsBump.wrapS = moonBump.wrapT = THREE.RepeatWrapping
      //   ringsBump.repeat.copy( rings.bump.repeat )
      //   ringsBump.minFilter = THREE.NearestFilter
      // }   
      
      let ringsMesh = new THREE.Mesh(ringsGeo, ringsMat)
      ringsMesh.position.set(0, 0, 0)    
      ringsMesh.rotation.x = Math.PI/2 + .1
      ringsMesh.rotation.y = .05
      ringsMesh.type = "rings"

      parent.add(ringsMesh)
    }
  }

  function addShip(){
    var gltfLoader = new THREE.GLTFLoader()
    gltfLoader.load(
      // resource URL
      'assets/start-destroyer/scene.gltf',
      // called when the resource is loaded
      function ( gltf ) {
        // l(gltf)
        var ship = gltf.scene.children[0]
        ship.scale.set(.02, .02, .02)
        ship.rotation.z = Math.PI/2
        scene.add( ship );

        // gltf.animations; // Array<THREE.AnimationClip>
        // gltf.scene; // THREE.Scene
        // gltf.scenes; // Array<THREE.Scene>
        // gltf.cameras; // Array<THREE.Camera>
        // gltf.asset; // Object

      },
      // called while loading is progressing
      function ( xhr ) {

        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

      },
      // called when loading has errors
      function ( error ) {

        console.log( 'An error happened' );

      }
    );
  }

  function rotateAboutPoint(obj, point, axis, theta, pointIsWorld){
    // obj - your object (THREE.Object3D or derived)
    // point - the point of rotation (THREE.Vector3)
    // axis - the axis of rotation (normalized THREE.Vector3)
    // theta - radian value of rotation
    // pointIsWorld - boolean indicating the point is in world coordinates (default = false)
    pointIsWorld = !!pointIsWorld
    
    if(pointIsWorld){
      obj.parent.localToWorld(obj.position); // compensate for world coordinate
    }
    
    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset
    
    if(pointIsWorld){
      obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
    }
    
    obj.rotateOnAxis(axis, theta); // rotate the OBJECT
  }

  function onProgress( xhr ) {
    // l( xhr.loaded, xhr.total );
  }

  function onError( xhr ) { }

  function render() {
    renderer.render( scene, camera );
  }

  function animate(){
    plObjArr.forEach(planetObject => {
      let children = planetObject.children
      if(children[0]) children[0].rotation.y += .001
      if(children[1]) children[1].rotation.y += .0005

      if(children[2] && children[2].type === "moon"){
        rotateAboutPoint(children[2], planetObject.position, new THREE.Vector3(0, 1, 0), 0.01, true)        
      }
    })

    render()
    requestAnimationFrame(animate)
  }

  // function onWindowResize(event) {
  //   w = document.getElementById("#three-ctn").width(); 
  //   h = document.getElementById("#three-ctn").height();
  //   camera.aspect = w / h;
  //   camera.updateProjectionMatrix();
  //   renderer.setSize( w, h );
  // }
  // window.addEventListener( "resize", onWindowResize, false );
}