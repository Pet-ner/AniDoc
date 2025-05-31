package com.petner.anidoc.global.init;

import com.petner.anidoc.domain.vet.vet.entity.VetInfo;
import com.petner.anidoc.domain.vet.vet.repository.VetInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class VetInfoInitializer implements CommandLineRunner {

    private final VetInfoRepository vetInfoRepository;

    @Override
    public void run(String... args) throws Exception {
        createVetInfo("행복동물병원", "010-2238-7856", "서울시 강남구", LocalDate.parse("2021-02-25"));
        createVetInfo("정담동물병원", "010-5879-2623", "서울시 광진구", LocalDate.parse("2018-06-12"));
    }

    private void createVetInfo(String vetName, String vetNumber, String vetAddress, LocalDate establishedDate) {
        if (!vetInfoRepository.existsByVetNumber(vetNumber)) {
            VetInfo vetInfo = VetInfo.builder()
                    .vetName(vetName)
                    .vetNumber(vetNumber)
                    .vetAddress(vetAddress)
                    .establishedDate(establishedDate)
                    .build();
            vetInfoRepository.save(vetInfo);
        }
    }
}
