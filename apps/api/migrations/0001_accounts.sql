CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(id)) > 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(id)) > 0),
  owner_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (id, owner_user_id)
    REFERENCES account_memberships(account_id, user_id)
    DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE account_memberships (
  account_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (account_id, user_id),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX account_memberships_user_id_idx ON account_memberships(user_id);

CREATE TABLE membership_area_access (
  account_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  area TEXT NOT NULL CHECK (length(trim(area)) > 0),
  access_level TEXT NOT NULL CHECK (access_level IN ('no_access', 'viewer', 'editor')),
  PRIMARY KEY (account_id, user_id, area),
  FOREIGN KEY (account_id, user_id)
    REFERENCES account_memberships(account_id, user_id) ON DELETE RESTRICT
);
