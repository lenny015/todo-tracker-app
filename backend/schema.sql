DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'privacy_status' AND typtype = 'e'
    ) THEN
        CREATE TYPE privacy_status AS ENUM ('public', 'private', 'followers_only');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'task_status' AND typtype = 'e'
    ) THEN
        CREATE TYPE task_status AS ENUM ('pending', 'completed');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_password TEXT NOT NULL,
    user_privacy privacy_status DEFAULT 'public',
    PRIMARY KEY (user_id)
);


CREATE TABLE IF NOT EXISTS tasks (
    task_id SERIAL NOT NULL,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'pending',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS task_completion_history (
    completion_id SERIAL NOT NULL,
    task_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (completion_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);

CREATE TABLE IF NOT EXISTS followers (
    follow_id SERIAL NOT NULL,
    follower_id INT,
    following_id INT,
    PRIMARY KEY (follow_id),
    FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follow_id <> following_id)
);