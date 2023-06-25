import Chip8Provider from "./components/Chip8";
import AppBar from "./components/AppBar";
import Display from "./components/Display";
import ControlPanel from "./components/ControlPanel";

function App() {
  return (
    <Chip8Provider>
      <div className="h-screen">
        <AppBar />
        <div className="m-2 flex flex-col gap-2 w-1/2">
          <Display className="border border-black w-full" />
          <ControlPanel />
        </div>
      </div>
    </Chip8Provider>
  );
}

export default App;
