package controller;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import entity.User;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.HibernateUtil;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.hibernate.hql.internal.ast.tree.RestrictableStatement;

@WebServlet(name = "GetLetters", urlPatterns = {"/GetLetters"})
public class GetLetters extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        String mobile = request.getParameter("mobile");

        Gson gson = new Gson();
        JsonObject responseJson = new JsonObject();
        responseJson.addProperty("found", false);

        Session session = HibernateUtil.getSessionFactory().openSession();

        Criteria criteria1 = session.createCriteria(User.class);
        criteria1.add(Restrictions.eq("mobile", mobile));

        if (!criteria1.list().isEmpty()) {

            String serverPath = request.getServletContext().getRealPath("");
            String otherUserImagePath = serverPath + File.separator + "AvatarImages" + File.separator + mobile + ".png";
            File file = new File(otherUserImagePath);

            if (file.exists()) {
                responseJson.addProperty("found", true);
            } else {
                responseJson.addProperty("found", false);

                User user = (User) criteria1.uniqueResult();
                String letters = user.getFirst_name().charAt(0) + "" + user.getLast_name().charAt(0);
                responseJson.addProperty("letters", letters);
            }

        } else {
            responseJson.addProperty("found", false);
            responseJson.addProperty("letters", "");
        }

        response.setContentType("application/json");
        response.getWriter().write(gson.toJson(responseJson));
    }

}
