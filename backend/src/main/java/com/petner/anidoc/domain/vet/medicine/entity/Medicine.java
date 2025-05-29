package com.petner.anidoc.domain.vet.medicine.entity;

import com.petner.anidoc.domain.vet.medicine.dto.MedicineRequestDto;
import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
import com.petner.anidoc.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
@Table(name = "medicines")
public class Medicine extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vet_id", nullable = false)
    private VetInfo vetInfo;

    @Column(name = "medication_name", nullable = false, length = 100)
    private String medicationName;

    private Integer stock;

    // 약품 정보 업데이트 메서드
    public void updateFromDto(MedicineRequestDto dto) {
        this.medicationName = dto.getMedicationName();
        this.stock = dto.getStock();
    }

    // 재고 업데이트 메서드
    public void updateStock(Integer newStock) {
        this.stock = newStock;
    }

    // 재고 차감 메서드
    public void decreaseStock(Integer quantity) {
        this.stock -= quantity;
    }

    // 재고 증가 메서드
    public void increaseStock(Integer quantity) {
        this.stock += quantity;
    }

    // 재고 사용 가능 여부 확인
    public boolean isAvailable() {
        return this.stock > 0;
    }

    // 재고 부족 여부 확인 (기본: 10개)
    public boolean isLowStock() {
        return isLowStock(10);
    }

    // 재고 부족 여부 확인
    public boolean isLowStock(Integer minimum) {
        if (minimum < 0) {
            minimum = 0;
        }
        return this.stock <= minimum;
    }

    // 특정 수량 처방 가능 여부 확인
    public boolean canPrescribe(Integer quantity) {
        return quantity > 0 && this.stock >= quantity;
    }


}
