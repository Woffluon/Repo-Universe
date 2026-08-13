import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { createSeededRandom, deriveSeed } from '@/lib/universe/seed'
import type { GraphicsQuality, UniverseModel } from '@/lib/universe/types'

export type UniverseHover = {
  id: string
  x: number
  y: number
} | null

export type UniverseEngineOptions = {
  quality: GraphicsQuality
  reducedMotion: boolean
  onHover: (hover: UniverseHover) => void
  onSelect: (id: string) => void
  onContextLost: () => void
}

type InteractiveObject = THREE.Object3D & { userData: { bodyId?: string } }

type PlanetRuntime = {
  mesh: THREE.Mesh
  orbitGroup: THREE.Group
  angle: number
  speed: number
  orbitRadius: number
}

const STAR_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const STAR_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uActivity;
  uniform float uBrightness;
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vPosition;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + .1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    float turbulence = hash(normalize(vPosition) * 8.0 + uTime * (0.12 + uActivity * 0.18));
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.0);
    float heat = 0.78 + turbulence * 0.34 + fresnel * 0.22;
    vec3 color = mix(vec3(1.0, 0.72, 0.32), uColor, 0.18) * heat * uBrightness;
    gl_FragColor = vec4(color, 1.0);
  }
`

const CORONA_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vViewDirection;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDirection = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const CORONA_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewDirection;
  void main() {
    float fresnel = pow(1.0 - abs(dot(vNormal, vViewDirection)), 2.5);
    float alpha = fresnel * 0.48 * uIntensity;
    gl_FragColor = vec4(mix(vec3(1.0, .55, .2), uColor, .16), alpha);
  }
`

function hexToColor(value: string): THREE.Color {
  try {
    return new THREE.Color(value)
  } catch {
    return new THREE.Color('#8ecae6')
  }
}

function mixHex(base: THREE.Color, amount: number): string {
  const white = new THREE.Color('#ffffff')
  return base.clone().lerp(white, amount).getStyle()
}

function createPlanetTexture(color: string, seed: number, kindIndex: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 192
  canvas.height = 96
  const context = canvas.getContext('2d')
  if (!context) throw new Error('2D canvas is unavailable.')

  const rng = createSeededRandom(seed)
  const base = hexToColor(color)
  context.fillStyle = base.getStyle()
  context.fillRect(0, 0, canvas.width, canvas.height)

  const variant = kindIndex % 4
  if (variant === 0) {
    for (let y = 0; y < canvas.height; y += 5) {
      const alpha = 0.035 + rng() * 0.11
      context.fillStyle = `rgba(255,255,255,${alpha})`
      context.fillRect(0, y, canvas.width, 2 + Math.floor(rng() * 4))
    }
  } else if (variant === 1) {
    for (let index = 0; index < 180; index += 1) {
      const radius = 1 + rng() * 7
      context.fillStyle = rng() > 0.5 ? `rgba(0,0,0,${0.04 + rng() * 0.13})` : `rgba(255,255,255,${0.03 + rng() * 0.1})`
      context.beginPath()
      context.arc(rng() * canvas.width, rng() * canvas.height, radius, 0, Math.PI * 2)
      context.fill()
    }
  } else if (variant === 2) {
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, mixHex(base, 0.28))
    gradient.addColorStop(0.48, base.getStyle())
    gradient.addColorStop(1, base.clone().multiplyScalar(0.62).getStyle())
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
    for (let y = 8; y < canvas.height; y += 12) {
      context.fillStyle = `rgba(255,255,255,${0.04 + rng() * 0.08})`
      context.fillRect(0, y, canvas.width, 2)
    }
  } else {
    for (let index = 0; index < 36; index += 1) {
      const x = rng() * canvas.width
      const y = rng() * canvas.height
      const radius = 4 + rng() * 18
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, `rgba(255,255,255,${0.06 + rng() * 0.1})`)
      gradient.addColorStop(1, 'rgba(255,255,255,0)')
      context.fillStyle = gradient
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.anisotropy = 2
  return texture
}

function disposeMaterial(material: THREE.Material): void {
  const candidate = material as THREE.Material & Record<string, unknown>
  for (const value of Object.values(candidate)) {
    if (value instanceof THREE.Texture) value.dispose()
  }
  material.dispose()
}

export class UniverseEngine {
  private readonly container: HTMLElement
  private readonly model: UniverseModel
  private readonly options: UniverseEngineOptions
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.PerspectiveCamera(46, 1, 0.1, 400)
  private readonly renderer: THREE.WebGLRenderer
  private readonly controls: OrbitControls
  private readonly raycaster = new THREE.Raycaster()
  private readonly pointer = new THREE.Vector2()
  private readonly interactive: InteractiveObject[] = []
  private readonly bodyObjects = new Map<string, THREE.Object3D>()
  private readonly planets: PlanetRuntime[] = []
  private readonly labelLayer = document.createElement('div')
  private readonly labels = new Map<string, HTMLElement>()
  private readonly projectedPosition = new THREE.Vector3()
  private readonly clock = new THREE.Clock()
  private starMaterial: THREE.ShaderMaterial | null = null
  private readonly resizeObserver: ResizeObserver
  private readonly composer: EffectComposer | null
  private rafId: number | null = null
  private paused = false
  private hidden = document.hidden
  private disposed = false
  private lastHovered: string | null = null
  private focusAnimation: {
    start: number
    duration: number
    fromCamera: THREE.Vector3
    fromTarget: THREE.Vector3
    toCamera: THREE.Vector3
    toTarget: THREE.Vector3
  } | null = null

  constructor(container: HTMLElement, model: UniverseModel, options: UniverseEngineOptions) {
    this.container = container
    this.model = model
    this.options = options
    this.scene.background = new THREE.Color('#05070a')
    this.scene.fog = new THREE.FogExp2('#05070a', 0.0075)

    const canvas = document.createElement('canvas')
    canvas.className = 'universe-webgl-canvas'
    canvas.setAttribute('aria-hidden', 'true')
    this.container.appendChild(canvas)
    this.labelLayer.className = 'scene-label-layer'
    this.labelLayer.setAttribute('aria-hidden', 'true')
    this.container.appendChild(this.labelLayer)

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: options.quality !== 'low',
      powerPreference: 'high-performance',
    })
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = options.quality === 'low' ? 1.02 : 1.12
    this.renderer.setPixelRatio(this.pixelRatio())

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = !options.reducedMotion
    this.controls.dampingFactor = 0.055
    this.controls.minDistance = Math.max(3.5, model.star.radius * 2.2)
    this.controls.maxDistance = Math.max(65, model.boundsRadius * 3.1)
    this.controls.zoomToCursor = true

    this.buildScene()
    this.buildLabels()
    this.frameInitialCamera()

    if (options.quality === 'low') {
      this.composer = null
    } else {
      const composer = new EffectComposer(this.renderer)
      composer.addPass(new RenderPass(this.scene, this.camera))
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(Math.max(1, container.clientWidth), Math.max(1, container.clientHeight)),
        options.quality === 'high' ? 0.55 : 0.38,
        0.72,
        0.78,
      )
      composer.addPass(bloom)
      this.composer = composer
    }

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)
    this.resize()

    canvas.addEventListener('pointermove', this.onPointerMove, { passive: true })
    canvas.addEventListener('pointerleave', this.onPointerLeave, { passive: true })
    canvas.addEventListener('click', this.onClick)
    canvas.addEventListener('webglcontextlost', this.onContextLost)
    document.addEventListener('visibilitychange', this.onVisibilityChange)

    if (!this.hidden) this.start()
  }

  private pixelRatio(): number {
    const dpr = window.devicePixelRatio || 1
    if (this.options.quality === 'low') return Math.min(dpr, 1)
    if (this.options.quality === 'high') return Math.min(dpr, 2)
    return Math.min(dpr, window.innerWidth < 700 ? 1.15 : 1.5)
  }

  private buildScene(): void {
    this.scene.add(new THREE.AmbientLight('#6680aa', 0.18))
    const keyLight = new THREE.PointLight('#ffd7a0', 115, this.model.boundsRadius * 3.4, 1.5)
    keyLight.position.set(0, 0, 0)
    this.scene.add(keyLight)

    this.buildStarField()
    this.buildCentralStar()
    this.buildPlanets()
    this.buildAsteroids()
    this.buildContributors()
  }

  private buildStarField(): void {
    const count = this.options.quality === 'high' ? 2900 : this.options.quality === 'low' ? 820 : 1750
    const rng = createSeededRandom(this.model.background.seed)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const color = new THREE.Color()

    for (let index = 0; index < count; index += 1) {
      const radius = 65 + rng() * 115
      const theta = rng() * Math.PI * 2
      const phi = Math.acos(2 * rng() - 1)
      positions[index * 3] = Math.sin(phi) * Math.cos(theta) * radius
      positions[index * 3 + 1] = Math.cos(phi) * radius
      positions[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius
      color.setHSL(0.54 + (rng() - 0.5) * 0.12, 0.24, 0.58 + rng() * 0.38)
      colors[index * 3] = color.r
      colors[index * 3 + 1] = color.g
      colors[index * 3 + 2] = color.b
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const material = new THREE.PointsMaterial({
      size: this.options.quality === 'high' ? 0.105 : 0.09,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.84,
      depthWrite: false,
    })
    this.scene.add(new THREE.Points(geometry, material))
  }


  private buildLabels(): void {
    const repositoryLabel = document.createElement('div')
    repositoryLabel.className = 'scene-object-label scene-repository-label'
    const repositoryKind = document.createElement('span')
    repositoryKind.textContent = 'Repository star'
    const repositoryName = document.createElement('strong')
    repositoryName.textContent = this.model.star.label
    repositoryLabel.append(repositoryKind, repositoryName)
    this.labelLayer.appendChild(repositoryLabel)
    this.labels.set('repository', repositoryLabel)

    const labelLimit = this.options.quality === 'high' ? 8 : this.options.quality === 'low' ? 4 : 6
    this.model.planets.slice(0, labelLimit).forEach((planet) => {
      const label = document.createElement('div')
      label.className = 'scene-object-label scene-planet-label'
      label.style.setProperty('--object-color', planet.color)

      const title = document.createElement('strong')
      title.textContent = planet.language
      const detail = document.createElement('span')
      detail.textContent = `${planet.percentage.toFixed(1)}% of code`
      label.append(title, detail)

      this.labelLayer.appendChild(label)
      this.labels.set(planet.id, label)
    })
  }

  private updateLabels(): void {
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    if (width <= 0 || height <= 0) return

    for (const [id, label] of this.labels) {
      const object = this.bodyObjects.get(id)
      if (!object) {
        label.style.opacity = '0'
        continue
      }

      object.getWorldPosition(this.projectedPosition)
      this.projectedPosition.project(this.camera)
      const visible = this.projectedPosition.z > -1 && this.projectedPosition.z < 1
      if (!visible) {
        label.style.opacity = '0'
        continue
      }

      const x = (this.projectedPosition.x * 0.5 + 0.5) * width
      const y = (-this.projectedPosition.y * 0.5 + 0.5) * height
      const margin = 28
      const inside = x > margin && x < width - margin && y > 78 && y < height - margin
      label.style.opacity = inside ? '1' : '0'
      label.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, ${id === 'repository' ? '36px' : '18px'})`
    }
  }

  private buildCentralStar(): void {
    const color = hexToColor(this.model.star.color)
    const geometry = new THREE.SphereGeometry(this.model.star.radius, this.options.quality === 'low' ? 32 : 56, 32)
    const material = new THREE.ShaderMaterial({
      vertexShader: STAR_VERTEX_SHADER,
      fragmentShader: STAR_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uActivity: { value: this.model.star.activity },
        uBrightness: { value: this.model.star.brightness },
        uColor: { value: color },
      },
    })
    this.starMaterial = material
    const star = new THREE.Mesh(geometry, material) as InteractiveObject
    star.userData.bodyId = 'repository'
    this.scene.add(star)
    this.interactive.push(star)
    this.bodyObjects.set('repository', star)

    const corona = new THREE.Mesh(
      new THREE.SphereGeometry(this.model.star.radius * 1.34, 36, 24),
      new THREE.ShaderMaterial({
        vertexShader: CORONA_VERTEX_SHADER,
        fragmentShader: CORONA_FRAGMENT_SHADER,
        uniforms: {
          uColor: { value: color },
          uIntensity: { value: 0.8 + this.model.star.activity * 0.45 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    )
    this.scene.add(corona)
  }

  private buildPlanets(): void {
    this.model.planets.forEach((planet, index) => {
      const orbitGroup = new THREE.Group()
      orbitGroup.rotation.x = planet.orbitInclination
      orbitGroup.rotation.z = planet.orbitLongitude
      this.scene.add(orbitGroup)

      const orbitGeometry = new THREE.BufferGeometry()
      const orbitPoints = Array.from({ length: 129 }, (_, pointIndex) => {
        const angle = (pointIndex / 128) * Math.PI * 2
        return new THREE.Vector3(Math.cos(angle) * planet.orbitRadius, 0, Math.sin(angle) * planet.orbitRadius)
      })
      orbitGeometry.setFromPoints(orbitPoints)
      const orbitMaterial = new THREE.LineBasicMaterial({ color: '#70809a', transparent: true, opacity: 0.17 })
      orbitGroup.add(new THREE.Line(orbitGeometry, orbitMaterial))

      const texture = createPlanetTexture(planet.color, planet.surfaceSeed, index)
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: '#ffffff',
        roughness: index % 3 === 0 ? 0.48 : 0.74,
        metalness: index % 4 === 3 ? 0.18 : 0.02,
      })
      const geometry = new THREE.SphereGeometry(planet.radius, this.options.quality === 'low' ? 20 : 36, 22)
      const mesh = new THREE.Mesh(geometry, material) as InteractiveObject
      mesh.userData.bodyId = planet.id
      mesh.rotation.z = planet.axialTilt
      orbitGroup.add(mesh)
      this.interactive.push(mesh)
      this.bodyObjects.set(planet.id, mesh)

      if (index % 3 === 1 && this.options.quality !== 'low') {
        const atmosphere = new THREE.Mesh(
          new THREE.SphereGeometry(planet.radius * 1.08, 28, 18),
          new THREE.MeshBasicMaterial({
            color: planet.color,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            depthWrite: false,
          }),
        )
        mesh.add(atmosphere)
      }

      this.planets.push({
        mesh,
        orbitGroup,
        angle: planet.startAngle,
        speed: planet.orbitSpeed,
        orbitRadius: planet.orbitRadius,
      })
      this.placePlanet(this.planets.at(-1)!)
    })
  }

  private placePlanet(runtime: PlanetRuntime): void {
    runtime.mesh.position.set(
      Math.cos(runtime.angle) * runtime.orbitRadius,
      0,
      Math.sin(runtime.angle) * runtime.orbitRadius,
    )
  }

  private buildAsteroids(): void {
    const sourceCount = this.model.asteroidBelt.count
    const qualityScale = this.options.quality === 'high' ? 1 : this.options.quality === 'low' ? 0.42 : 0.72
    const count = Math.max(8, Math.round(sourceCount * qualityScale))
    const rng = createSeededRandom(this.model.asteroidBelt.seed)
    const geometry = new THREE.IcosahedronGeometry(0.12, 0)
    const material = new THREE.MeshStandardMaterial({ color: '#8d8278', roughness: 0.95, metalness: 0.04 })
    const instances = new THREE.InstancedMesh(geometry, material, count)
    const dummy = new THREE.Object3D()

    for (let index = 0; index < count; index += 1) {
      const angle = rng() * Math.PI * 2
      const radius = this.model.asteroidBelt.innerRadius + rng() * (this.model.asteroidBelt.outerRadius - this.model.asteroidBelt.innerRadius)
      const vertical = (rng() - 0.5) * 0.9
      const scale = 0.55 + rng() * 1.7
      dummy.position.set(Math.cos(angle) * radius, vertical, Math.sin(angle) * radius)
      dummy.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      instances.setMatrixAt(index, dummy.matrix)
    }
    instances.instanceMatrix.needsUpdate = true
    this.scene.add(instances)
  }

  private buildContributors(): void {
    this.model.contributors.forEach((contributor) => {
      const material = new THREE.MeshBasicMaterial({
        color: '#b7e7ff',
        transparent: true,
        opacity: Math.min(1, 0.55 + contributor.intensity * 0.2),
      })
      const signal = new THREE.Mesh(new THREE.SphereGeometry(contributor.radius, 14, 10), material) as InteractiveObject
      signal.position.set(...contributor.position)
      signal.userData.bodyId = contributor.id
      this.scene.add(signal)
      this.interactive.push(signal)
      this.bodyObjects.set(contributor.id, signal)

      if (this.options.quality !== 'low') {
        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(contributor.radius * 1.95, 10, 8),
          new THREE.MeshBasicMaterial({
            color: '#6bc9ff',
            transparent: true,
            opacity: 0.045 * contributor.intensity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        )
        signal.add(halo)
      }
    })
  }

  private frameInitialCamera(): void {
    const distance = Math.min(52, Math.max(20, this.model.boundsRadius * 1.3))
    this.camera.position.set(distance * 0.72, distance * 0.46, distance)
    this.controls.target.set(0, 0, 0)
    this.camera.lookAt(0, 0, 0)
    this.controls.update()
  }

  private resize(): void {
    const width = Math.max(1, this.container.clientWidth)
    const height = Math.max(1, this.container.clientHeight)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setPixelRatio(this.pixelRatio())
    this.renderer.setSize(width, height, false)
    this.composer?.setSize(width, height)
  }

  private onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') return
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hit = this.raycaster.intersectObjects(this.interactive, false)[0]
    const id = (hit?.object as InteractiveObject | undefined)?.userData.bodyId ?? null
    if (id === this.lastHovered) return
    this.lastHovered = id
    this.renderer.domElement.style.cursor = id ? 'pointer' : 'grab'
    this.options.onHover(id ? { id, x: event.clientX, y: event.clientY } : null)
  }

  private onPointerLeave = (): void => {
    this.lastHovered = null
    this.renderer.domElement.style.cursor = 'grab'
    this.options.onHover(null)
  }

  private onClick = (event: MouseEvent): void => {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hit = this.raycaster.intersectObjects(this.interactive, false)[0]
    const id = (hit?.object as InteractiveObject | undefined)?.userData.bodyId
    if (!id) return
    this.options.onSelect(id)
    this.focus(id)
  }

  private onContextLost = (event: Event): void => {
    event.preventDefault()
    this.stop()
    this.options.onContextLost()
  }

  private onVisibilityChange = (): void => {
    this.hidden = document.hidden
    if (this.hidden) {
      this.stop()
    } else if (!this.paused) {
      this.clock.getDelta()
      this.start()
    }
  }

  private start(): void {
    if (this.disposed || this.rafId !== null || this.paused || this.hidden) return
    this.rafId = requestAnimationFrame(this.animate)
  }

  private stop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId)
    this.rafId = null
  }

  private animate = (): void => {
    this.rafId = null
    if (this.disposed || this.paused || this.hidden) return

    const delta = Math.min(0.05, this.clock.getDelta())
    const elapsed = this.clock.elapsedTime

    if (!this.options.reducedMotion) {
      for (const planet of this.planets) {
        planet.angle += delta * planet.speed
        planet.mesh.rotation.y += delta * 0.1
        this.placePlanet(planet)
      }
    }

    if (this.starMaterial) this.starMaterial.uniforms.uTime.value = elapsed

    this.updateFocusAnimation()
    this.controls.update()
    this.updateLabels()
    if (this.composer) this.composer.render()
    else this.renderer.render(this.scene, this.camera)
    this.rafId = requestAnimationFrame(this.animate)
  }

  private updateFocusAnimation(): void {
    const animation = this.focusAnimation
    if (!animation) return
    const now = performance.now()
    const raw = Math.min(1, (now - animation.start) / animation.duration)
    const t = 1 - Math.pow(1 - raw, 3)
    this.camera.position.lerpVectors(animation.fromCamera, animation.toCamera, t)
    this.controls.target.lerpVectors(animation.fromTarget, animation.toTarget, t)
    if (raw >= 1) this.focusAnimation = null
  }

  private worldPositionFor(id: string): THREE.Vector3 | null {
    const object = this.bodyObjects.get(id)
    if (!object) return null
    return object.getWorldPosition(new THREE.Vector3())
  }

  focus(id: string): void {
    const target = this.worldPositionFor(id)
    const object = this.bodyObjects.get(id)
    if (!target || !object) return

    const sphere = new THREE.Box3().setFromObject(object).getBoundingSphere(new THREE.Sphere())
    const radius = Math.max(0.5, sphere.radius)
    const currentDirection = this.camera.position.clone().sub(this.controls.target).normalize()
    const distance = Math.max(radius * 5.8, id === 'repository' ? this.model.star.radius * 5.2 : 4.2)
    const toCamera = target.clone().add(currentDirection.multiplyScalar(distance))

    if (this.options.reducedMotion) {
      this.camera.position.copy(toCamera)
      this.controls.target.copy(target)
      this.controls.update()
      return
    }

    this.focusAnimation = {
      start: performance.now(),
      duration: 680,
      fromCamera: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      toCamera,
      toTarget: target,
    }
  }

  reset(): void {
    const distance = Math.min(52, Math.max(20, this.model.boundsRadius * 1.3))
    const toCamera = new THREE.Vector3(distance * 0.72, distance * 0.46, distance)
    const toTarget = new THREE.Vector3(0, 0, 0)
    if (this.options.reducedMotion) {
      this.camera.position.copy(toCamera)
      this.controls.target.copy(toTarget)
      return
    }
    this.focusAnimation = {
      start: performance.now(),
      duration: 720,
      fromCamera: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      toCamera,
      toTarget,
    }
  }

  setPaused(paused: boolean): void {
    this.paused = paused
    if (paused) this.stop()
    else {
      this.clock.getDelta()
      this.start()
    }
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.stop()
    this.resizeObserver.disconnect()
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    const canvas = this.renderer.domElement
    canvas.removeEventListener('pointermove', this.onPointerMove)
    canvas.removeEventListener('pointerleave', this.onPointerLeave)
    canvas.removeEventListener('click', this.onClick)
    canvas.removeEventListener('webglcontextlost', this.onContextLost)

    this.controls.dispose()
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
        object.geometry?.dispose()
        const material = object.material
        if (Array.isArray(material)) material.forEach(disposeMaterial)
        else if (material) disposeMaterial(material)
      }
    })
    this.composer?.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.scene.clear()
    this.interactive.length = 0
    this.bodyObjects.clear()
    this.planets.length = 0
    this.starMaterial = null
    this.labels.clear()
    this.labelLayer.remove()
    canvas.remove()
  }
}
