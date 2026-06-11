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
  Expand,
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

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    console.log("[v0] Initializing Three.js panorama viewer", { width, height })
    console.log("[v0] Loading panorama:", selectedRoom.panoramaUrl)

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
      (loadedTexture) => {
        console.log("[v0] Texture loaded successfully:", selectedRoom.panoramaUrl)
        console.log("[v0] Texture size:", loadedTexture.image?.width, "x", loadedTexture.image?.height)
        setIsLoading(false)
        setLoadError(null)
      },
      (progress) => {
        console.log("[v0] Loading progress:", progress)
      },
      (error) => {
        console.error("[v0] Texture load error:", error)
        setIsLoading(false)
        setLoadError("Failed to load panorama image")
      },
    )

    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    const material = new THREE.MeshBasicMaterial({
      map: texture,
    })

    const sphere = new THREE.Mesh(geometry, material)
    sphereRef.current = sphere
    scene.add(sphere)

    const updateCameraTarget = () => {
      const phi = THREE.MathUtils.degToRad(90 - lat.current)
      const theta = THREE.MathUtils.degToRad(lon.current)

      const x = 500 * Math.sin(phi) * Math.cos(theta)
      const y = 500 * Math.cos(phi)
      const z = 500 * Math.sin(phi) * Math.sin(theta)

      camera.lookAt(x, y, z)
    }

    const onPointerDown = (event: PointerEvent) => {
      isDragging.current = true
      setIsAutoRotating(false)
      previousMousePosition.current = { x: event.clientX, y: event.clientY }
      container.style.cursor = "grabbing"
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging.current) return

      const deltaX = event.clientX - previousMousePosition.current.x
      const deltaY = event.clientY - previousMousePosition.current.y

      lon.current -= deltaX * 0.2
      lat.current += deltaY * 0.2

      lat.current = Math.max(-85, Math.min(85, lat.current))

      previousMousePosition.current = { x: event.clientX, y: event.clientY }
    }

    const onPointerUp = () => {
      isDragging.current = false
      container.style.cursor = "grab"
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const newFov = camera.fov + event.deltaY * 0.05
      camera.fov = THREE.MathUtils.clamp(newFov, 30, 100)
      camera.updateProjectionMatrix()
    }

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        isDragging.current = true
        previousMousePosition.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        }
      }
    }

    const onTouchMove = (event: TouchEvent) => {
      if (!isDragging.current || event.touches.length !== 1) return
      event.preventDefault()

      const deltaX = event.touches[0].clientX - previousMousePosition.current.x
      const deltaY = event.touches[0].clientY - previousMousePosition.current.y

      lon.current -= deltaX * 0.2
      lat.current += deltaY * 0.2
      lat.current = Math.max(-85, Math.min(85, lat.current))

      previousMousePosition.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      }
    }

    const onTouchEnd = () => {
      isDragging.current = false
    }

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
      
      // Auto-rotation when not dragging
      if (isAutoRotating && !isDragging.current) {
        lon.current += 0.1
      }
      
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
      console.log("[v0] Cleaning up Three.js")
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
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
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

  const handleCarouselPrev = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1))
  }

  const handleCarouselNext = () => {
    setCarouselIndex((prev) => Math.min(rooms.length - visibleThumbnails, prev + 1))
  }

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
        await navigator.share({
          title: `${selectedRoom.name} - 360° Virtual Tour`,
          text: `Check out this 360° view of ${selectedRoom.name}`,
          url: url,
        })
        console.log('Share successful')
      } catch (err) {
        console.log('Share cancelled:', err)
        // If share fails, copy to clipboard
        try {
          await navigator.clipboard.writeText(url)
          setShowShareMenu(true)
          setTimeout(() => setShowShareMenu(false), 2000)
        } catch (clipErr) {
          console.error('Clipboard failed:', clipErr)
          alert('Link: ' + url)
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        setShowShareMenu(true)
        setTimeout(() => setShowShareMenu(false), 2000)
      } catch (err) {
        console.error('Clipboard not available:', err)
        // Final fallback: show alert with URL
        alert('Copy this link to share: ' + url)
      }
    }
  }

  const toggleInfo = () => {
    console.log('Toggle info clicked, current state:', showInfo)
    setShowInfo(!showInfo)
  }

  return (
    <div className={`relative w-full ${isEmbedded ? "h-[600px]" : "h-screen"} bg-[#1a0a10] overflow-hidden`}>
      <div ref={containerRef} className="absolute inset-0 cursor-grab" style={{ touchAction: "none" }} />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm">Loading 360° View...</p>
          </div>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <p className="text-red-400 text-lg">Failed to load panorama</p>
            <p className="text-white/60 text-sm">Image: {selectedRoom.panoramaUrl}</p>
            <p className="text-white/40 text-xs mt-2">
              Please ensure panorama images are uploaded to the public folder
            </p>
          </div>
        </div>
      )}

      
      {showInfo && (
        <div className="absolute top-4 right-20 z-20 bg-[#1a1a1a]/95 rounded-lg overflow-hidden shadow-2xl w-80 backdrop-blur-sm animate-in fade-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="text-white text-sm font-medium">Room Information</span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="w-7 h-7 text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => setShowInfo(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <h3 className="text-white font-semibold text-lg mb-1">{selectedRoom.name}</h3>
              <p className="text-white/60 text-sm">Experience this room in stunning 360° view</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-white/80">Drag to look around</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-white/80">Scroll to zoom in/out</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-white/80">Click thumbnails to switch rooms</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <p className="text-white/40 text-xs">
                Auto-rotation is {isAutoRotating ? 'active' : 'paused'}. Start dragging to pause, click reset to resume.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-1/2 right-4 -translate-y-1/2 z-20 flex flex-col gap-2">
        <Button 
          size="icon" 
          className={`w-10 h-10 ${showInfo ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-black/60 hover:bg-black/80'} text-white rounded-lg backdrop-blur-sm transition-all`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Eye button clicked')
            toggleInfo()
          }}
          title="Room Information"
        >
          <Eye className="w-5 h-5" />
        </Button>
        
        <div className="relative">
          <Button 
            size="icon" 
            className="w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Share button clicked')
              handleShare()
            }}
            title="Share Tour"
          >
            <Share2 className="w-5 h-5" />
          </Button>
          {showShareMenu && (
            <div className="absolute right-full mr-2 top-0 bg-green-500 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
              ✓ Link copied!
            </div>
          )}
        </div>
        
        <Button
          size="icon"
          className="w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </Button>
        
        <Button
          size="icon"
          className="w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm"
          onClick={handleResetView}
          title="Reset View"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      <button
        onClick={() => setShowCarousel(!showCarousel)}
        className="absolute left-1/2 -translate-x-1/2 z-20 bg-black/60 hover:bg-black/80 text-white px-4 py-1 rounded-full backdrop-blur-sm transition-all"
        style={{ bottom: showCarousel ? "140px" : "20px" }}
      >
        {showCarousel ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </button>

      {showCarousel && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-4">
          <div className="flex items-center justify-center gap-2 px-4">
            <Button
              size="icon"
              className="w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm shrink-0"
              onClick={handleCarouselPrev}
              disabled={carouselIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex gap-3 overflow-hidden">
              {rooms.slice(carouselIndex, carouselIndex + visibleThumbnails).map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleRoomChange(room)}
                  className={`relative shrink-0 rounded-xl overflow-hidden transition-all ${
                    selectedRoom.id === room.id
                      ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-black"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="relative w-32 h-20">
                    <Image src={room.thumbnail || "/placeholder.svg"} alt={room.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  </div>
                  <div className="absolute top-1 left-1 right-1">
                    <span className="text-white text-xs font-medium drop-shadow-lg line-clamp-1">{room.name}</span>
                  </div>
                </button>
              ))}
            </div>

            <Button
              size="icon"
              className="w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm shrink-0"
              onClick={handleCarouselNext}
              disabled={carouselIndex >= rooms.length - visibleThumbnails}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {onClose && (
        <Button
          size="icon"
          className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      )}
    </div>
  )
}