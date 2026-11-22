import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Webcam from "react-webcam";
import { FiCamera, FiCheck, FiRefreshCw, FiRotateCw, FiX } from "react-icons/fi";
import styles from "./LiveCamera.module.css";

function getCameraError(error) {
  const name = typeof error === "object" && error !== null ? error.name : "";
  const message = typeof error === "string" ? error.toLowerCase() : "";
  if (name === "NotAllowedError" || name === "SecurityError" || message.includes("permission") || message.includes("denied")) {
    return {
      title: "Camera permission required",
      message: "Allow camera access in your browser settings to take a photo.",
    };
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return {
      title: "No camera found",
      message: "We couldn't find an available camera on this device. You can upload an image instead.",
    };
  }
  return {
    title: "Camera unavailable",
    message: "The camera could not be started. Please try again or upload an image.",
  };
}

function makeImageFile(dataUrl) {
  const [metadata, encoded] = dataUrl.split(",");
  const mimeType = metadata.match(/^data:(.*?);base64$/)?.[1];
  if (!mimeType || !encoded) throw new Error("The captured photo could not be prepared. Please try again.");
  const bytes = window.atob(encoded);
  const buffer = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1) buffer[index] = bytes.charCodeAt(index);
  const extension = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  return new File([buffer], `cogniface-photo-${Date.now()}.${extension}`, { type: mimeType });
}

export default function LiveCamera({ onCapture, onClose }) {
  const webcamRef = useRef(null);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const streamRef = useRef(null);
  const trackEndedHandlersRef = useRef(new Map());
  const onCloseRef = useRef(onClose);
  const photoUrlRef = useRef(null);
  const [cameraError, setCameraError] = useState(() => {
    if (!window.isSecureContext) {
      return {
        title: "Secure connection required",
        message: "Camera access requires HTTPS or a trusted local connection. You can upload an image instead.",
      };
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      return {
        title: "Camera not supported",
        message: "This browser does not support camera access. You can upload an image instead.",
      };
    }
    return null;
  });
  const [cameraReady, setCameraReady] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [deviceIndex, setDeviceIndex] = useState(-1);
  const [cameraKey, setCameraKey] = useState(0);
  const [facingMode, setFacingMode] = useState(
    window.matchMedia("(pointer: coarse)").matches ? "user" : undefined,
  );
  const secureContext = window.isSecureContext;

  const stopStream = useCallback(() => {
    const stream = streamRef.current || webcamRef.current?.stream;
    stream?.getTracks().forEach(track => {
      const handleEnded = trackEndedHandlersRef.current.get(track);
      if (handleEnded) track.removeEventListener("ended", handleEnded);
      trackEndedHandlersRef.current.delete(track);
      track.stop();
    });
    streamRef.current = null;
  }, []);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    const handleKeyDown = event => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll("button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex='-1'])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.cancelAnimationFrame(focusFrame);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
      stopStream();
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    };
  }, [stopStream]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleUserMedia = async stream => {
    if (streamRef.current && streamRef.current !== stream) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    streamRef.current = stream;
    setCameraError(null);
    setCameraReady(true);
    stream.getVideoTracks().forEach(track => {
      const handleEnded = () => {
        setCameraReady(false);
        setCameraError({
          title: "Camera unavailable",
          message: "The camera stopped unexpectedly. Please try again or upload an image instead.",
        });
      };
      trackEndedHandlersRef.current.set(track, handleEnded);
      track.addEventListener("ended", handleEnded, { once: true });
    });
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === "videoinput");
      setCameraDevices(cameras);
      const activeDeviceId = stream.getVideoTracks()[0]?.getSettings().deviceId;
      setDeviceIndex(cameras.findIndex(device => device.deviceId === activeDeviceId));
    } catch {
      setCameraDevices([]);
      setDeviceIndex(-1);
    }
  };

  const handleCameraError = error => {
    stopStream();
    setCameraReady(false);
    setCameraError(getCameraError(error));
  };

  const switchCamera = () => {
    if (cameraDevices.length > 1) {
      const nextIndex = (deviceIndex + 1 + cameraDevices.length) % cameraDevices.length;
      setDeviceIndex(nextIndex);
      setFacingMode(undefined);
    } else {
      setFacingMode(current => current === "user" ? "environment" : "user");
    }
    stopStream();
    setCameraReady(false);
    setCameraError(null);
    setCameraKey(value => value + 1);
  };

  const capturePhoto = () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) {
      setCameraError({
        title: "Photo not ready",
        message: "The camera is still starting. Wait a moment and try again.",
      });
      return;
    }
    try {
      const file = makeImageFile(screenshot);
      const previewUrl = URL.createObjectURL(file);
      photoUrlRef.current = previewUrl;
      setPhoto({ file, previewUrl });
      setCameraReady(false);
      stopStream();
    } catch (error) {
      setCameraError({
        title: "Photo could not be captured",
        message: error.message,
      });
    }
  };

  const retakePhoto = () => {
    if (photo) URL.revokeObjectURL(photo.previewUrl);
    photoUrlRef.current = null;
    setPhoto(null);
    setCameraError(null);
    setCameraReady(false);
    setCameraKey(value => value + 1);
  };

  const usePhoto = () => {
    if (!photo) return;
    stopStream();
    const accepted = onCapture(photo.file);
    if (accepted === false || typeof accepted === "string") {
      setCameraError({
        title: typeof accepted === "string" ? "Photo could not be added" : "Photo doesn't meet the image requirements",
        message: typeof accepted === "string"
          ? accepted
          : "Use a JPG, JPEG, or PNG photo that meets the workspace size limit. Retake the photo or upload an image instead.",
      });
      return;
    }
    onClose();
  };

  const videoConstraints = deviceIndex >= 0 && cameraDevices[deviceIndex]?.deviceId
    ? { deviceId: { exact: cameraDevices[deviceIndex].deviceId }, width: 640, height: 480 }
    : { ...(facingMode ? { facingMode: { ideal: facingMode } } : {}), width: 640, height: 480 };

  return createPortal((
    <div className={styles.backdrop} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="camera-title">
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.titleIcon}><FiCamera /></span>
            <div><h2 id="camera-title">Take a Photo</h2><p>Position your face within the frame.</p></div>
          </div>
          <button ref={closeButtonRef} type="button" className={styles.closeButton} onClick={onClose} aria-label="Close camera"><FiX /></button>
        </header>

        <div className={styles.previewFrame}>
          {photo ? (
            <img className={styles.capturedPhoto} src={photo.previewUrl} alt="Captured photo preview" />
          ) : secureContext && !cameraError?.title?.includes("not supported") && (
            <Webcam
              key={cameraKey}
              ref={webcamRef}
              className={styles.video}
              audio={false}
              mirrored={facingMode === "user" || (!facingMode && cameraDevices[deviceIndex]?.label.toLowerCase().includes("front"))}
              videoConstraints={videoConstraints}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.7}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleCameraError}
            />
          )}
          {!photo && !cameraError && !cameraReady && <div className={styles.loading}><span /><strong>Starting camera…</strong></div>}
          {cameraError && (
            <div className={styles.cameraError} role="alert">
              <span><FiCamera /></span>
              <strong>{cameraError.title}</strong>
              <p>{cameraError.message}</p>
              {!photo && secureContext && navigator.mediaDevices?.getUserMedia && (
                <button type="button" className={styles.retryButton} onClick={() => {
                  setCameraError(null);
                  setCameraKey(value => value + 1);
                }}><FiRefreshCw /> Try again</button>
              )}
            </div>
          )}
          {!photo && cameraReady && <div className={styles.faceGuide} aria-hidden="true"><i /><i /><i /><i /></div>}
          {!photo && cameraReady && <span className={styles.liveBadge}><i /> LIVE CAMERA</span>}
        </div>

        <div className={styles.instructions}>
          <span className={styles.statusDot} />
          {photo ? "Review your photo, or retake it if needed." : "Face the camera and keep your face clearly visible."}
        </div>

        <footer className={styles.controls}>
          {photo ? (
            <>
              <button type="button" className={styles.secondaryButton} onClick={retakePhoto}><FiRotateCw /> Retake Photo</button>
              <button type="button" className={styles.primaryButton} onClick={usePhoto}><FiCheck /> Use This Photo</button>
            </>
          ) : (
            <>
              <button type="button" className={styles.secondaryButton} onClick={onClose}>Close Camera</button>
              {(cameraDevices.length > 1 || window.matchMedia("(pointer: coarse)").matches) && <button type="button" className={styles.switchButton} onClick={switchCamera} aria-label="Switch camera"><FiRefreshCw /></button>}
              <button type="button" className={styles.primaryButton} onClick={capturePhoto} disabled={!cameraReady}><FiCamera /> Capture Photo</button>
            </>
          )}
        </footer>
      </section>
    </div>
  ), document.body);
}
