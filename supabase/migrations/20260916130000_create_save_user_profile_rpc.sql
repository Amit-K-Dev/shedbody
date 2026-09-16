-- Create save_user_profile SECURITY DEFINER RPC
-- Allows authenticated users to safely create/update their profile via controlled function
-- Direct table INSERT/UPDATE on user_profiles remains revoked for authenticated

BEGIN;

-- 1. Create/replace the save_user_profile function
CREATE OR REPLACE FUNCTION public.save_user_profile(
    p_goal               text                       DEFAULT NULL,
    p_target_weight      double precision           DEFAULT NULL,
    p_weight             double precision           DEFAULT NULL,
    p_height             double precision           DEFAULT NULL,
    p_age                bigint                     DEFAULT NULL,
    p_diet_type          text                       DEFAULT NULL,
    p_level              public.activity_level      DEFAULT NULL,
    p_gender             text                       DEFAULT NULL,
    p_unit_system        text                       DEFAULT NULL,
    p_reminder_enabled   boolean                    DEFAULT NULL,
    p_reminder_time      time without time zone     DEFAULT NULL
)
RETURNS TABLE (
    user_id              uuid,
    goal                 text,
    target_weight        double precision,
    weight               double precision,
    height               double precision,
    age                  bigint,
    diet_type            text,
    level                public.activity_level,
    gender               text,
    unit_system          text,
    reminder_enabled     boolean,
    reminder_time        time without time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_user_id uuid := auth.uid();
BEGIN
    -- Authorization: must be authenticated
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not authorized';
    END IF;

    -- UPSERT: INSERT if new, UPDATE if exists
    INSERT INTO public.user_profiles (
        user_id,
        goal,
        target_weight,
        weight,
        height,
        age,
        diet_type,
        level,
        gender,
        unit_system,
        reminder_enabled,
        reminder_time
    ) VALUES (
        v_user_id,
        COALESCE(p_goal, 'maintain'),
        COALESCE(p_target_weight, NULL),
        COALESCE(p_weight, NULL),
        COALESCE(p_height, NULL),
        COALESCE(p_age, NULL),
        COALESCE(p_diet_type, NULL),
        COALESCE(p_level, NULL),
        COALESCE(p_gender, NULL),
        COALESCE(p_unit_system, 'metric'),
        COALESCE(p_reminder_enabled, false),
        COALESCE(p_reminder_time, '20:00:00'::time without time zone)
    )
    ON CONFLICT (user_id) DO UPDATE SET
        goal               = COALESCE(p_goal,               public.user_profiles.goal),
        target_weight      = COALESCE(p_target_weight,      public.user_profiles.target_weight),
        weight             = COALESCE(p_weight,             public.user_profiles.weight),
        height             = COALESCE(p_height,             public.user_profiles.height),
        age                = COALESCE(p_age,                public.user_profiles.age),
        diet_type          = COALESCE(p_diet_type,          public.user_profiles.diet_type),
        level              = COALESCE(p_level,              public.user_profiles.level),
        gender             = COALESCE(p_gender,             public.user_profiles.gender),
        unit_system        = COALESCE(p_unit_system,        public.user_profiles.unit_system),
        reminder_enabled   = COALESCE(p_reminder_enabled,   public.user_profiles.reminder_enabled),
        reminder_time      = COALESCE(p_reminder_time,      public.user_profiles.reminder_time)
    WHERE public.user_profiles.user_id = v_user_id;

    -- Return only user-controlled fields
    RETURN QUERY
    SELECT
        up.user_id,
        up.goal,
        up.target_weight,
        up.weight,
        up.height,
        up.age,
        up.diet_type,
        up.level,
        up.gender,
        up.unit_system,
        up.reminder_enabled,
        up.reminder_time
    FROM public.user_profiles up
    WHERE up.user_id = v_user_id;
END;
$function$;

-- 2. Revoke PUBLIC execution
REVOKE EXECUTE ON FUNCTION public.save_user_profile(
    text,
    double precision,
    double precision,
    double precision,
    bigint,
    text,
    public.activity_level,
    text,
    text,
    boolean,
    time without time zone
) FROM PUBLIC;

-- 3. Grant EXECUTE only to authenticated
GRANT EXECUTE ON FUNCTION public.save_user_profile(
    text,
    double precision,
    double precision,
    double precision,
    bigint,
    text,
    public.activity_level,
    text,
    text,
    boolean,
    time without time zone
) TO authenticated;

-- 4. Ensure authenticated has no direct INSERT/UPDATE on user_profiles
REVOKE INSERT, UPDATE ON TABLE public.user_profiles FROM authenticated;

COMMIT;