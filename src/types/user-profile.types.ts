// src/types/user-profile.types.ts
// UserProfile shape matching the user_profiles table.

export interface UserProfile {
    id: string;
    created_at: string;
    business_name: string;
    owner_name: string;
    phone: string;
    address: string;
    city: string;
}