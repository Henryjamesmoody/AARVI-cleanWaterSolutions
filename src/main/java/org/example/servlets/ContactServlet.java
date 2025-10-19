package org.example.servlets;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

public class ContactServlet extends HttpServlet {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    // Load from application.env at project root, but don't fail if missing
    private static final Dotenv dotenv = Dotenv.configure()
            .filename("application.env")
            .ignoreIfMalformed()
            .ignoreIfMissing()
            .load();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Set CORS headers
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setContentType("application/json");

        //test
        // Create response map
        Map<String, Object> responseMap = new HashMap<>();

        try {
            // Parse JSON request body
            Map<String, String> formData = objectMapper.readValue(
                    request.getInputStream(),
                    Map.class
            );

            // Extract form fields
            String name = formData.get("name");
            String email = formData.get("email");
            String subject = formData.get("subject");
            String message = formData.get("message");

            // Validate input
            if (name == null || name.trim().isEmpty() ||
                    email == null || email.trim().isEmpty() ||
                    subject == null || subject.trim().isEmpty() ||
                    message == null || message.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                responseMap.put("success", false);
                responseMap.put("message", "All fields are required.");
                objectMapper.writeValue(response.getWriter(), responseMap);
                return;
            }

            // Send email
            sendEmail(name, email, subject, message);

            // Prepare success response
            response.setStatus(HttpServletResponse.SC_OK);
            responseMap.put("success", true);
            responseMap.put("message", "Thank you for your message! We will get back to you soon.");

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            responseMap.put("success", false);
            responseMap.put("message", "Failed to send message. Please try again later.");
        }

        // Send JSON response
        objectMapper.writeValue(response.getWriter(), responseMap);
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    private void sendEmail(String name, String email, String subject, String message) throws Exception {
        // Read SendGrid config from application.env or OS env as fallback
        final String apiKey = firstNonBlank(
                dotenv.get("SENDGRID_API_KEY"),
                System.getenv("SENDGRID_API_KEY")
        );
        final String sender = firstNonBlank(
                dotenv.get("SENDER_EMAIL"),
                System.getenv("SENDER_EMAIL")
        );
        final String recipient = firstNonBlank(
                dotenv.get("RECIPIENT_EMAIL"),
                System.getenv("RECIPIENT_EMAIL")
        );
        if (apiKey == null || apiKey.isBlank() || sender == null || sender.isBlank() || recipient == null || recipient.isBlank()) {
            throw new IllegalStateException("Missing SENDGRID_API_KEY/SENDER_EMAIL/RECIPIENT_EMAIL in environment");
        }

        // Build email content
        String plainText = String.format(
                "New contact form submission from ARI Water Solutions website:\n\n" +
                        "Name: %s\n" +
                        "Email: %s\n" +
                        "Subject: %s\n\n" +
                        "Message:\n%s",
                name, email, subject, message
        );

        Email from = new Email(sender);
        Email to = new Email(recipient);
        Content content = new Content("text/plain", plainText);
        Mail mail = new Mail(from, "AARI Contact: " + subject, to, content);

        SendGrid sg = new SendGrid(apiKey);
        Request request = new Request();
        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());
        Response response = sg.api(request);

        if (response.getStatusCode() != 202) {
            throw new RuntimeException("SendGrid send failed: status=" + response.getStatusCode() + ", body=" + response.getBody());
        }
        System.out.println("SendGrid accepted email (202) to: " + recipient);
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return null;
    }
}