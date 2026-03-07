import jwt from "jsonwebtoken";

class Tokens {
  private static ACCESS_TOKEN_SECRET = process.env
    .ACCESS_TOKEN_SECRET as string;
  private static REFRESH_TOKEN_SECRET = process.env
    .REFRESH_TOKEN_SECRET as string;

  static accessToken(currentUser: any) {
    return jwt.sign(
      { id: currentUser.id, email: currentUser.email, role: currentUser.role },
      this.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
  }

  static refreshToken(currentUser: any) {
    return jwt.sign(
      { id: currentUser.id, email: currentUser.email, role: currentUser.role },
      this.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
  }
}

export default Tokens;
