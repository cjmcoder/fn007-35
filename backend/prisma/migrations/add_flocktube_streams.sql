-- Migration: Add FlockTube streaming support for private server matches
-- Date: 2025-09-28
-- Description: Adds support for PRIVATE_SERVER_WITH_STREAM mode and FlockTube streaming infrastructure

-- Add new match mode
ALTER TYPE "MatchMode" ADD VALUE 'PRIVATE_SERVER_WITH_STREAM';

-- Create FlockTube streams table
CREATE TABLE "flocktube_streams" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "matchId" TEXT NOT NULL REFERENCES "matches"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "side" TEXT NOT NULL CHECK (side IN ('p1', 'p2')),
  "streamKey" TEXT NOT NULL UNIQUE,
  "rtmpUrl" TEXT NOT NULL,
  "hlsUrl" TEXT,
  "dashUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'LIVE', 'ENDED', 'ERROR')),
  "bitrate" INTEGER,
  "fps" INTEGER,
  "resolution" TEXT,
  "title" TEXT,
  "viewerCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX "flocktube_streams_matchId_idx" ON "flocktube_streams"("matchId");
CREATE INDEX "flocktube_streams_userId_idx" ON "flocktube_streams"("userId");
CREATE INDEX "flocktube_streams_streamKey_idx" ON "flocktube_streams"("streamKey");
CREATE INDEX "flocktube_streams_status_idx" ON "flocktube_streams"("status");
CREATE INDEX "flocktube_streams_side_idx" ON "flocktube_streams"("side");

-- Add FlockTube streaming fields to StreamPair table (optional enhancement)
ALTER TABLE "stream_pairs" ADD COLUMN "p1FlocktubeStreamId" TEXT REFERENCES "flocktube_streams"("id");
ALTER TABLE "stream_pairs" ADD COLUMN "p2FlocktubeStreamId" TEXT REFERENCES "flocktube_streams"("id");
ALTER TABLE "stream_pairs" ADD COLUMN "p1FlocktubeLive" BOOLEAN DEFAULT false;
ALTER TABLE "stream_pairs" ADD COLUMN "p2FlocktubeLive" BOOLEAN DEFAULT false;
ALTER TABLE "stream_pairs" ADD COLUMN "p1FlocktubeBitrate" INTEGER;
ALTER TABLE "stream_pairs" ADD COLUMN "p2FlocktubeBitrate" INTEGER;
ALTER TABLE "stream_pairs" ADD COLUMN "p1FlocktubeFps" INTEGER;
ALTER TABLE "stream_pairs" ADD COLUMN "p2FlocktubeFps" INTEGER;

-- Create indexes for new StreamPair fields
CREATE INDEX "stream_pairs_p1FlocktubeStreamId_idx" ON "stream_pairs"("p1FlocktubeStreamId");
CREATE INDEX "stream_pairs_p2FlocktubeStreamId_idx" ON "stream_pairs"("p2FlocktubeStreamId");

-- Add comments for documentation
COMMENT ON TABLE "flocktube_streams" IS 'FlockTube streaming records for private server matches';
COMMENT ON COLUMN "flocktube_streams"."streamKey" IS 'Unique stream key for RTMP authentication';
COMMENT ON COLUMN "flocktube_streams"."rtmpUrl" IS 'RTMP URL for streaming software (OBS, etc.)';
COMMENT ON COLUMN "flocktube_streams"."hlsUrl" IS 'HLS URL for web playback';
COMMENT ON COLUMN "flocktube_streams"."dashUrl" IS 'DASH URL for adaptive streaming';
COMMENT ON COLUMN "flocktube_streams"."status" IS 'Current stream status';
COMMENT ON COLUMN "flocktube_streams"."side" IS 'Player side: p1 (host) or p2 (opponent)';





