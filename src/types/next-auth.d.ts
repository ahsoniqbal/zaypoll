import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      userName: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: number;
    userName: string;
  }
}