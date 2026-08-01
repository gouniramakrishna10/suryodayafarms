import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  FiZoomIn, 
  FiCheck, 
  FiX, 
  FiRotateCcw, 
  FiRotateCw, 
  FiMaximize2, 
  FiRefreshCw, 
  FiInfo,
  FiGrid
} from 'react-icons/fi';
import { LuFlipHorizontal, LuFlipVertical } from 'react-icons/lu';

export default function ImageCropper({ imageSrc, onCropComplete, onCancel, targetAspect = 4 / 3 }) {
  // Lock body scroll while cropper modal is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const dragStartPointer = useRef({ x: 0, y: 0 });
  const dragStartPan = useRef({ x: 0, y: 0 });

  // Image & Viewport dimensions
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 600, height: 420 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Aspect ratio modes
  const [aspectMode, setAspectMode] = useState('product'); // 'product' | 'square' | 'portrait' | 'landscape' | 'free'
  const [currentAspect, setCurrentAspect] = useState(targetAspect);

  // Transformation states (Rotation & Flips)
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Dismissible Tip state
  const [showTipBanner, setShowTipBanner] = useState(true);

  // Crop Box State (Position & size inside viewport)
  const [cropBox, setCropBox] = useState({ x: 40, y: 40, width: 320, height: 240 });
  const [activeHandle, setActiveHandle] = useState(null); // 'move' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r'
  const dragStartBox = useRef({ x: 0, y: 0, width: 100, height: 100 });

  // Multi-touch pinch zoom refs
  const touchPinchStartDist = useRef(null);
  const touchStartZoom = useRef(1);

  // Calculate current numerical aspect ratio based on active mode
  useEffect(() => {
    switch (aspectMode) {
      case 'square':
        setCurrentAspect(1);
        break;
      case 'portrait':
        setCurrentAspect(4 / 5);
        break;
      case 'landscape':
        setCurrentAspect(16 / 9);
        break;
      case 'free':
        setCurrentAspect(null);
        break;
      case 'product':
      default:
        setCurrentAspect(targetAspect || 4 / 3);
        break;
    }
  }, [aspectMode, targetAspect]);

  // Responsive Viewport Sizing (70% width on Desktop)
  useEffect(() => {
    const updateViewportSize = () => {
      if (containerRef.current) {
        const clientWidth = containerRef.current.clientWidth || 600;
        const maxW = Math.max(320, Math.min(clientWidth - 56, 720)); // 28px padding reserved on left & right
        const maxH = Math.min(window.innerHeight * 0.52, 440);

        let w = maxW;
        let h = currentAspect ? w / currentAspect : maxH;
        if (h > maxH) {
          h = maxH;
          if (currentAspect) w = h * currentAspect;
        }
        setViewportSize({ width: Math.round(w), height: Math.round(h) });
      }
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, [currentAspect]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImgDimensions({ width: naturalWidth, height: naturalHeight });
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  // Helper render details math
  const getRenderDetails = useCallback(() => {
    if (!imgDimensions.width || !viewportSize.width) return null;

    const baseScale = Math.min(
      viewportSize.width / imgDimensions.width,
      viewportSize.height / imgDimensions.height
    );

    const baseWidth = imgDimensions.width * baseScale;
    const baseHeight = imgDimensions.height * baseScale;

    const zoomedWidth = baseWidth * zoom;
    const zoomedHeight = baseHeight * zoom;

    const maxPanX = Math.max(viewportSize.width, zoomedWidth) / 1.5;
    const maxPanY = Math.max(viewportSize.height, zoomedHeight) / 1.5;

    return {
      baseScale,
      zoomedWidth,
      zoomedHeight,
      maxPanX,
      maxPanY,
      totalScale: baseScale * zoom
    };
  }, [imgDimensions, viewportSize, zoom]);

  const renderDetails = getRenderDetails();

  // Initialize and center crop box inside viewport
  useEffect(() => {
    if (viewportSize.width && viewportSize.height) {
      const boxW = Math.round(viewportSize.width * 0.85);
      const boxH = currentAspect ? Math.round(boxW / currentAspect) : Math.round(viewportSize.height * 0.85);
      
      let finalH = boxH;
      let finalW = boxW;

      if (finalH > viewportSize.height * 0.9) {
        finalH = Math.round(viewportSize.height * 0.9);
        if (currentAspect) finalW = Math.round(finalH * currentAspect);
      }

      const x = Math.round((viewportSize.width - finalW) / 2);
      const y = Math.round((viewportSize.height - finalH) / 2);

      setCropBox({ x: Math.max(0, x), y: Math.max(0, y), width: finalW, height: finalH });
    }
  }, [viewportSize, currentAspect]);

  // Handle Mouse Wheel Zoom & Ctrl + Mouse Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    setShowTipBanner(false);
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom(prev => Math.min(4, Math.max(0.3, parseFloat((prev + zoomDelta).toFixed(2)))));
  };

  // Keyboard Arrow Key Nudges
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setShowTipBanner(false);
        const step = e.shiftKey ? 10 : 2;
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;

        setCropBox(prev => ({
          ...prev,
          x: Math.max(0, Math.min(prev.x + dx, viewportSize.width - prev.width)),
          y: Math.max(0, Math.min(prev.y + dy, viewportSize.height - prev.height))
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewportSize]);

  // Viewport Pan Start (Mouse / Touch)
  const handleViewportPointerDown = (e) => {
    if (activeHandle) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (e.touches && e.touches.length === 2) {
      // Multi-touch pinch start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchPinchStartDist.current = dist;
      touchStartZoom.current = zoom;
      return;
    }

    setIsDraggingImage(true);
    setShowTipBanner(false);
    dragStartPointer.current = { x: clientX, y: clientY };
    dragStartPan.current = { ...pan };
  };

  // Viewport Pan Move
  const handleViewportPointerMove = (e) => {
    if (e.touches && e.touches.length === 2 && touchPinchStartDist.current) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchPinchStartDist.current;
      setZoom(Math.min(4, Math.max(0.3, touchStartZoom.current * scale)));
      return;
    }

    if (!isDraggingImage || !renderDetails) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - dragStartPointer.current.x;
    const dy = clientY - dragStartPointer.current.y;

    const newX = dragStartPan.current.x + dx;
    const newY = dragStartPan.current.y + dy;

    setPan({
      x: Math.min(Math.max(newX, -renderDetails.maxPanX), renderDetails.maxPanX),
      y: Math.min(Math.max(newY, -renderDetails.maxPanY), renderDetails.maxPanY)
    });
  };

  const handleViewportPointerUp = () => {
    setIsDraggingImage(false);
    touchPinchStartDist.current = null;
  };

  // Crop Box Drag & Resize Pointer Handlers
  const handleHandleStart = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTipBanner(false);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setActiveHandle(handle);
    dragStartPointer.current = { x: clientX, y: clientY };
    dragStartBox.current = { ...cropBox };
  };

  // Pointer move effect for resizing crop frame
  useEffect(() => {
    if (!activeHandle) return;

    const handlePointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const dx = clientX - dragStartPointer.current.x;
      const dy = clientY - dragStartPointer.current.y;
      const start = dragStartBox.current;

      const minW = 60;
      const minH = currentAspect ? minW / currentAspect : 60;

      let nextBox = { ...start };

      if (activeHandle === 'move') {
        let newX = start.x + dx;
        let newY = start.y + dy;

        newX = Math.max(0, Math.min(newX, viewportSize.width - start.width));
        newY = Math.max(0, Math.min(newY, viewportSize.height - start.height));

        nextBox = { ...start, x: newX, y: newY };
      } else {
        // Handle resizing with or without locked aspect ratio
        if (aspectMode === 'free' || !currentAspect) {
          // Freeform Resizing
          if (activeHandle.includes('r')) nextBox.width = Math.max(minW, Math.min(viewportSize.width - start.x, start.width + dx));
          if (activeHandle.includes('b')) nextBox.height = Math.max(minH, Math.min(viewportSize.height - start.y, start.height + dy));
          if (activeHandle.includes('l')) {
            const w = Math.max(minW, Math.min(start.x + start.width, start.width - dx));
            nextBox.x = start.x + start.width - w;
            nextBox.width = w;
          }
          if (activeHandle.includes('t')) {
            const h = Math.max(minH, Math.min(start.y + start.height, start.height - dy));
            nextBox.y = start.y + start.height - h;
            nextBox.height = h;
          }
        } else {
          // Locked Aspect Ratio Resizing
          if (activeHandle === 'br' || activeHandle === 'r' || activeHandle === 'b') {
            let w = start.width + (activeHandle === 'b' ? dy * currentAspect : dx);
            let h = w / currentAspect;

            const maxW = viewportSize.width - start.x;
            const maxH = viewportSize.height - start.y;

            if (w > maxW) { w = maxW; h = w / currentAspect; }
            if (h > maxH) { h = maxH; w = h * currentAspect; }
            if (w < minW) { w = minW; h = minH; }

            nextBox = { ...start, width: Math.round(w), height: Math.round(h) };
          } else if (activeHandle === 'tl' || activeHandle === 't' || activeHandle === 'l') {
            const factor = activeHandle === 't' ? -dy : -dx;
            let w = start.width + (activeHandle === 't' ? factor * currentAspect : factor);
            let h = w / currentAspect;

            const maxW = start.x + start.width;
            const maxH = start.y + start.height;

            if (w > maxW) { w = maxW; h = w / currentAspect; }
            if (h > maxH) { h = maxH; w = h * currentAspect; }
            if (w < minW) { w = minW; h = minH; }

            nextBox = {
              x: Math.round(start.x + start.width - w),
              y: Math.round(start.y + start.height - h),
              width: Math.round(w),
              height: Math.round(h)
            };
          } else if (activeHandle === 'tr') {
            let w = start.width + dx;
            let h = w / currentAspect;

            const maxW = viewportSize.width - start.x;
            const maxH = start.y + start.height;

            if (w > maxW) { w = maxW; h = w / currentAspect; }
            if (h > maxH) { h = maxH; w = h * currentAspect; }
            if (w < minW) { w = minW; h = minH; }

            nextBox = {
              x: start.x,
              y: Math.round(start.y + start.height - h),
              width: Math.round(w),
              height: Math.round(h)
            };
          } else if (activeHandle === 'bl') {
            let w = start.width - dx;
            let h = w / currentAspect;

            const maxW = start.x + start.width;
            const maxH = viewportSize.height - start.y;

            if (w > maxW) { w = maxW; h = w / currentAspect; }
            if (h > maxH) { h = maxH; w = h * currentAspect; }
            if (w < minW) { w = minW; h = minH; }

            nextBox = {
              x: Math.round(start.x + start.width - w),
              y: start.y,
              width: Math.round(w),
              height: Math.round(h)
            };
          }
        }
      }

      setCropBox(nextBox);
    };

    const handlePointerUp = () => {
      setActiveHandle(null);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [activeHandle, currentAspect, aspectMode, viewportSize]);

  // Reset function
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setAspectMode('product');
    if (viewportSize.width) {
      const boxW = Math.round(viewportSize.width * 0.85);
      const boxH = Math.round(boxW / targetAspect);
      setCropBox({
        x: Math.round((viewportSize.width - boxW) / 2),
        y: Math.round((viewportSize.height - boxH) / 2),
        width: boxW,
        height: boxH
      });
    }
  };

  // High quality client-side canvas crop generator
  const handleApply = () => {
    if (!renderDetails || !imgDimensions.width) return;

    const { totalScale } = renderDetails;

    // Center of image in viewport
    const baseWidth = imgDimensions.width * renderDetails.baseScale;
    const baseHeight = imgDimensions.height * renderDetails.baseScale;
    const imgWidth = baseWidth * zoom;
    const imgHeight = baseHeight * zoom;
    const imgLeft = (viewportSize.width - imgWidth) / 2 + pan.x;
    const imgTop = (viewportSize.height - imgHeight) / 2 + pan.y;

    // Crop box coordinates relative to zoomed image
    const relativeLeft = cropBox.x - imgLeft;
    const relativeTop = cropBox.y - imgTop;

    const cropX = Math.max(0, Math.round(relativeLeft / totalScale));
    const cropY = Math.max(0, Math.round(relativeTop / totalScale));
    const cropWidth = Math.min(imgDimensions.width - cropX, Math.round(cropBox.width / totalScale));
    const cropHeight = Math.min(imgDimensions.height - cropY, Math.round(cropBox.height / totalScale));

    const imgElement = imageRef.current;
    if (imgElement && cropWidth > 0 && cropHeight > 0) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Support Rotation & Flip Transformations
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

        ctx.drawImage(
          imgElement,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          -canvas.width / 2,
          -canvas.height / 2,
          canvas.width,
          canvas.height
        );
        ctx.restore();

        try {
          const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);
          onCropComplete({
            croppedImage: croppedBase64,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            zoom,
            rotation,
            flipH,
            flipV,
            aspectRatio: aspectMode
          });
          return;
        } catch (err) {
          console.error('[Canvas Export Error] Using fallback crop data:', err);
        }
      }
    }

    onCropComplete({
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      zoom,
      rotation,
      flipH,
      flipV,
      aspectRatio: aspectMode
    });
  };

  // Helper for live preview cards (30% Right Panel)
  const getLivePreviewStyle = (simWidth, simHeight) => {
    if (!renderDetails || !imgDimensions.width) return {};

    const baseWidth = imgDimensions.width * renderDetails.baseScale;
    const baseHeight = imgDimensions.height * renderDetails.baseScale;
    const imgWidth = baseWidth * zoom;
    const imgHeight = baseHeight * zoom;
    const imgLeft = (viewportSize.width - imgWidth) / 2 + pan.x;
    const imgTop = (viewportSize.height - imgHeight) / 2 + pan.y;

    const relativeLeft = cropBox.x - imgLeft;
    const relativeTop = cropBox.y - imgTop;
    const scaleFactor = simWidth / cropBox.width;

    return {
      width: `${imgWidth * scaleFactor}px`,
      height: `${imgHeight * scaleFactor}px`,
      left: `${-relativeLeft * scaleFactor}px`,
      top: `${-relativeTop * scaleFactor}px`,
      position: 'absolute',
      maxWidth: 'none',
      maxHeight: 'none',
      transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
      transition: 'none'
    };
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-stone-950/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in text-left">
      <div className="bg-white border border-stone-200/90 rounded-[28px] max-w-5xl w-full shadow-2xl flex flex-col max-h-[88vh] h-auto overflow-hidden my-auto relative transition-all duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-stone-200 px-6 py-4 shrink-0 bg-white z-20">
          <div className="space-y-0.5">
            <h3 className="font-serif text-xl font-bold text-dark-olive flex items-center gap-2">
              <span>✂️</span> <span>Image Cropper & Studio Editor</span>
            </h3>
            <p className="text-xs text-stone-500 font-sans">
              Adjust framing, aspect ratio modes, zoom, and orientation for high-resolution storefront display.
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition cursor-pointer border-none bg-transparent"
            title="Close Editor (ESC)"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Workspace Body: 70% Cropper (8 Cols) / 30% Live Showcase (4 Cols) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll">
          
          {/* Dismissible Tip Banner Above Cropper */}
          {showTipBanner && (
            <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3 px-4 flex items-center justify-between text-xs text-amber-900 font-sans animate-fade-in shadow-2xs">
              <div className="flex items-center gap-2">
                <FiInfo className="text-[#C68A2B] shrink-0 text-sm" />
                <span>
                  <strong>Tip:</strong> Drag image to pan • Use handles or mouse wheel to resize/zoom crop area • Use keyboard arrows for fine movement.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTipBanner(false)}
                className="text-amber-700 hover:text-amber-950 text-sm font-bold border-none bg-transparent cursor-pointer shrink-0 ml-3"
              >
                ✕
              </button>
            </div>
          )}

          {/* Aspect Ratio Mode Selector Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50/80 border border-stone-200 rounded-2xl p-2.5">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider pl-2 flex items-center gap-1.5">
              <FiGrid className="text-[#4E641A]" />
              <span>Crop Mode:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'product', label: 'Product Card' },
                { id: 'square', label: 'Square (1:1)' },
                { id: 'portrait', label: 'Portrait (4:5)' },
                { id: 'landscape', label: 'Landscape (16:9)' },
                { id: 'free', label: 'Free Crop' }
              ].map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setAspectMode(mode.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    aspectMode === mode.id
                      ? 'bg-[#4E641A] text-white border-[#4E641A] shadow-2xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 70% LEFT PANEL: Cropper Canvas Workspace */}
            <div className="lg:col-span-8 flex flex-col items-center gap-5 w-full">
              
              {/* Outer Viewport Box with 28px Padding Guarantee */}
              <div 
                ref={containerRef}
                className="w-full flex justify-center items-center bg-stone-100/70 border border-stone-200 rounded-3xl p-7 relative shadow-inner min-h-[300px]"
              >
                {/* Interactive Canvas Viewport */}
                <div 
                  className="relative overflow-hidden border border-stone-300 bg-white shadow-md select-none rounded-2xl cursor-grab active:cursor-grabbing touch-none"
                  style={{
                    width: `${viewportSize.width}px`,
                    height: `${viewportSize.height}px`
                  }}
                  onWheel={handleWheel}
                  onMouseDown={handleViewportPointerDown}
                  onMouseMove={handleViewportPointerMove}
                  onMouseUp={handleViewportPointerUp}
                  onMouseLeave={handleViewportPointerUp}
                  onTouchStart={handleViewportPointerDown}
                  onTouchMove={handleViewportPointerMove}
                  onTouchEnd={handleViewportPointerUp}
                >
                  {/* Image Under Edit */}
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Source Crop Preview"
                    onLoad={handleImageLoad}
                    draggable={false}
                    className="absolute origin-center max-w-none select-none pointer-events-none"
                    style={{
                      width: renderDetails ? `${renderDetails.zoomedWidth}px` : 'auto',
                      height: renderDetails ? `${renderDetails.zoomedHeight}px` : 'auto',
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                      transition: isDraggingImage ? 'none' : 'transform 0.15s ease-out'
                    }}
                  />

                  {/* 4 Dark Masking Overlays around Crop Box */}
                  <div 
                    className="absolute bg-black/50 pointer-events-none z-20"
                    style={{ left: 0, top: 0, width: '100%', height: `${Math.max(0, cropBox.y)}px` }}
                  />
                  <div 
                    className="absolute bg-black/50 pointer-events-none z-20"
                    style={{ left: 0, top: `${cropBox.y + cropBox.height}px`, width: '100%', height: `${Math.max(0, viewportSize.height - (cropBox.y + cropBox.height))}px` }}
                  />
                  <div 
                    className="absolute bg-black/50 pointer-events-none z-20"
                    style={{ left: 0, top: `${cropBox.y}px`, width: `${Math.max(0, cropBox.x)}px`, height: `${cropBox.height}px` }}
                  />
                  <div 
                    className="absolute bg-black/50 pointer-events-none z-20"
                    style={{ left: `${cropBox.x + cropBox.width}px`, top: `${cropBox.y}px`, width: `${Math.max(0, viewportSize.width - (cropBox.x + cropBox.width))}px`, height: `${cropBox.height}px` }}
                  />

                  {/* Active Crop Boundary Frame */}
                  <div 
                    className="absolute border-2 border-white rounded-lg z-30 cursor-move select-none shadow-2xl"
                    style={{
                      left: `${cropBox.x}px`,
                      top: `${cropBox.y}px`,
                      width: `${cropBox.width}px`,
                      height: `${cropBox.height}px`,
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.2)'
                    }}
                    onMouseDown={(e) => handleHandleStart(e, 'move')}
                    onTouchStart={(e) => handleHandleStart(e, 'move')}
                  >
                    {/* Grid Rule of Thirds */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/30 pointer-events-none">
                      <div className="border-r border-b border-white/25"></div>
                      <div className="border-r border-b border-white/25"></div>
                      <div className="border-b border-white/25"></div>
                      <div className="border-r border-b border-white/25"></div>
                      <div className="border-r border-b border-white/25"></div>
                      <div className="border-b border-white/25"></div>
                      <div className="border-r border-white/25"></div>
                      <div className="border-r border-white/25"></div>
                      <div></div>
                    </div>

                    {/* Corner Handles (Unclipped 20px Dots) */}
                    <div 
                      className="absolute w-5 h-5 bg-white border-2 border-[#4E641A] rounded-full shadow-md cursor-nwse-resize -left-2.5 -top-2.5 z-40 hover:scale-125 active:scale-95 transition-transform"
                      onMouseDown={(e) => handleHandleStart(e, 'tl')}
                      onTouchStart={(e) => handleHandleStart(e, 'tl')}
                    />
                    <div 
                      className="absolute w-5 h-5 bg-white border-2 border-[#4E641A] rounded-full shadow-md cursor-nesw-resize -right-2.5 -top-2.5 z-40 hover:scale-125 active:scale-95 transition-transform"
                      onMouseDown={(e) => handleHandleStart(e, 'tr')}
                      onTouchStart={(e) => handleHandleStart(e, 'tr')}
                    />
                    <div 
                      className="absolute w-5 h-5 bg-white border-2 border-[#4E641A] rounded-full shadow-md cursor-nesw-resize -left-2.5 -bottom-2.5 z-40 hover:scale-125 active:scale-95 transition-transform"
                      onMouseDown={(e) => handleHandleStart(e, 'bl')}
                      onTouchStart={(e) => handleHandleStart(e, 'bl')}
                    />
                    <div 
                      className="absolute w-5 h-5 bg-white border-2 border-[#4E641A] rounded-full shadow-md cursor-nwse-resize -right-2.5 -bottom-2.5 z-40 hover:scale-125 active:scale-95 transition-transform"
                      onMouseDown={(e) => handleHandleStart(e, 'br')}
                      onTouchStart={(e) => handleHandleStart(e, 'br')}
                    />

                    {/* Edge Handles */}
                    <div 
                      className="absolute w-7 h-3 bg-white border border-[#4E641A] rounded-full shadow-xs cursor-ns-resize left-1/2 -translate-x-1/2 -top-1.5 z-40 hover:scale-110 active:scale-95 transition-transform"
                      onMouseDown={(e) => handleHandleStart(e, 't')}
                      onTouchStart={(e) => handleHandleStart(e, 't')}
                    />
                    <div 
                      className="absolute w-7 h-3 bg-white border border-[#4E641A] rounded-full shadow-xs cursor-ns-resize left-1/2 -translate-x-1/2 -bottom-1.5 z-40 hover:scale-110 active:scale-95 transition-transform"
                      onMouseDown={(e) => handleHandleStart(e, 'b')}
                      onTouchStart={(e) => handleHandleStart(e, 'b')}
                    />
                    <div 
                      className="absolute w-3 h-7 bg-white border border-[#4E641A] rounded-full shadow-xs cursor-ew-resize -left-1.5 top-1/2 -translate-y-1/2 z-40 hover:scale-110 active:scale-95 transition-transform"
                      onMouseDown={(e) => handleHandleStart(e, 'l')}
                      onTouchStart={(e) => handleHandleStart(e, 'l')}
                    />
                    <div 
                      className="absolute w-3 h-7 bg-white border border-[#4E641A] rounded-full shadow-xs cursor-ew-resize -right-1.5 top-1/2 -translate-y-1/2 z-40 hover:scale-110 active:scale-95 transition-transform"
                      onMouseDown={(e) => handleHandleStart(e, 'r')}
                      onTouchStart={(e) => handleHandleStart(e, 'r')}
                    />
                  </div>

                </div>
              </div>

              {/* Zoom Control Card BELOW Cropper Canvas */}
              <div className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-2">
                    <FiZoomIn className="text-[#4E641A]" />
                    <span>Zoom Level</span>
                  </span>
                  <span className="text-xs font-bold text-[#4E641A] font-mono bg-white px-2.5 py-0.5 rounded border border-stone-200">
                    Current Zoom: {Math.round(zoom * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => setZoom(prev => Math.max(0.3, parseFloat((prev - 0.1).toFixed(2))))} 
                    className="w-8 h-8 rounded-xl bg-white border border-stone-300 text-stone-700 font-bold text-sm flex items-center justify-center cursor-pointer shadow-2xs hover:bg-stone-100 transition"
                    title="Zoom Out (-)"
                  >
                    -
                  </button>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[10px] text-stone-400 font-mono">[-]</span>
                    <input
                      type="range"
                      min="0.3"
                      max="4"
                      step="0.01"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 accent-[#4E641A] cursor-pointer h-2 bg-stone-200 rounded-lg appearance-none"
                    />
                    <span className="text-[10px] text-stone-400 font-mono">[+]</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setZoom(prev => Math.min(4, parseFloat((prev + 0.1).toFixed(2))))} 
                    className="w-8 h-8 rounded-xl bg-white border border-stone-300 text-stone-700 font-bold text-sm flex items-center justify-center cursor-pointer shadow-2xs hover:bg-stone-100 transition"
                    title="Zoom In (+)"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* 30% RIGHT PANEL: Live Showcase Cards */}
            <div className="lg:col-span-4 space-y-5 border-l border-stone-200 pl-0 lg:pl-6 text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C68A2B] block">
                Live Storefront Showcase
              </span>
              
              <div className="space-y-5">
                {/* Large Desktop Preview Card */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-700 block">Desktop Card Preview</span>
                  <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
                    <div 
                      className="border border-stone-200 rounded-xl overflow-hidden relative bg-stone-50 mx-auto"
                      style={{ height: '140px', width: '100%', maxWidth: '240px' }}
                    >
                      <div className="absolute inset-0 overflow-hidden">
                        {imgDimensions.width > 0 && renderDetails && (
                          <img
                            src={imageSrc}
                            alt="Desktop Sim"
                            style={getLivePreviewStyle(240, 140)}
                          />
                        )}
                      </div>
                      <span className="absolute bottom-2 left-2 bg-[#2F3B0C]/85 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-xs z-10 pointer-events-none">
                        Desktop Hero
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-stone-900 block truncate">Organic Product Showcase</span>
                      <span className="text-[10px] text-emerald-700 font-extrabold block">₹399 • In Stock</span>
                    </div>
                  </div>
                </div>

                {/* Large Mobile Preview Card */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-700 block">Mobile Card Preview</span>
                  <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex gap-4 items-center">
                    <div 
                      className="border border-stone-200 rounded-xl overflow-hidden relative bg-stone-50 shrink-0"
                      style={{ height: '110px', width: '110px' }}
                    >
                      <div className="absolute inset-0 overflow-hidden">
                        {imgDimensions.width > 0 && renderDetails && (
                          <img
                            src={imageSrc}
                            alt="Mobile Sim"
                            style={getLivePreviewStyle(110, 110)}
                          />
                        )}
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 bg-[#C68A2B]/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded z-10 pointer-events-none">
                        Mobile Card
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-stone-900 block">Autofit Display</span>
                      <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
                        Updates live while dragging or zooming. Ensure key branding features remain centered.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions (Bottom Left: Rotation & Flips • Bottom Right: Cancel, Reset, Apply) */}
        <div className="shrink-0 bg-white border-t border-stone-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-20 shadow-md">
          
          {/* Bottom Left Toolbar: Rotate & Flip */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setRotation(prev => (prev - 90 + 360) % 360)}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer border-none"
              title="Rotate Left 90°"
            >
              <FiRotateCcw className="text-sm" />
              <span>Rotate Left</span>
            </button>
            <button
              type="button"
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer border-none"
              title="Rotate Right 90°"
            >
              <FiRotateCw className="text-sm" />
              <span>Rotate Right</span>
            </button>
            <button
              type="button"
              onClick={() => setFlipH(prev => !prev)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer border ${
                flipH ? 'bg-[#4E641A] text-white border-[#4E641A]' : 'bg-stone-100 text-stone-700 border-transparent hover:bg-stone-200'
              }`}
              title="Flip Horizontal"
            >
              <LuFlipHorizontal className="text-sm" />
              <span>Flip H</span>
            </button>
            <button
              type="button"
              onClick={() => setFlipV(prev => !prev)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer border ${
                flipV ? 'bg-[#4E641A] text-white border-[#4E641A]' : 'bg-stone-100 text-stone-700 border-transparent hover:bg-stone-200'
              }`}
              title="Flip Vertical"
            >
              <LuFlipVertical className="text-sm" />
              <span>Flip V</span>
            </button>
          </div>

          {/* Bottom Right Actions: Cancel, Reset, Apply */}
          <div className="flex items-center gap-3 ml-auto w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold transition cursor-pointer bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              title="Reset Crop & Adjustments"
            >
              <FiRefreshCw className="text-xs" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition shadow-md cursor-pointer flex items-center gap-2 border-none active:scale-98"
            >
              <FiCheck className="text-sm" />
              <span>Apply Crop</span>
            </button>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}
