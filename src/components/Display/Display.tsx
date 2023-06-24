import { useContext, useMemo } from "react";
import { memory } from "@deanrumsby/chip8_core/chip8_core_bg.wasm";

import { type Chip8, Chip8Context } from "../Chip8";
import Canvas from "../Canvas";

interface DisplayProps {
  style?: React.CSSProperties;
  className?: string;
}

function Display({ style, className }: DisplayProps) {
  const { chip8 } = useContext(Chip8Context) as Chip8;

  const frameBuffer = useMemo(
    () =>
      new Uint8ClampedArray(
        memory.buffer,
        chip8.frame_buffer_mut_ptr(),
        chip8.frame_buffer_len()
      ),
    [chip8]
  );

  const imageData = new ImageData(frameBuffer, chip8.frame_width());

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
