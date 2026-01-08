package controller;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import entity.Chat;
import entity.User;
import entity.User_Status;
import java.io.File;
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
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;

@WebServlet(name = "LoadHomeData", urlPatterns = {"/LoadHomeData"})
public class LoadHomeData extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        Gson gson = new Gson();

        JsonObject responseJson = new JsonObject();
        responseJson.addProperty("success", false);
        responseJson.addProperty("message", "Unable to Process the Request");

        try {
            String userId = request.getParameter("id");
            String searchText = request.getParameter("searchText");

            Session session = HibernateUtil.getSessionFactory().openSession();

            //setting user status online
            User user = (User) session.get(User.class, Integer.parseInt(userId));

            User_Status user_status = (User_Status) session.get(User_Status.class, 1);

            user.setUser_status(user_status);
            session.update(user);

            //getting users not equal to signed in user
            Criteria criteria1 = session.createCriteria(User.class);
            criteria1.add(Restrictions.ne("id", user.getId()));                
            criteria1.add(Restrictions.ilike("first_name", searchText, MatchMode.ANYWHERE));  
            List<User> userList = criteria1.list();

            JsonArray jsonChatArray = new JsonArray();

            for (User otherUser : userList) {

                Criteria criteria2 = session.createCriteria(Chat.class);
                criteria2.add(
                        Restrictions.or(
                                Restrictions.and(
                                        Restrictions.eq("from_user", user),
                                        Restrictions.eq("to_user", otherUser)
                                ),
                                Restrictions.and(
                                        Restrictions.eq("from_user", otherUser),
                                        Restrictions.eq("to_user", user)
                                )
                        )
                );

                criteria2.addOrder(Order.desc("id"));

                JsonObject chatItem = new JsonObject();

                List<Chat> countList = criteria2.list();

                int unseenChat = 0;

                if (!countList.isEmpty()) {

                    for (Chat chat : countList) {

                        if (chat.getChat_status().getId() == 2) {

                            if (chat.getTo_user().getId() == user.getId()) {
                                unseenChat += 1;
                            }
                        }
                    }

                    chatItem.addProperty("unseenCount", unseenChat);

                } else {
                    chatItem.addProperty("unseenCount", 0);
                }

                criteria2.setMaxResults(1);

                chatItem.addProperty("other_user_id", otherUser.getId());
                chatItem.addProperty("other_user_mobile", otherUser.getMobile());
                chatItem.addProperty("other_user_name", otherUser.getFirst_name() + " " + otherUser.getLast_name());
                chatItem.addProperty("other_user_status", otherUser.getUser_status().getId());

                String serverPath = request.getServletContext().getRealPath("");
                String otherUserImagePath = serverPath + File.separator + "AvatarImages" + File.separator + otherUser.getMobile() + ".png";
                File file = new File(otherUserImagePath);

                if (file.exists()) {
                    chatItem.addProperty("avatar_image_found", true);
                } else {
                    chatItem.addProperty("avatar_image_found", false);
                    chatItem.addProperty("other_user_avatar_letters", otherUser.getFirst_name().charAt(0) + "" + otherUser.getLast_name().charAt(0));
                }

                List<Chat> chatList = criteria2.list();
                SimpleDateFormat dateFormat = new SimpleDateFormat("yy, MMM dd hh:mm a");

                if (chatList.isEmpty()) {
                    chatItem.addProperty("message", "Wanna Hangout?");
                    chatItem.addProperty("dateTime", dateFormat.format(user.getRegistered_date_time()));
                    chatItem.addProperty("chat_status_id", 1);
                } else {
                    chatItem.addProperty("message", chatList.get(0).getMessage());
                    chatItem.addProperty("dateTime", dateFormat.format(chatList.get(0).getDate_time()));
                    chatItem.addProperty("chat_status_id", chatList.get(0).getChat_status().getId());
                }

                jsonChatArray.add(chatItem);

            }

            session.beginTransaction().commit();

            responseJson.addProperty("success", true);
            responseJson.addProperty("message", "Success");
//            responseJson.add("user", gson.toJsonTree(user));
            responseJson.add("jsonChatArray", gson.toJsonTree(jsonChatArray));

            session.beginTransaction().commit();
            session.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        response.setContentType("application/json");
        response.getWriter().write(gson.toJson(responseJson));
    }

}
