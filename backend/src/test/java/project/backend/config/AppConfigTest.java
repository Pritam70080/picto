package project.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AppConfigTest {

    @Test
    void corsConfigurationAllowsConfiguredOriginsAndHeaders() {
        CorsConfigurationSource source = new AppConfig().corsConfigurationSource(
                new CorsProperties("http://localhost:3000, https://picto.example")
        );
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/photos");
        CorsConfiguration configuration = source.getCorsConfiguration(request);

        assertEquals(List.of("http://localhost:3000", "https://picto.example"),
                configuration.getAllowedOrigins());
        assertEquals(List.of("*"), configuration.getAllowedHeaders());
        assertTrue(configuration.getAllowCredentials());
    }
}
