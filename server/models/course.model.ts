import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.Model";

interface IComment extends Document {
  user: IUser;
  question: string;
  questionReplies: IComment[];
}

interface IReview extends Document {
  user: IUser;
  rating: number;
  comment: string;
  commentReplies?: IComment[];
}

interface Ilinks extends Document {
  title: string;
  url: string;
}

interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: string;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: Ilinks[];
  suggestion: string;
  question: IComment[];
}

interface Icourse extends Document {
  name: String;
  description: string;
  price: number;
  estimatedPrice?: number;
  thumnail: object;
  tag: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequistites: { title: string }[];
  reviews: IReview[];
  courseData: ICourseData[];
  ratings?: number;
  purchased?: number;
}

const reviewSchema = new Schema<IReview>({
  user: Object,
  rating: {
    type: Number,
    default: 0,
  },
  comment: String,
});

const linkschema = new Schema<Ilinks>({
  title: String,
  url: String,
});

const commentSchema = new Schema<IComment>({
  user: Object,
  question: String,
  questionReplies: [Array],
});

const courseDataSchema = new Schema<ICourseData>({
  videoUrl: String,
  title: String,
  description: String,
  videoSection: String,
  videoLength: Number,
  videoPlayer: String,
  links: [linkschema],
  suggestion: String,
  question: [commentSchema],
});

const courseSchema = new Schema<Icourse>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    estimatedPrice: {
      type: Number,
    },
    thumnail: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },

    tag: {
      type: String,
      require: true,
    },
    level: {
      type: String,
      require: true,
    },
    demoUrl: {
      type: String,
      require: true,
    },

    benefits: [{ title: String }],
    prerequistites: [{ title: String }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: {
      type: Number,
      default: 0,
    },
    purchased: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);


const CourseModel:Model<Icourse> = mongoose.model("course",courseSchema);
export default CourseModel