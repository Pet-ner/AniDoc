"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";

interface Hospital {
  id: number;
  vetName: string;
  vetAddress?: string;
}

interface HospitalComboboxProps {
  onChange: (hospitalId: number | null, hospitalName: string) => void;
  value?: number;
  name: string;
  placeholder?: string;
  required?: boolean;
}

export default function HospitalCombobox({
  onChange,
  value,
  name,
  placeholder = "병원 선택",
  required = false,
}: HospitalComboboxProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null
  );
  const comboboxRef = useRef<HTMLDivElement>(null);

  // 병원 목록 불러오기
  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vets`
        );

        if (!response.ok) {
          throw new Error("병원 목록을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setHospitals(data);

        // 초기값이 있으면 선택된 병원 설정
        if (value) {
          const hospital = data.find((h: Hospital) => h.id === value);
          if (hospital) {
            setSelectedHospital(hospital);
          }
        }
      } catch (error) {
        console.error("병원 목록 로드 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [value]);

  // 검색어에 따른 필터링
  const filteredHospitals = searchTerm
    ? hospitals.filter((hospital) =>
        hospital.vetName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : hospitals;

  // 병원 선택 처리
  const handleSelectHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setSearchTerm("");
    setIsOpen(false);
    onChange(hospital.id, hospital.vetName);
  };

  // 바깥쪽 클릭시 드랍다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 선택 해제
  const handleClear = () => {
    setSelectedHospital(null);
    setSearchTerm("");
    onChange(null, "");
  };

  return (
    <div className="relative" ref={comboboxRef}>
      <div
        className={`flex items-center px-3 py-2 border rounded-md ${
          isOpen ? "border-[#49BEB7] ring-1 ring-[#49BEB7]" : "border-gray-300"
        }`}
      >
        {selectedHospital ? (
          <div className="flex justify-between items-center w-full">
            <div>
              <span className="text-gray-900">{selectedHospital.vetName}</span>
              {selectedHospital.vetAddress && (
                <span className="text-gray-500 text-xs ml-2">
                  {selectedHospital.vetAddress}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            className="flex items-center justify-between w-full cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <input
              type="text"
              className="w-full border-none focus:outline-none focus:ring-0 p-0"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
              required={required}
              name={name}
            />
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-500">로딩 중...</div>
          ) : filteredHospitals.length === 0 ? (
            <div className="p-3 text-center text-gray-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            <>
              <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full p-2 pl-10 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
                    placeholder="병원 이름 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <ul>
                {filteredHospitals.map((hospital) => (
                  <li
                    key={hospital.id}
                    className="p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectHospital(hospital)}
                  >
                    <div className="font-medium">{hospital.vetName}</div>
                    {hospital.vetAddress && (
                      <div className="text-sm text-gray-500">
                        {hospital.vetAddress}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
