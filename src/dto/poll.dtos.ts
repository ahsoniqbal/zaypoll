
export type PollOptionDto = {
    id: number;
    optionText: string;
    voteCount: number;
};

export type PollListingDto = {
    pollId: number;
    title: string;
    content: string;
    totalVotes: number;
    reasonCount: number;
    upvotes: number;
    downvotes: number;
    userReaction: 1 | -1 | null;
    createdAt: Date | string;
    expiresAt: string | null;
    isExpired: boolean;
    hasVoted: boolean;
    userVoteOptionId: number | null;
    hasReason: boolean;
    userReasonId: number | null;
    userReason: string | null;

    options: PollOptionDto[];

    user: {
        id: number;
        name: string;
        userName: string;
        image: string | null;
        followersCount: number,
        followingCount: number,
        isFollowing: boolean;

    };
};

export type PollDetailsDto = {
    pollId: number;
    title: string;
    content: string;
    totalVotes: number;
    reasonCount: number;
    upvotes: number;
    downvotes: number;
    userReaction: 1 | -1 | null;
    createdAt: Date | string;
    expiresAt: string | null;
    isExpired: boolean;
    hasVoted: boolean;
    userVoteOptionId: number | null;

    hasReason: boolean;
    userReasonId: number | null;
    userReason: string | null;

    options: PollOptionDto[];

    user: {
        id: number;
        name: string;
        userName: string;
        image: string | null;
        followersCount: number,
        followingCount: number,
        isFollowing: boolean;
    };
};


export type CreatePollDto = {
    title: string;
    content: string;
    options: string[];
    createdBy: number;
    topicIds: number[];
    expiresAt: Date | null;
}




export type CommentDto = {
    id: number;
    optionId: number
    comment: string;
    upvotes: number;
    downvotes: number;
    userReaction: 1 | -1 | null;
    createdAt: Date | string;
    user: {
        userId: number;
        name: string;
        userName: string;
        image: string | null
    };
};
