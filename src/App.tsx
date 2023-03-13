import { useEffect, useState, useRef } from "react";
// import reactLogo from "./assets/react.svg";
import "./App.css";
import * as mobilenet from "@tensorflow-models/mobilenet";

function App() {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const imageRef = useRef(null);
  const loadModel = async () => {
    console.log("Loading");
    try {
      setIsModelLoading(true);
      const model = await mobilenet.load();
      console.log("loaded");
      setModel(model);
    } catch (error) {
      console.log("error");
      console.log(error);
    } finally {
      console.log("loaded");
      setIsModelLoading(false);
    }
  };

  const uploadImage: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = event.target.files;
    if ((files?.length || 0) > 0) {
      const file = event.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        return;
      }
    }
    setImageUrl(null);
    return;
  };
  console.log(imageUrl);

  useEffect(() => {
    loadModel();
  }, []);

  // if (isModelLoading) {
  //   return <div>Loading model...</div>;
  // }
  return (
    <div className="App">
      <h1 className="header">Image Identification</h1>
      <div className="inputHolder">
        <input
          type="file"
          accept="image/*"
          capture="user"
          className="uploadInput"
          onChange={uploadImage}
        />
      </div>
      <div className="mainWrapper">
        <div className="mainContent">
          <div className="imageHolder">
            {imageUrl && (
              <img
                src={imageUrl || ""}
                alt="Upload Preview"
                crossOrigin="anonymous"
                ref={imageRef}
              />
            )}
          </div>
        </div>
        {imageUrl && <button className="button">Identify Image</button>}
      </div>
    </div>
  );
}

export default App;

//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={require("./assets/react.svg")} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.

//   };

//   return (
//     <div className="App">
//       <h1>Image Identification</h1>
//     </div>
//   );
// }

// export default App;
