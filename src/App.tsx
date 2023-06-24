import Chip8Provider from "./components/Chip8";
import Display from "./components/Display";
import ControlPanel from "./components/ControlPanel";

function App() {
  return (
    <Chip8Provider>
      <Display className="border border-black w-1/2" />
      <ControlPanel />
    </Chip8Provider>
  );
}

export default App;
