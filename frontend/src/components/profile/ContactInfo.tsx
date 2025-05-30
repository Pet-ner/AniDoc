interface ContactInfoProps {
  phoneNumber: string;
  emergencyContact: string;
  isEditing: boolean;
  phoneValid: boolean;
  emergencyPhoneValid: boolean;
  onPhoneNumberChange: (value: string) => void;
  onEmergencyContactChange: (value: string) => void;
}

export default function ContactInfo({
  phoneNumber,
  emergencyContact,
  isEditing,
  phoneValid,
  emergencyPhoneValid,
  onPhoneNumberChange,
  onEmergencyContactChange,
}: ContactInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          연락처
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange(e.target.value)}
          placeholder="010-0000-0000"
          className={`w-full p-2 border rounded-md ${
            isEditing
              ? phoneValid && phoneNumber
                ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                : phoneNumber && !phoneValid
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
              : "bg-gray-50"
          }`}
          readOnly={!isEditing}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          비상연락처
        </label>
        <input
          type="tel"
          value={emergencyContact}
          onChange={(e) => onEmergencyContactChange(e.target.value)}
          placeholder="010-0000-0000"
          className={`w-full p-2 border rounded-md ${
            isEditing
              ? emergencyContact
                ? emergencyPhoneValid
                  ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                  : "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-[#49BEB7] focus:border-[#49BEB7]"
              : "bg-gray-50"
          }`}
          readOnly={!isEditing}
        />
      </div>
    </div>
  );
}
