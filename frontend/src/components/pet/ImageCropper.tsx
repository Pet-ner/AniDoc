// components/ImageCropper.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MediaSize {
  naturalWidth: number;
  naturalHeight: number;
  width: number;
  height: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null
  );
  const [mediaSize, setMediaSize] = useState<MediaSize | null>(null);

  // 이미지 로드 시 미디어 크기 설정
  const onMediaLoaded = useCallback((mediaSize: MediaSize) => {
    setMediaSize(mediaSize);
    console.log("Media loaded:", mediaSize);
  }, []);

  // 첨부한 이미지의 출력 사이즈 (고정값 - 실제 카드에서 보이는 크기)
  const OUTPUT_SIZE = {
    width: 384, // 24rem = 384px (카드 이미지 영역 크기)
    height: 192, // 12rem = 192px (h-48)
  };

  // 크롭 영역을 출력 사이즈와 동일하게 설정
  const cropSize = {
    width: OUTPUT_SIZE.width,
    height: OUTPUT_SIZE.height,
  };

  // 종횡비를 출력 사이즈 비율로 설정
  const aspectRatio = OUTPUT_SIZE.width / OUTPUT_SIZE.height; // 2:1 비율

  const onCropCompleteHandler = useCallback(
    (croppedArea: CropArea, croppedAreaPixels: CropArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
      console.log("Crop area pixels:", croppedAreaPixels);
      console.log("Output size:", OUTPUT_SIZE);
    },
    []
  );

  // 출력 사이즈로 크롭된 이미지를 생성하는 함수
  const createCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels || !mediaSize) return;

    try {
      const croppedImageBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        OUTPUT_SIZE.width,
        OUTPUT_SIZE.height
      );
      onCropComplete(croppedImageBlob);
    } catch (error) {
      console.error("이미지 크롭 실패:", error);
    }
  }, [croppedAreaPixels, imageSrc, rotation, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4">
      {/* 스크롤 가능한 모달 컨테이너 */}
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden flex flex-col">
        {/* 고정 헤더 */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold">이미지 편집</h2>
        </div>

        {/* 스크롤 가능한 내용 영역 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 크롭 영역 */}
          <div className="relative h-[400px] bg-gray-100 rounded-lg overflow-hidden mb-4">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              cropShape="rect"
              cropSize={cropSize}
              onCropChange={setCrop}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onMediaLoaded={onMediaLoaded}
              showGrid={true}
              style={{
                containerStyle: {
                  backgroundColor: "#f3f4f6",
                },
                mediaStyle: {
                  objectFit: "contain",
                },
                cropAreaStyle: {
                  border: "3px solid #14b8a6",
                  borderRadius: "8px",
                  boxShadow: "0 0 0 2px rgba(20, 184, 166, 0.2)",
                },
              }}
            />
          </div>

          {/* 이미지 정보 표시 */}
          {mediaSize && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-800 font-medium">
                    📐 원본 이미지: {mediaSize.naturalWidth} ×{" "}
                    {mediaSize.naturalHeight}px
                  </p>
                  <p className="text-blue-600">
                    📱 화면 표시: {mediaSize.width} × {mediaSize.height}px
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">
                    🎯 크롭 영역: {OUTPUT_SIZE.width} × {OUTPUT_SIZE.height}px
                  </p>
                  <p className="text-blue-600 font-medium">
                    ✂️ 최종 출력: {OUTPUT_SIZE.width} × {OUTPUT_SIZE.height}px
                  </p>
                </div>
              </div>
              <p className="text-blue-500 text-xs mt-2">
                💡 크롭 영역이 카드에서 보이는 이미지 크기와 정확히 일치합니다
                (2:1 비율)
              </p>
            </div>
          )}

          {/* 컨트롤 */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 확대/축소: {zoom.toFixed(1)}x
              </label>
              <input
                type="range"
                value={zoom}
                min={0.1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔄 회전: {rotation}°
              </label>
              <input
                type="range"
                value={rotation}
                min={0}
                max={360}
                step={1}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 고정 버튼 영역 */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0 bg-white">
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={createCroppedImage}
              disabled={!croppedAreaPixels}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              적용 ({OUTPUT_SIZE.width}×{OUTPUT_SIZE.height})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 고정 출력 사이즈로 크롭하는 유틸리티 함수
const getCroppedImg = (
  imageSrc: string,
  pixelCrop: CropArea,
  rotation = 0,
  outputWidth: number,
  outputHeight: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context를 가져올 수 없습니다."));
        return;
      }

      // 회전을 위한 임시 캔버스
      const maxSize = Math.max(image.width, image.height);
      const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

      canvas.width = safeArea;
      canvas.height = safeArea;

      ctx.translate(safeArea / 2, safeArea / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-safeArea / 2, -safeArea / 2);

      ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
      );

      const data = ctx.getImageData(0, 0, safeArea, safeArea);

      // 최종 출력 캔버스 설정 (고정 출력 크기)
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // 크롭된 영역 추출
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");

      if (!tempCtx) {
        reject(new Error("Temp canvas context를 가져올 수 없습니다."));
        return;
      }

      tempCanvas.width = pixelCrop.width;
      tempCanvas.height = pixelCrop.height;

      tempCtx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
        Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
      );

      // 최종 캔버스에 고정 크기로 그리기
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, outputWidth, outputHeight);
      ctx.drawImage(
        tempCanvas,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputWidth,
        outputHeight
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log(
              `크롭된 이미지 크기: ${outputWidth}×${outputHeight}, 파일 크기: ${blob.size} bytes`
            );
            resolve(blob);
          } else {
            reject(new Error("이미지 크롭에 실패했습니다."));
          }
        },
        "image/jpeg",
        0.95
      );
    };

    image.onerror = () => {
      reject(new Error("이미지 로드에 실패했습니다."));
    };

    image.src = imageSrc;
  });
};

export default ImageCropper;
