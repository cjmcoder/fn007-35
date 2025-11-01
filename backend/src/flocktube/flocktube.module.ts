import { Module } from '@nestjs/common';
import { FlockTubeService } from './flocktube.service';

@Module({ providers: [FlockTubeService], exports: [FlockTubeService] })
export class FlockTubeModule {}

