import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import "dotenv/config";
import { Auth, User } from "../models";
const SECRET = process.env.SECRET;

export function getSHA256ofString(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}
export function authMiddleware(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const data = jwt.verify(token, SECRET);
    req._user = data;
    next();
  } catch (e) {
    res.status(401).json({ error: true });
  }
}

export async function createUser(userData) {
  const { fullname, email, password } = userData;
  const user = await User.create({
    fullname,
    email,
  });
  await Auth.create({
    email,
    password: getSHA256ofString(password),
    user_id: user.get("id"),
  });
  return user;
}
export async function updateUser(userData) {
  const { fullname, email, password } = userData;
  const passwordHasheado = getSHA256ofString(password);
  const user = await User.findOne({ where: { email } });
  if (user) {
    await User.update(
      { fullname },
      {
        where: {
          email,
        },
      }
    );
    const userId: any = user.get("id");
    const auth: any = await Auth.findOne({ where: { user_id: userId } });
    const passwordAuth = auth.password;
    if (passwordHasheado == passwordAuth) {
      return { error: "La contraseña es la misma" };
    } else {
      return await Auth.update(
        { password: passwordHasheado },
        {
          where: {
            user_id: userId,
          },
        }
      );
    }
  } else {
    return { error: true };
  }
}
export async function getToken(userData) {
  const { email, password } = userData;
  const passwordHasheado = getSHA256ofString(password);
  const auth = await Auth.findOne({
    where: {
      email,
      password: passwordHasheado,
    },
  });
  if (auth) {
    const token = jwt.sign({ id: auth.get("user_id") }, SECRET);
    return token;
  } else {
    return false;
  }
}
export async function allAuth() {
  const auth = await Auth.findAll();
  return auth;
}
