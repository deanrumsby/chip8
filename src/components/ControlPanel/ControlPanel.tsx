import { useContext } from "react";

import { Chip8Context, type Chip8 } from "../Chip8";

function ControlPanel() {
  const { setIsRunning } = useContext(Chip8Context) as Chip8;

  return (
    <div className="flex justify-center">
      <button onClick={() => setIsRunning(true)}>Start</button>
      <button onClick={() => setIsRunning(false)}>Stop</button>
    </div>
  );
}

export default ControlPanel;
