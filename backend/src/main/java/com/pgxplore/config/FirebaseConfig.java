package com.pgxplore.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${pgxplore.firebase.credentials-path}")
    private Resource credentialsPath;

    @Value("${pgxplore.firebase.bucket-name}")
    private String bucketName;

    @PostConstruct
    public void initialize() {
        if (FirebaseApp.getApps().isEmpty()) {
            try (InputStream serviceAccount = credentialsPath.getInputStream()) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .setStorageBucket(bucketName)
                        .build();
                FirebaseApp.initializeApp(options);
                log.info("Firebase initialized with bucket: {}", bucketName);
            } catch (IOException e) {
                log.warn("Firebase credentials not found — image upload will be unavailable: {}", e.getMessage());
            }
        }
    }
}
