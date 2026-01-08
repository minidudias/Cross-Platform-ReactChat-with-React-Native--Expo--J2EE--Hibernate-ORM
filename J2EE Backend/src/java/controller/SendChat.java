package controller;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import entity.Chat;
import entity.Chat_Status;
import entity.User;
import java.io.IOException;
import java.util.Date;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.HibernateUtil;
import org.hibernate.Session;

@WebServlet(name = "SendChat", urlPatterns = {"/SendChat"})
public class SendChat extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        Gson gson = new Gson();
        JsonObject responseJson = new JsonObject();
        responseJson.addProperty("success", false);

        Session session = HibernateUtil.getSessionFactory().openSession();

        String loggedUserId = request.getParameter("loggedUserId");
        String otherUserId = request.getParameter("otherUserId");
        String message = request.getParameter("message");

        User loggedUser = (User) session.get(User.class, Integer.parseInt(loggedUserId));
        User otherUser = (User) session.get(User.class, Integer.parseInt(otherUserId));

        Chat_Status chat_Status = (Chat_Status) session.get(Chat_Status.class, 2);

        Chat chat = new Chat();

        chat.setChat_status(chat_Status);
        chat.setDate_time(new Date());
        chat.setFrom_user(loggedUser);
        chat.setTo_user(otherUser);
        chat.setMessage(message);

        session.save(chat);

        try {
            session.beginTransaction().commit();
            responseJson.addProperty("success", true);
        } catch (Exception e) {
        }

        response.setContentType("application/json");
        response.getWriter().write(gson.toJson(responseJson));
    }

}
