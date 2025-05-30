import { useState, useEffect } from "react";
import { MedicalRecord } from "../../types/medicalRecordTypes";

interface TestRecord {
  id?: number;
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

interface ChartModalProps {
  onClose: () => void;
  record: MedicalRecord;
  currentUserId: number;
  mode?: "create" | "edit";
  onSaved?: (id: number, reservationId: number) => void;
  hospitalizationId?: number;
  surgeryId?: number;
}

export default function ChartModal({
  onClose,
  record,
  currentUserId,
  mode,
  onSaved,
  hospitalizationId,
  surgeryId,
}: ChartModalProps) {
  console.log("ChartModal - Initial Record:", record);
  console.log("ChartModal - Mode:", mode);
  console.log(
    "ChartModal - Received hospitalizationId prop:",
    hospitalizationId
  );
  console.log("ChartModal - Received surgeryId prop:", surgeryId);

  // Log IDs right before state initialization
  console.log("Debug: IDs before state init - Surgery", surgeryId);
  console.log(
    "Debug: IDs before state init - Hospitalization",
    hospitalizationId
  );
  console.log(
    "Debug: IDs before state init - Checkups",
    record?.checkups?.map((c) => c.id)
  );

  const reservationDetails = record
    ? {
        reservationId: record.reservationId || record.id,
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
    record?.checkups?.map(
      (checkup: {
        id?: number;
        checkupType?: string;
        checkupDate?: string;
        result?: string;
        resultUrl?: string;
      }) => ({
        id: checkup.id,
        testName: checkup.checkupType || "",
        testDate: checkup.checkupDate || "",
        testResult: checkup.result || "",
        testFile: null,
        testFileUrl: checkup.resultUrl,
        testFilePreview: checkup.resultUrl?.startsWith("http")
          ? checkup.resultUrl
          : undefined,
      })
    ) || []
  );

  // State for Surgery Record including ID
  const [surgeryRecord, setSurgeryRecord] = useState({
    id: surgeryId,
    surgeryName: record?.surgery?.surgeryName ?? "",
    surgeryDate: record?.surgery?.surgeryDate ?? "",
    anesthesiaType: record?.surgery?.anesthesiaType ?? "",
    surgeryNote: record?.surgery?.surgeryNote ?? "",
  });

  // State for Hospitalization Record including ID
  const [hospitalizationRecord, setHospitalizationRecord] = useState({
    id: hospitalizationId,
    admissionDate: record?.hospitalization?.admissionDate ?? "",
    dischargeDate: record?.hospitalization?.dischargeDate ?? "",
    reason: record?.hospitalization?.reason ?? "",
    imageUrl: record?.hospitalization?.imageUrl ?? null,
    imageFile: null as File | null,
    imagePreview: record?.hospitalization?.imageUrl ?? null,
  });

  const handleSurgeryChange = (
    field: keyof typeof surgeryRecord,
    value: any
  ) => {
    setSurgeryRecord((prev) => ({ ...prev, [field]: value }));
  };

  const handleHospitalizationChange = (
    field: keyof typeof hospitalizationRecord,
    value: any
  ) => {
    setHospitalizationRecord((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    console.log("ChartModal - Effect - testRecords:", testRecords);
    console.log("ChartModal - Effect - surgeryRecord:", surgeryRecord);
    console.log(
      "ChartModal - Effect - hospitalizationRecord:",
      hospitalizationRecord
    );
  }, [testRecords, surgeryRecord, hospitalizationRecord]);

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

    setHospitalizationRecord((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));

    try {
      const folder = "HOSPITALIZATION";
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/s3/presigned-url?s3Folder=${folder}&fileName=${encodeURIComponent(
          file.name
        )}&contentType=${encodeURIComponent(file.type)}
      `,
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

      // Update imageUrl in hospitalizationRecord state
      setHospitalizationRecord((prev) => ({ ...prev, imageUrl: finalUrl }));
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
    console.log("Debug - reservationDetails:", reservationDetails);
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

    const isEditMode = record?.id !== undefined && mode === "edit";
    const medicalRecordId = record?.id;

    console.log("Debug - Record data:", {
      record,
      isEditMode,
      medicalRecordId,
      mode,
      hasMedicalRecord: record?.hasMedicalRecord,
    });

    try {
      const medicalPayload = {
        age: parseInt(age) || 0,
        currentWeight: parseFloat(weight) || 0,
        diagnosis,
        treatment,
        doctorId: currentUserId,
      };

      let res;
      if (isEditMode && medicalRecordId) {
        // 수정 모드
        res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medical-records/${medicalRecordId}?userId=${currentUserId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(medicalPayload),
            credentials: "include",
          }
        );
      } else {
        // 생성 모드
        res = await fetch(
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
      }

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("진료기록 저장 실패:", {
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
                  method: isEditMode ? "PUT" : "POST",
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

        throw new Error(`진료기록 저장 실패: ${res.status} - ${errorBody}`);
      }

      const result = await res.json();
      const newMedicalRecordId = result.medicalRecord?.id || medicalRecordId;

      if (!newMedicalRecordId) {
        console.error(
          "진료기록 저장 응답에서 medicalRecord ID를 찾을 수 없음:",
          result
        );
        alert(
          "진료 기록 저장은 성공했지만, 상세 기록 저장에 필요한 정보가 부족합니다."
        );
        onClose();
        return;
      }

      if (record?.reservationId !== undefined && onSaved) {
        onSaved(newMedicalRecordId, record.reservationId);
      }

      console.log("Saving records for medicalRecordId:", newMedicalRecordId);

      const petIdToSave = reservationDetails.petId;
      if (!petIdToSave) {
        console.warn(
          "펫 ID를 찾을 수 없어 일부 상세 기록 저장이 누락될 수 있습니다.",
          reservationDetails
        );
      }

      if (
        showSurgery &&
        surgeryRecord.surgeryName &&
        surgeryRecord.surgeryDate &&
        surgeryRecord.anesthesiaType &&
        surgeryRecord.surgeryNote
      ) {
        const surgeryRecordId = surgeryId;
        console.log("Surgery Save Debug: Before Fetch", {
          surgeryRecordId,
          surgeryRecord,
          record,
        });
        const method = surgeryRecordId ? "PUT" : "POST";
        const url = `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/medical-records/${newMedicalRecordId}/surgery${
          surgeryRecordId ? `/${surgeryRecordId}` : ""
        }?userId=${currentUserId}`;

        console.log("Surgery Save Debug: Fetch URL and Method", {
          url,
          method,
        });

        const surgeryRes = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            medicalRecordId: newMedicalRecordId,
            petId: petIdToSave,
            surgeryName: surgeryRecord.surgeryName,
            surgeryDate: surgeryRecord.surgeryDate,
            surgeryNote: surgeryRecord.surgeryNote,
            anesthesiaType: surgeryRecord.anesthesiaType,
          }),
          credentials: "include",
        });
        if (!surgeryRes.ok) {
          const errorBody = await surgeryRes.text();
          console.error("수술 기록 저장 실패:", surgeryRes.status, errorBody);
          alert(`수술 기록 저장 실패: ${surgeryRes.status}`);
        }
      }

      if (
        showHospitalization &&
        hospitalizationRecord.admissionDate &&
        hospitalizationRecord.dischargeDate &&
        hospitalizationRecord.reason
      ) {
        const hospitalizationRecordId = hospitalizationId;
        console.log("Hospitalization Save Debug: Before Fetch", {
          hospitalizationRecordId,
          hospitalizationRecord,
          record,
        });
        const method = hospitalizationRecordId ? "PUT" : "POST";
        const url = `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/medical-records/${newMedicalRecordId}/hospitalization${
          hospitalizationRecordId ? `/${hospitalizationRecordId}` : ""
        }?userId=${currentUserId}`;

        console.log("Hospitalization Save Debug: Fetch URL and Method", {
          url,
          method,
        });

        const hospitalizationRes = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            medicalRecordId: newMedicalRecordId,
            petId: petIdToSave,
            admissionDate: hospitalizationRecord.admissionDate,
            dischargeDate: hospitalizationRecord.dischargeDate,
            reason: hospitalizationRecord.reason,
            imageUrl: hospitalizationRecord.imageUrl,
          }),
          credentials: "include",
        });
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

      if (showTest && testRecords.length > 0) {
        for (const rec of testRecords) {
          if (!rec.testName || !rec.testDate || !rec.testResult) {
            console.warn(
              "필수 필드가 누락된 검사 기록이 있습니다. 저장하지 않습니다.",
              rec
            );
            continue;
          }
          const checkupRecordId = rec.id;
          console.log("Checkup Save Debug: Before Fetch", {
            checkupRecordId,
            rec,
          });
          const method = checkupRecordId ? "PUT" : "POST";
          const url = `${
            process.env.NEXT_PUBLIC_API_BASE_URL
          }/api/medical-records/${newMedicalRecordId}/checkup${
            checkupRecordId ? `/${checkupRecordId}` : ""
          }?userId=${currentUserId}`;

          console.log("Checkup Save Debug: Fetch URL and Method", {
            url,
            method,
          });

          const checkupRes = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              medicalRecordId: newMedicalRecordId,
              petId: petIdToSave,
              checkupType: rec.testName,
              checkupDate: rec.testDate,
              result: rec.testResult,
              resultUrl: rec.testFileUrl,
            }),
            credentials: "include",
          });
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
                    value={surgeryRecord.surgeryName}
                    onChange={(e) =>
                      handleSurgeryChange("surgeryName", e.target.value)
                    }
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
                    value={surgeryRecord.surgeryDate}
                    onChange={(e) =>
                      handleSurgeryChange("surgeryDate", e.target.value)
                    }
                    className="w-full bg-white border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    마취 종류
                  </label>
                  <select
                    value={surgeryRecord.anesthesiaType}
                    onChange={(e) =>
                      handleSurgeryChange("anesthesiaType", e.target.value)
                    }
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
                    value={surgeryRecord.surgeryNote}
                    onChange={(e) =>
                      handleSurgeryChange("surgeryNote", e.target.value)
                    }
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
                    value={hospitalizationRecord.admissionDate}
                    onChange={(e) =>
                      handleHospitalizationChange(
                        "admissionDate",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    퇴원 일자
                  </label>
                  <input
                    type="date"
                    value={hospitalizationRecord.dischargeDate}
                    onChange={(e) =>
                      handleHospitalizationChange(
                        "dischargeDate",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    입원 사유
                  </label>
                  <textarea
                    value={hospitalizationRecord.reason}
                    onChange={(e) =>
                      handleHospitalizationChange("reason", e.target.value)
                    }
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
                  {hospitalizationRecord.imageFile && (
                    <div className="mt-1 text-xs text-gray-500">
                      {hospitalizationRecord.imageFile.name}
                    </div>
                  )}
                  {hospitalizationRecord.imagePreview && (
                    <img
                      src={hospitalizationRecord.imagePreview}
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
