import * as Joi from 'joi';

/**
 * 이벤트 서비스 환경 변수 검증 스키마
 */
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3002),
  MONGODB_URI: Joi.string().required(),
  INNGEST_DEV: Joi.boolean().default(true),
  INNGEST_SIGNING_KEY: Joi.string().default('dev_inngest_signing_key'),
});

/**
 * 이벤트 서비스 구성 함수
 * 환경 변수에서 구성 값을 가져옵니다.
 */
export default () => ({
  port: parseInt(process.env.PORT || '3002', 10),
  database: {
    uri: process.env.MONGODB_URI,
  },
  inngest: {
    dev: process.env.INNGEST_DEV === 'true',
    signingKey: process.env.INNGEST_SIGNING_KEY,
  },
});

// /**
//  * 이벤트 서비스 설정 모듈
//  * 환경 변수 및 설정 값을 관리합니다.
//  */
// export default () => ({
//   port: parseInt(process.env.PORT, 10) || 3002,
//   mongodb: {
//     uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/reward-system',
//   },
//   inngest: {
//     signingKey: process.env.INNGEST_SIGNING_KEY || 'test-signing-key',
//   },
//   eventProcessing: {
//     enabled: process.env.EVENT_PROCESSING_ENABLED === 'true' || false,
//   },
// });
