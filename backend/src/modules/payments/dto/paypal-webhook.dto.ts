import { ApiProperty } from '@nestjs/swagger';

export class PayPalWebhookDto {
  @ApiProperty({ 
    example: 'PAYMENT.CAPTURE.COMPLETED', 
    description: 'PayPal webhook event type' 
  })
  event_type: string;

  @ApiProperty({ 
    example: '2024-01-01T00:00:00.000Z', 
    description: 'Event creation time' 
  })
  create_time: string;

  @ApiProperty({ 
    example: 'EC-1234567890', 
    description: 'PayPal event ID' 
  })
  id: string;

  @ApiProperty({ 
    description: 'Event resource data' 
  })
  resource: any;

  @ApiProperty({ 
    example: 'https://api.sandbox.paypal.com/v1/notifications/webhooks/events/EC-1234567890', 
    description: 'Event resource URL' 
  })
  resource_type: string;

  @ApiProperty({ 
    example: 'https://api.sandbox.paypal.com/v1/notifications/webhooks/events/EC-1234567890', 
    description: 'Event resource URL' 
  })
  event_version: string;

  @ApiProperty({ 
    example: 'https://api.sandbox.paypal.com/v1/notifications/webhooks/events/EC-1234567890', 
    description: 'Event resource URL' 
  })
  summary: string;
}





