import { memo, useRef } from "react";

interface CanvasProps {
  imageData?: ImageData;
  width: number;
  height: number;
  style?: React.CSSProperties;
  className?: string;
}

const Canvas = memo(function Canvas({
  imageData,
  width,
  height,
  style,
  className,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (canvasRef.current && imageData) {
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.putImageData(imageData, 0, 0);
    }
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ imageRendering: "pixelated", ...style }}
      className={className}
      width={width}
      height={height}
    />
  );
});

export default Canvas;
