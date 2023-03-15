import { useEffect, useState, useCallback } from "react";
import "@tensorflow/tfjs-backend-webgl";

import * as mobilenet from "@tensorflow-models/mobilenet";

export function useModel() {
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);

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
    loadModel();
  }, []);

  const classify = useCallback(
    (...inputs: Parameters<mobilenet.MobileNet["classify"]>) => {
      return model?.classify(...inputs);
    },
    [model]
  );

  return { model, isModelLoading, classify, isModelLoaded: !!model };
}
