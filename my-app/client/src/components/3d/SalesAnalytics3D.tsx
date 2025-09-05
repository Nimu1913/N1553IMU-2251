import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { TrendingUp, Calendar, Target, Award } from 'lucide-react';

interface SalesData {
  month: string;
  sales: number;
  revenue: number;
  leads: number;
}

interface SalesAnalytics3DProps {
  data?: SalesData[];
  className?: string;
}

const defaultData: SalesData[] = [
  { month: 'Jan', sales: 24, revenue: 1200000, leads: 180 },
  { month: 'Feb', sales: 31, revenue: 1550000, leads: 220 },
  { month: 'Mar', sales: 18, revenue: 900000, leads: 150 },
  { month: 'Apr', sales: 42, revenue: 2100000, leads: 280 },
  { month: 'May', sales: 35, revenue: 1750000, leads: 240 },
  { month: 'Jun', sales: 28, revenue: 1400000, leads: 200 },
  { month: 'Jul', sales: 50, revenue: 2500000, leads: 320 },
  { month: 'Aug', sales: 45, revenue: 2250000, leads: 300 },
  { month: 'Sep', sales: 38, revenue: 1900000, leads: 260 },
  { month: 'Oct', sales: 55, revenue: 2750000, leads: 350 },
  { month: 'Nov', sales: 62, revenue: 3100000, leads: 380 },
  { month: 'Dec', sales: 48, revenue: 2400000, leads: 290 }
];

export default function SalesAnalytics3D({ data = defaultData, className = "" }: SalesAnalytics3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationRef = useRef<number>();
  const barsRef = useRef<THREE.Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'revenue' | 'leads'>('sales');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f23);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(15, 10, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 300);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(20, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Colored accent lights
    const accentLight1 = new THREE.DirectionalLight(0x00aaff, 0.3);
    accentLight1.position.set(-20, 15, -10);
    scene.add(accentLight1);

    const accentLight2 = new THREE.DirectionalLight(0xff6600, 0.2);
    accentLight2.position.set(20, -10, 15);
    scene.add(accentLight2);

    // Grid floor
    const gridHelper = new THREE.GridHelper(30, 20, 0x444444, 0x222222);
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // Ground plane for shadows
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create initial bars
    createBars(scene, data, selectedMetric);

    setIsLoading(false);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Smooth camera movement
      const time = Date.now() * 0.001;
      camera.position.x = Math.cos(time * 0.1) * 25;
      camera.position.z = Math.sin(time * 0.1) * 25;
      camera.lookAt(0, 2, 0);

      // Animate bars
      barsRef.current.forEach((barGroup, index) => {
        if (barGroup) {
          const bar = barGroup.children[0] as THREE.Mesh;
          if (bar) {
            // Floating animation
            bar.position.y = Math.sin(time * 2 + index * 0.3) * 0.1;
            
            // Highlight hovered bar
            if (hoveredBar === index) {
              bar.scale.x = 1.1;
              bar.scale.z = 1.1;
            } else {
              bar.scale.x = 1;
              bar.scale.z = 1;
            }
          }
        }
      });

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

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      
      const intersectable = barsRef.current.map(group => group.children[0]).filter(Boolean);
      const intersects = raycaster.intersectObjects(intersectable);

      if (intersects.length > 0) {
        const index = barsRef.current.findIndex(group => 
          group.children[0] === intersects[0].object
        );
        setHoveredBar(index);
      } else {
        setHoveredBar(null);
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update bars when metric changes
  useEffect(() => {
    if (sceneRef.current) {
      updateBars(sceneRef.current, data, selectedMetric);
    }
  }, [selectedMetric, data]);

  const createBars = (scene: THREE.Scene, chartData: SalesData[], metric: string) => {
    // Clear existing bars
    barsRef.current.forEach(barGroup => {
      scene.remove(barGroup);
    });
    barsRef.current = [];

    const maxValue = Math.max(...chartData.map(d => getMetricValue(d, metric)));
    const barWidth = 1.2;
    const barSpacing = 2;

    chartData.forEach((item, index) => {
      const barGroup = new THREE.Group();
      
      const value = getMetricValue(item, metric);
      const normalizedHeight = (value / maxValue) * 8;
      
      // Create bar geometry
      const barGeometry = new THREE.BoxGeometry(barWidth, normalizedHeight, barWidth);
      const barMaterial = new THREE.MeshPhysicalMaterial({
        color: getMetricColor(metric),
        metalness: 0.3,
        roughness: 0.4,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.9
      });
      
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.position.y = normalizedHeight / 2;
      bar.castShadow = true;
      bar.receiveShadow = true;
      barGroup.add(bar);
      
      // Add glow effect
      const glowGeometry = new THREE.BoxGeometry(barWidth * 1.1, normalizedHeight * 1.1, barWidth * 1.1);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: getMetricColor(metric),
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.y = normalizedHeight / 2;
      barGroup.add(glow);
      
      // Position bar
      const x = (index - (chartData.length - 1) / 2) * barSpacing;
      barGroup.position.x = x;
      
      // Add month label (3D text would require additional setup)
      const labelGeometry = new THREE.PlaneGeometry(1, 0.5);
      const labelMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(x, -0.5, 0);
      label.rotation.x = -Math.PI / 2;
      scene.add(label);
      
      scene.add(barGroup);
      barsRef.current.push(barGroup);
    });
  };

  const updateBars = (scene: THREE.Scene, chartData: SalesData[], metric: string) => {
    const maxValue = Math.max(...chartData.map(d => getMetricValue(d, metric)));
    const color = getMetricColor(metric);

    barsRef.current.forEach((barGroup, index) => {
      const bar = barGroup.children[0] as THREE.Mesh;
      const glow = barGroup.children[1] as THREE.Mesh;
      
      if (bar && bar.material instanceof THREE.MeshPhysicalMaterial) {
        bar.material.color.setHex(parseInt(color.replace('#', '0x')));
      }
      
      if (glow && glow.material instanceof THREE.MeshBasicMaterial) {
        glow.material.color.setHex(parseInt(color.replace('#', '0x')));
      }

      // Animate height change
      const value = getMetricValue(chartData[index], metric);
      const targetHeight = (value / maxValue) * 8;
      
      // Simple height animation (in a real app, you'd use a tween library)
      if (bar.geometry instanceof THREE.BoxGeometry) {
        bar.geometry.dispose();
        bar.geometry = new THREE.BoxGeometry(1.2, targetHeight, 1.2);
        bar.position.y = targetHeight / 2;
      }
      
      if (glow.geometry instanceof THREE.BoxGeometry) {
        glow.geometry.dispose();
        glow.geometry = new THREE.BoxGeometry(1.32, targetHeight * 1.1, 1.32);
        glow.position.y = targetHeight / 2;
      }
    });
  };

  const getMetricValue = (item: SalesData, metric: string): number => {
    switch (metric) {
      case 'sales': return item.sales;
      case 'revenue': return item.revenue / 100000; // Scale down for visualization
      case 'leads': return item.leads;
      default: return item.sales;
    }
  };

  const getMetricColor = (metric: string): string => {
    switch (metric) {
      case 'sales': return '#00aaff';
      case 'revenue': return '#00ff88';
      case 'leads': return '#ff6600';
      default: return '#00aaff';
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'sales': return <Award size={16} />;
      case 'revenue': return <TrendingUp size={16} />;
      case 'leads': return <Target size={16} />;
      default: return <TrendingUp size={16} />;
    }
  };

  const getCurrentValue = () => {
    if (hoveredBar !== null && data[hoveredBar]) {
      const item = data[hoveredBar];
      return {
        month: item.month,
        value: getMetricValue(item, selectedMetric),
        raw: selectedMetric === 'revenue' ? item.revenue : getMetricValue(item, selectedMetric)
      };
    }
    return null;
  };

  const currentValue = getCurrentValue();

  return (
    <div className={`relative bg-gradient-to-br from-slate-900 to-blue-900 rounded-xl overflow-hidden ${className}`}>
      {/* 3D Chart */}
      <div 
        ref={mountRef} 
        className="w-full h-full min-h-[400px]"
        style={{ background: 'linear-gradient(135deg, #0f0f23, #1a1a3e, #2d2d5f)' }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-white">Loading 3D Analytics...</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 left-4">
        <div className="flex space-x-2">
          {(['sales', 'revenue', 'leads'] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                selectedMetric === metric
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              {getMetricIcon(metric)}
              <span className="capitalize">{metric}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Data display */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 min-w-[200px]">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar size={16} className="text-blue-400" />
          <span className="text-white font-semibold">Sales Analytics 3D</span>
        </div>
        
        {currentValue ? (
          <div className="text-white">
            <div className="text-lg font-bold">{currentValue.month}</div>
            <div className="text-2xl font-bold text-blue-400">
              {selectedMetric === 'revenue' 
                ? `$${(currentValue.raw / 1000000).toFixed(1)}M`
                : currentValue.raw.toLocaleString()
              }
            </div>
            <div className="text-white/70 text-sm capitalize">{selectedMetric}</div>
          </div>
        ) : (
          <div className="text-white/70 text-sm">
            Hover over bars to see details
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
        <p className="text-white/70 text-xs">
          Hover to inspect • Auto-rotating camera view
        </p>
      </div>
    </div>
  );
}