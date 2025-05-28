import { useState, useEffect } from "react";

interface MedicalRecord {
  id: number;
  reservationTime: string;
  petName: string;
  symptom: string;
  doctorName: string;
  status: string;
  userId: number;
  reservationId?: number;
  hasMedicalRecord: boolean;
  weight?: number;
  age?: number;
  diagnosis?: string;
  treatment?: string;
  surgery?: {
    surgeryName?: string;
    surgeryDate?: string;
    anesthesiaType?: string;
    surgeryNote?: string;
    resultUrl?: string;
  };
  hospitalization?: {
    admissionDate?: string;
    dischargeDate?: string;
    reason?: string;
    imageUrl?: string;
  };
  checkups?: {
    checkupType?: string;
    checkupDate?: string;
    result?: string;
    resultUrl?: string;
  }[];
  userName?: string;
  petId?: number;
  doctorId?: number;
  reservationDate?: string;
}

interface ChartModalProps {
  onClose: () => void;
  record: MedicalRecord | null;
  currentUserId: number;
  onSaved?: (id: number, reservationId: number) => void;
}

interface TestRecord {
  testName: string;
  testDate: string;
  testResult: string;
  testFile: File | null;
  testFileUrl?: string;
  testFilePreview?: string;
}

interface ReservationInfo {
  id: number;
  userId: number;
  userName: string;
  petId: number;
  petName: string;
  doctorId: number;
  doctorName: string;
  reservationDate: string;
  reservationTime: string;
  status: string;
  symptom: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  hasMedicalRecord: boolean;
}

export default function ChartModal({
  onClose,
  record,
  currentUserId,
  onSaved,
}: ChartModalProps) {
  const reservationDetails = record
    ? {
        reservationId: record.id,
        userId: record.userId,
        userName: record.userName || "",
        petId: record.petId || 0,
        petName: record.petName,
        doctorId: record.doctorId,
        doctorName: record.doctorName,
        reservationDate: record.reservationDate || "",
        reservationTime: record.reservationTime,
        weight: record.weight,
        age: record.age,
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        surgery: record.surgery,
        hospitalization: record.hospitalization,
        checkups: record.checkups,
      }
    : null;

  const [weight, setWeight] = useState(
    reservationDetails?.weight?.toString() ?? ""
  );
  const [age, setAge] = useState(reservationDetails?.age?.toString() ?? "");
  const [diagnosis, setDiagnosis] = useState(
    reservationDetails?.diagnosis ?? ""
  );
  const [treatment, setTreatment] = useState(
    reservationDetails?.treatment ?? ""
  );
  const [showSurgery, setShowSurgery] = useState(!!record?.surgery);
  const [showHospitalization, setShowHospitalization] = useState(
    !!record?.hospitalization
  );
  const [showTest, setShowTest] = useState(
    !!record?.checkups && record.checkups.length > 0
  );
  const [reservationInfo, setReservationInfo] = useState<ReservationInfo>(
    {} as ReservationInfo
  );
  const [petId, setPetId] = useState<number>(record?.petId || 0);

  const [testRecords, setTestRecords] = useState<TestRecord[]>(
    record?.checkups?.map((checkup) => ({
      testName: checkup.checkupType || "",
      testDate: checkup.checkupDate || "",
      testResult: checkup.result || "",
      testFile: null,
      testFileUrl: checkup.resultUrl,
      testFilePreview: checkup.resultUrl?.startsWith("http")
        ? checkup.resultUrl
        : undefined,
    })) || []
  );

  const [surgeryName, setSurgeryName] = useState(
    record?.surgery?.surgeryName ?? ""
  );
  const [surgeryDate, setSurgeryDate] = useState(
    record?.surgery?.surgeryDate ?? ""
  );
  const [anesthesiaType, setAnesthesiaType] = useState<string>(
    record?.surgery?.anesthesiaType ?? ""
  );
  const [surgeryDetail, setSurgeryDetail] = useState(
    record?.surgery?.surgeryNote ?? ""
  );

  const [admissionDate, setAdmissionDate] = useState(
    record?.hospitalization?.admissionDate ?? ""
  );
  const [dischargeDate, setDischargeDate] = useState(
    record?.hospitalization?.dischargeDate ?? ""
  );
  const [hospitalReason, setHospitalReason] = useState(
    record?.hospitalization?.reason ?? ""
  );
  const [hospitalImageUrl, setHospitalImageUrl] = useState<string | null>(
    record?.hospitalization?.imageUrl ?? null
  );
  const [hospitalImage, setHospitalImage] = useState<File | null>(null);
  const [hospitalImagePreview, setHospitalImagePreview] = useState<
    string | null
  >(record?.hospitalization?.imageUrl ?? null);

  const handleTestFileUpload = async (idx: number, file: File | null) => {
    if (!file) return;
    try {
      const folder = "CHECKUPS";
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/s3/presigned-url?s3Folder=${folder}&fileName=${encodeURIComponent(
          file.name
        )}&contentType=${encodeURIComponent(file.type)}`,
        {
          credentials: "include",
        }
      );
      const { url: presignedUrl } = await res.json();
      if (!presignedUrl) throw new Error("Presigned URL 생성 실패");
      await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const objectKey = presignedUrl.split(".com/")[1]?.split("?")[0];
      const finalUrl = `https://anidoc-bucket.s3.ap-northeast-2.amazonaws.com/${objectKey}`;
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;
      setTestRecords((records) =>
        records.map((rec, i) =>
          i === idx
            ? {
                ...rec,
                testFile: file,
                testFileUrl: finalUrl,
                testFilePreview: previewUrl,
              }
            : rec
        )
      );
    } catch (err) {
      alert("검사 파일 업로드 실패");
    }
  };

  const handleHospitalImageUpload = async (file: File | null) => {
    if (!file) return;
    try {
      const folder = "HOSPITALIZATION";
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/s3/presigned-url?s3Folder=${folder}&fileName=${encodeURIComponent(
          file.name
        )}&contentType=${encodeURIComponent(file.type)}`,
        {
          credentials: "include",
        }
      );
      const { url: presignedUrl } = await res.json();
      if (!presignedUrl) throw new Error("Presigned URL 생성 실패");
      await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const objectKey = presignedUrl.split(".com/")[1]?.split("?")[0];
      const finalUrl = `https://anidoc-bucket.s3.ap-northeast-2.amazonaws.com/${objectKey}`;
      setHospitalImage(file);
      setHospitalImageUrl(finalUrl);
      setHospitalImagePreview(
        file.type.startsWith("image/") ? URL.createObjectURL(file) : null
      );
    } catch (err) {
      alert("입원 사진 업로드 실패");
    }
  };

  const formattedDate = reservationDetails?.reservationDate
    ? new Date(reservationDetails.reservationDate).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const formattedTime = reservationDetails?.reservationTime
    ? reservationDetails.reservationTime.split(":").slice(0, 2).join(":")
    : "";

  const handleSave = async () => {
    if (
      !reservationDetails ||
      typeof reservationDetails.reservationId !== "number" ||
      typeof reservationDetails.doctorId !== "number" ||
      typeof reservationDetails.userId !== "number"
    ) {
      alert(
        "진료 기록을 저장할 수 없습니다. 필요한 예약 정보가 누락되었습니다."
      );
      return;
    }

    try {
      const medicalPayload = {
        age: parseInt(age) || 0,
        currentWeight: parseFloat(weight) || 0,
        diagnosis,
        treatment,
        doctorId: currentUserId,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medical-records?userId=${currentUserId}&reservationId=${reservationDetails.reservationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(medicalPayload),
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("기본 진료기록 저장 실패:", {
          status: res.status,
          statusText: res.statusText,
          errorBody,
          headers: Object.fromEntries(res.headers.entries()),
          url: res.url,
        });

        if (res.status === 403 || res.status === 401) {
          const backendErrorMessage = errorBody || "권한이 없습니다.";
          alert(`진료 기록 저장 실패: ${backendErrorMessage}`);
          return;
        }

        if (res.status === 400) {
          alert("잘못된 요청입니다. 필요한 정보가 누락되었습니다.");
          return;
        }

        if (res.status === 500) {
          try {
            const errorData = JSON.parse(errorBody);
            if (errorData.message === "진료 기록을 작성할 권한이 없습니다.") {
              alert(
                "진료 기록을 작성할 권한이 없습니다. 의사 계정으로 로그인해주세요."
              );
              console.error("Permission denied. Full error details:", {
                errorData,
                requestDetails: {
                  url: res.url,
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  payload: medicalPayload,
                  credentials: "include",
                },
              });
            } else {
              alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
              console.error("Server error:", { errorData });
            }
          } catch (parseError) {
            alert("서버 응답을 처리하는데 실패했습니다.");
            console.error("Failed to parse server error response:", {
              status: res.status,
              errorBody,
              parseError,
            });
          }
          return;
        }

        throw new Error(
          `기본 진료기록 저장 실패: ${res.status} - ${errorBody}`
        );
      }

      const result = await res.json();
      const medicalRecordId = result.medicalRecord?.id;

      if (!medicalRecordId) {
        console.error(
          "기본 진료기록 저장 응답에서 medicalRecord ID를 찾을 수 없음:",
          result
        );
        alert(
          "진료 기록 저장은 성공했지만, 상세 기록 저장에 필요한 정보가 부족합니다."
        );
        onClose();
        return;
      }
      if (record?.reservationId !== undefined && onSaved) {
        onSaved(medicalRecordId, record.reservationId);
      }

      const petIdToSave = reservationDetails.petId;
      if (!petIdToSave) {
        console.warn(
          "펫 ID를 찾을 수 없어 일부 상세 기록 저장이 누락될 수 있습니다.",
          reservationDetails
        );
      }

      if (showTest && testRecords.length > 0) {
        for (const rec of testRecords) {
          if (!rec.testName || !rec.testDate || !rec.testResult) {
            console.warn(
              "필수 필드가 누락된 검사 기록이 있습니다. 저장하지 않습니다.",
              rec
            );
            continue;
          }
          const checkupRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medical-records/${medicalRecordId}/checkup?userId=${currentUserId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                medicalRecordId: medicalRecordId,
                petId: petIdToSave,
                checkupType: rec.testName,
                checkupDate: rec.testDate,
                result: rec.testResult,
                resultUrl: rec.testFileUrl,
              }),
              credentials: "include",
            }
          );
          if (!checkupRes.ok) {
            const errorBody = await checkupRes.text();
            console.error(
              "개별 검사 기록 저장 실패:",
              checkupRes.status,
              errorBody
            );
            alert(`일부 검사 기록 저장 실패: ${checkupRes.status}`);
          }
        }
      }

      if (
        showHospitalization &&
        admissionDate &&
        dischargeDate &&
        hospitalReason
      ) {
        const hospitalizationRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medical-records/${medicalRecordId}/hospitalization?userId=${currentUserId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              medicalRecordId: medicalRecordId,
              petId: petIdToSave,
              admissionDate,
              dischargeDate,
              reason: hospitalReason,
              imageUrl: hospitalImageUrl,
            }),
            credentials: "include",
          }
        );
        if (!hospitalizationRes.ok) {
          const errorBody = await hospitalizationRes.text();
          console.error(
            "입원 기록 저장 실패:",
            hospitalizationRes.status,
            errorBody
          );
          alert(`입원 기록 저장 실패: ${hospitalizationRes.status}`);
        }
      }

      if (
        showSurgery &&
        surgeryName &&
        surgeryDate &&
        anesthesiaType &&
        surgeryDetail
      ) {
        const surgeryRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medical-records/${medicalRecordId}/surgery?userId=${currentUserId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              medicalRecordId: medicalRecordId,
              petId: petIdToSave,
              surgeryName: surgeryName,
              surgeryDate: surgeryDate,
              surgeryNote: surgeryDetail,
              anesthesiaType: anesthesiaType,
            }),
            credentials: "include",
          }
        );
        if (!surgeryRes.ok) {
          const errorBody = await surgeryRes.text();
          console.error("수술 기록 저장 실패:", surgeryRes.status, errorBody);
          alert(`수술 기록 저장 실패: ${surgeryRes.status}`);
        }
      }

      alert("진료기록 저장 완료!");
      onClose();
      return;
    } catch (error) {
      alert(
        `진료기록 저장 중 오류 발생: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      console.error("진료기록 저장 최종 에러:", error);
    }
  };

  const handleAddTestRecord = () => {
    setTestRecords([
      ...testRecords,
      {
        testName: "",
        testDate: "",
        testResult: "",
        testFile: null,
        testFileUrl: undefined,
        testFilePreview: undefined,
      },
    ]);
  };
  const handleRemoveTestRecord = (idx: number) => {
    setTestRecords(testRecords.filter((_, i) => i !== idx));
  };
  const handleTestRecordChange = (
    idx: number,
    field: keyof TestRecord,
    value: any
  ) => {
    setTestRecords((records) =>
      records.map((rec, i) => (i === idx ? { ...rec, [field]: value } : rec))
    );
  };

  if (!record) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-12 relative max-h-[90vh] overflow-y-auto animate-fadeIn">
          <button
            className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 text-3xl"
            onClick={onClose}
          >
            &times;
          </button>
          <div className="text-center py-10 text-red-500 text-lg">
            오류: 진료 기록 정보를 불러오지 못했습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-12 relative max-h-[90vh] overflow-y-auto animate-fadeIn">
        <button
          className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 text-3xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-8">Medical Record</h2>
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">담당의</label>
            <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
              {record.doctorName || "담당의 미지정"}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">진료일</label>
            <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
              {formattedDate} {formattedTime}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              보호자 이름
            </label>
            <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
              {record.userName}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              반려동물 이름
            </label>
            <div className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-700">
              {record.petName}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">체중</label>
            <div className="relative">
              <input
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="예: 2.3"
                type="number"
                step="0.01"
                min="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
                kg
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">나이</label>
            <input
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
              placeholder="예: 3세"
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-xs text-gray-500 mb-1">진단 내용</label>
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
          />
        </div>
        <div className="mb-8">
          <label className="block text-xs text-gray-500 mb-1">치료 내용</label>
          <textarea
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
          />
        </div>
        <div className="flex flex-col gap-4 mb-10">
          <div>
            {!showTest ? (
              <button
                type="button"
                onClick={() => setShowTest(true)}
                className="w-full py-3 rounded bg-teal-50 text-teal-700 font-medium hover:bg-teal-100 transition"
              >
                검사 기록 추가
              </button>
            ) : (
              <div className="space-y-2 bg-gray-50 rounded p-4 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-teal-700">검사 기록</span>
                  <button
                    type="button"
                    onClick={() => setShowTest(false)}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    차트 닫기
                  </button>
                </div>
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={handleAddTestRecord}
                    className="px-3 py-1 rounded bg-teal-500 text-white text-sm"
                  >
                    + 기록 추가
                  </button>
                </div>
                {testRecords.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-4">
                    추가된 검사 기록이 없습니다. [기록 추가] 버튼을 눌러주세요.
                  </div>
                )}
                {testRecords.map((rec, idx) => (
                  <div
                    key={idx}
                    className="relative bg-white border border-gray-200 rounded px-3 py-4 mb-4"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveTestRecord(idx)}
                      className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-600"
                    >
                      삭제
                    </button>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        검사 종류
                      </label>
                      <select
                        value={rec.testName}
                        onChange={(e) =>
                          handleTestRecordChange(
                            idx,
                            "testName",
                            e.target.value
                          )
                        }
                        className="w-full bg-white border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                      >
                        <option value="">선택하세요</option>
                        <option value="CT">CT</option>
                        <option value="X_RAY">X-RAY</option>
                        <option value="BLOOD_TEST">혈액 검사</option>
                        <option value="ALLERGY_TEST">알레르기 검사</option>
                        <option value="ULTRASOUND">초음파</option>
                        <option value="EMESIS_TEST">구토 검사</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        검사일
                      </label>
                      <input
                        type="date"
                        value={rec.testDate}
                        onChange={(e) =>
                          handleTestRecordChange(
                            idx,
                            "testDate",
                            e.target.value
                          )
                        }
                        className="w-full bg-white border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        검사 결과
                      </label>
                      <textarea
                        value={rec.testResult}
                        onChange={(e) =>
                          handleTestRecordChange(
                            idx,
                            "testResult",
                            e.target.value
                          )
                        }
                        className="w-full bg-white border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        검사 파일
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0] || null;
                          await handleTestFileUpload(idx, file);
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                      />
                      {rec.testFile && (
                        <div className="mt-1 text-xs text-gray-500">
                          {rec.testFile.name}
                        </div>
                      )}
                      {rec.testFilePreview && (
                        <img
                          src={rec.testFilePreview}
                          alt="미리보기"
                          className="mt-2 max-h-32 rounded"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            {!showSurgery ? (
              <button
                type="button"
                onClick={() => setShowSurgery(true)}
                className="w-full py-3 rounded bg-teal-50 text-teal-700 font-medium hover:bg-teal-100 transition"
              >
                수술 기록 추가
              </button>
            ) : (
              <div className="space-y-2 bg-gray-50 rounded p-4 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-teal-700">수술 기록</span>
                  <button
                    type="button"
                    onClick={() => setShowSurgery(false)}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    차트 닫기
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    수술명
                  </label>
                  <input
                    value={surgeryName}
                    onChange={(e) => setSurgeryName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                    placeholder="예: 슬개골 탈구 수술"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    수술일
                  </label>
                  <input
                    type="date"
                    value={surgeryDate}
                    onChange={(e) => setSurgeryDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    마취 종류
                  </label>
                  <select
                    value={anesthesiaType}
                    onChange={(e) => setAnesthesiaType(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                  >
                    <option value="">선택하세요</option>
                    <option value="GENERAL">전신 마취</option>
                    <option value="REGIONAL">부분 마취</option>
                    <option value="LOCAL">국소 마취</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    수술 내용
                  </label>
                  <textarea
                    value={surgeryDetail}
                    onChange={(e) => setSurgeryDetail(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                  />
                </div>
              </div>
            )}
          </div>
          <div>
            {!showHospitalization ? (
              <button
                type="button"
                onClick={() => setShowHospitalization(true)}
                className="w-full py-3 rounded bg-teal-50 text-teal-700 font-medium hover:bg-teal-100 transition"
              >
                입원 기록 추가
              </button>
            ) : (
              <div className="space-y-2 bg-gray-50 rounded p-4 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-teal-700">입원 기록</span>
                  <button
                    type="button"
                    onClick={() => setShowHospitalization(false)}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    차트 닫기
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    입원 일자
                  </label>
                  <input
                    type="date"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    퇴원 일자
                  </label>
                  <input
                    type="date"
                    value={dischargeDate}
                    onChange={(e) => setDischargeDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    입원 사유
                  </label>
                  <textarea
                    value={hospitalReason}
                    onChange={(e) => setHospitalReason(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    입원 사진
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0] || null;
                      await handleHospitalImageUpload(file);
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                  {hospitalImage && (
                    <div className="mt-1 text-xs text-gray-500">
                      {hospitalImage.name}
                    </div>
                  )}
                  {hospitalImagePreview && (
                    <img
                      src={hospitalImagePreview}
                      alt="미리보기"
                      className="mt-2 max-h-32 rounded"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              onClose();
            }}
            className="px-6 py-3 rounded bg-gray-100 text-gray-700 text-lg"
          >
            닫기
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded bg-teal-500 text-white text-lg"
          >
            진료 기록 저장
          </button>
        </div>
      </div>
    </div>
  );
}
