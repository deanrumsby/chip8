import { memo, useRef } from "react";

interface DisplayProps {
  style?: React.CSSProperties;
  className?: string;
  width: number;
  height: number;
  imageData?: ImageData;
}

const Display = memo(function Display({
  style,
  className,
  width,
  height,
  imageData,
}: DisplayProps) {
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

export default Display;
