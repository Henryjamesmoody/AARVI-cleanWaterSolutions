package org.example;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.example.servlets.ContactServlet;

import java.io.File;

public class Application {
    public static void main(String[] args) {
        try {
            // Create a server instance on port 8080
            Server server = new Server(8080);
            
            // Create a resource handler for static content
            ResourceHandler resourceHandler = new ResourceHandler();
            resourceHandler.setDirectoriesListed(false);
            resourceHandler.setWelcomeFiles(new String[]{"index.html"});
            
            // Set the resource base to the webapp directory
            String webDir = new File("src/main/webapp").getAbsolutePath();
            resourceHandler.setResourceBase(webDir);
            
            // Create a context handler for the static content
            ContextHandler staticContext = new ContextHandler("/");
            staticContext.setHandler(resourceHandler);
            
            // Create a servlet context handler for dynamic content
            ServletContextHandler servletContext = new ServletContextHandler(ServletContextHandler.SESSIONS);
            servletContext.setContextPath("/api");
            servletContext.addServlet(new ServletHolder(new ContactServlet()), "/contact");
            
            // Add all handlers to the server
            HandlerList handlers = new HandlerList();
            handlers.addHandler(staticContext);
            handlers.addHandler(servletContext);
            server.setHandler(handlers);
            
            // Start the server
            server.start();
            System.out.println("Server started on http://localhost:8080");
            System.out.println("Press Ctrl+C to stop the server");
            
            // Add shutdown hook for graceful shutdown
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                try {
                    System.out.println("Shutting down the server...");
                    server.stop();
                    System.out.println("Server stopped");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }));
            
            server.join();
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }
}