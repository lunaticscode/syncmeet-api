import { USER_TOKEN_KEY } from "../consts/app";

const testAuthController: AppController = (req, res) => {
  res.cookie(USER_TOKEN_KEY, "thisistokenfromsyncmeetapi", {
    httpOnly: true,
    path: "/",
  });
  return res.json({ isError: false });
};
export { testAuthController };
