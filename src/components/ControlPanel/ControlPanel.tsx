import { useChip8Context } from "../../context/Chip8Context";

function ControlPanel() {
  const { status, speed, setSpeed, play, pause, reset, step } =
    useChip8Context();

  const handleSetSpeed = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSpeed(parseInt(value));
  };

  const handlePlayPause = () => {
    if (status === "running") {
      pause();
    } else {
      play();
    }
  };

  return (
    <div className="flex justify-center gap-10 border border-black p-2">
      <input
        type="range"
        min="1"
        max="1400"
        value={speed}
        onChange={handleSetSpeed}
      />
      <button onClick={handlePlayPause}>
        {status !== "running" ? "Play" : "Pause"}
      </button>
      <button disabled={status === "running"} onClick={step}>
        Step
      </button>
      <button onClick={reset}>Reset</button>
      <span className="text-4xl mx-3">{status}</span>
    </div>
  );
}

export default ControlPanel;
