CREATE TABLE nomfinder_favorite_events (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id INTEGER NOT NULL
        REFERENCES nomfinder_users(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL
        REFERENCES nomfinder_events(id) ON DELETE CASCADE
);