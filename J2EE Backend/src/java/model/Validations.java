package model;

public class Validations {
    public static boolean isPasswordValid(String password) {
        return password.matches("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,20}$");
    }
        
    public static boolean isMobileNumberValidSriLankan(String insertedText) {
        return insertedText.matches("^07[01245678]{1}[0-9]{7}$");
    }
}
