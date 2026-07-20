"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import {
  Maximize2,
  Minimize2,
  Share2,
  X,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  type LucideIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import * as THREE from "three"

interface RoomScene {
  id: string
  name: string
  /** Short blurb shown in the "Room info" panel and (truncated) in the switcher. */
  description?: string
  /** Bullet list of amenities/highlights shown in the "Room info" panel. */
  features?: string[]
  panoramaUrl: string
  /** IDs of other rooms this room has a walkable hotspot connection to. */
  connectsTo?: string[]
  thumbnailUrl?: string
}

interface BuildingTab {
  id: string
  label: string
  icon: LucideIcon
}

interface Immersive360TourProps {
  /** Rooms shown in the bottom-center switcher (kept short, e.g. 4-5 rooms). */
  rooms: RoomScene[]
  /**
   * Full set of rooms for this building, used to resolve hotspot targets
   * (e.g. hallways) that aren't part of the featured switcher list. Falls
   * back to `rooms` if not provided.
   */
  allRooms?: RoomScene[]
  initialRoomId?: string
  onClose?: () => void
  isEmbedded?: boolean
  /** Optional building switcher, rendered top-left inside the viewer. */
  buildingTabs?: BuildingTab[]
  activeBuildingId?: string
  onSwitchBuilding?: (id: string) => void
}

interface Hotspot {
  targetId: string
  targetName: string
  lon: number // degrees, horizontal position on the sphere
  lat: number // degrees, vertical position on the sphere
}

const HOTSPOT_LAT = -12 // slightly below eye-level, like a floor-directed arrow

/** Evenly distribute hotspots for a room's connections around the horizon. */
function computeHotspots(room: RoomScene, allRooms: RoomScene[]): Hotspot[] {
  const targets = (room.connectsTo || [])
    .map((id) => allRooms.find((r) => r.id === id))
    .filter((r): r is RoomScene => Boolean(r))

  if (targets.length === 0) return []

  const spread = 360 / targets.length
  return targets.map((target, i) => ({
    targetId: target.id,
    targetName: target.name,
    lon: i * spread,
    lat: HOTSPOT_LAT,
  }))
}

export function Immersive360Tour({
  rooms,
  allRooms,
  initialRoomId,
  onClose,
  isEmbedded = false,
  buildingTabs,
  activeBuildingId,
  onSwitchBuilding,
}: Immersive360TourProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const hotspotLayerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const sphereRef = useRef<THREE.Mesh | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const isDragging = useRef<boolean>(false)
  const didDrag = useRef<boolean>(false)
  // Pending timeout used to clear `didDrag` shortly after a drag ends, so it
  // only suppresses the click that immediately follows a drag-release
  // instead of permanently blocking hotspot clicks afterward.
  const didDragResetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const lon = useRef<number>(0)
  const lat = useRef<number>(0)

  // Full room graph used for resolving hotspot targets (may include rooms,
  // like hallways, that aren't part of the featured switcher list).
  const roomGraph = useMemo(() => (allRooms && allRooms.length > 0 ? allRooms : rooms), [allRooms, rooms])

  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    initialRoomId && roomGraph.find((r) => r.id === initialRoomId) ? initialRoomId : rooms[0]?.id
  )

  // The room currently being viewed — resolved against the full graph so a
  // hotspot can take the visitor into a room outside the featured list.
  const selectedRoom = useMemo(
    () => roomGraph.find((r) => r.id === selectedRoomId) || rooms[0] || roomGraph[0],
    [roomGraph, rooms, selectedRoomId]
  )

  // Index within the *switcher* list. If the current room isn't part of the
  // switcher (e.g. a hallway reached via hotspot), this is -1 and prev/next
  // navigation wraps to the start of the featured list instead.
  const selectedRoomIndex = useMemo(
    () => rooms.findIndex((r) => r.id === selectedRoom.id),
    [rooms, selectedRoom]
  )

  // Keep the internally-selected room in sync if the parent hands us a new
  // initialRoomId (e.g. the user picked a different room from outside).
  useEffect(() => {
    if (initialRoomId && roomGraph.find((r) => r.id === initialRoomId)) {
      setSelectedRoomId(initialRoomId)
    }
  }, [initialRoomId, roomGraph])

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  // Whether the bottom-center room switcher panel is expanded. The user can
  // collapse it (e.g. to see more of the panorama) and reopen it via a
  // small pill button that stays in its place.
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(true)

  // Forces a re-render each frame-ish so hotspot screen positions track the camera.
  const [, forceHotspotUpdate] = useState(0)

  const hotspots = useMemo(() => computeHotspots(selectedRoom, roomGraph), [selectedRoom, roomGraph])

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

    // Reset the look direction whenever we load a new room's panorama so
    // hotspots and framing start from a consistent, predictable position.
    lon.current = 0
    lat.current = 0

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
      if (!isActiveRef.current) {
        setIsActive(true)
        isActiveRef.current = true // sync immediately, don't wait for useEffect
      }
      // Starting a new drag gesture cancels any pending didDrag reset from
      // a previous gesture and clears the flag immediately.
      if (didDragResetTimeout.current) {
        clearTimeout(didDragResetTimeout.current)
        didDragResetTimeout.current = null
      }
      isDragging.current = true
      didDrag.current = false
      setIsAutoRotating(false)
      previousMousePosition.current = { x: event.clientX, y: event.clientY }
      container.style.cursor = "grabbing"
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging.current || !isActiveRef.current) return
      const dx = event.clientX - previousMousePosition.current.x
      const dy = event.clientY - previousMousePosition.current.y
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true
      lon.current -= dx * 0.2
      lat.current += dy * 0.2
      lat.current = Math.max(-85, Math.min(85, lat.current))
      previousMousePosition.current = { x: event.clientX, y: event.clientY }
    }

    const onPointerUp = () => {
      isDragging.current = false
      container.style.cursor = "grab"
      // Only suppress the click that immediately follows a drag-release —
      // hotspot buttons live outside this container, so without this reset
      // `didDrag` would stay `true` forever after the first drag and every
      // subsequent hotspot click would silently no-op.
      if (didDragResetTimeout.current) clearTimeout(didDragResetTimeout.current)
      didDragResetTimeout.current = setTimeout(() => {
        didDrag.current = false
        didDragResetTimeout.current = null
      }, 0)
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
        if (didDragResetTimeout.current) {
          clearTimeout(didDragResetTimeout.current)
          didDragResetTimeout.current = null
        }
        isDragging.current = true
        didDrag.current = false
        previousMousePosition.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
      }
    }

    const onTouchMove = (event: TouchEvent) => {
      if (!isDragging.current || !isActiveRef.current || event.touches.length !== 1) return
      event.preventDefault()
      const dx = event.touches[0].clientX - previousMousePosition.current.x
      const dy = event.touches[0].clientY - previousMousePosition.current.y
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true
      lon.current -= dx * 0.2
      lat.current += dy * 0.2
      lat.current = Math.max(-85, Math.min(85, lat.current))
      previousMousePosition.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
    }

    const onTouchEnd = () => {
      isDragging.current = false
      // Same reasoning as onPointerUp above — clear didDrag shortly after
      // release instead of leaving it stuck on `true`.
      if (didDragResetTimeout.current) clearTimeout(didDragResetTimeout.current)
      didDragResetTimeout.current = setTimeout(() => {
        didDrag.current = false
        didDragResetTimeout.current = null
      }, 0)
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
      // Keep it "static but moving": auto-rotate continues regardless of
      // activation state, but stops while the user is actively dragging.
      if (isAutoRotating && !isDragging.current) lon.current += 0.1
      updateCameraTarget()
      renderer.render(scene, camera)
      // Cheap-ish: only trigger a React re-render every few frames to
      // reposition hotspot overlays without hammering the render loop.
      forceHotspotUpdate((n) => (n + 1) % 1000000)
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
      if (didDragResetTimeout.current) clearTimeout(didDragResetTimeout.current)
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

  const handleResetView = () => {
    lon.current = 0
    lat.current = 0
    setIsAutoRotating(true)
    if (cameraRef.current) {
      cameraRef.current.fov = 75
      cameraRef.current.updateProjectionMatrix()
    }
  }

  const navigateToRoom = (roomId: string) => {
    if (roomId === selectedRoom.id) return
    setSelectedRoomId(roomId)
    setIsAutoRotating(true)
  }

  const goToPrevRoom = () => {
    if (rooms.length < 2) return
    // If we're currently outside the featured list (e.g. in a hallway),
    // step back into the list from its start.
    const baseIndex = selectedRoomIndex === -1 ? 0 : selectedRoomIndex
    const prevIndex = (baseIndex - 1 + rooms.length) % rooms.length
    navigateToRoom(rooms[prevIndex].id)
  }

  const goToNextRoom = () => {
    if (rooms.length < 2) return
    const baseIndex = selectedRoomIndex === -1 ? -1 : selectedRoomIndex
    const nextIndex = (baseIndex + 1 + rooms.length) % rooms.length
    navigateToRoom(rooms[nextIndex].id)
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
      document.exitFullscreen?.().catch(() => { })
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

  // Project a hotspot's (lon, lat) onto 2D screen space based on the current
  // camera orientation, so it visually sits on the sphere surface.
  const projectHotspot = (hs: Hotspot): { x: number; y: number; visible: boolean } | null => {
    const camera = cameraRef.current
    const container = containerRef.current
    if (!camera || !container) return null

    const phi = THREE.MathUtils.degToRad(90 - hs.lat)
    const theta = THREE.MathUtils.degToRad(hs.lon)
    const point = new THREE.Vector3(
      500 * Math.sin(phi) * Math.cos(theta),
      500 * Math.cos(phi),
      500 * Math.sin(phi) * Math.sin(theta),
    )

    const projected = point.clone().project(camera)

    // Behind the camera → not visible.
    const camDir = new THREE.Vector3()
    camera.getWorldDirection(camDir)
    const toPoint = point.clone().normalize()
    const facing = camDir.dot(toPoint)
    if (facing < 0.15) return { x: 0, y: 0, visible: false }

    const rect = container.getBoundingClientRect()
    const x = (projected.x * 0.5 + 0.5) * rect.width
    const y = (-projected.y * 0.5 + 0.5) * rect.height
    return { x, y, visible: true }
  }

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full ${isEmbedded ? "h-105 sm:h-130 md:h-150 lg:h-160" : "h-screen"} ${isFullscreen ? "h-screen" : ""
        } bg-[#0A1420] overflow-hidden ring-1 ring-white/10`}
    >
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ touchAction: isActive ? "none" : "pan-y" }}
      />

      {/* Hotspot layer: arrows/markers linking to connected rooms, positioned
          over the 3D sphere surface based on current camera orientation. */}
      <div ref={hotspotLayerRef} className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {!isLoading && !loadError && hotspots.map((hs) => {
          const pos = projectHotspot(hs)
          if (!pos || !pos.visible) return null
          return (
            <button
              key={hs.targetId}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center gap-1.5 group"
              style={{ left: pos.x, top: pos.y }}
              onClick={(e) => {
                e.stopPropagation()
                // Ignore clicks that are really the tail end of a drag gesture.
                if (didDrag.current) return
                navigateToRoom(hs.targetId)
              }}
              title={`Go to ${hs.targetName}`}
            >
              <span className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-[#C9A15D]/30 animate-ping" />
                <span className="relative flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#0A1420]/85 border-2 border-[#C9A15D] shadow-lg backdrop-blur-md transition-transform group-hover:scale-110">
                  <ChevronUp className="w-8 h-8 text-[#C9A15D]" />
                </span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#0A1420]/90 border border-[#C9A15D]/25 text-white text-[10px] sm:text-xs font-medium whitespace-nowrap shadow-md">
                {hs.targetName}
              </span>
            </button>
          )
        })}
      </div>

      {/* Building switcher — top-left overlay, inside the view */}
      {buildingTabs && buildingTabs.length > 0 && (
        <div
          className="absolute z-20 inline-flex p-1 bg-[#0A1420]/80 backdrop-blur-md rounded-xl border border-white/10 shadow-lg"
          style={{ top: "max(0.75rem, env(safe-area-inset-top))", left: "max(0.75rem, env(safe-area-inset-left))" }}
        >
          {buildingTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSwitchBuilding?.(tab.id)}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-semibold transition-colors ${activeBuildingId === tab.id ? "text-white" : "text-white/50 hover:text-white/80"
                }`}
            >
              {activeBuildingId === tab.id && (
                <motion.span
                  layoutId="activeBuildingTabViewer"
                  className="absolute inset-0 bg-[#C9A15D]/90 rounded-lg shadow-sm"
                  transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                />
              )}
              <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
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

      {/* Info panel */}
      {showInfo && (
        <div className="absolute top-16 left-18 z-20 bg-[#0A1B33]/95 border border-[#C9A15D]/20 rounded-xl shadow-2xl sm:w-82 backdrop-blur-md max-h-[70%] overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              <p className="text-white font-semibold mb-1 text-xl">{selectedRoom.name}</p>
            </div>
            <button onClick={() => setShowInfo(false)} className="text-white/40 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              
              {selectedRoom.description && (
                <p className="text-white/60 text-sm leading-relaxed">{selectedRoom.description}</p>
              )}
            </div>

            {selectedRoom.features && selectedRoom.features.length > 0 && (
              <ul className="space-y-1.5">
                {selectedRoom.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A15D] shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Left-side control dock: Exit fullscreen (when active), Room info, Share, Full screen, Reset view.
          Sits below the building switcher (when present) so the two overlays never collide. */}
      <div
        className="absolute z-20 flex flex-col bg-[#0A1420]/80 backdrop-blur-md rounded-xl border border-white/10 shadow-lg divide-y divide-white/10 overflow-hidden"
        style={{
          top:
            buildingTabs && buildingTabs.length > 0
              ? "calc(max(0.75rem, env(safe-area-inset-top)) + 3.25rem)"
              : "max(0.75rem, env(safe-area-inset-top))",
          left: "max(0.75rem, env(safe-area-inset-left))",
        }}
      >
        {isFullscreen && (
          <button className={dockButtonClass()} onClick={toggleFullscreen} title="Exit fullscreen">
            <X className="w-4 h-4" />
          </button>
        )}

        <button className={dockButtonClass(showInfo)} onClick={() => setShowInfo(!showInfo)} title="Room info">
          <Eye className="w-4 h-4" />
        </button>

        <div className="relative">
          <button className={dockButtonClass()} onClick={handleShare} title="Share">
            <Share2 className="w-4 h-4" />
          </button>
          {showShareMenu && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#C9A15D] text-[#0A1420] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg">
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

      {/* Close button (modal mode) — stays top-right now that the dock has moved left */}
      {onClose && (
        <button
          className="absolute top-3 sm:top-4 right-3 sm:right-4 z-30 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-[#0A1420]/80 hover:bg-[#0A1420] text-white rounded-full backdrop-blur-md border border-white/10 transition-colors"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Room Switcher */}
      {rooms.length > 1 && !isLoading && (
        <AnimatePresence initial={false} mode="popLayout">
          {isSwitcherOpen ? (
            <motion.div
              key="switcher-open"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-[min(90vw,21rem)] rounded-t-2xl border border-b-0 border-white/10 bg-[#0A1420]/90 backdrop-blur-3xl shadow-2xl"
            >
              <button
                onClick={() => setIsSwitcherOpen(false)}
                className="group flex w-full items-center justify-center py-2"
                title="Hide room switcher"
              >
                <span className="h-1 w-9 rounded-full bg-white/20 transition-colors group-hover:bg-[#C9A15D]/70" />
              </button>

              <div className="flex items-center gap-2 px-3 pb-3">
                <button
                  onClick={goToPrevRoom}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                  title="Previous room"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <div
                  className="relative flex-1 h-14 sm:h-30 rounded-xl overflow-hidden bg-cover bg-center"
                  style={{ backgroundImage: `url(${selectedRoom.thumbnailUrl || selectedRoom.panoramaUrl})` }}
                >
                  <div className="absolute inset-0 bg-linear-to-t from-[#0A1420]/95 via-[#0A1420]/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 px-2.5 py-1.5">
                    <span className="text-sm md:text-lg font-semibold text-white truncate">
                      {selectedRoom.name}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-white/60 tabular-nums shrink-0">
                      {(selectedRoomIndex === -1 ? 1 : selectedRoomIndex + 1)}/{rooms.length}
                    </span>
                  </div>
                </div>

                <button
                  onClick={goToNextRoom}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                  title="Next room"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 pb-3">
                {rooms.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => navigateToRoom(r.id)}
                    className={`h-1.5 rounded-full transition-all ${
                      r.id === selectedRoom.id ? "w-5 bg-[#C9A15D]" : "w-1.5 bg-white/25 hover:bg-white/40"
                    }`}
                    title={r.name}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="switcher-closed"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              onClick={() => setIsSwitcherOpen(true)}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 rounded-t-2xl border border-b-0 border-white/10 bg-[#0A1420]/90 backdrop-blur-3xl px-5 pt-2 pb-3 shadow-lg text-white/70 hover:text-white transition-colors"
              title="Show room switcher"
            >
              <span className="h-1 w-9 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="truncate max-w-28 sm:max-w-40 text-lg">{selectedRoom.name}</span>
                <span className="text-white/30">·</span>
                <span className="text-white/40 tabular-nums text-md">
                  {(selectedRoomIndex === -1 ? 1 : selectedRoomIndex + 1)}/{rooms.length}
                </span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}