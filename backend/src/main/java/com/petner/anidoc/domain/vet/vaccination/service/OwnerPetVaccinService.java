package com.petner.anidoc.domain.vet.vaccination.service;

import com.petner.anidoc.domain.vet.vaccination.dto.OwnerPetVaccinDTO;
import com.petner.anidoc.domain.vet.vaccination.entity.Vaccination;
import com.petner.anidoc.domain.vet.vaccination.repository.VaccinRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerPetVaccinService {
    private final VaccinRepository vaccinRepository;

    //전체 조회
    @Transactional(readOnly = true)
    public List<OwnerPetVaccinDTO> findAllByOwner(Long ownerId) {
        List<Vaccination> vaccinations = vaccinRepository.findByPetOwnerId(ownerId);
        return vaccinations.stream()
                .map(OwnerPetVaccinDTO::new)
                .collect(Collectors.toList());
    }


    //상세 조회
    @Transactional(readOnly = true)
    public OwnerPetVaccinDTO findByIdAndOwner(Long vaccinationId, Long ownerId) {
        Vaccination vaccination = vaccinRepository.findById(vaccinationId)
                .orElseThrow(() -> new RuntimeException("예방접종 기록이 없습니다."));
        if (!vaccination.getPet().getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("조회 권한이 없습니다.");
        }
        return new OwnerPetVaccinDTO(vaccination);
    }

    // 알림기능 여기다 생성(7일전)

}
