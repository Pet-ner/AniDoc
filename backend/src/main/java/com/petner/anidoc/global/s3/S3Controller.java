package com.petner.anidoc.global.s3;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/s3")
public class S3Controller {

    private final S3Service s3Service;

    @Operation(summary = "S3 Presigned URL 발급", description = "지정된 폴더에 Presigned URL을 발급")
    @GetMapping("/presigned-url")
    public ResponseEntity<Map<String, String>> getPresignedUrl(
            @RequestParam S3Folder s3Folder,
            @RequestParam String fileName,
            @RequestParam String contentType
    ) {
        String url = s3Service.generatePresignedUrl(s3Folder,fileName, contentType);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @Operation(summary = "S3 Presigned GET URL 발급", description = "조회용 Presigned URL을 발급 (퍼블릭 접근 없이 이미지 표시)")
    @GetMapping("/presigned-url/view")
    public ResponseEntity<Map<String, String>> getPresignedViewUrl(
            @RequestParam String s3Key // 예: hospitalization/abcd.png
    ) {
        String url = s3Service.generatePresignedGetUrl(s3Key);
        return ResponseEntity.ok(Map.of("url", url));
    }


}
