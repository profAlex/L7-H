import { Collection, Db, MongoClient } from "mongodb";
import { BlogViewModel } from "../routers/router-types/blog-view-model";
import { PostViewModel } from "../routers/router-types/post-view-model";
import { UserCollectionStorageModel } from "../routers/router-types/user-storage-model";
import { CommentStorageModel } from "../routers/router-types/comment-storage-model";


const DB_NAME = "bloggers_db";
export const BLOGGERS_COLLECTION_NAME = "bloggers_collection";
export const POSTS_COLLECTION_NAME = "posts_collection";
export const USERS_COLLECTION_NAME = "users_collection";
export const COMMENTS_COLLECTION_NAME = "comments_collection";

const URI =
    "mongodb+srv://admin:admin@learningcluster.f1zm90x.mongodb.net/?retryWrites=true&w=majority&appName=LearningCluster";

let db: Db | null = null;

export let client: MongoClient | null = null;
export let bloggersCollection: Collection<BlogViewModel>;
export let postsCollection: Collection<PostViewModel>;
export let usersCollection: Collection<UserCollectionStorageModel>;
export let commentsCollection: Collection<CommentStorageModel>;



export async function runDB() {
    client = new MongoClient(URI);
    db = client.db(DB_NAME);

    bloggersCollection = db.collection<BlogViewModel>(BLOGGERS_COLLECTION_NAME);
    postsCollection = db.collection<PostViewModel>(POSTS_COLLECTION_NAME);
    usersCollection = db.collection<UserCollectionStorageModel>(USERS_COLLECTION_NAME);
    commentsCollection = db.collection<CommentStorageModel>(COMMENTS_COLLECTION_NAME);

    try {
        await client.connect();
        await db.command({ ping: 1 });
        console.log(`🟢 Connected to DB ${DB_NAME}`);
    } catch (error) {
        await client.close();
        throw new Error(`Database not connected: ${error}`);
    }
}



export async function closeDB() {
    try {
        if (client) {
            await client.close();

            console.log("🛑 MongoDB connection closed");
            client = null;
            db = null;
        }
    } catch (error) {
        console.error("Error: ", error);
    }
}



export { db };
