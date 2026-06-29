"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  Maximize2,
  Minimize2,
  Share2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import * as THREE from "three"
import Image from "next/image"

interface RoomScene {
  id: string
  name: string
  panoramaUrl: string
  thumbnail: string
}

interface Immersive360TourProps {
  rooms: RoomScene[]
  initialRoomId?: string
  onClose?: () => void
  isEmbedded?: boolean
}

export function Immersive360Tour({ rooms, initialRoomId, onClose, isEmbedded = false }: Immersive360TourProps) {
  const containerRef = useRef<HTMLDivElement>(null)
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
  const [showCarousel, setShowCarousel] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const visibleThumbnails = 5
  const carouselRef = useRef<HTMLDivElement>(null)
  const ITEM_WIDTH = 172

  const maxIndex = Math.max(0, rooms.length - visibleThumbnails)

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

    const onPointerDown = (event: PointerEvent) => {
      isDragging.current = true
      setIsAutoRotating(false)
      previousMousePosition.current = { x: event.clientX, y: event.clientY }
      container.style.cursor = "grabbing"
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging.current) return
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
      event.preventDefault()
      camera.fov = THREE.MathUtils.clamp(camera.fov + event.deltaY * 0.05, 30, 100)
      camera.updateProjectionMatrix()
    }

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        isDragging.current = true
        previousMousePosition.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
      }
    }

    const onTouchMove = (event: TouchEvent) => {
      if (!isDragging.current || event.touches.length !== 1) return
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

  const handleRoomChange = useCallback((room: RoomScene) => {
    setSelectedRoom(room)
    lon.current = 0
    lat.current = 0
    setIsAutoRotating(true)
  }, [])

  const handleResetView = () => {
    lon.current = 0
    lat.current = 0
    setIsAutoRotating(true)
    if (cameraRef.current) {
      cameraRef.current.fov = 75
      cameraRef.current.updateProjectionMatrix()
    }
  }

  const handleCarouselNext = () => setCarouselIndex((prev) => Math.min(prev + 1, maxIndex))
  const handleCarouselPrev = () => setCarouselIndex((prev) => Math.max(prev - 1, 0))

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.parentElement?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

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

  return (
    <div className={`relative w-full ${isEmbedded ? "h-[560px]" : "h-screen"} bg-[#0f172a] overflow-hidden rounded-2xl`}>
      <div ref={containerRef} className="absolute inset-0 cursor-grab" style={{ touchAction: "none" }} />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-[3px] border-[#1B3A8C] border-t-transparent rounded-full animate-spin" />
            <p className="text-white/70 text-sm tracking-wide">Loading 360° view…</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
          <div className="flex flex-col items-center gap-2 text-center px-6">
            <p className="text-white/80">Could not load this panorama</p>
            <p className="text-white/40 text-xs">{selectedRoom.panoramaUrl}</p>
          </div>
        </div>
      )}

      {/* Room name badge — top left */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        {selectedRoom.name}
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#0f172a]/95 border border-white/10 rounded-xl shadow-2xl w-72 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              <Eye className="w-4 h-4 text-cyan-400" />
              Room info
            </div>
            <button onClick={() => setShowInfo(false)} className="text-white/40 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className="text-white font-medium mb-0.5">{selectedRoom.name}</p>
              <p className="text-white/50 text-xs">360° interactive view</p>
            </div>
            <ul className="space-y-1.5">
              {["Drag to look around", "Scroll to zoom in/out", "Click thumbnails to switch rooms"].map((tip) => (
                <li key={tip} className="flex items-center gap-2 text-xs text-white/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
            <p className="text-white/30 text-xs pt-2 border-t border-white/10">
              Auto-rotation is {isAutoRotating ? "active" : "paused"}
            </p>
          </div>
        </div>
      )}

      {/* Right-side controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <Button
          size="icon"
          className={`w-9 h-9 rounded-lg backdrop-blur-sm border border-white/10 text-white transition-all ${showInfo ? "bg-[#1B3A8C]" : "bg-black/50 hover:bg-black/70"}`}
          onClick={() => setShowInfo(!showInfo)}
          title="Room info"
        >
          <Eye className="w-4 h-4" />
        </Button>

        <div className="relative">
          <Button
            size="icon"
            className="w-9 h-9 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/10 text-white"
            onClick={handleShare}
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          {showShareMenu && (
            <div className="absolute right-full mr-2 top-0 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-lg">
              ✓ Link copied
            </div>
          )}
        </div>

        <Button
          size="icon"
          className="w-9 h-9 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/10 text-white"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>

        <Button
          size="icon"
          className="w-9 h-9 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/10 text-white"
          onClick={handleResetView}
          title="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Carousel toggle */}
      <button
        onClick={() => setShowCarousel(!showCarousel)}
        className="absolute left-1/2 -translate-x-1/2 z-20 bg-black/50 hover:bg-black/70 text-white px-4 py-1 rounded-full backdrop-blur-sm border border-white/10 transition-all"
        style={{ bottom: showCarousel ? "132px" : "16px" }}
      >
        {showCarousel ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {/* Thumbnail carousel */}
      {showCarousel && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent pt-10 pb-4 px-4">
          <div className="relative flex items-center">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCarouselPrev}
              disabled={carouselIndex === 0}
              className="absolute left-0 z-10 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-20 flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="overflow-hidden mx-10">
              <div
                ref={carouselRef}
                className="flex gap-2.5 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${carouselIndex * ITEM_WIDTH}px)` }}
              >
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => handleRoomChange(room)}
                    className={`relative w-40 flex-shrink-0 overflow-hidden rounded-xl transition-all duration-200 ${
                      selectedRoom.id === room.id
                        ? "ring-2 ring-cyan-400 scale-[1.03]"
                        : "opacity-60 hover:opacity-90 hover:scale-[1.02]"
                    }`}
                  >
                    <div className="relative h-[72px] w-full">
                      <Image src={room.thumbnail} alt={room.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>
                    <span className="absolute bottom-1.5 left-2 right-2 text-[11px] font-medium text-white line-clamp-1 text-left">
                      {room.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={handleCarouselNext}
              disabled={carouselIndex === maxIndex}
              className="absolute right-0 z-10 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-20 flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Close button (modal mode) */}
      {onClose && (
        <Button
          size="icon"
          className="absolute top-4 right-4 z-30 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm border border-white/10"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}