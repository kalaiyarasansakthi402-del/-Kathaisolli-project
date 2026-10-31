import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும் (Invalid email)'),
  password: z
    .string()
    .min(8, 'கடவுச்சொல் குறைந்தது 8 எழுத்துக்கள் இருக்க வேண்டும் (Min 8 chars)'),
  displayName: z
    .string()
    .min(2, 'பெயர் குறைந்தது 2 எழுத்துக்கள் இருக்க வேண்டும்')
    .max(100),
});

export const LoginSchema = z.object({
  email: z.string().email('சரியான மின்னஞ்சலை உள்ளிடவும்'),
  password: z.string().min(1, 'கடவுச்சொல்லை உள்ளிடவும்'),
});

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

export const CreateSeriesSchema = z.object({
  title: z.string().min(2, 'தலைப்பு அவசியம்').max(200),
  shortDescription: z.string().min(10, 'சுருக்கமான விளக்கம் தேவை').max(500),
  fullDescription: z.string().optional(),
  coverImage: z.string().url('சரியான பட இணைப்பு தேவை').optional().or(z.literal('')),
  bannerImage: z.string().url().optional().or(z.literal('')),
  contentType: z.enum(['STORY', 'AUDIOBOOK', 'PODCAST', 'SHORT_STORY']),
  languageId: z.string().uuid(),
  categoryId: z.string().uuid(),
  authorName: z.string().max(160).optional(),
  narratorName: z.string().max(160).optional(),
  tags: z.array(z.string()).default([]),
  ageRating: z.enum(['ALL_AGES', 'AGE_7_PLUS', 'AGE_13_PLUS', 'AGE_16_PLUS', 'AGE_18_PLUS']),
});

export const CreateSeasonSchema = z.object({
  title: z.string().min(2).max(160),
  number: z.number().int().min(1),
});

export const CreateEpisodeSchema = z.object({
  seasonId: z.string().uuid(),
  title: z.string().min(2, 'அத்தியாயத் தலைப்பு அவசியம்').max(200),
  description: z.string().optional(),
  episodeNumber: z.number().int().min(1),
});

export const CreatePlaylistSchema = z.object({
  title: z.string().min(2, 'பிளேலிஸ்ட் பெயர் தேவை').max(160),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const ApplyCreatorSchema = z.object({
  bio: z.string().min(20, 'தயவுசெய்து உங்களைப்பற்றி குறைந்தது 20 எழுத்துகளில் விவரிக்கவும்').max(1000),
  sampleAudioUrl: z.string().url().optional().or(z.literal('')),
  experience: z.string().optional(),
});

export const ModerationDecisionSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  moderationNote: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type CreateSeriesInput = z.infer<typeof CreateSeriesSchema>;
export type CreateSeasonInput = z.infer<typeof CreateSeasonSchema>;
export type CreateEpisodeInput = z.infer<typeof CreateEpisodeSchema>;
export type CreatePlaylistInput = z.infer<typeof CreatePlaylistSchema>;
export type ApplyCreatorInput = z.infer<typeof ApplyCreatorSchema>;
export type ModerationDecisionInput = z.infer<typeof ModerationDecisionSchema>;
