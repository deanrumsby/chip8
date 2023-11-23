import { useContext } from "react";

import { type Chip8, Chip8Context } from "../Chip8";
import Canvas from "../Canvas";

interface DisplayProps {
  style?: React.CSSProperties;
  className?: string;
}

function Display({ style, className }: DisplayProps) {
  const { chip8 } = useContext(Chip8Context) as Chip8;

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
