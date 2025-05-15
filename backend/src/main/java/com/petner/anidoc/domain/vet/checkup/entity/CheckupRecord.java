package com.petner.anidoc.domain.vet.checkup.entity;

import com.petner.anidoc.domain.vet.medicalrecord.entity.MedicalRecord;
import com.petner.anidoc.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
@Table(name = "checkup_records")
public class CheckupRecord extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private MedicalRecord medicalRecord;

    @Enumerated(EnumType.STRING)
    @Column(name = "checkup_type")
    private CheckupType checkupType;

    @Column(columnDefinition = "TEXT")
    private String result;

    @Column(name = "result_url")
    private String resultUrl;

    @Column(name = "checkup_date")
    private LocalDate checkupDate;

    @Enumerated(EnumType.STRING)
    private CheckupStatus status; //검사상태(검사전, 검사중, 검사완료)

    @Builder.Default
    @Column(name="is_deleted")
    private Boolean isDeleted = false;

    public void markAsDeleted(){
        this.isDeleted=true;
    }
}
