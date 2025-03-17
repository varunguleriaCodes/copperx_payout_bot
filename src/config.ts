export type IConfig = {
  bot: { token: string };
  server: { port: number };
  log: { output: string };
  api_base_url: { output: string};
  redis_url: { output: string};
  pusher_key: { output: string};
  pusher_cluster: {output: string};
  organization_id:{output:string}
};

function initConfig(): IConfig {
  const envs = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    SERVER_PORT: process.env.SERVER_PORT,
    LOGS_OUTPUT: process.env.LOGS_OUTPUT || 'logs.log',
    API_BASE_URL: process.env.API_BASE_URL,
    REDIS_URL:process.env.REDIS_URL,
    PUSHER_KEY:process.env.PUSHER_KEY,
    PUSHER_CLUSTER:process.env.PUSHER_CLUSTER,
    ORGANIZATION_ID:process.env.ORGANIZATION_ID,
  } as const;

  const requiredEnvsNames = ['BOT_TOKEN'] as const;

  requiredEnvsNames.forEach((key: keyof typeof envs) => {
    const value = !!envs[key];
    if (!value) {
      console.error(`❌ Missing env value for ${key}`);
      return process.exit(0);
    }
  });

  const config: IConfig = {
    bot: {
      token: envs.BOT_TOKEN!,
    },
    server: {
      port: Number(envs.SERVER_PORT) || 3000,
    },
    log: {
      output: envs.LOGS_OUTPUT,
    },
    api_base_url: {
      output: envs.API_BASE_URL!
    },
    redis_url:{
      output: envs.REDIS_URL!
    },
    pusher_key: {
       output: envs.PUSHER_KEY!
    },
    pusher_cluster: {
       output: envs.PUSHER_CLUSTER!
    },
    organization_id:{
       output:envs.ORGANIZATION_ID!
    }
  };

  return config;
}

export const CONFIG: IConfig = initConfig();
