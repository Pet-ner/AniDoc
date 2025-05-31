package com.petner.anidoc.domain.vet.vaccination.service;

import com.petner.anidoc.domain.vet.vaccination.dto.OwnerPetVaccineDTO;
import com.petner.anidoc.domain.vet.vaccination.entity.Vaccination;
import com.petner.anidoc.domain.vet.vaccination.repository.VaccineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerPetVaccineService {
    private final VaccineRepository vaccineRepository;

    //전체 조회
    @Transactional(readOnly = true)
    public List<OwnerPetVaccineDTO> findAllByOwner(Long ownerId) {
        List<Vaccination> vaccinations = vaccineRepository.findByPetOwnerId(ownerId);
        return vaccinations.stream()
                .map(OwnerPetVaccineDTO::new)
                .collect(Collectors.toList());
    }


    //상세 조회
    @Transactional(readOnly = true)
    public OwnerPetVaccineDTO findByIdAndOwner(Long vaccinationId, Long ownerId) {
        Vaccination vaccination = vaccineRepository.findById(vaccinationId)
                .orElseThrow(() -> new RuntimeException("예방접종 기록이 없습니다."));
        if (!vaccination.getPet().getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("조회 권한이 없습니다.");
        }
        return new OwnerPetVaccineDTO(vaccination);
    }

}
