declare namespace Express {
  interface Request {
    file?: Express.Multer.File;
    authUser?: {
      userId: string;
      name: string;
      emailOrPhone: string;
      institutionName: string;
    };
  }
}
