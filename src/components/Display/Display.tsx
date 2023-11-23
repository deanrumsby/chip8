import { useChip8Context } from "../../context/Chip8Context";
import Canvas from "../Canvas";

interface DisplayProps {
  style?: React.CSSProperties;
  className?: string;
}

function Display({ style, className }: DisplayProps) {
  const { chip8 } = useChip8Context();

  const imageData = new ImageData(chip8.frame(), chip8.frame_width());

  return (
    <Canvas
      style={style}
      className={className}
      width={chip8.frame_width()}
      height={chip8.frame_height()}
      imageData={imageData}
    />
  );
}

export default Display;
