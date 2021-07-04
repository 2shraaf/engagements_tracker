import { ITrackedConversation } from '../interfaces/IConversation';
import {
  SendMessageCommand,
  SQSClient,
  DeleteMessageCommand,
  ReceiveMessageCommand,
} from '@aws-sdk/client-sqs';
import config from '../config';
import { Message } from 'aws-sdk/clients/sqs';
const sqsClient = new SQSClient({ region: config.REGION });
const messageGroupId = 'TrackedConversations';
export const sendConversationToQueue = async (
  conversation: ITrackedConversation
) => {
  const params = {
    MessageAttributes: {
      Id: {
        DataType: 'String',
        StringValue: conversation.id,
      },
      Type: {
        DataType: 'String',
        StringValue: conversation.type,
      },
      Source: {
        DataType: 'String',
        StringValue: conversation.source,
      },
      TotalEngagements: {
        DataType: 'Number',
        StringValue: conversation.total_engagements.toString(),
      },
    },
    MessageBody: JSON.stringify(conversation),
    MessageDeduplicationId: conversation.id,
    MessageGroupId: messageGroupId,
    QueueUrl: config.SQSSendURL,
  };
  await sqsClient.send(new SendMessageCommand(params));
};

export const receiveConversationFromQueue =
  async (): Promise<Message | null> => {
    const params = {
      AttributeNames: ['SentTimestamp'],
      MaxNumberOfMessages: 10,
      MessageAttributeNames: ['All'],
      QueueUrl: config.SQSReceiveURL,
      VisibilityTimeout: 20,
      WaitTimeSeconds: 0,
    };

    const data = await sqsClient.send(new ReceiveMessageCommand(params));
    return data.Messages == null ? null : (data.Messages[0] as Message);
  };

export const deleteConversationFromQueue = async (
  messageReceiptHandle: string
) => {
  const queueURL = config.SQSReceiveURL;
  const params = {
    ReceiptHandle: messageReceiptHandle,
    QueueUrl: queueURL,
  };
  await sqsClient.send(new DeleteMessageCommand(params));
};
