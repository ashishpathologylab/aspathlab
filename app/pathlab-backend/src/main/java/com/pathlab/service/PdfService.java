package com.pathlab.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import freemarker.template.Template;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.util.Map;

@Service
public class PdfService {

    private final freemarker.template.Configuration freemarkerConfig;

    public PdfService(@Qualifier("pdfFreemarkerConfig") freemarker.template.Configuration freemarkerConfig) {
        this.freemarkerConfig = freemarkerConfig;
    }

    public byte[] generatePdf(String templateName, Map<String, Object> dataModel) {
        try {
            Template template = freemarkerConfig.getTemplate(templateName);
            StringWriter writer = new StringWriter();
            template.process(dataModel, writer);
            String html = writer.toString();

            try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
                PdfRendererBuilder builder = new PdfRendererBuilder();
                builder.useFastMode();
                builder.withHtmlContent(html, null);
                builder.toStream(os);
                builder.run();
                return os.toByteArray();
            }
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed", e);
        }
    }
}
