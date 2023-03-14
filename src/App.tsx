import { useEffect, useState, useRef } from "react";
// import reactLogo from "./assets/react.svg";
// import "./App.css";
import "@tensorflow/tfjs-backend-webgl";
import * as mobilenet from "@tensorflow-models/mobilenet";

function retrieveImageFromClipboardAsBlob(pasteEvent: any, callback: Function) {
  if (pasteEvent.clipboardData == false) {
    if (typeof callback == "function") {
      callback(undefined);
    }
  }

  var items = pasteEvent.clipboardData.items;

  if (items == undefined) {
    if (typeof callback == "function") {
      callback(undefined);
    }
  }

  for (var i = 0; i < items.length; i++) {
    // Skip content if not image
    if (items[i].type.indexOf("image") == -1) continue;
    // Retrieve image on clipboard as blob
    var blob = items[i].getAsFile();

    if (typeof callback == "function") {
      callback(blob);
    }
  }
}

// const pasteHandler = function (event: any) {

//   window.addEventListener(
//     "paste",
//     function (e) {
//       // Handle the event
//       retrieveImageFromClipboardAsBlob(e, function (imageBlob) {

//           createUrlFromBlob(img, imageBlob);

//       });
//     },
//     false
//   );
// };

function createUrlFromBlob(imageBlob: any) {
  var URLObj = window.URL || window.webkitURL;

  // Creates a DOMString containing a URL representing the object given in the parameter
  // namely the original Blob
  return URLObj.createObjectURL(imageBlob);
}

function App() {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [history, setHistory] = useState<string[]>([]);

  const [results, setResults] = useState<Awaited<
    ReturnType<mobilenet.MobileNet["classify"]>
  > | null>(null);

  const textInputRef = useRef<React.LegacyRef<HTMLInputElement>>(null);
  const fileInputRef = useRef<React.LegacyRef<HTMLInputElement>>(null);
  const imageRef = useRef<React.LegacyRef<HTMLImageElement>>(null);
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
      setIsModelLoading(false);
    }
  };

  useEffect(() => {
    let handler = function (e: any) {
      // Handle the event
      retrieveImageFromClipboardAsBlob(e, function (imageBlob) {
        const url = createUrlFromBlob(imageBlob);
        setImageUrl(url);
      });
    };
    window.addEventListener("paste", handler, false);
    return () => {
      window.removeEventListener("paste", handler);
    };
  }, [setImageUrl]);
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

  useEffect(() => {
    loadModel();
  }, []);

  useEffect(() => {
    if (imageUrl != null) {
      setHistory((history) => {
        let index = history.indexOf(imageUrl);
        let arr = history;
        if (index != -1) {
          arr = arr.splice(index, 1);
        }

        return [imageUrl, ...arr];
      });
    }
  }, [imageUrl]);

  const handleOnChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setImageUrl(e.target.value as string);
    setResults([]);
  };
  const triggerUpload = () => {
    if (fileInputRef.current) {
      (fileInputRef.current as any).click();
    }
  };

  const identify = async () => {
    console.log("identifying1");
    if (imageRef.current != null) {
      console.log("identifying2");
      const results = await model?.classify(imageRef.current as any);
      console.log(results);
      setResults(results);
    }
  };

  if (isModelLoading) {
    return <div>Loading model...</div>;
  }
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
          ref={fileInputRef}
        />
        <button className="uploadImage" onClick={triggerUpload}>
          Upload Image
        </button>
        <span className="or">OR</span>
        <input
          type="text"
          placeholder="Paster image URL"
          ref={textInputRef}
          onChange={handleOnChange}
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
          {(results?.length || 0) > 0 && (
            <div className="resultsHolder">
              {results.map((result, index) => {
                return (
                  <div className="result" key={result.className}>
                    <span className="name">{result.className}</span>
                    <span className="confidence">
                      Confidence level: {(result.probability * 100).toFixed(2)}%{" "}
                      {index === 0 && (
                        <span className="bestGuess">Best Guess</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {imageUrl && (
          <button className="button" onClick={identify}>
            Identify Image
          </button>
        )}
      </div>

      {history.length > 0 && (
        <div className="recentPredictions">
          <h2>Recent Images</h2>
          <div className="recentImages">
            {history.map((image, index) => {
              return (
                <div className="recentPrediction" key={`${image}${index}`}>
                  <img
                    src={image}
                    alt="Recent Prediction"
                    onClick={() => setImageUrl(image)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
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
