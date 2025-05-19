package com.petner.anidoc.global.s3;

public enum S3Folder {
    PROFILE_IMAGES("profile-images"),
    HOSPITALIZATION("hospitalization"),
    CHECKUPS("checkups");

    private final String folderName;

    S3Folder(String folderName) {
        this.folderName = folderName;
    }

    public String getFolderName() {
        return folderName;
    }
}
