import { BlogInputModel } from "../../routers/router-types/blog-input-model";
import { PostViewModel } from "../../routers/router-types/post-view-model";
import { PostInputModel } from "../../routers/router-types/post-input-model";
import {
    bloggersCollection,
    commentsCollection,
    postsCollection,
    usersCollection,
} from "../../db/mongo.db";
import { ObjectId } from "mongodb";
import { BlogPostInputModel } from "../../routers/router-types/blog-post-input-model";
import { CustomError } from "../utility/custom-error-class";
import { UserInputModel } from "../../routers/router-types/user-input-model";
import { UserViewModel } from "../../routers/router-types/user-view-model";
import { bcryptService } from "../../adapters/authentication/bcrypt-service";
import { UserCollectionStorageModel } from "../../routers/router-types/user-storage-model";
import { CommentViewModel } from "../../routers/router-types/comment-view-model";
import { CustomResult } from "../../common/result-type/result-type";
import { token } from "../../adapters/verification/token-type";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { CommentStorageModel } from "../../routers/router-types/comment-storage-model";
import { CommentInputModel } from "../../routers/router-types/comment-input-model";
import { User } from "../../common/classes/user-class";

export type BloggerCollectionStorageModel = {
    _id: ObjectId;
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: Date;
    isMembership: boolean;
};

export type PostCollectionStorageModel = {
    _id: ObjectId;
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: Date;
};

async function findBlogByPrimaryKey(
    id: ObjectId,
): Promise<BloggerCollectionStorageModel | null> {
    return bloggersCollection.findOne({ _id: id });
}

async function findPostByPrimaryKey(
    id: ObjectId,
): Promise<PostCollectionStorageModel | null> {
    return postsCollection.findOne({ _id: id });
}

async function findUserByPrimaryKey(
    id: ObjectId,
): Promise<UserCollectionStorageModel | null> {
    return usersCollection.findOne({ _id: id });
}

async function findCommentByPrimaryKey(
    id: ObjectId,
): Promise<CommentStorageModel | null> {
    return commentsCollection.findOne({ _id: id });
}

export const dataCommandRepository = {
    // *****************************
    // методы для управления блогами
    // *****************************

    async createNewBlog(newBlog: BlogInputModel): Promise<string | undefined> {
        try {
            const tempId = new ObjectId();
            const newBlogEntry = {
                _id: tempId,
                id: tempId.toString(),
                ...newBlog,
                createdAt: new Date(),
                isMembership: false,
            } as BloggerCollectionStorageModel;

            const result = await bloggersCollection.insertOne(newBlogEntry);

            if (!result.acknowledged) {
                throw new CustomError({
                    errorMessage: {
                        field: "bloggersCollection.insertOne(newBlogEntry)",
                        message: "attempt to insert new blog entry failed",
                    },
                });
            }

            return result.insertedId.toString();
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                return undefined;
            } else {
                console.error(`Unknown error: ${JSON.stringify(error)}`);
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository",
                );
            }
        }
    },

    async updateBlog(
        blogId: string,
        newData: BlogInputModel,
    ): Promise<null | undefined> {
        try {
            if (ObjectId.isValid(blogId)) {
                const idToCheck = new ObjectId(blogId);
                const res = await bloggersCollection.updateOne(
                    { _id: idToCheck },
                    { $set: { ...newData } },
                );

                if (!res.acknowledged) {
                    throw new CustomError({
                        errorMessage: {
                            field: "bloggersCollection.updateOne",
                            message: "attempt to update blog entry failed",
                        },
                    });
                }

                if (res.matchedCount === 1) {
                    // успешное выполнение
                    return null;
                }
            } else {
                throw new CustomError({
                    errorMessage: {
                        field: "ObjectId.isValid(blogId)",
                        message: "invalid blog ID",
                    },
                });
            }
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                return undefined;
            } else {
                console.error(
                    `Unknown error inside dataCommandRepository.updateBlog: ${JSON.stringify(error)}`,
                );
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in updateBlog method of dataCommandRepository",
                );
            }
        }
    },

    async deleteBlog(blogId: string): Promise<null | undefined> {
        try {
            if (ObjectId.isValid(blogId)) {
                const idToCheck = new ObjectId(blogId);
                const res = await bloggersCollection.deleteOne({
                    _id: idToCheck,
                });

                if (!res.acknowledged) {
                    throw new CustomError({
                        errorMessage: {
                            field: "bloggersCollection.deleteOne",
                            message: "attempt to delete blog entry failed",
                        },
                    });
                }

                if (res.deletedCount === 1) {
                    return null;
                }
            } else {
                return undefined;
            }
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                return undefined;
            } else {
                console.error(
                    `Unknown error inside dataCommandRepository.deleteBlog: ${JSON.stringify(error)}`,
                );
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in deleteBlog method of dataCommandRepository",
                );
            }
        }
    },

    // *****************************
    // методы для управления постами
    // *****************************
    async getAllPosts(): Promise<PostViewModel[] | []> {
        const tempContainer: PostCollectionStorageModel[] | [] =
            await postsCollection.find({}).toArray();

        return tempContainer.map((value: PostCollectionStorageModel) => ({
            id: value._id.toString(),
            title: value.title,
            shortDescription: value.shortDescription,
            content: value.content,
            blogId: value.blogId,
            blogName: value.blogName,
            createdAt: value.createdAt,
        }));

        // _id: ObjectId,
        // id: string;
        // title: string;
        // shortDescription: string;
        // content: string;
        // blogId: string;
        // blogName: string;
        // createdAt: Date;
    },

    async createNewPost(newPost: PostInputModel): Promise<string | undefined> {
        try {
            if (ObjectId.isValid(newPost.blogId)) {
                const relatedBlogger = await findBlogByPrimaryKey(
                    new ObjectId(newPost.blogId),
                );
                const tempId = new ObjectId();

                if (relatedBlogger) {
                    const newPostEntry = {
                        _id: tempId,
                        id: tempId.toString(),
                        ...newPost,
                        blogName: relatedBlogger.name,
                        createdAt: new Date(),
                    } as PostCollectionStorageModel;

                    const result =
                        await postsCollection.insertOne(newPostEntry);
                    if (!result.acknowledged) {
                        throw new CustomError({
                            errorMessage: {
                                field: "postsCollection.insertOne(newPostEntry)",
                                message:
                                    "attempt to insert new post entry failed",
                            },
                        });
                    }

                    return result.insertedId.toString();
                } else {
                    throw new CustomError({
                        errorMessage: {
                            field: "findBlogByPrimaryKey(new ObjectId(newPost.blogId))",
                            message: "attempt to find blogger failed",
                        },
                    });
                }
            } else {
                throw new CustomError({
                    errorMessage: {
                        field: "ObjectId.isValid(newPost.blogId)",
                        message: "invalid blogId",
                    },
                });
            }
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                return undefined;
            } else {
                console.error(
                    `Unknown error inside dataCommandRepository.createNewPost: ${JSON.stringify(error)}`,
                );
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in createNewPost method of dataCommandRepository",
                );
            }
        }
    },

    async createNewBlogPost(
        sentBlogId: string,
        newPost: BlogPostInputModel,
    ): Promise<string | undefined> {
        try {
            if (ObjectId.isValid(sentBlogId)) {
                const relatedBlogger = await findBlogByPrimaryKey(
                    new ObjectId(sentBlogId),
                );
                const tempId = new ObjectId();

                if (relatedBlogger) {
                    const newPostEntry = {
                        _id: tempId,
                        id: tempId.toString(),
                        ...newPost,
                        blogId: sentBlogId,
                        blogName: relatedBlogger.name,
                        createdAt: new Date(),
                    } as PostCollectionStorageModel;

                    const result =
                        await postsCollection.insertOne(newPostEntry);
                    if (!result.acknowledged) {
                        throw new CustomError({
                            errorMessage: {
                                field: "postsCollection.insertOne(newPostEntry)",
                                message:
                                    "attempt to insert new post entry failed",
                            },
                        });
                    }

                    return result.insertedId.toString();
                }
            }
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                return undefined;
            } else {
                console.error(`Unknown error: ${JSON.stringify(error)}`);
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in createNewBlogPost method of dataCommandRepository",
                );
            }
        }
    },

    async updatePost(
        postId: string,
        newData: PostInputModel,
    ): Promise<null | undefined> {
        try {
            if (ObjectId.isValid(postId)) {
                const idToCheck = new ObjectId(postId);
                const res = await postsCollection.updateOne(
                    { _id: idToCheck },
                    { $set: { ...newData } },
                );

                if (!res.acknowledged) {
                    throw new CustomError({
                        errorMessage: {
                            field: "postsCollection.updateOne",
                            message: "attempt to update post entry failed",
                        },
                    });
                }

                if (res.matchedCount === 1) {
                    // успешное выполнение
                    return null;
                }
            } else {
                throw new CustomError({
                    errorMessage: {
                        field: "ObjectId.isValid(postId)",
                        message: "invalid post ID",
                    },
                });
            }
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                return undefined;
            } else {
                console.error(
                    `Unknown error inside dataCommandRepository.updatePost: ${JSON.stringify(error)}`,
                );
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in updatePost method of dataCommandRepository",
                );
            }
        }
    },

    async deletePost(postId: string): Promise<null | undefined> {
        try {
            if (ObjectId.isValid(postId)) {
                const idToCheck = new ObjectId(postId);
                const res = await postsCollection.deleteOne({ _id: idToCheck });

                if (!res.acknowledged) {
                    throw new CustomError({
                        errorMessage: {
                            field: "postsCollection.deleteOne",
                            message: "attempt to delete post entry failed",
                        },
                    });
                }

                if (res.deletedCount === 1) {
                    return null;
                }
            } else {
                throw new CustomError({
                    errorMessage: {
                        field: "ObjectId.isValid(postId)",
                        message: "invalid post ID",
                    },
                });
            }
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                return undefined;
            } else {
                console.error(
                    `Unknown error inside dataCommandRepository.deletePost: ${JSON.stringify(error)}`,
                );
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in deletePost method of dataCommandRepository",
                );
            }
        }
    },

    // *****************************
    // методы для управления юзерами
    // *****************************

    async createNewUser(
        sentNewUser: UserInputModel,
    ): Promise<string | undefined> {
        try {
            const passwordHash = await bcryptService.generateHash(
                sentNewUser.password,
            );
            if (!passwordHash) {
                throw new CustomError({
                    errorMessage: {
                        field: "bcryptService.generateHash",
                        message: "Generating hash error",
                    },
                });
            }

            const tempId = new ObjectId();

            // нижеследующее заменили на инициализацию через клас User и extend interface UserCollectionStorageModel
            // const newUserEntry = {
            //     _id: tempId,
            //     id: tempId.toString(),
            //     login: sentNewUser.login,
            //     email: sentNewUser.email,
            //     passwordHash: passwordHash,
            //     createdAt: new Date(),
            // } as UserCollectionStorageModel;

            const newUserEntry = new User(
                sentNewUser.login,
                sentNewUser.email,
                passwordHash,
                tempId,
            );

            const result = await usersCollection.insertOne(newUserEntry);

            if (!result.acknowledged) {
                throw new CustomError({
                    errorMessage: {
                        field: "usersCollection.insertOne(newUserEntry)",
                        message: "attempt to insert new user entry failed",
                    },
                });
            }
            return result.insertedId.toString();
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                return undefined;
            } else {
                console.error(`Unknown error: ${JSON.stringify(error)}`);
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in createNewUser method of dataCommandRepository",
                );
            }
        }
    },

    async deleteUser(userId: string): Promise<null | undefined> {
        try {
            if (ObjectId.isValid(userId)) {
                const idToCheck = new ObjectId(userId);
                const res = await usersCollection.deleteOne({ _id: idToCheck });

                if (!res.acknowledged) {
                    throw new CustomError({
                        errorMessage: {
                            field: "usersCollection.deleteOne",
                            message: "attempt to delete user entry failed",
                        },
                    });
                }

                if (res.deletedCount === 1) {
                    return null;
                }
            } else {
                return undefined;
            }
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                return undefined;
            } else {
                console.error(
                    `Unknown error inside dataCommandRepository.deleteUser: ${JSON.stringify(error)}`,
                );
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in deleteUser method of dataCommandRepository",
                );
            }
        }
    },

    // *****************************
    // методы для управления комментариями
    // *****************************
    async createNewComment(
        postId: string,
        content: string,
        userId: string,
    ): Promise<CustomResult<CommentViewModel>> {
        try {
            if (ObjectId.isValid(userId) && ObjectId.isValid(postId)) {
                // проверяем существует ли такой юзер и возвращаем его логин
                // ищем существует ли такой пост
                // создаем временный объект, куда записываем postId, userId, создаем и записываем id нового объекта
                const user = await findUserByPrimaryKey(new ObjectId(userId));

                if (!user) {
                    return {
                        data: null,
                        statusCode: HttpStatus.InternalServerError,
                        statusDescription:
                            "User is not found, possibly because its token is valid but user-record was already deleted or due to an database error",
                        errorsMessages: [
                            {
                                field: "dataCommandRepository.createNewComment -> findUserByPrimaryKey(new ObjectId(userId))", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: "Couldn't find User record", // ошибкам надо присваивать кода, чтобы пользователи могли сообщать номер ошибки в техподдержку
                            },
                        ],
                    } as CustomResult<CommentViewModel>;
                }
                const userLogin = user.login;
                // тут по-идее также проверка на соответствие userLogin требованиям?

                const tempId = new ObjectId();
                const newCommentEntry = {
                    _id: tempId,
                    id: tempId.toString(),
                    relatedPostId: postId,
                    content: content,
                    commentatorInfo: { userId: userId, userLogin: userLogin },
                    createdAt: new Date(),
                } as CommentStorageModel;

                const result =
                    await commentsCollection.insertOne(newCommentEntry);

                if (!result.acknowledged) {
                    return {
                        data: null,
                        statusCode: HttpStatus.InternalServerError,
                        statusDescription: "Error while inserting new comment",
                        errorsMessages: [
                            {
                                field: "dataCommandRepository.createNewComment -> commentsCollection.insertOne(newCommentEntry)", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: "Error while inserting new comment",
                            },
                        ],
                    } as CustomResult<CommentViewModel>;
                }

                return {
                    data: {
                        id: newCommentEntry.id,
                        content: newCommentEntry.content,
                        commentatorInfo: newCommentEntry.commentatorInfo,
                        createdAt: newCommentEntry.createdAt,
                    } as CommentViewModel,
                    statusCode: HttpStatus.Created,
                    errorsMessages: [
                        {
                            field: null,
                            message: null,
                        },
                    ],
                } as CustomResult<CommentViewModel>;
            } else {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription:
                        "User ID or Post ID dont look like valid mongo ID. Need to check input data and corresponding user and post records.",
                    errorsMessages: [
                        {
                            field: "dataCommandRepository.createNewComment -> if (ObjectId.isValid(userId) && ObjectId.isValid(postId))", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: "User ID or Post ID have invalid format",
                        },
                    ],
                } as CustomResult<CommentViewModel>;
            }
        } catch (error) {
            console.error(`Unknown error: ${JSON.stringify(error)}`);
            // throw new Error("Placeholder for an error to be rethrown and dealt with in the future in createNewUser method of dataCommandRepository");
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription: `Unknown error inside try-catch block: ${JSON.stringify(error)}`,
                errorsMessages: [
                    {
                        field: "dataCommandRepository.createNewComment", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                        message: `Unknown error inside try-catch block: ${JSON.stringify(error)}`,
                    },
                ],
            } as CustomResult<CommentViewModel>;
        }
    },

    async updateCommentById(
        sentCommentId: string,
        sentUserId: string,
        sentContent: CommentInputModel,
    ): Promise<CustomResult> {
        try {
            const comment = await findCommentByPrimaryKey(
                new ObjectId(sentCommentId),
            );

            if (!comment) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription: `Comment is not found by sent comment ID ${sentCommentId} inside dataCommandRepository.updateCommentById. Even though this exact ID passed existence check in middlewares previously.`,
                    errorsMessages: [
                        {
                            field: "if (!comment) inside dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `Internal Server Error`,
                        },
                    ],
                } as CustomResult;
            }

            if (sentUserId !== comment.commentatorInfo.userId) {
                return {
                    data: null,
                    statusCode: HttpStatus.Forbidden,
                    statusDescription: `User is forbidden to change another user’s comment`,
                    errorsMessages: [
                        {
                            field: "if (sentUserId !== comment.commentatorInfo.userId) inside dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `User is forbidden to change another user’s comment`,
                        },
                    ],
                } as CustomResult;
            }

            const res = await commentsCollection.updateOne(
                { _id: new ObjectId(sentCommentId) },
                { $set: { content: sentContent.content } },
            );

            if (!res.acknowledged) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription: `Unknown error inside bloggersCollection.updateOne inside dataCommandRepository.updateCommentById`,
                    errorsMessages: [
                        {
                            field: "bloggersCollection.updateOne inside dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `Unknown error while trying to update comment`,
                        },
                    ],
                } as CustomResult;
            }

            return {
                data: null,
                statusCode: HttpStatus.NoContent,
                statusDescription: "",
                errorsMessages: [
                    {
                        field: "",
                        message: "",
                    },
                ],
            } as CustomResult;
        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription: `Unknown error inside try-catch block inside dataCommandRepository.updateCommentById: ${JSON.stringify(error)}`,
                errorsMessages: [
                    {
                        field: "dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                        message: `Unknown error inside try-catch block: ${JSON.stringify(error)}`,
                    },
                ],
            } as CustomResult;
        }
    },

    async deleteCommentById(
        sentCommentId: string,
        sentUserId: string,
    ): Promise<CustomResult> {
        try {
            const comment = await findCommentByPrimaryKey(
                new ObjectId(sentCommentId),
            );

            if (!comment) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription: `Comment is not found by sent comment ID ${sentCommentId} inside dataCommandRepository.deleteCommentById. Even though this exact ID passed existence check in middlewares previously.`,
                    errorsMessages: [
                        {
                            field: "if (!comment) inside dataCommandRepository.deleteCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `Internal Server Error`,
                        },
                    ],
                } as CustomResult;
            }

            if (sentUserId !== comment.commentatorInfo.userId) {
                return {
                    data: null,
                    statusCode: HttpStatus.Forbidden,
                    statusDescription: `User is forbidden to delete another user’s comment`,
                    errorsMessages: [
                        {
                            field: "if (sentUserId !== comment.commentatorInfo.userId) inside dataCommandRepository.deleteCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `User is forbidden to delete another user’s comment`,
                        },
                    ],
                } as CustomResult;
            }

            const res = await commentsCollection.deleteOne({
                _id: new ObjectId(sentCommentId),
            });

            if (!res.acknowledged) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription: `Unknown error inside bloggersCollection.deleteOne inside dataCommandRepository.deleteCommentById`,
                    errorsMessages: [
                        {
                            field: "bloggersCollection.deleteOne inside dataCommandRepository.deleteCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `Unknown error while trying to delete comment`,
                        },
                    ],
                } as CustomResult;
            }

            return {
                data: null,
                statusCode: HttpStatus.NoContent,
                statusDescription: "",
                errorsMessages: [
                    {
                        field: "",
                        message: "",
                    },
                ],
            } as CustomResult;
        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription: `Unknown error inside try-catch block inside dataCommandRepository.deleteCommentById: ${JSON.stringify(error)}`,
                errorsMessages: [
                    {
                        field: "dataCommandRepository.deleteCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                        message: `Unknown error inside try-catch block: ${JSON.stringify(error)}`,
                    },
                ],
            } as CustomResult;
        }
    },
    // *****************************
    // методы для тестов
    // *****************************
    async deleteAllBloggers() {
        await bloggersCollection.deleteMany({});
        await postsCollection.deleteMany({});
        await usersCollection.deleteMany({});
        await commentsCollection.deleteMany({});
    },
};
