"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataCommandRepository = void 0;
const mongo_db_1 = require("../../db/mongo.db");
const mongodb_1 = require("mongodb");
const custom_error_class_1 = require("../utility/custom-error-class");
const bcrypt_service_1 = require("../../adapters/authentication/bcrypt-service");
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const user_class_1 = require("../../common/classes/user-class");
const mailer_service_1 = require("../../adapters/email-sender/mailer-service");
function findBlogByPrimaryKey(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return mongo_db_1.bloggersCollection.findOne({ _id: id });
    });
}
function findPostByPrimaryKey(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return mongo_db_1.postsCollection.findOne({ _id: id });
    });
}
function findUserByPrimaryKey(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return mongo_db_1.usersCollection.findOne({ _id: id });
    });
}
function findCommentByPrimaryKey(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return mongo_db_1.commentsCollection.findOne({ _id: id });
    });
}
exports.dataCommandRepository = {
    // *****************************
    // методы для управления блогами
    // *****************************
    createNewBlog(newBlog) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tempId = new mongodb_1.ObjectId();
                const newBlogEntry = Object.assign(Object.assign({ _id: tempId, id: tempId.toString() }, newBlog), { createdAt: new Date(), isMembership: false });
                const result = yield mongo_db_1.bloggersCollection.insertOne(newBlogEntry);
                if (!result.acknowledged) {
                    throw new custom_error_class_1.CustomError({
                        errorMessage: {
                            field: "bloggersCollection.insertOne(newBlogEntry)",
                            message: "attempt to insert new blog entry failed"
                        }
                    });
                }
                return result.insertedId.toString();
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                    return undefined;
                }
                else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository");
                }
            }
        });
    },
    updateBlog(blogId, newData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mongodb_1.ObjectId.isValid(blogId)) {
                    const idToCheck = new mongodb_1.ObjectId(blogId);
                    const res = yield mongo_db_1.bloggersCollection.updateOne({ _id: idToCheck }, { $set: Object.assign({}, newData) });
                    if (!res.acknowledged) {
                        throw new custom_error_class_1.CustomError({
                            errorMessage: {
                                field: "bloggersCollection.updateOne",
                                message: "attempt to update blog entry failed"
                            }
                        });
                    }
                    if (res.matchedCount === 1) {
                        // успешное выполнение
                        return null;
                    }
                }
                else {
                    throw new custom_error_class_1.CustomError({
                        errorMessage: {
                            field: "ObjectId.isValid(blogId)",
                            message: "invalid blog ID"
                        }
                    });
                }
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    return undefined;
                }
                else {
                    console.error(`Unknown error inside dataCommandRepository.updateBlog: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in updateBlog method of dataCommandRepository");
                }
            }
        });
    },
    deleteBlog(blogId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mongodb_1.ObjectId.isValid(blogId)) {
                    const idToCheck = new mongodb_1.ObjectId(blogId);
                    const res = yield mongo_db_1.bloggersCollection.deleteOne({
                        _id: idToCheck
                    });
                    if (!res.acknowledged) {
                        throw new custom_error_class_1.CustomError({
                            errorMessage: {
                                field: "bloggersCollection.deleteOne",
                                message: "attempt to delete blog entry failed"
                            }
                        });
                    }
                    if (res.deletedCount === 1) {
                        return null;
                    }
                }
                else {
                    return undefined;
                }
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                    return undefined;
                }
                else {
                    console.error(`Unknown error inside dataCommandRepository.deleteBlog: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in deleteBlog method of dataCommandRepository");
                }
            }
        });
    },
    // *****************************
    // методы для управления постами
    // *****************************
    getAllPosts() {
        return __awaiter(this, void 0, void 0, function* () {
            const tempContainer = yield mongo_db_1.postsCollection.find({})
                .toArray();
            return tempContainer.map((value) => ({
                id: value._id.toString(),
                title: value.title,
                shortDescription: value.shortDescription,
                content: value.content,
                blogId: value.blogId,
                blogName: value.blogName,
                createdAt: value.createdAt
            }));
            // _id: ObjectId,
            // id: string;
            // title: string;
            // shortDescription: string;
            // content: string;
            // blogId: string;
            // blogName: string;
            // createdAt: Date;
        });
    },
    createNewPost(newPost) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mongodb_1.ObjectId.isValid(newPost.blogId)) {
                    const relatedBlogger = yield findBlogByPrimaryKey(new mongodb_1.ObjectId(newPost.blogId));
                    const tempId = new mongodb_1.ObjectId();
                    if (relatedBlogger) {
                        const newPostEntry = Object.assign(Object.assign({ _id: tempId, id: tempId.toString() }, newPost), { blogName: relatedBlogger.name, createdAt: new Date() });
                        const result = yield mongo_db_1.postsCollection.insertOne(newPostEntry);
                        if (!result.acknowledged) {
                            throw new custom_error_class_1.CustomError({
                                errorMessage: {
                                    field: "postsCollection.insertOne(newPostEntry)",
                                    message: "attempt to insert new post entry failed"
                                }
                            });
                        }
                        return result.insertedId.toString();
                    }
                    else {
                        throw new custom_error_class_1.CustomError({
                            errorMessage: {
                                field: "findBlogByPrimaryKey(new ObjectId(newPost.blogId))",
                                message: "attempt to find blogger failed"
                            }
                        });
                    }
                }
                else {
                    throw new custom_error_class_1.CustomError({
                        errorMessage: {
                            field: "ObjectId.isValid(newPost.blogId)",
                            message: "invalid blogId"
                        }
                    });
                }
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                    return undefined;
                }
                else {
                    console.error(`Unknown error inside dataCommandRepository.createNewPost: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in createNewPost method of dataCommandRepository");
                }
            }
        });
    },
    createNewBlogPost(sentBlogId, newPost) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mongodb_1.ObjectId.isValid(sentBlogId)) {
                    const relatedBlogger = yield findBlogByPrimaryKey(new mongodb_1.ObjectId(sentBlogId));
                    const tempId = new mongodb_1.ObjectId();
                    if (relatedBlogger) {
                        const newPostEntry = Object.assign(Object.assign({ _id: tempId, id: tempId.toString() }, newPost), { blogId: sentBlogId, blogName: relatedBlogger.name, createdAt: new Date() });
                        const result = yield mongo_db_1.postsCollection.insertOne(newPostEntry);
                        if (!result.acknowledged) {
                            throw new custom_error_class_1.CustomError({
                                errorMessage: {
                                    field: "postsCollection.insertOne(newPostEntry)",
                                    message: "attempt to insert new post entry failed"
                                }
                            });
                        }
                        return result.insertedId.toString();
                    }
                }
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                    return undefined;
                }
                else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in createNewBlogPost method of dataCommandRepository");
                }
            }
        });
    },
    updatePost(postId, newData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mongodb_1.ObjectId.isValid(postId)) {
                    const idToCheck = new mongodb_1.ObjectId(postId);
                    const res = yield mongo_db_1.postsCollection.updateOne({ _id: idToCheck }, { $set: Object.assign({}, newData) });
                    if (!res.acknowledged) {
                        throw new custom_error_class_1.CustomError({
                            errorMessage: {
                                field: "postsCollection.updateOne",
                                message: "attempt to update post entry failed"
                            }
                        });
                    }
                    if (res.matchedCount === 1) {
                        // успешное выполнение
                        return null;
                    }
                }
                else {
                    throw new custom_error_class_1.CustomError({
                        errorMessage: {
                            field: "ObjectId.isValid(postId)",
                            message: "invalid post ID"
                        }
                    });
                }
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                    return undefined;
                }
                else {
                    console.error(`Unknown error inside dataCommandRepository.updatePost: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in updatePost method of dataCommandRepository");
                }
            }
        });
    },
    deletePost(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mongodb_1.ObjectId.isValid(postId)) {
                    const idToCheck = new mongodb_1.ObjectId(postId);
                    const res = yield mongo_db_1.postsCollection.deleteOne({ _id: idToCheck });
                    if (!res.acknowledged) {
                        throw new custom_error_class_1.CustomError({
                            errorMessage: {
                                field: "postsCollection.deleteOne",
                                message: "attempt to delete post entry failed"
                            }
                        });
                    }
                    if (res.deletedCount === 1) {
                        return null;
                    }
                }
                else {
                    throw new custom_error_class_1.CustomError({
                        errorMessage: {
                            field: "ObjectId.isValid(postId)",
                            message: "invalid post ID"
                        }
                    });
                }
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                    return undefined;
                }
                else {
                    console.error(`Unknown error inside dataCommandRepository.deletePost: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in deletePost method of dataCommandRepository");
                }
            }
        });
    },
    // *****************************
    // методы для управления юзерами
    // *****************************
    createNewUser(sentNewUser) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const passwordHash = yield bcrypt_service_1.bcryptService.generateHash(sentNewUser.password);
                if (!passwordHash) {
                    throw new custom_error_class_1.CustomError({
                        errorMessage: {
                            field: "bcryptService.generateHash",
                            message: "Generating hash error"
                        }
                    });
                }
                const tempId = new mongodb_1.ObjectId();
                // нижеследующее заменили на инициализацию через клас User через extend interface UserCollectionStorageModel
                // const newUserEntry = {
                //     _id: tempId,
                //     id: tempId.toString(),
                //     login: sentNewUser.login,
                //     email: sentNewUser.email,
                //     passwordHash: passwordHash,
                //     createdAt: new Date(),
                // } as UserCollectionStorageModel;
                const newUserEntry = new user_class_1.User(sentNewUser.login, sentNewUser.email, passwordHash, tempId);
                newUserEntry.emailConfirmation.isConfirmed = true; // для созданных админом пользователей подтверждения не нужно
                const result = yield mongo_db_1.usersCollection.insertOne(newUserEntry);
                if (!result.acknowledged) {
                    throw new custom_error_class_1.CustomError({
                        errorMessage: {
                            field: "usersCollection.insertOne(newUserEntry)",
                            message: "attempt to insert new user entry failed"
                        }
                    });
                }
                return result.insertedId.toString();
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    return undefined;
                }
                else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in createNewUser method of dataCommandRepository");
                }
            }
        });
    },
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mongodb_1.ObjectId.isValid(userId)) {
                    const idToCheck = new mongodb_1.ObjectId(userId);
                    const res = yield mongo_db_1.usersCollection.deleteOne({ _id: idToCheck });
                    if (!res.acknowledged) {
                        throw new custom_error_class_1.CustomError({
                            errorMessage: {
                                field: "usersCollection.deleteOne",
                                message: "attempt to delete user entry failed"
                            }
                        });
                    }
                    if (res.deletedCount === 1) {
                        return null;
                    }
                }
                else {
                    return undefined;
                }
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    return undefined;
                }
                else {
                    console.error(`Unknown error inside dataCommandRepository.deleteUser: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in deleteUser method of dataCommandRepository");
                }
            }
        });
    },
    // *****************************
    // методы для управления комментариями
    // *****************************
    createNewComment(postId, content, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mongodb_1.ObjectId.isValid(userId) && mongodb_1.ObjectId.isValid(postId)) {
                    // проверяем существует ли такой юзер и возвращаем его логин
                    // ищем существует ли такой пост
                    // создаем временный объект, куда записываем postId, userId, создаем и записываем id нового объекта
                    const user = yield findUserByPrimaryKey(new mongodb_1.ObjectId(userId));
                    if (!user) {
                        return {
                            data: null,
                            statusCode: http_statuses_1.HttpStatus.InternalServerError,
                            statusDescription: "User is not found, possibly because its token is valid but user-record was already deleted or due to an database error",
                            errorsMessages: [
                                {
                                    field: "dataCommandRepository.createNewComment -> findUserByPrimaryKey(new ObjectId(userId))", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                    message: "Couldn't find User record" // ошибкам надо присваивать кода, чтобы пользователи могли сообщать номер ошибки в техподдержку
                                }
                            ]
                        };
                    }
                    const userLogin = user.login;
                    // тут по-идее также проверка на соответствие userLogin требованиям?
                    const tempId = new mongodb_1.ObjectId();
                    const newCommentEntry = {
                        _id: tempId,
                        id: tempId.toString(),
                        relatedPostId: postId,
                        content: content,
                        commentatorInfo: { userId: userId, userLogin: userLogin },
                        createdAt: new Date()
                    };
                    const result = yield mongo_db_1.commentsCollection.insertOne(newCommentEntry);
                    if (!result.acknowledged) {
                        return {
                            data: null,
                            statusCode: http_statuses_1.HttpStatus.InternalServerError,
                            statusDescription: "Error while inserting new comment",
                            errorsMessages: [
                                {
                                    field: "dataCommandRepository.createNewComment -> commentsCollection.insertOne(newCommentEntry)", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                    message: "Error while inserting new comment"
                                }
                            ]
                        };
                    }
                    return {
                        data: {
                            id: newCommentEntry.id,
                            content: newCommentEntry.content,
                            commentatorInfo: newCommentEntry.commentatorInfo,
                            createdAt: newCommentEntry.createdAt
                        },
                        statusCode: http_statuses_1.HttpStatus.Created,
                        errorsMessages: [
                            {
                                field: null,
                                message: null
                            }
                        ]
                    };
                }
                else {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "User ID or Post ID dont look like valid mongo ID. Need to check input data and corresponding user and post records.",
                        errorsMessages: [
                            {
                                field: "dataCommandRepository.createNewComment -> if (ObjectId.isValid(userId) && ObjectId.isValid(postId))", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: "User ID or Post ID have invalid format"
                            }
                        ]
                    };
                }
            }
            catch (error) {
                console.error(`Unknown error: ${JSON.stringify(error)}`);
                // throw new Error("Placeholder for an error to be rethrown and dealt with in the future in createNewUser method of dataCommandRepository");
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: `Unknown error inside try-catch block: ${JSON.stringify(error)}`,
                    errorsMessages: [
                        {
                            field: "dataCommandRepository.createNewComment", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `Unknown error inside try-catch block: ${JSON.stringify(error)}`
                        }
                    ]
                };
            }
        });
    },
    updateCommentById(sentCommentId, sentUserId, sentContent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const comment = yield findCommentByPrimaryKey(new mongodb_1.ObjectId(sentCommentId));
                if (!comment) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: `Comment is not found by sent comment ID ${sentCommentId} inside dataCommandRepository.updateCommentById. Even though this exact ID passed existence check in middlewares previously.`,
                        errorsMessages: [
                            {
                                field: "if (!comment) inside dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: `Internal Server Error`
                            }
                        ]
                    };
                }
                if (sentUserId !== comment.commentatorInfo.userId) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.Forbidden,
                        statusDescription: `User is forbidden to change another user’s comment`,
                        errorsMessages: [
                            {
                                field: "if (sentUserId !== comment.commentatorInfo.userId) inside dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: `User is forbidden to change another user’s comment`
                            }
                        ]
                    };
                }
                const res = yield mongo_db_1.commentsCollection.updateOne({ _id: new mongodb_1.ObjectId(sentCommentId) }, { $set: { content: sentContent.content } });
                if (!res.acknowledged) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: `Unknown error inside bloggersCollection.updateOne inside dataCommandRepository.updateCommentById`,
                        errorsMessages: [
                            {
                                field: "bloggersCollection.updateOne inside dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: `Unknown error while trying to update comment`
                            }
                        ]
                    };
                }
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.NoContent,
                    statusDescription: "",
                    errorsMessages: [
                        {
                            field: "",
                            message: ""
                        }
                    ]
                };
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: `Unknown error inside try-catch block inside dataCommandRepository.updateCommentById: ${JSON.stringify(error)}`,
                    errorsMessages: [
                        {
                            field: "dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `Unknown error inside try-catch block: ${JSON.stringify(error)}`
                        }
                    ]
                };
            }
        });
    },
    deleteCommentById(sentCommentId, sentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const comment = yield findCommentByPrimaryKey(new mongodb_1.ObjectId(sentCommentId));
                if (!comment) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: `Comment is not found by sent comment ID ${sentCommentId} inside dataCommandRepository.deleteCommentById. Even though this exact ID passed existence check in middlewares previously.`,
                        errorsMessages: [
                            {
                                field: "if (!comment) inside dataCommandRepository.deleteCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: `Internal Server Error`
                            }
                        ]
                    };
                }
                if (sentUserId !== comment.commentatorInfo.userId) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.Forbidden,
                        statusDescription: `User is forbidden to delete another user’s comment`,
                        errorsMessages: [
                            {
                                field: "if (sentUserId !== comment.commentatorInfo.userId) inside dataCommandRepository.deleteCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: `User is forbidden to delete another user’s comment`
                            }
                        ]
                    };
                }
                const res = yield mongo_db_1.commentsCollection.deleteOne({
                    _id: new mongodb_1.ObjectId(sentCommentId)
                });
                if (!res.acknowledged) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: `Unknown error inside bloggersCollection.deleteOne inside dataCommandRepository.deleteCommentById`,
                        errorsMessages: [
                            {
                                field: "bloggersCollection.deleteOne inside dataCommandRepository.deleteCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: `Unknown error while trying to delete comment`
                            }
                        ]
                    };
                }
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.NoContent,
                    statusDescription: "",
                    errorsMessages: [
                        {
                            field: "",
                            message: ""
                        }
                    ]
                };
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: `Unknown error inside try-catch block inside dataCommandRepository.deleteCommentById: ${JSON.stringify(error)}`,
                    errorsMessages: [
                        {
                            field: "dataCommandRepository.deleteCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `Unknown error inside try-catch block: ${JSON.stringify(error)}`
                        }
                    ]
                };
            }
        });
    },
    // *****************************
    // методы для управления регистрацией новых пользователей
    // *****************************
    confirmRegistrationCode(sentConfirmationCode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchResult = yield mongo_db_1.usersCollection.aggregate([
                    {
                        $match: {
                            "emailConfirmation.confirmationCode": sentConfirmationCode.code,
                            "emailConfirmation.expirationDate": { $gt: new Date() },
                            "emailConfirmation.isConfirmed": false
                        }
                    },
                    {
                        $project: {
                            _id: 1
                        }
                    }
                ])
                    .toArray();
                // aggregate() всегда возвращает массив.
                if (searchResult.length === 1) {
                    const updateResult = yield mongo_db_1.usersCollection.updateOne({ _id: searchResult[0] }, {
                        $set: {
                            "emailConfirmation.confirmationCode": null,
                            "emailConfirmation.isConfirmed": true
                        }
                    });
                    if (updateResult.modifiedCount === 1) {
                        return {
                            data: null,
                            statusCode: http_statuses_1.HttpStatus.NoContent,
                            statusDescription: "Successfully confirmed user",
                            errorsMessages: [
                                {
                                    field: "",
                                    message: ""
                                }
                            ]
                        };
                    }
                    // не смогли обновить юзера
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "Couldn't confirm user: dataCommandRepository -> confirmRegistrationCode",
                        errorsMessages: [
                            {
                                field: "",
                                message: "Couldn't confirm user"
                            }
                        ]
                    };
                }
                // юзер не был найден или просрочен
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.BadRequest,
                    statusDescription: "Couldn't confirm user: dataCommandRepository -> confirmRegistrationCode",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Couldn't confirm user - not existent or out of date"
                        }
                    ]
                };
            }
            catch (error) {
                // непредвиденная ошибка
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "dataCommandRepository -> confirmRegistrationCode",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error"
                        }
                    ]
                };
            }
        });
    },
    registerNewUser(sentNewUser) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const passwordHash = yield bcrypt_service_1.bcryptService.generateHash(sentNewUser.password);
                if (!passwordHash) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "",
                        errorsMessages: [
                            {
                                field: "bcryptService.generateHash",
                                message: "Generating hash error"
                            }
                        ]
                    };
                }
                const tempId = new mongodb_1.ObjectId();
                // нижеследующее заменили на инициализацию через клас User через extend interface UserCollectionStorageModel
                // const newUserEntry = {
                //     _id: tempId,
                //     id: tempId.toString(),
                //     login: sentNewUser.login,
                //     email: sentNewUser.email,
                //     passwordHash: passwordHash,
                //     createdAt: new Date(),
                // } as UserCollectionStorageModel;
                const newUserEntry = new user_class_1.User(sentNewUser.login, sentNewUser.email, passwordHash, tempId);
                const result = yield mongo_db_1.usersCollection.insertOne(newUserEntry);
                // newUserEntry.emailConfirmation.isConfirmed = true; // для созданных админом пользователей подтверждения не нужно
                if (!result.acknowledged) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "",
                        errorsMessages: [
                            {
                                field: "usersCollection.insertOne(newUserEntry)",
                                message: "attempt to insert new user entry failed"
                            }
                        ]
                    };
                }
                // регистрационный код генерируется внутри инстанса юзера, при его создании
                // здесь отсылка письма. с точки зрения обработки потенциальных ошибок
                // максимум того что целесообразно сделать, это в том случае если по какой-то причине с нашей стороны чтото сломалось
                // никак не говорить об этом юзерам, пускай они самостоятельно повторно отправляют запрос, мы максимум логируем ошибку
                // тут жестко будет связано с политикой компании по этому поводу
                // так делается чтобы не брать на себя лишней работы, т.к. в случае реальной проблемы с сервисом отправки мы так или иначе будем это чинить
                // а если письмо просто потерялось или юзер тупит - для нас это может быть куча лишней работы по обслуживанию непонятно чего
                // так что во втором случае пусть юзер сам лучше на себя возьмет это работу - просто повторно отправит если что запррос, нам главно оптимально подобрать период удалления неподтвержденных данных (минут 15-30)
                const sendingResult = yield mailer_service_1.mailerService.sendConfirmationRegisterEmail("\"Alex St\" <geniusb198@yandex.ru>", newUserEntry.email, newUserEntry.emailConfirmation.confirmationCode, mailer_service_1.emailExamples.registrationEmail);
                let status = "Sending went without problems, awaiting confirmation form user";
                if (!sendingResult) {
                    console.error("Something went wrong during the sending the registration email");
                    status = "Something went wrong during the sending the registration email";
                }
                // отправка результата что все ОК
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.NoContent,
                    statusDescription: status,
                    errorsMessages: [
                        {
                            field: "",
                            message: ""
                        }
                    ]
                };
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "usersCollection.insertOne(newUserEntry)",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error"
                        }
                    ]
                };
            }
        });
    },
    findByLoginOrEmail(loginOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield mongo_db_1.usersCollection.findOne({
                    $or: [
                        { email: { loginOrEmail } },
                        { login: { loginOrEmail } }
                    ]
                }, { projection: { _id: 1 } } // т.к. нам не нужны все данные по юзеру, то оптимизируем - запрашиваем только _id
                );
                return !!user;
            }
            catch (error) {
                // не оптимально, но пока не унифицирован подход к обработке ошибок - оставляем
                console.error("Internal DB error in dataCommandRepository -> findByLoginOrEmail:", error);
                return false;
            }
        });
    },
    // *****************************
    // методы для тестов
    // *****************************
    deleteAllBloggers() {
        return __awaiter(this, void 0, void 0, function* () {
            yield mongo_db_1.bloggersCollection.deleteMany({});
            yield mongo_db_1.postsCollection.deleteMany({});
            yield mongo_db_1.usersCollection.deleteMany({});
            yield mongo_db_1.commentsCollection.deleteMany({});
        });
    }
};
