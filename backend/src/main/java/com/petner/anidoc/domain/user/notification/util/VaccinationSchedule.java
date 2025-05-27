package com.petner.anidoc.domain.user.notification.util;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaccinationSchedule {
    private int round;
    private int startWeek;
    private int endWeek;
    private String vaccineTypes;
}
