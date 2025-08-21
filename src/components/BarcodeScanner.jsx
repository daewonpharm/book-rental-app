import React, { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";


/**
* 안정화 포인트
* - decodeFromVideoDevice(deviceId, video, cb) 사용
* - 후면 카메라 우선 선택
* - 언마운트 시 reset() 및 트랙 정지
*/
export default function BarcodeScanner({ onDetected, onClose }) {
const videoRef = useRef(null);
const codeReaderRef = useRef(null);
const streamRef = useRef(null);


useEffect(() => {
const init = async () => {
try {
codeReaderRef.current = new BrowserMultiFormatReader();


// 후면 카메라 추정
const devices = await navigator.mediaDevices.enumerateDevices();
const videos = devices.filter(d => d.kind === "videoinput");
let backCam = videos.find(v => /back|rear|환경|후면/i.test(v.label));
if (!backCam && videos.length) backCam = videos[videos.length - 1];
const deviceId = backCam ? backCam.deviceId : undefined;


// 미디어 직접 열어 후면 강제
streamRef.current = await navigator.mediaDevices.getUserMedia({
video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: "environment" } },
audio: false,
});
if (videoRef.current) videoRef.current.srcObject = streamRef.current;


await codeReaderRef.current.decodeFromVideoDevice(
deviceId || null,
videoRef.current,
(result, err) => {
if (result) {
const text = result.getText();
// 즉시 정리 후 상위로 전달
cleanup();
onDetected && onDetected(text);
}
}
);
} catch (e) {
console.error(e);
}
};


const cleanup = () => {
try {
if (codeReaderRef.current) {
codeReaderRef.current.reset();
codeReaderRef.current = null;
}
} catch {}
try {
if (streamRef.current) {
streamRef.current.getTracks().forEach(t => t.stop());
streamRef.current = null;
}
} catch {}
};


init();
return () => cleanup();
}, [onDetected]);


return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
<div className="relative w-[92vw] max-w-sm rounded-2xl bg-white p-4">
<video ref={videoRef} className="w-full rounded-xl" autoPlay playsInline muted />
<div className="mt-2 rounded-lg border-2 border-green-500 p-2 text-center text-sm font-semibold">
초록 박스 안에 바코드를 맞춰주세요
</div>
<button
onClick={onClose}
className="mt-3 w-full rounded-xl bg-neutral-900 px-4 py-2 text-white"
>
}