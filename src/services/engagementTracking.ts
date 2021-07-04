import {
  IConversation,
  ITrackedConversation,
} from '../interfaces/IConversation';
import loggerInstance from '../loaders/logger';
import { organizationTrackingEngagementSetting } from './organizationService';
import { sendConversationToQueue } from './sqsService';

export default class EngagementTrackingService {
  private totalNumberOfEngagements: number;
  private totalNumberOfConversations: number;

  constructor() {
    this.totalNumberOfEngagements = 0;
    this.totalNumberOfConversations = 0;
  }

  /**
   * Calculate total number of engagement according to conversation source
   * @param engagements
   * @param source
   * @returns
   */
  static calculateTotalNumberOfEngagement = (
    engagements: { [Key: string]: number },
    source: string
  ) => {
    // Calculations can be changed according to the source
    return Object.keys(engagements)
      .map((value) => engagements[value])
      .reduce((prevSum, currentValue) => prevSum + currentValue);
  };

  /**
   * Add total number of engagement to the conversation
   * @param conversion
   * @returns
   */
  static addTotalNumberOfEngagement = (conversion: IConversation) => {
    const totalEngagements =
      EngagementTrackingService.calculateTotalNumberOfEngagement(
        conversion.engagements,
        conversion.source
      );
    const updatedConversion = {
      ...conversion,
      total_engagements: totalEngagements,
    };
    return updatedConversion;
  };

  public trackEngagementHandler = async (conversion: IConversation) => {
    const organizationAllowTrackingEngagement =
      await organizationTrackingEngagementSetting();

    if (!organizationAllowTrackingEngagement) return;

    const updatedConversion =
      EngagementTrackingService.addTotalNumberOfEngagement(conversion);

    await this.pushUpdatedConversation(updatedConversion);

    this.trackAverageNumberOfEngagement(updatedConversion.total_engagements);
  };

  /**
   * Push updated conversation to new SQS after added total engagement to it
   * @param updatedConversion
   */
  private pushUpdatedConversation = async (
    updatedConversion: ITrackedConversation
  ) => sendConversationToQueue(updatedConversion);

  /**
   * Update total sum of conversations and engagement, then calculate the average and log the output
   * @param totalNumberOfEngagementsInConversation
   */
  private trackAverageNumberOfEngagement = (
    totalNumberOfEngagementsInConversation: number
  ) => {
    this.totalNumberOfConversations++;
    this.totalNumberOfEngagements += totalNumberOfEngagementsInConversation;

    const averageNumberOfEngagement =
      this.totalNumberOfEngagements / this.totalNumberOfConversations;

    loggerInstance.info(` ${new Date()} -> ${averageNumberOfEngagement}`);
  };
}
