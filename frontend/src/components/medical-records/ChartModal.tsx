/**
 * ChartModal: presigned-url S3 업로드 적용 (CHECKUPS, HOSPITALIZATION)
 */
import { useState } from "react";

interface ChartModalProps {
  onClose: () => void;
  userId: number;
  reservationId: number;
}

interface TestRecord {
  testName: string;
  testDate: string;
  testResult: string;
  testFile: File | null;
  testFileUrl?: string;
  testFilePreview?: string;
}

export default function ChartModal({ onClose, userId, reservationId }: ChartModalProps) {

  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [showSurgery, setShowSurgery] = useState(false);
  const [showHospitalization, setShowHospitalization] = useState(false);
  const [showTest, setShowTest] = useState(false);

  // 검사 기록 여러개 (각 입력폼이 독립적으로 상태를 가짐)
  const [testRecords, setTestRecords] = useState<TestRecord[]>([]);

  // 검사 기록 추가 핸들러: 빈 폼 추가
  const handleAddTestRecord = () => {
    setTestRecords([
      ...testRecords,
      { testName: "", testDate: "", testResult: "", testFile: null },
    ]);
  };
  // 검사 기록 삭제 핸들러
  const handleRemoveTestRecord = (idx: number) => {
    setTestRecords(testRecords.filter((_, i) => i !== idx));
  };
  // 검사 기록 입력값 변경 핸들러
  const handleTestRecordChange = (idx: number, field: keyof TestRecord, value: any) => {
    setTestRecords(records =>
      records.map((rec, i) =>
        i === idx ? { ...rec, [field]: value } : rec
      )
    );
  };

  // 검사 기록 파일 업로드 (CHECKUPS)
  const handleTestFileUpload = async (idx: number, file: File | null) => {
    if (!file) return;
    try {
      const folder = 'CHECKUPS';
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/s3/presigned-url?s3Folder=${folder}&fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`
      );
      const { url: presignedUrl } = await res.json();
      if (!presignedUrl) throw new Error("Presigned URL 생성 실패");
      await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const objectKey = presignedUrl.split('.com/')[1]?.split('?')[0];
      const finalUrl = `https://anidoc-bucket.s3.ap-northeast-2.amazonaws.com/${objectKey}`;
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      setTestRecords(records =>
        records.map((rec, i) =>
          i === idx ? { ...rec, testFile: file, testFileUrl: finalUrl, testFilePreview: previewUrl } : rec
        )
      );
    } catch (err) {
      alert('검사 파일 업로드 실패');
    }
  };

  // 수술 정보
  const [surgeryName, setSurgeryName] = useState("");
  const [surgeryDate, setSurgeryDate] = useState("");
  const [surgeryDetail, setSurgeryDetail] = useState("");
  const [surgeryResult, setSurgeryResult] = useState("");
  const [surgeryImage, setSurgeryImage] = useState<File | null>(null);
  const [surgeryImageUrl, setSurgeryImageUrl] = useState<string | null>(null);
  const [surgeryImagePreview, setSurgeryImagePreview] = useState<string | null>(null);

  // 수술 파일 업로드 (HOSPITALIZATION)
  const handleSurgeryImageUpload = async (file: File | null) => {
    if (!file) return;
    try {
      const folder = 'HOSPITALIZATION';
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/s3/presigned-url?s3Folder=${folder}&fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`
      );
      const { url: presignedUrl } = await res.json();
      await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const objectKey = presignedUrl.split('.com/')[1]?.split('?')[0];
      const finalUrl = `https://anidoc-bucket.s3.ap-northeast-2.amazonaws.com/${objectKey}`;
      setSurgeryImage(file);
      setSurgeryImageUrl(finalUrl);
      setSurgeryImagePreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    } catch (err) {
      alert('수술 사진 업로드 실패');
    }
  };

  // 입원 정보
  const [admissionDate, setAdmissionDate] = useState("");
  const [dischargeDate, setDischargeDate] = useState("");
  const [hospitalReason, setHospitalReason] = useState("");
  const [hospitalImage, setHospitalImage] = useState<File | null>(null);
  const [hospitalImageUrl, setHospitalImageUrl] = useState<string | null>(null);
  const [hospitalImagePreview, setHospitalImagePreview] = useState<string | null>(null);

  // 입원 파일 업로드 (HOSPITALIZATION)
  const handleHospitalImageUpload = async (file: File | null) => {
    if (!file) return;
    try {
      const folder = 'HOSPITALIZATION';
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/s3/presigned-url?s3Folder=${folder}&fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`
      );
      const { url: presignedUrl } = await res.json();
      await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const objectKey = presignedUrl.split('.com/')[1]?.split('?')[0];
      const finalUrl = `https://anidoc-bucket.s3.ap-northeast-2.amazonaws.com/${objectKey}`;
      setHospitalImage(file);
      setHospitalImageUrl(finalUrl);
      setHospitalImagePreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    } catch (err) {
      alert('입원 사진 업로드 실패');
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("accessToken");
  
    const payload = {
      weight,
      age,
      diagnosis,
      treatment,
      surgery: showSurgery
        ? {
            name: surgeryName,
            date: surgeryDate,
            detail: surgeryDetail,
            result: surgeryResult,
            imageUrl: surgeryImageUrl,
          }
        : null,
      hospitalization: showHospitalization
        ? {
            admissionDate,
            dischargeDate,
            reason: hospitalReason,
            imageUrl: hospitalImageUrl,
          }
        : null,
      checkups: showTest
        ? testRecords.map((rec) => ({
            testName: rec.testName,
            testDate: rec.testDate,
            testResult: rec.testResult,
            testFileUrl: rec.testFileUrl,
          }))
        : [],
    };
  
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medical-records?userId=${userId}&reservationId=${reservationId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            }
          );
  
        if (!res.ok) {
            throw new Error("서버 응답 실패");
        }
    
        alert("진료기록 저장 완료!");
        onClose();
        } catch (error) {
        alert("진료기록 저장 중 오류 발생");
        console.error(error);
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-12 relative max-h-[90vh] overflow-y-auto animate-fadeIn">
        <button className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 text-3xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-8">몽이(포메라니안) 상세 정보</h2>
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">체중</label>
            <input value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400" placeholder="예: 2.3kg" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">나이</label>
            <input value={age} onChange={e => setAge(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400" placeholder="예: 3세" />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-xs text-gray-500 mb-1">진단 내용</label>
          <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400" />
        </div>
        <div className="mb-8">
          <label className="block text-xs text-gray-500 mb-1">치료 내용</label>
          <textarea value={treatment} onChange={e => setTreatment(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400" />
        </div>
        {/* 차트 추가 버튼 세로 배치 및 폼 */}
        <div className="flex flex-col gap-4 mb-10">
          {/* 검사 기록 차트 */}
          <div>
            {!showTest ? (
              <button type="button" onClick={() => setShowTest(true)} className="w-full py-3 rounded bg-teal-50 text-teal-700 font-medium hover:bg-teal-100 transition">검사 기록 추가</button>
            ) : (
              <div className="space-y-2 bg-gray-50 rounded p-4 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-teal-700">검사 기록</span>
                  <button type="button" onClick={() => setShowTest(false)} className="text-xs text-gray-400 hover:text-red-500">차트 닫기</button>
                </div>
                <div className="flex justify-end mb-2">
                  <button type="button" onClick={handleAddTestRecord} className="px-3 py-1 rounded bg-teal-500 text-white text-sm">+ 기록 추가</button>
                </div>
                {/* 여러 개의 검사 기록 입력폼 */}
                {testRecords.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-4">추가된 검사 기록이 없습니다. [기록 추가] 버튼을 눌러주세요.</div>
                )}
                {testRecords.map((rec, idx) => (
                  <div key={idx} className="relative bg-white border border-gray-200 rounded px-3 py-4 mb-4">
                    <button type="button" onClick={() => handleRemoveTestRecord(idx)} className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-600">삭제</button>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">검사명</label>
                      <input value={rec.testName} onChange={e => handleTestRecordChange(idx, 'testName', e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400" placeholder="예: 혈액 검사" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">검사일</label>
                      <input type="date" value={rec.testDate} onChange={e => handleTestRecordChange(idx, 'testDate', e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">검사 결과</label>
                      <textarea value={rec.testResult} onChange={e => handleTestRecordChange(idx, 'testResult', e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">검사 파일</label>
                      <input type="file" accept="image/*,.pdf" onChange={async e => {
                        const file = e.target.files?.[0] || null;
                        await handleTestFileUpload(idx, file);
                      }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                      {rec.testFile && <div className="mt-1 text-xs text-gray-500">{rec.testFile.name}</div>}
                      {rec.testFilePreview && <img src={rec.testFilePreview} alt="미리보기" className="mt-2 max-h-32 rounded" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* 수술 기록 차트 */}
          <div>
            {!showSurgery ? (
              <button type="button" onClick={() => setShowSurgery(true)} className="w-full py-3 rounded bg-teal-50 text-teal-700 font-medium hover:bg-teal-100 transition">수술 기록 추가</button>
            ) : (
              <div className="space-y-2 bg-gray-50 rounded p-4 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-teal-700">수술 기록</span>
                  <button type="button" onClick={() => setShowSurgery(false)} className="text-xs text-gray-400 hover:text-red-500">차트 닫기</button>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">수술명</label>
                  <input value={surgeryName} onChange={e => setSurgeryName(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400" placeholder="예: 슬개골 탈구 수술" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">수술일</label>
                  <input type="date" value={surgeryDate} onChange={e => setSurgeryDate(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">수술 내용</label>
                  <textarea value={surgeryDetail} onChange={e => setSurgeryDetail(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">수술 결과</label>
                  <textarea value={surgeryResult} onChange={e => setSurgeryResult(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">수술 사진</label>
                  <input type="file" accept="image/*" onChange={async e => {
                    const file = e.target.files?.[0] || null;
                    await handleSurgeryImageUpload(file);
                  }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                  {surgeryImage && <div className="mt-1 text-xs text-gray-500">{surgeryImage.name}</div>}
                  {surgeryImagePreview && <img src={surgeryImagePreview} alt="미리보기" className="mt-2 max-h-32 rounded" />}
                </div>
              </div>
            )}
          </div>
          {/* 입원 기록 차트 */}
          <div>
            {!showHospitalization ? (
              <button type="button" onClick={() => setShowHospitalization(true)} className="w-full py-3 rounded bg-teal-50 text-teal-700 font-medium hover:bg-teal-100 transition">입원 기록 추가</button>
            ) : (
              <div className="space-y-2 bg-gray-50 rounded p-4 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-teal-700">입원 기록</span>
                  <button type="button" onClick={() => setShowHospitalization(false)} className="text-xs text-gray-400 hover:text-red-500">차트 닫기</button>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">입원 일자</label>
                  <input type="date" value={admissionDate} onChange={e => setAdmissionDate(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">퇴원 일자</label>
                  <input type="date" value={dischargeDate} onChange={e => setDischargeDate(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">입원 사유</label>
                  <textarea value={hospitalReason} onChange={e => setHospitalReason(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">입원 사진</label>
                  <input type="file" accept="image/*" onChange={async e => {
                    const file = e.target.files?.[0] || null;
                    await handleHospitalImageUpload(file);
                  }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                  {hospitalImage && <div className="mt-1 text-xs text-gray-500">{hospitalImage.name}</div>}
                  {hospitalImagePreview && <img src={hospitalImagePreview} alt="미리보기" className="mt-2 max-h-32 rounded" />}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-6 py-3 rounded bg-gray-100 text-gray-700 text-lg">닫기</button>
          <button onClick={handleSave} className="px-6 py-3 rounded bg-teal-500 text-white text-lg">진료 기록 저장</button>
        </div>
      </div>
    </div>
  );
}
