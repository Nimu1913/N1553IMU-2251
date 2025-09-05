import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, Maximize, Settings, Palette, Wheel } from 'lucide-react';

interface VehicleViewer3DProps {
  vehicleData?: {
    make: string;
    model: string;
    year: number;
    color?: string;
  };
  className?: string;
}

export default function VehicleViewer3D({ vehicleData, className = "" }: VehicleViewer3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const carGroupRef = useRef<THREE.Group>();
  const animationRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const [showControls, setShowControls] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const colors = [
    { name: 'Racing Red', value: '#ff0000' },
    { name: 'Ocean Blue', value: '#0066cc' },
    { name: 'Midnight Black', value: '#1a1a1a' },
    { name: 'Pearl White', value: '#f8f8ff' },
    { name: 'Silver Metallic', value: '#c0c0c0' },
    { name: 'Forest Green', value: '#228B22' },
    { name: 'Sunset Orange', value: '#ff6600' },
    { name: 'Royal Purple', value: '#6a0dad' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(5, 3, 8);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 300);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Rim lighting
    const rimLight1 = new THREE.DirectionalLight(0x00aaff, 0.3);
    rimLight1.position.set(-10, 5, -5);
    scene.add(rimLight1);

    const rimLight2 = new THREE.DirectionalLight(0xff00aa, 0.2);
    rimLight2.position.set(10, -5, 5);
    scene.add(rimLight2);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.3
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create car group
    const carGroup = new THREE.Group();
    carGroupRef.current = carGroup;
    scene.add(carGroup);

    // Create a simplified car mesh
    createCarMesh(carGroup, currentColor);

    setIsLoading(false);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (autoRotate && carGroup) {
        carGroup.rotation.y += 0.01;
      }

      // Add subtle floating animation
      if (carGroup) {
        carGroup.position.y = Math.sin(Date.now() * 0.002) * 0.1;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (mountRef.current && renderer && camera) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      setAutoRotate(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && carGroup) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        carGroup.rotation.y += deltaX * 0.01;
        carGroup.rotation.x += deltaY * 0.01;

        // Limit vertical rotation
        carGroup.rotation.x = Math.max(-0.5, Math.min(0.5, carGroup.rotation.x));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (camera) {
        camera.position.z += e.deltaY * 0.01;
        camera.position.z = Math.max(3, Math.min(15, camera.position.z));
      }
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      
      resizeObserver.disconnect();
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update car color
  useEffect(() => {
    if (carGroupRef.current) {
      updateCarColor(carGroupRef.current, currentColor);
    }
  }, [currentColor]);

  const createCarMesh = (parent: THREE.Group, color: string) => {
    // Car body
    const bodyGeometry = new THREE.BoxGeometry(4, 1.2, 1.8);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.8,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    body.castShadow = true;
    parent.add(body);

    // Car cabin
    const cabinGeometry = new THREE.BoxGeometry(2.5, 1, 1.6);
    const cabinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x222222,
      metalness: 0.1,
      roughness: 0.9,
      transparent: true,
      opacity: 0.8
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 1.6, 0);
    cabin.castShadow = true;
    parent.add(cabin);

    // Windows
    const windowMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x87ceeb,
      metalness: 0,
      roughness: 0.05,
      transparent: true,
      opacity: 0.3,
      transmission: 0.9,
      thickness: 0.1
    });

    // Front windshield
    const windshieldGeometry = new THREE.PlaneGeometry(1.8, 0.8);
    const windshield = new THREE.Mesh(windshieldGeometry, windowMaterial);
    windshield.position.set(1, 1.6, 0.8);
    windshield.rotation.x = -0.2;
    parent.add(windshield);

    // Side windows
    const sideWindowGeometry = new THREE.PlaneGeometry(1.5, 0.6);
    const leftWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
    leftWindow.position.set(0.2, 1.7, 0.8);
    leftWindow.rotation.y = 0.1;
    parent.add(leftWindow);

    const rightWindow = leftWindow.clone();
    rightWindow.position.z = -0.8;
    rightWindow.rotation.y = -0.1;
    parent.add(rightWindow);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel1.position.set(1.2, 0.4, 1);
    wheel1.rotation.z = Math.PI / 2;
    wheel1.castShadow = true;
    parent.add(wheel1);

    const wheel2 = wheel1.clone();
    wheel2.position.x = -1.2;
    parent.add(wheel2);

    const wheel3 = wheel1.clone();
    wheel3.position.set(1.2, 0.4, -1);
    parent.add(wheel3);

    const wheel4 = wheel1.clone();
    wheel4.position.set(-1.2, 0.4, -1);
    parent.add(wheel4);

    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const headlightMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffaa,
      emissive: 0x444400
    });
    
    const headlight1 = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight1.position.set(1.9, 0.8, 0.6);
    parent.add(headlight1);

    const headlight2 = headlight1.clone();
    headlight2.position.z = -0.6;
    parent.add(headlight2);

    // Taillights
    const taillightMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff2222,
      emissive: 0x440000
    });
    
    const taillight1 = new THREE.Mesh(headlightGeometry, taillightMaterial);
    taillight1.position.set(-1.9, 0.8, 0.6);
    parent.add(taillight1);

    const taillight2 = taillight1.clone();
    taillight2.position.z = -0.6;
    parent.add(taillight2);
  };

  const updateCarColor = (carGroup: THREE.Group, color: string) => {
    carGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
        if (child.material.metalness > 0.5) { // Car body material
          child.material.color.setHex(parseInt(color.replace('#', '0x')));
        }
      }
    });
  };

  const resetView = () => {
    if (cameraRef.current && carGroupRef.current) {
      cameraRef.current.position.set(5, 3, 8);
      carGroupRef.current.rotation.set(0, 0, 0);
      setAutoRotate(true);
    }
  };

  const toggleFullscreen = () => {
    if (mountRef.current) {
      if (!document.fullscreenElement) {
        mountRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className={`relative bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden ${className}`}>
      {/* 3D Viewer */}
      <div 
        ref={mountRef} 
        className="w-full h-full min-h-[400px] cursor-grab active:cursor-grabbing"
        style={{ background: 'linear-gradient(45deg, #0a0a0a, #1a1a2e, #16213e)' }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-white">Loading 3D Model...</p>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => setShowControls(!showControls)}
          className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white transition-colors"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={resetView}
          className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white transition-colors"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white transition-colors"
        >
          <Maximize size={16} />
        </button>
      </div>

      {/* Vehicle info */}
      {vehicleData && (
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
          <h3 className="text-white font-bold">
            {vehicleData.year} {vehicleData.make} {vehicleData.model}
          </h3>
          <p className="text-white/70 text-sm">Interactive 3D View</p>
        </div>
      )}

      {/* Color picker panel */}
      {showControls && (
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-xl p-4 max-w-xs">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette size={16} className="text-white" />
              <h4 className="text-white font-semibold">Customize Color</h4>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setCurrentColor(color.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    currentColor === color.value ? 'border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                  className="rounded"
                />
                <span className="text-white text-sm">Auto Rotate</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
        <p className="text-white/70 text-xs">
          Drag to rotate • Scroll to zoom • Click settings for options
        </p>
      </div>
    </div>
  );
}