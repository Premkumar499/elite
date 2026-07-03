import { useState } from 'react';

/**
 * Amazon-style Image Zoom Component
 * Shows magnified view on hover
 */
export default function ImageZoom({ src, alt, className, style }) {
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleMouseEnter = () => {
    if (imageLoaded) setShowZoom(true);
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
  };

  const handleMouseMove = (e) => {
    if (!showZoom) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  return (
    <div style={{ position: 'relative', ...style }} className={className}>
      {/* Original Image */}
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          cursor: showZoom ? 'crosshair' : 'zoom-in',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onLoad={() => setImageLoaded(true)}
        onError={(e) => {
          e.target.src = '/elite studio pic/product.jpeg';
          setImageLoaded(true);
        }}
      />

      {/* Zoom Lens Overlay */}
      {showZoom && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            border: '2px solid rgba(160, 125, 86, 0.5)',
            boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.5)',
          }}
        />
      )}

      {/* Zoomed Image Panel */}
      {showZoom && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '105%',
            width: '400px',
            height: '400px',
            border: '1px solid #ddd',
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${src})`,
              backgroundSize: '250%',
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
      )}
    </div>
  );
}
