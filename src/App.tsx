import { Chip8 } from "@deanrumsby/chip8_core";

import Display from "./components/Display";

function App() {
  const seed = Math.floor(Math.random() * (1 << 32));
  const chip8 = new Chip8(seed);
  return (
    <Display
      className="border border-black w-1/2"
      width={chip8.frame_width()}
      height={chip8.frame_height()}
    />
  );
}

export default App;
