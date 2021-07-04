import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (process.env.NODE_ENV === 'development' && envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  /**
   *  Favorite confport with 3015 as default
   */
  port: parseInt(process.env.PORT || '3015', 10),

  /**
   * Used by winston logger
   */
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },
  SQSSendURL:
    'https://sqs.us-east-2.amazonaws.com/867018563138/conversations.fifo',
  SQSReceiveURL:
    'https://sqs.us-east-2.amazonaws.com/867018563138/conversations.fifo',
  REGION: 'us-east-2',
};
