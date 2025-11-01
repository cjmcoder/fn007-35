import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer, EachMessagePayload, KafkaMessage } from 'kafkajs';

export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  data: any;
  metadata: {
    timestamp: string;
    userId?: string;
    requestId?: string;
    correlationId?: string;
  };
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: configService.get<string>('kafka.clientId'),
      brokers: configService.get<string[]>('kafka.brokers'),
      ssl: configService.get<boolean>('kafka.ssl'),
      sasl: configService.get<any>('kafka.sasl'),
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    });
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('✅ Connected to Kafka producer');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Kafka producer:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      // Disconnect all consumers
      for (const [topic, consumer] of this.consumers) {
        await consumer.disconnect();
        this.logger.log(`🔌 Disconnected consumer for topic: ${topic}`);
      }

      // Disconnect producer
      await this.producer.disconnect();
      this.logger.log('🔌 Disconnected from Kafka producer');
    } catch (error) {
      this.logger.error('Error disconnecting from Kafka:', error);
    }
  }

  /**
   * Publish a domain event to Kafka
   */
  async publishEvent(topic: string, event: DomainEvent): Promise<void> {
    try {
      const message = {
        key: event.aggregateId,
        value: JSON.stringify(event),
        headers: {
          eventType: event.type,
          aggregateType: event.aggregateType,
          version: event.version.toString(),
          timestamp: event.metadata.timestamp,
          ...(event.metadata.userId && { userId: event.metadata.userId }),
          ...(event.metadata.requestId && { requestId: event.metadata.requestId }),
          ...(event.metadata.correlationId && { correlationId: event.metadata.correlationId }),
        },
      };

      await this.producer.send({
        topic,
        messages: [message],
      });

      this.logger.debug(`📤 Published event ${event.type} to topic ${topic}`, {
        aggregateId: event.aggregateId,
        eventId: event.id,
      });
    } catch (error) {
      this.logger.error(`❌ Failed to publish event to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Publish multiple events in a transaction
   */
  async publishEvents(topic: string, events: DomainEvent[]): Promise<void> {
    const transaction = await this.producer.transaction();
    
    try {
      for (const event of events) {
        const message = {
          key: event.aggregateId,
          value: JSON.stringify(event),
          headers: {
            eventType: event.type,
            aggregateType: event.aggregateType,
            version: event.version.toString(),
            timestamp: event.metadata.timestamp,
            ...(event.metadata.userId && { userId: event.metadata.userId }),
            ...(event.metadata.requestId && { requestId: event.metadata.requestId }),
            ...(event.metadata.correlationId && { correlationId: event.metadata.correlationId }),
          },
        };

        await transaction.send({
          topic,
          messages: [message],
        });
      }

      await transaction.commit();
      this.logger.debug(`📤 Published ${events.length} events to topic ${topic}`);
    } catch (error) {
      await transaction.abort();
      this.logger.error(`❌ Failed to publish events to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to a topic and handle messages
   */
  async subscribe(
    topic: string,
    groupId: string,
    handler: (event: DomainEvent) => Promise<void>,
  ): Promise<void> {
    const consumer = this.kafka.consumer({ groupId });
    this.consumers.set(topic, consumer);

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          const message = payload.message;
          if (!message.value) {
            this.logger.warn(`Received message without value on topic ${topic}`);
            return;
          }

          const event: DomainEvent = JSON.parse(message.value.toString());
          await handler(event);

          this.logger.debug(`📥 Processed event ${event.type} from topic ${topic}`, {
            aggregateId: event.aggregateId,
            eventId: event.id,
          });
        } catch (error) {
          this.logger.error(`❌ Error processing message from topic ${topic}:`, error);
          // In production, you might want to send to DLQ here
          throw error;
        }
      },
    });

    this.logger.log(`📥 Subscribed to topic ${topic} with group ${groupId}`);
  }

  /**
   * Create a domain event
   */
  createEvent(
    type: string,
    aggregateId: string,
    aggregateType: string,
    data: any,
    metadata: Partial<DomainEvent['metadata']> = {},
  ): DomainEvent {
    return {
      id: this.generateEventId(),
      type,
      aggregateId,
      aggregateType,
      version: 1,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  /**
   * Generate a unique event ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Health check for Kafka
   */
  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      // Try to get metadata to check connection
      const admin = this.kafka.admin();
      await admin.connect();
      await admin.describeCluster();
      await admin.disconnect();
      
      const latency = Date.now() - start;
      return { status: 'healthy', latency };
    } catch (error) {
      this.logger.error('Kafka health check failed:', error);
      return { status: 'unhealthy', latency: Date.now() - start };
    }
  }

  /**
   * Get Kafka admin client for management operations
   */
  getAdmin() {
    return this.kafka.admin();
  }
}





