package com.pathlab.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class FreemarkerConfig {

    @Bean(name = "pdfFreemarkerConfig")
    public freemarker.template.Configuration pdfFreemarkerConfig() throws IOException {
        freemarker.template.Configuration cfg =
                new freemarker.template.Configuration(freemarker.template.Configuration.VERSION_2_3_31);
        cfg.setClassLoaderForTemplateLoading(this.getClass().getClassLoader(), "/templates");
        cfg.setDefaultEncoding("UTF-8");
        return cfg;
    }
}

