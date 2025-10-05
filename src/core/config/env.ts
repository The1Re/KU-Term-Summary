import z from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
});

export type EnvType = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    Object.entries(z.treeifyError(parsed.error).properties ?? {}).forEach(
      ([key, value]) => {
        console.error(`   - ${key}:`);
        value.errors.forEach(err => console.error(`\t- ${err}`));
      }
    );
    process.exit(1);
  }
  return parsed.data;
}
