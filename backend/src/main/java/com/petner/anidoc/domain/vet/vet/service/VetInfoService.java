package com.petner.anidoc.domain.vet.vet.service;

import com.petner.anidoc.domain.vet.vet.dto.VetInfoResponseDto;
import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
import com.petner.anidoc.domain.vet.vet.repository.VetInfoRepository;
import com.petner.anidoc.global.exception.CustomException;
import com.petner.anidoc.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VetInfoService {

    private final VetInfoRepository vetInfoRepository;

    @Transactional(readOnly = true)
    public List<VetInfoResponseDto> getAllVets() {
        List<VetInfo> vets = vetInfoRepository.findAll();
        return vets.stream()
                .map(VetInfoResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VetInfoResponseDto getVetById(Long id) {
        VetInfo vetInfo = vetInfoRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.VET_NOT_FOUND));
        return VetInfoResponseDto.fromEntity(vetInfo);
    }
}
