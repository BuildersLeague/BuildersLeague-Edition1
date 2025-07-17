BEGIN;

-- First, clean up existing data
DO $$
BEGIN
    DELETE FROM Notes;
    DELETE FROM TopicProgress;
    DELETE FROM Feedbacks;
    DELETE FROM Schedule_Organizations;
    DELETE FROM Schedules;
    DELETE FROM CBH_banned_words;
    DELETE FROM Organization_Banned_Words;
    DELETE FROM Survey;
    DELETE FROM profiles;
    DELETE FROM auth.identities;
    DELETE FROM auth.users;
END $$;

-- Create all users and related data in one transaction
WITH user_values AS (
    SELECT *
    FROM (
        VALUES 
            ('admin@example.com', 3, 'CBH Admin User'),
            ('hr@example.com', 2, 'HR/Org User'),
            ('employee@example.com', 1, 'Employee User')
    ) AS t(email, profile_role, name)
),
inserted_users AS (
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at
    )
    SELECT
        CASE 
            WHEN email = 'admin@example.com' THEN '00000000-0000-0000-0000-000000000001'::uuid
            WHEN email = 'hr@example.com' THEN '00000000-0000-0000-0000-000000000002'::uuid
            ELSE '00000000-0000-0000-0000-000000000003'::uuid
        END,
        '00000000-0000-0000-0000-000000000000'::uuid,
        'authenticated',
        'authenticated',
        email,
        crypt('password123', gen_salt('bf')),
        now(),
        NULL::timestamp,
        '',
        NULL::timestamp,
        '',
        NULL::timestamp,
        '',
        '',
        NULL::timestamp,
        now()::timestamp,
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        false,
        now(),
        now(),
        NULL,
        NULL::timestamp,
        '',
        '',
        NULL::timestamp,
        '',
        0,
        NULL::timestamp,
        '',
        NULL::timestamp
    FROM user_values
    RETURNING id, email
),
inserted_identities AS (
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
    )
    SELECT 
        gen_random_uuid(),
        id,
        json_build_object(
            'sub', id::text,
            'email', email,
            'email_verified', true
        )::jsonb,
        'email',
        email, -- Use email as provider_id
        now(),
        now(),
        now()
    FROM inserted_users
    RETURNING user_id
)
-- Wait for trigger to create profiles
SELECT pg_sleep(0.1);

-- Now update the profiles
DO $$
DECLARE
    admin_uuid UUID := '00000000-0000-0000-0000-000000000001';
    hr_uuid UUID := '00000000-0000-0000-0000-000000000002';
    employee_uuid UUID := '00000000-0000-0000-0000-000000000003';
BEGIN
    -- Update profiles
    UPDATE profiles
    SET role = 3,
        name = 'CBH Admin User',
        contact_info = '123-456-7890',
        email = 'admin@example.com'
    WHERE id = admin_uuid;

    UPDATE profiles
    SET role = 2,
        name = 'HR/Org User',
        contact_info = '234-567-8901',
        admin_id = admin_uuid,
        email = 'hr@example.com'
    WHERE id = hr_uuid;

    UPDATE profiles
    SET role = 1,
        name = 'Employee User',
        contact_info = '345-678-9012',
        admin_id = hr_uuid,
        email = 'employee@example.com'
    WHERE id = employee_uuid;

    -- Insert Notes with extended schema
    INSERT INTO Notes (textrange, note_content, topic_id, employee_id, is_public, is_approved_cbh, is_approved_emp, address, quote, note_type, view_count, like_count, article_link, created_at, updated_at)
    VALUES
        (ARRAY[0, 5], 'I love this topic! It really helped me understand the concepts better.', 1, employee_uuid, TRUE, TRUE, TRUE, 'Topic 1, Item 2', NULL, 'public', 15, 3, NULL, NOW(), NOW()),
        (ARRAY[6, 15], 'This is my private note for later reference.', 1, employee_uuid, FALSE, FALSE, FALSE, 'Topic 1, Item 3', NULL, 'private', 0, 0, NULL, NOW(), NOW()),
        (ARRAY[16, 25], 'Great article about workplace communication!', 2, employee_uuid, TRUE, TRUE, TRUE, 'Communication Resources', NULL, 'shared-article', 42, 8, 'https://example.com/communication-guide', NOW(), NOW()),
        (ARRAY[26, 35], 'This quote really resonates with me in my daily work.', 1, employee_uuid, TRUE, FALSE, TRUE, 'Topic 1, Item 4', 'Success is not final, failure is not fatal: it is the courage to continue that counts.', 'under-review', 5, 1, NULL, NOW(), NOW()),
        (ARRAY[36, 45], 'Adding my thoughts on this discussion.', 3, employee_uuid, FALSE, FALSE, FALSE, 'Discussion Thread #123', NULL, 'comment', 0, 0, NULL, NOW(), NOW()),
        (ARRAY[46, 55], 'I found this article very insightful and practical.', 2, employee_uuid, TRUE, TRUE, TRUE, 'Resource Library', NULL, 'article', 28, 6, 'https://example.com/leadership-tips', NOW(), NOW());

    -- Insert TopicProgress
    INSERT INTO TopicProgress (topic_id, employee_id, content_id, created_at, updated_at)
    VALUES 
        (1, employee_uuid, 1, NOW(), NOW());

    -- Insert Feedbacks
    INSERT INTO Feedbacks (content, employee_id, created_at, updated_at)
    VALUES 
        ('Great progress!', employee_uuid, NOW(), NOW());

    -- Insert Schedules
    INSERT INTO Schedules (topic_id, cbh_admin_id, schedule_at, created_at, updated_at)
    VALUES 
        ('TOPIC-001', admin_uuid, NOW() + INTERVAL '1 day', NOW(), NOW());

    -- Insert Schedule_Organizations
    INSERT INTO Schedule_Organizations (parent_id, organization_id, created_at, updated_at)
    VALUES 
        (1, hr_uuid, NOW(), NOW());

    -- Insert CBH_banned_words
    INSERT INTO CBH_banned_words (banned_word, cbh_admin_id, created_at, updated_at)
    VALUES 
        ('inappropriate1', admin_uuid, NOW(), NOW());

    -- Insert Organization_Banned_Words
    INSERT INTO Organization_Banned_Words (banned_word, organization_id, created_at, updated_at)
    VALUES 
        ('org_banned1', hr_uuid, NOW(), NOW());

    -- Insert Survey
    INSERT INTO Survey (link, organization_id, created_at, updated_at, status)
    VALUES 
        ('https://survey1.example.com', hr_uuid, NOW(), NOW(), TRUE);
END $$;

COMMIT;
