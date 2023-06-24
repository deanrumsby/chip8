import { type ChangeEventHandler, useContext } from "react";

import { Chip8Context, type Chip8 } from "../Chip8";

function ControlPanel() {
  const { chip8, setIsRunning } = useContext(Chip8Context) as Chip8;

  const handleFileChange: ChangeEventHandler = (event) => {
    const input = event.target as HTMLInputElement;
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const typedArray = new Uint8Array(fileReader.result as ArrayBufferLike);
      chip8.load(typedArray);
    };
    if (!input.files) {
      return;
    }
    fileReader.readAsArrayBuffer(input.files[0]);
  };

  return (
    <div>
      <button onClick={() => setIsRunning(true)}>Start</button>
      <button onClick={() => setIsRunning(false)}>Stop</button>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
}

export default ControlPanel;
