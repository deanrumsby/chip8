import { useState, useEffect } from "react";

const menu = [
  {
    id: 0,
    name: "File",
    items: [
      {
        name: "Open",
        action: () => {},
      },
    ],
  },
];

function AppBar() {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const handleClickMenu = (event: React.MouseEvent, id: number) => {
    event.stopPropagation();
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }
    setOpenMenuId(id);
  };

  const handleCloseMenu = () => {
    console.log("close");
    setOpenMenuId(null);
  };

  useEffect(() => {
    if (openMenuId === null) {
      return;
    }
    window.addEventListener("click", handleCloseMenu);
    return () => window.removeEventListener("click", handleCloseMenu);
  }, [openMenuId]);

  return (
    <div className="flex justify-between items-center bg-gray-800 text-white pl-2">
      {menu.map((item) => (
        <div className="relative" key={item.name}>
          <button
            className="hover:bg-gray-700 px-2 py-1"
            onClick={(event) => handleClickMenu(event, item.id)}
          >
            {item.name}
          </button>
          {openMenuId === item.id && (
            <div
              className="absolute bg-gray-800 text-white"
              style={{ top: "100%", left: 0 }}
            >
              {item.items.map((subItem) => (
                <button
                  className="hover:bg-gray-700 px-2 py-1 w-full text-left"
                  key={subItem.name}
                  onClick={subItem.action}
                >
                  {subItem.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AppBar;
