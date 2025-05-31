plugins {
	java
	id("org.springframework.boot") version "3.4.5"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.petner"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	compileOnly("org.projectlombok:lombok")
	developmentOnly("org.springframework.boot:spring-boot-devtools")
	annotationProcessor("org.projectlombok:lombok")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")

	//db 관련
	runtimeOnly("com.h2database:h2")
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	runtimeOnly("com.mysql:mysql-connector-j")

	//swagger 의존성
	implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.5")

	//시큐리티 의존성
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.thymeleaf.extras:thymeleaf-extras-springsecurity6:3.1.2.RELEASE")

	//jwt 의존성
	//JWT & JSON
	implementation("io.jsonwebtoken:jjwt-api:0.12.6")
	runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
	runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

	//Gson - JSON 메시지를 다루기 위한 라이브러리
	implementation("com.google.code.gson:gson")

	//Oauth2
	implementation("org.springframework.boot:spring-boot-starter-oauth2-client")

	//웹소켓
	implementation("org.springframework.boot:spring-boot-starter-websocket")

	//S3 관련
	implementation("software.amazon.awssdk:s3:2.25.7")
	implementation("software.amazon.awssdk:auth:2.25.7")
	implementation("software.amazon.awssdk:regions:2.25.7")


}

tasks.withType<Test> {
	useJUnitPlatform()
}
