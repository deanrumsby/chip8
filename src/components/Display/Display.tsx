import { useChip8Context } from "../../context/Chip8Context";
import Canvas from "../Canvas";

interface DisplayProps {
  style?: React.CSSProperties;
  className?: string;
}

function Display({ style, className }: DisplayProps) {
  const { frame } = useChip8Context();

  const imageData = new ImageData(frame, 64);

  return (
    <Canvas
      style={style}
      className={className}
      width={64}
      height={32}
      imageData={imageData}
    />
  );
}

export default Display;
