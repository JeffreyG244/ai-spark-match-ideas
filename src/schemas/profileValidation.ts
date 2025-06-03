
import { z } from 'zod';
import { LIMITS, containsInappropriateContent } from '@/utils/security';

export const profileSchema = z.object({
  bio: z
    .string()
    .min(LIMITS.MIN_BIO_LENGTH, `Bio must be at least ${LIMITS.MIN_BIO_LENGTH} characters`)
    .max(LIMITS.BIO_MAX_LENGTH, `Bio cannot exceed ${LIMITS.BIO_MAX_LENGTH} characters`)
    .refine(
      (val) => !containsInappropriateContent(val),
      'Bio contains inappropriate content'
    ),
  values: z
    .string()
    .max(LIMITS.VALUES_MAX_LENGTH, `Values cannot exceed ${LIMITS.VALUES_MAX_LENGTH} characters`)
    .refine(
      (val) => !containsInappropriateContent(val),
      'Values contain inappropriate content'
    ),
  lifeGoals: z
    .string()
    .max(LIMITS.GOALS_MAX_LENGTH, `Life goals cannot exceed ${LIMITS.GOALS_MAX_LENGTH} characters`)
    .refine(
      (val) => !containsInappropriateContent(val),
      'Life goals contain inappropriate content'
    ),
  greenFlags: z
    .string()
    .max(LIMITS.GREEN_FLAGS_MAX_LENGTH, `Green flags cannot exceed ${LIMITS.GREEN_FLAGS_MAX_LENGTH} characters`)
    .refine(
      (val) => !containsInappropriateContent(val),
      'Green flags contain inappropriate content'
    )
});

export type ProfileData = z.infer<typeof profileSchema>;
