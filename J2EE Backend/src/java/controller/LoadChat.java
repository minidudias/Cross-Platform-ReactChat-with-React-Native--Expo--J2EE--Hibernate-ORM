package controller;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import entity.Chat;
import entity.Chat_Status;
import entity.User;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.HibernateUtil;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;

@WebServlet(name = "LoadChat", urlPatterns = {"/LoadChat"})
public class LoadChat extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Gson gson = new Gson();
        
        String logged_in_user_id = request.getParameter("loggedUserId");
        String other_user_id = request.getParameter("otherUserId");
        
        Session session = HibernateUtil.getSessionFactory().openSession();
        
        //get logged-in user
        User logged_in_user =(User) session.get(User.class, Integer.parseInt(logged_in_user_id));
        
        //get other user
        User other_user =(User) session.get(User.class, Integer.parseInt(other_user_id));
        
        //getting chats
        Criteria criteria = session.createCriteria(Chat.class);
        criteria.add(
            Restrictions.or(
                Restrictions.and(
                   Restrictions.eq("from_user", logged_in_user),
                   Restrictions.eq("to_user", other_user)
                ),
               
                Restrictions.and(
                   Restrictions.eq("from_user", other_user),
                   Restrictions.eq("to_user", logged_in_user)
                )     
            )
        );
        
        //sort chats
        criteria.addOrder(Order.asc("date_time"));
        
        //get chat list
        List<Chat> chatlist_between_two_users = criteria.list();
        
        //get chat status (1=seen)
        Chat_Status chat_Status =(Chat_Status) session.get(Chat_Status.class,1);
        
        //create chat array
        JsonArray chatArray = new JsonArray();
        
        //create datetime format
        SimpleDateFormat fmt = new SimpleDateFormat("MMM dd, hh:mm a");
        
        for(Chat chat : chatlist_between_two_users){
            //create chat object
            JsonObject chatObject = new JsonObject();
            chatObject.addProperty("message", chat.getMessage());
            chatObject.addProperty("dateTime", fmt.format(chat.getDate_time()));
            
            //get chats only from other user
            if(chat.getFrom_user().getId() == other_user.getId()){
                
                //add side to the chat object
                chatObject.addProperty("side", "left");
                
                //get unseen chats only(chat_status_id=2)
                if(chat.getChat_status().getId()==2){
                    
                    //update chat status to "seen"
                    chat.setChat_status(chat_Status);
                    session.update(chat);
                    
                }
            }else{
                //get chat from logged in user
                
                //add side to chat object
                chatObject.addProperty("side", "right");
                chatObject.addProperty("status", chat.getChat_status().getId()); //1=seen, 2=unseen
            }
            
            //add chat object into chatArray
            chatArray.add(chatObject);
        }
        //update database
        session.beginTransaction().commit();
        
        //send response
        response.setContentType("application/json");
        response.getWriter().write(gson.toJson(chatArray));
        
        
        session.close();
    }
}
