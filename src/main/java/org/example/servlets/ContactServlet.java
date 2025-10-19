package org.example.servlets;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/contact")
public class ContactServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Set response content type
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
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
            
            // Here you would typically:
            // 1. Validate the input
            // 2. Save to a database
            // 3. Send an email notification
            
            // For now, we'll just log the data
            System.out.println("New contact form submission:");
            System.out.println("Name: " + name);
            System.out.println("Email: " + email);
            System.out.println("Subject: " + subject);
            System.out.println("Message: " + message);
            
            // Prepare success response
            response.setStatus(HttpServletResponse.SC_OK);
            responseMap.put("success", true);
            responseMap.put("message", "Thank you for your message! We will get back to you soon.");
            
        } catch (Exception e) {
            // Handle errors
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            responseMap.put("success", false);
            responseMap.put("message", "There was an error processing your request. Please try again later.");
            e.printStackTrace();
        }
        
        // Send JSON response
        objectMapper.writeValue(response.getWriter(), responseMap);
    }
}
