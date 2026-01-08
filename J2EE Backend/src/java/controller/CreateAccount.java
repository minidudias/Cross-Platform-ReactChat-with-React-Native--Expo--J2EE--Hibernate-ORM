package controller;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import entity.User;
import entity.User_Status;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import model.HibernateUtil;
import model.Validations;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

@MultipartConfig
@WebServlet(name = "CreateAccount", urlPatterns = {"/CreateAccount"})
public class CreateAccount extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        
        Gson gson = new Gson();
        JsonObject responseJson = new JsonObject();
        responseJson.addProperty("success", false);
        
        //JsonObject requestJson = gson.fromJson(request.getReader(), JsonObject.class);
        String mobile = request.getParameter("mobile");
        String password = request.getParameter("password");
        String firstName = request.getParameter("firstName");
        String lastName = request.getParameter("lastName");
        Part avatarImage = request.getPart("avatarImage");
        
        if(firstName.isEmpty()){
            //first name is not inserted
            responseJson.addProperty("message", "Please insert your first name");            
        }else if(lastName.isEmpty()){
            //last name is not inserted
            responseJson.addProperty("message", "Please insert your last name");            
        }else if(mobile.isEmpty()){
            //mobile is not inserted
            responseJson.addProperty("message", "Please insert your mobile number");            
        }else if(!Validations.isMobileNumberValidSriLankan(mobile)){
            //mobile is not valid
            responseJson.addProperty("message", "This is not a valid Sri Lankan mobile number");
        }else  if(password.isEmpty()){
            //password is not inserted
            responseJson.addProperty("message", "Please set a proper password");            
        }else if(!Validations.isPasswordValid(password)){
            //password is not valid
            responseJson.addProperty("message", "Password must consist 6 to 20 numerals and digits");
        }else{
            
            Session session_Hibernate = HibernateUtil.getSessionFactory().openSession();
            
            //search for mobile
            Criteria criteria = session_Hibernate.createCriteria(User.class);
            criteria.add(Restrictions.eq("mobile",mobile));
            
            if(!criteria.list().isEmpty()){
                //mobile number found
                responseJson.addProperty("message", "Another account has been registered with the mobile number");
            }else{
                User user = new User();
                user.setMobile(mobile);
                user.setPassword(password);
                user.setFirst_name(firstName);
                user.setLast_name(lastName);
                user.setRegistered_date_time(new Date());
            
                //setting user status to "Currently Offline (2)" on default
                User_Status user_Status =(User_Status) session_Hibernate.get(User_Status.class, 2);
                user.setUser_status(user_Status);
            
                session_Hibernate.save(user);
                session_Hibernate.beginTransaction().commit();
            
                //check whether the image the is uploaded or not
                if(avatarImage != null){
                    //image selected
                
                    String ourServerPath = request.getServletContext().getRealPath("");
                    //String newServerPath = ourServerPath.replace("build"+File.separator+"web", "web");
                    String avatarImagePath = ourServerPath + File.separator + "AvatarImages" + File.separator + mobile + ".png";
                    File file = new File(avatarImagePath);
                    Files.copy(avatarImage.getInputStream(), file.toPath(), StandardCopyOption.REPLACE_EXISTING);
                }
            }
            
            
            
            responseJson.addProperty("success", true);
            responseJson.addProperty("message", "Now you are all signed up and ready to chat!");
        
            session_Hibernate.close();
        }
        
        
        
        response.setContentType("application/json");
        response.getWriter().write(gson.toJson(responseJson));
    }
}
