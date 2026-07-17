"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  Maximize2,
  Minimize2,
  Share2,
  X,
  RotateCcw,
  Eye,
  MousePointerClick,
} from "lucide-react"
import * as THREE from "three"

interface RoomScene {
  id: string
  name: string
  panoramaUrl: string
}

interface Immersive360TourProps {
  rooms: RoomScene[]
  initialRoomId?: string
  onClose?: () => void
  isEmbedded?: boolean
}

export function Immersive360Tour({ rooms, initialRoomId, onClose, isEmbedded = false }: Immersive360TourProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const sphereRef = useRef<THREE.Mesh | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const isDragging = useRef<boolean>(false)
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const lon = useRef<number>(0)
  const lat = useRef<number>(0)

  const [selectedRoom, setSelectedRoom] = useState<RoomScene>(rooms.find((r) => r.id === initialRoomId) || rooms[0])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  // Viewer must be explicitly "activated" (clicked/tapped) before it captures
  // drag/scroll input. This lets the page scroll normally over the viewer
  // until the user opts in, and prevents accidental zoom-on-scroll.
  const [isActive, setIsActive] = useState(false)
  const isActiveRef = useRef(false)
  useEffect(() => {
    isActiveRef.current = isActive
  }, [isActive])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1100)
    camera.position.set(0, 0, 0.1)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const geometry = new THREE.SphereGeometry(500, 60, 40)
    geometry.scale(-1, 1, 1)

    const textureLoader = new THREE.TextureLoader()
    textureLoader.crossOrigin = "anonymous"
    setIsLoading(true)
    setLoadError(null)

    const texture = textureLoader.load(
      selectedRoom.panoramaUrl,
      () => {
        setIsLoading(false)
        setLoadError(null)
      },
      undefined,
      () => {
        setIsLoading(false)
        setLoadError("Failed to load panorama image")
      },
    )

    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    const material = new THREE.MeshBasicMaterial({ map: texture })
    const sphere = new THREE.Mesh(geometry, material)
    sphereRef.current = sphere
    scene.add(sphere)

    const updateCameraTarget = () => {
      const phi = THREE.MathUtils.degToRad(90 - lat.current)
      const theta = THREE.MathUtils.degToRad(lon.current)
      camera.lookAt(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta),
      )
    }

    // Remove the separate overlay button's onClick-only activation.
    // Instead, activate directly inside onPointerDown so the same touch/click
    // that starts the drag also activates the viewer — no extra click needed.

    const onPointerDown = (event: PointerEvent) => {
      if (!isActiveRef.current) {
        setIsActive(true)
        isActiveRef.current = true // sync immediately, don't wait for useEffect
      }
      isDragging.current = true
      setIsAutoRotating(false)
      previousMousePosition.current = { x: event.clientX, y: event.clientY }
      container.style.cursor = "grabbing"
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging.current || !isActiveRef.current) return
      lon.current -= (event.clientX - previousMousePosition.current.x) * 0.2
      lat.current += (event.clientY - previousMousePosition.current.y) * 0.2
      lat.current = Math.max(-85, Math.min(85, lat.current))
      previousMousePosition.current = { x: event.clientX, y: event.clientY }
    }

    const onPointerUp = () => {
      isDragging.current = false
      container.style.cursor = "grab"
    }

    const onWheel = (event: WheelEvent) => {
      if (!isActiveRef.current) return // let the page scroll normally
      event.preventDefault()
      camera.fov = THREE.MathUtils.clamp(camera.fov + event.deltaY * 0.05, 30, 100)
      camera.updateProjectionMatrix()
    }

    const onTouchStart = (event: TouchEvent) => {
      if (!isActiveRef.current) return // let the page scroll normally
      if (event.touches.length === 1) {
        isDragging.current = true
        previousMousePosition.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
      }
    }

    const onTouchMove = (event: TouchEvent) => {
      if (!isDragging.current || !isActiveRef.current || event.touches.length !== 1) return
      event.preventDefault()
      lon.current -= (event.touches[0].clientX - previousMousePosition.current.x) * 0.2
      lat.current += (event.touches[0].clientY - previousMousePosition.current.y) * 0.2
      lat.current = Math.max(-85, Math.min(85, lat.current))
      previousMousePosition.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
    }

    const onTouchEnd = () => { isDragging.current = false }

    container.addEventListener("pointerdown", onPointerDown)
    container.addEventListener("pointermove", onPointerMove)
    container.addEventListener("pointerup", onPointerUp)
    container.addEventListener("pointerleave", onPointerUp)
    container.addEventListener("wheel", onWheel, { passive: false })
    container.addEventListener("touchstart", onTouchStart, { passive: false })
    container.addEventListener("touchmove", onTouchMove, { passive: false })
    container.addEventListener("touchend", onTouchEnd)

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      // Keep it "static but moving": auto-rotate continues regardless of
      // activation state, but stops while the user is actively dragging.
      if (isAutoRotating && !isDragging.current) lon.current += 0.1
      updateCameraTarget()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      container.removeEventListener("pointerdown", onPointerDown)
      container.removeEventListener("pointermove", onPointerMove)
      container.removeEventListener("pointerup", onPointerUp)
      container.removeEventListener("pointerleave", onPointerUp)
      container.removeEventListener("wheel", onWheel)
      container.removeEventListener("touchstart", onTouchStart)
      container.removeEventListener("touchmove", onTouchMove)
      container.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("resize", handleResize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      texture.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [selectedRoom.panoramaUrl, isAutoRotating])

  // Deactivate the viewer (release scroll/drag capture) whenever the user
  // clicks/taps outside of it, and always deactivate on room change.
  useEffect(() => {
    setIsActive(false)
  }, [selectedRoom.id])

  useEffect(() => {
    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(event.target as Node)) {
        setIsActive(false)
      }
    }
    document.addEventListener("pointerdown", handleOutsidePointerDown)
    return () => document.removeEventListener("pointerdown", handleOutsidePointerDown)
  }, [])

  // Escape also releases the viewer, handy on desktop.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsActive(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  const activateViewer = () => {
    setIsActive(true)
  }

  const handleResetView = () => {
    lon.current = 0
    lat.current = 0
    setIsAutoRotating(true)
    if (cameraRef.current) {
      cameraRef.current.fov = 75
      cameraRef.current.updateProjectionMatrix()
    }
  }

  const toggleFullscreen = () => {
  // Already in CSS fake-fullscreen? Just toggle it off directly.
  if (isFullscreen && !document.fullscreenElement) {
    setIsFullscreen(false)
    return
  }

  const el = wrapperRef.current as any
  if (!document.fullscreenElement) {
    const request =
      el?.requestFullscreen?.bind(el) ||
      el?.webkitRequestFullscreen?.bind(el) ||
      el?.webkitEnterFullscreen?.bind(el)

    if (!request) {
      setIsFullscreen(true)
      return
    }

    Promise.resolve(request()).catch((err: any) => {
      // Silently fall back for permission policy errors (expected in iframes)
      if (err?.name === 'NotAllowedError' || err?.message?.includes('permissions policy')) {
        setIsFullscreen(true)
      } else {
        console.warn("Fullscreen request failed, falling back to CSS fullscreen:", err)
        setIsFullscreen(true)
      }
    })
  } else {
    document.exitFullscreen?.().catch(() => {})
  }
}

  useEffect(() => {
    const handleFsChange = () => {
      const fsActive = !!document.fullscreenElement
      setIsFullscreen(fsActive)
      if (!fsActive) setIsActive(false)
    }
    document.addEventListener("fullscreenchange", handleFsChange)
    return () => document.removeEventListener("fullscreenchange", handleFsChange)
  }, [])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: `${selectedRoom.name} - 360° Virtual Tour`, url })
      } catch {
        try { await navigator.clipboard.writeText(url); setShowShareMenu(true); setTimeout(() => setShowShareMenu(false), 2000) } catch { alert("Link: " + url) }
      }
    } else {
      try { await navigator.clipboard.writeText(url); setShowShareMenu(true); setTimeout(() => setShowShareMenu(false), 2000) } catch { alert("Copy this link to share: " + url) }
    }
  }

  const dockButtonClass = (active?: boolean) =>
    `w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-colors ${active ? "bg-[#C9A15D]/15 text-[#C9A15D]" : "text-white/70 hover:text-white hover:bg-white/5"
    }`

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full ${isEmbedded ? "h-80 sm:h-105 md:h-125 lg:h-140" : "h-screen"} ${isFullscreen ? "h-screen" : ""
        } bg-[#0A1420] overflow-hidden rounded-2xl ring-1 ring-white/10`}
    >
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ touchAction: isActive ? "none" : "pan-y" }}
      />

      {/* Activation overlay: shown until the user clicks/taps to engage the viewer.
          This keeps the panorama "static but moving" (auto-rotate still plays)
          while letting normal page scroll pass through underneath. */}
      {!isActive && !isLoading && !loadError && (
        <div
          className="absolute inset-0 z-10 flex items-end sm:items-bottom py-6 justify-center pointer-events-none"
        >
          <span className="mb-6 sm:mb-0 flex items-center gap-2 bg-[#0A1420]/85 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full border border-[#C9A15D]/30 shadow-lg backdrop-blur-md">
            <MousePointerClick className="w-4 h-4 text-[#C9A15D]" />
            Click to look around
          </span>
        </div>
      )}

      {/* Active-state hint so users know how to get back to scrolling the page */}
      {isActive && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[#0A1420]/80 text-white/80 text-[11px] sm:text-xs px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md pointer-events-none">
          Drag to look around • Click outside to release
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A1420]/85 backdrop-blur-sm z-30">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-[3px] border-[#C9A15D] border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 text-xs tracking-[0.15em] uppercase">Loading 360° view…</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A1420]/85 backdrop-blur-sm z-30">
          <div className="flex flex-col items-center gap-2 text-center px-6">
            <p className="text-white/80 text-sm">Could not load this panorama</p>
            <p className="text-white/35 text-xs">{selectedRoom.panoramaUrl}</p>
          </div>
        </div>
      )}

      {/* Room name badge — top left */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 flex items-center gap-2 sm:gap-2.5 bg-[#0A1420]/80 backdrop-blur-md text-white pl-2 sm:pl-2.5 pr-3 sm:pr-4 py-1.5 rounded-full border border-[#C9A15D]/25 shadow-lg max-w-[55%] sm:max-w-none">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A15D] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FFC107]" />
        </span>
        <span className="text-[11px] sm:text-xs font-medium tracking-wide truncate">{selectedRoom.name}</span>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="absolute top-14 sm:top-16 left-3 sm:left-4 right-3 sm:right-auto z-20 bg-[#0A1B33]/95 border border-[#C9A15D]/20 rounded-xl shadow-2xl sm:w-72 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              <Eye className="w-4 h-4 text-[#C9A15D]" />
              Room info
            </div>
            <button onClick={() => setShowInfo(false)} className="text-white/40 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className="text-white font-medium mb-0.5">{selectedRoom.name}</p>
            </div>
            <ul className="space-y-1.5">
              {["Click the view to activate", "Drag to look around", "Click outside to release", "Click thumbnails to switch rooms"].map((tip) => (
                <li key={tip} className="flex items-center gap-2 text-xs text-white/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A15D] shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Right-side control dock */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 flex flex-col bg-[#0A1420]/80 backdrop-blur-md rounded-xl border border-white/10 shadow-lg divide-y divide-white/10 overflow-hidden">
        <button className={dockButtonClass(showInfo)} onClick={() => setShowInfo(!showInfo)} title="Room info">
          <Eye className="w-4 h-4" />
        </button>

        <div className="relative">
          <button className={dockButtonClass()} onClick={handleShare} title="Share">
            <Share2 className="w-4 h-4" />
          </button>
          {showShareMenu && (
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-[#C9A15D] text-[#0A1420] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg">
              Link copied
            </div>
          )}
        </div>

        <button className={dockButtonClass()} onClick={toggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button className={dockButtonClass()} onClick={handleResetView} title="Reset view">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Explicit exit-fullscreen button, always visible while in fullscreen,
          positioned clear of the control dock and safe-area aware on mobile. */}
      {isFullscreen && (
        <button
          className="absolute z-30 flex items-center gap-1.5 bg-[#0A1420]/90 hover:bg-[#0A1420] text-white px-3 sm:px-4 py-2 rounded-full backdrop-blur-md border border-white/15 shadow-lg transition-colors"
          style={{ top: "max(0.75rem, env(safe-area-inset-top))", left: "max(0.75rem, env(safe-area-inset-left))" }}
          onClick={toggleFullscreen}
          title="Exit fullscreen"
        >
          <X className="w-4 h-4" />
          <span className="text-xs font-medium hidden sm:inline">Exit fullscreen</span>
        </button>
      )}

      {/* Close button (modal mode) */}
      {onClose && (
        <button
          className="absolute top-3 sm:top-4 right-14 sm:right-16 z-30 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-[#0A1420]/80 hover:bg-[#0A1420] text-white rounded-full backdrop-blur-md border border-white/10 transition-colors"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}