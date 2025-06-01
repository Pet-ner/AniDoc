export interface Medicine {
  id: number;
  medicationName: string;
  stock: number;
  vetName: string;
  vetInfoId: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  onSave: () => void;
}
