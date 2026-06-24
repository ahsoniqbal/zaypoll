export type CreateUserDto = {
    name: string;
    email: string;
    image?: string;
    // userName: string;
};


export type FollowUserDto = {
  userId: number;
  name: string;
  userName: string;
  image: string;
};

export type FollowMetaDto = {
  isFollowing: boolean;
};
