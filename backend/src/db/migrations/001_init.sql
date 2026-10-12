CREATE TABLE IF NOT EXISTS artists (
  id          SERIAL PRIMARY KEY,
  uuid        UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  genre       VARCHAR(100),
  location    VARCHAR(255),
  bio         TEXT,
  twitter_handle     VARCHAR(100),
  instagram_handle   VARCHAR(100),
  spotify_artist_id  VARCHAR(100),
  linkedin_profile   VARCHAR(255),
  plan        VARCHAR(20) DEFAULT 'free',
  stripe_customer_id VARCHAR(100),
  twitter_connected  BOOLEAN DEFAULT false,
  instagram_connected BOOLEAN DEFAULT false,
  spotify_connected  BOOLEAN DEFAULT false,
  auto_apply  BOOLEAN DEFAULT true,
  ai_manager  BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fans (
  id           SERIAL PRIMARY KEY,
  artist_id    INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  username     VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  platform     VARCHAR(20) NOT NULL,
  profile_url  VARCHAR(500),
  avatar_url   VARCHAR(500),
  followers    INTEGER DEFAULT 0,
  likes_given  INTEGER DEFAULT 0,
  comments_given INTEGER DEFAULT 0,
  shares_given INTEGER DEFAULT 0,
  score        INTEGER DEFAULT 0,
  tier         VARCHAR(20) DEFAULT 'engaged',
  last_active  TIMESTAMPTZ,
  is_starred   BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id, username, platform)
);

CREATE TABLE IF NOT EXISTS gigs (
  id          SERIAL PRIMARY KEY,
  type        VARCHAR(30) NOT NULL,
  title       VARCHAR(500) NOT NULL,
  venue       VARCHAR(255),
  description TEXT,
  pay         VARCHAR(100),
  pay_amount  NUMERIC(10,2),
  location    VARCHAR(255),
  genre       VARCHAR(100),
  deadline    TIMESTAMPTZ,
  contact_email VARCHAR(255),
  apply_url   VARCHAR(500),
  source      VARCHAR(100),
  match_score INTEGER DEFAULT 0,
  status      VARCHAR(20) DEFAULT 'open',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id            SERIAL PRIMARY KEY,
  artist_id     INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  gig_id        INTEGER REFERENCES gigs(id),
  resume_id     INTEGER,
  cover_letter  TEXT,
  status        VARCHAR(30) DEFAULT 'sent',
  applied_at    TIMESTAMPTZ DEFAULT NOW(),
  response_at   TIMESTAMPTZ,
  notes         TEXT
);

CREATE TABLE IF NOT EXISTS campaigns (
  id              SERIAL PRIMARY KEY,
  artist_id       INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  type            VARCHAR(50) NOT NULL,
  title           VARCHAR(255),
  caption         TEXT,
  dm_script       TEXT,
  hashtags        TEXT[],
  target_fan_ids  INTEGER[],
  platform        VARCHAR(20)[],
  estimated_reach INTEGER DEFAULT 0,
  actual_reach    INTEGER DEFAULT 0,
  revenue_generated NUMERIC(10,2) DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'draft',
  launched_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resumes (
  id           SERIAL PRIMARY KEY,
  artist_id    INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  version      INTEGER DEFAULT 1,
  content      JSONB NOT NULL,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fans_artist_id ON fans(artist_id);
CREATE INDEX IF NOT EXISTS idx_fans_score ON fans(score DESC);
CREATE INDEX IF NOT EXISTS idx_fans_tier ON fans(tier);
CREATE INDEX IF NOT EXISTS idx_applications_artist_id ON applications(artist_id);
CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status);
CREATE INDEX IF NOT EXISTS idx_gigs_match ON gigs(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_artist_id ON campaigns(artist_id);

-- Notifications table (for AI agent alerts)
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  artist_id   INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL,
  title       VARCHAR(255),
  message     TEXT,
  data        JSONB,
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_artist ON notifications(artist_id);

-- Add linkedin_profile to artists if not exists
ALTER TABLE artists ADD COLUMN IF NOT EXISTS linkedin_profile VARCHAR(255);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS spotify_artist_id VARCHAR(100);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS ig_access_token TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS ig_user_id VARCHAR(100);

-- Media table (audio, video, images)
CREATE TABLE IF NOT EXISTS media (
  id          SERIAL PRIMARY KEY,
  artist_id   INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  type        VARCHAR(20) NOT NULL,     -- 'audio' | 'video' | 'images'
  filename    VARCHAR(500) NOT NULL,
  url         VARCHAR(500) NOT NULL,
  mimetype    VARCHAR(100),
  size        BIGINT DEFAULT 0,
  album_name  VARCHAR(255),
  genre       VARCHAR(100),
  play_count  INTEGER DEFAULT 0,
  is_public   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio / bio pad table
CREATE TABLE IF NOT EXISTS portfolios (
  id           SERIAL PRIMARY KEY,
  artist_id    INTEGER REFERENCES artists(id) ON DELETE CASCADE UNIQUE,
  bio          TEXT DEFAULT '',
  short_bio    VARCHAR(500) DEFAULT '',
  press_quote  VARCHAR(500) DEFAULT '',
  influences   JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  links        JSONB DEFAULT '{}',
  is_public    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_artist ON media(artist_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_portfolios_artist ON portfolios(artist_id);

-- Media table (audio, video, images)
CREATE TABLE IF NOT EXISTS media (
  id          SERIAL PRIMARY KEY,
  artist_id   INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  type        VARCHAR(20) NOT NULL,     -- 'audio' | 'video' | 'images'
  filename    VARCHAR(500) NOT NULL,
  url         VARCHAR(500) NOT NULL,
  mimetype    VARCHAR(100),
  size        BIGINT DEFAULT 0,
  album_name  VARCHAR(255),
  genre       VARCHAR(100),
  play_count  INTEGER DEFAULT 0,
  is_public   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio / bio pad table
CREATE TABLE IF NOT EXISTS portfolios (
  id           SERIAL PRIMARY KEY,
  artist_id    INTEGER REFERENCES artists(id) ON DELETE CASCADE UNIQUE,
  bio          TEXT DEFAULT '',
  short_bio    VARCHAR(500) DEFAULT '',
  press_quote  VARCHAR(500) DEFAULT '',
  influences   JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  links        JSONB DEFAULT '{}',
  is_public    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_artist ON media(artist_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_portfolios_artist ON portfolios(artist_id);
