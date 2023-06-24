import Chip8Provider from "./components/Chip8";
import AppBar from "./components/AppBar";
import Display from "./components/Display";
import ControlPanel from "./components/ControlPanel";

function App() {
  return (
    <Chip8Provider>
      <AppBar />
      <div className="w-1/2">
        <Display className="border border-black m-2 w-full" />
        <ControlPanel />
      </div>
    </Chip8Provider>
  );
}

export default App;
