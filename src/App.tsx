import { useEffect, useState, useRef } from "react";
// import reactLogo from "./assets/react.svg";
// import "./App.css";
import { useClipboardImageUrl } from "./useClipboardImageUrl";
import { useModel } from "./useModel";

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

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [history, setHistory] = useState<string[]>([]);

  const [results, setResults] = useState<Array<
    Awaited<ReturnType<ReturnType<typeof useModel>["classify"]>>
  > | null>(null);

  const textInputRef = useRef<React.LegacyRef<HTMLInputElement>>(null);
  const fileInputRef = useRef<React.LegacyRef<HTMLInputElement>>(null);
  const imageRef = useRef<React.LegacyRef<HTMLImageElement>>(null);

  const { isModelLoading, classify, isModelLoaded } = useModel();

  const { clipboardImageUrl } = useClipboardImageUrl();

  useEffect(() => {
    setImageUrl(clipboardImageUrl);
  }, [clipboardImageUrl, setImageUrl]);

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
      const results = await classify(imageRef.current as any);
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
