import { useEffect, useState } from "react";

function createUrlFromBlob(imageBlob: any) {
  var URLObj = window.URL || window.webkitURL;

  // Creates a DOMString containing a URL representing the object given in the parameter
  // namely the original Blob
  return URLObj.createObjectURL(imageBlob);
}

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
export function useClipboardImageUrl() {
  const [clipboardImageUrl, setClipboardImageUrl] = useState<string | null>(
    null
  );
  useEffect(() => {
    let handler = function (e: any) {
      // Handle the event
      retrieveImageFromClipboardAsBlob(e, function (imageBlob: any) {
        const url = createUrlFromBlob(imageBlob);
        setClipboardImageUrl(url);
      });
    };
    window.addEventListener("paste", handler, false);
    return () => {
      window.removeEventListener("paste", handler);
    };
  }, [setClipboardImageUrl]);

  return { clipboardImageUrl };
}
