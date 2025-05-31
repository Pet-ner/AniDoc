interface HospitalSectionProps {
  vetName?: string;
  isLoading: boolean;
}

export default function HospitalSection({
  vetName,
  isLoading,
}: HospitalSectionProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        소속
      </label>
      <div className="relative">
        <input
          type="text"
          value={isLoading ? "로딩 중..." : vetName || ""}
          className="w-full p-2 border rounded-md bg-gray-50 text-gray-500"
          readOnly
        />
        {isLoading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#49BEB7]"></div>
          </div>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500">소속은 변경할 수 없습니다.</p>
    </div>
  );
}
