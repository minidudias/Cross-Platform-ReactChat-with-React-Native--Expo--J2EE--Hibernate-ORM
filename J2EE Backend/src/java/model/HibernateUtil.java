package model;  //always add "HibernateUtil.java" to "model" package


import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
public class HibernateUtil{
    private static final SessionFactory sessionFactory;
    static{
        try{


            sessionFactory = new Configuration().configure().buildSessionFactory();

            
            System.out.println("Successfully created SessionFactory initially.");
        }catch(Throwable ex){
            System.err.println("Initial SessionFactory creation failed." + ex);
            throw new ExceptionInInitializerError(ex);
        }
    } 
    public static SessionFactory getSessionFactory(){
        return sessionFactory;
    } 
    public static void shutdown(){
        getSessionFactory().close();
    }
}