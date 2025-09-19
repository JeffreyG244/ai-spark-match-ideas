
import { z } from 'zod';
import { LIMITS, validateProfileContent } from '@/utils/security';

export const profileSchema = z.object({
  bio: z
    .string()
    .min(LIMITS.MIN_BIO_LENGTH, `Bio must be at least ${LIMITS.MIN_BIO_LENGTH} characters`)
    .max(LIMITS.BIO_MAX_LENGTH, `Bio cannot exceed ${LIMITS.BIO_MAX_LENGTH} characters`)
    .refine(
      (val) => {
        if (!val) return true; // Allow empty bio
        const validation = validateProfileContent(val, LIMITS.BIO_MAX_LENGTH);
        return validation.isValid;
      },
      'Bio contains inappropriate content'
    ),
  values: z
    .string()
    .max(LIMITS.VALUES_MAX_LENGTH, `Values cannot exceed ${LIMITS.VALUES_MAX_LENGTH} characters`)
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Allow empty values
        const validation = validateProfileContent(val, LIMITS.VALUES_MAX_LENGTH);
        return validation.isValid;
      },
      'Values contain inappropriate content'
    ),
  lifeGoals: z
    .string()
    .max(LIMITS.GOALS_MAX_LENGTH, `Life goals cannot exceed ${LIMITS.GOALS_MAX_LENGTH} characters`)
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Allow empty life goals
        const validation = validateProfileContent(val, LIMITS.GOALS_MAX_LENGTH);
        return validation.isValid;
      },
      'Life goals contain inappropriate content'
    ),
  greenFlags: z
    .string()
    .max(LIMITS.GREEN_FLAGS_MAX_LENGTH, `Green flags cannot exceed ${LIMITS.GREEN_FLAGS_MAX_LENGTH} characters`)
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Allow empty green flags
        const validation = validateProfileContent(val, LIMITS.GREEN_FLAGS_MAX_LENGTH);
        return validation.isValid;
      },
      'Green flags contain inappropriate content'
    )
});

export type ProfileData = z.infer<typeof profileSchema>;
