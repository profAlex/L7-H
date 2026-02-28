import { dataCommandRepository } from "../repository-layers/command-repository-layer/command-repository";
import { PostViewModel } from "../routers/router-types/post-view-model";
import { PostInputModel } from "../routers/router-types/post-input-model";
import { CommentViewModel } from "../routers/router-types/comment-view-model";
import { CustomResult } from "../common/result-type/result-type";

export const postsService = {
    async createNewPost(newPost: PostInputModel): Promise<string | undefined> {
        return await dataCommandRepository.createNewPost(newPost);
    },

    async updatePost(postId: string, newData: PostInputModel) {
        return await dataCommandRepository.updatePost(postId, newData);
    },

    async deletePost(postId: string): Promise<null | undefined> {
        return await dataCommandRepository.deletePost(postId);
    },

    async createNewComment(
        postId: string,
        content: string,
        userId: string,
    ): Promise<CustomResult<CommentViewModel>> {
        return await dataCommandRepository.createNewComment(
            postId,
            content,
            userId,
        );
    },
};
