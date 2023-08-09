import React, { useState, useEffect } from "react";
import {
  BrowserMultiFormatReader,
  DecodeHintType,
  BarcodeFormat,
} from "@zxing/library";
function IDScanner() {
  const [scannedID, setScannedID] = useState("");
  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    const selectBackCamera = async (videoInputDevices) => {
      const backCamera = videoInputDevices.find((device) =>
        device.label.toLowerCase().includes("back")
      );
      return backCamera || videoInputDevices[0];
    };
    const focusCamera = (stream, enable) => {
      const tracks = stream.getVideoTracks();
      if (tracks.length > 0) {
        const capabilities = tracks[0].getCapabilities();
        if (
          capabilities.focusMode &&
          capabilities.focusMode.includes("continuous")
        ) {
          tracks[0].applyConstraints({
            advanced: [{ focusMode: enable ? "continuous" : "none" }],
          });
        }
      }
    };
    const decodeContinuously = async () => {
      try {
        const selectedDevice = await codeReader.getVideoInputDevices();
        const deviceId = await selectBackCamera(selectedDevice).deviceId;
        const hints = new Map();
        const formats = [
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.CODE_93,
          BarcodeFormat.CODABAR,
          BarcodeFormat.DATA_MATRIX,
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.ITF,
          BarcodeFormat.PDF_417,
          BarcodeFormat.QR_CODE,
          BarcodeFormat.RSS_14,
          BarcodeFormat.RSS_EXPANDED,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.UPC_EAN_EXTENSION,
        ];
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
        hints.set(DecodeHintType.TRY_HARDER, true);
        codeReader.decodeFromInputVideoDeviceContinuously(
          deviceId,
          "video",
          (result, error, controls) => {
            if (result) {
              setScannedID(result.text);
              focusCamera(controls.stream, false); // Disable continuous focus after barcode detection
            } else if (error) {
              console.error("Error decoding barcode:", error);
            }
          },
          hints
        );
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };
    decodeContinuously();
    return () => {
      codeReader.reset();
    };
  }, []);
  return (
    <div>
      <h1>ID Scanner</h1>
      <video id="video" width="100%" height="auto" autoPlay />
      <p>Scanned ID: {scannedID}</p>
    </div>
  );
}
export default IDScanner;