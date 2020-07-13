CREATE TABLE nomfinder_user_roles (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    role_title TEXT NOT NULL
);


CREATE TABLE nomfinder_users (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password TEXT,
  user_role INTEGER DEFAULT 1 NOT NULL
	REFERENCES nomfinder_user_roles(id) ON DELETE SET DEFAULT,
  date_created TIMESTAMPTZ NOT NULL DEFAULT now()
);
